import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

// Configure pdfjs worker to use CDN matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfEditor() {
  const [pdfBytes, setPdfBytes] = useState(null);
  const [fileName, setFileName] = useState('');
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(false);

  // Tools: 'select', 'text', 'highlight', 'redact', 'pen', 'signature', 'image', 'shape'
  const [activeTool, setActiveTool] = useState('select');

  // Annotation states: mapped by page number { [pageNumber]: [annotation1, annotation2, ...] }
  const [annotations, setAnnotations] = useState({});
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  // Per-page rotation overrides: { [pageNumber]: 0 | 90 | 180 | 270 }
  const [pageRotations, setPageRotations] = useState({});
  // List of excluded (deleted) pages: array of 1-based page indices
  const [deletedPages, setDeletedPages] = useState([]);

  // Tool customization options
  const [textColor, setTextColor] = useState('#CC0000');
  const [textSize, setTextSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [highlightColor, setHighlightColor] = useState('#FEF08A'); // yellow-200
  const [redactColor, setRedactColor] = useState('#FFFFFF'); // whiteout default
  const [penColor, setPenColor] = useState('#CC0000');
  const [penWidth, setPenWidth] = useState(3);

  // Signature Modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'type'
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureFont, setSignatureFont] = useState('cursive');
  const sigCanvasRef = useRef(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Freehand drawing on main page canvas
  const [isPenDrawing, setIsPenDrawing] = useState(false);
  const [currentPenPath, setCurrentPenPath] = useState([]);

  // Canvas and Stage references
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const penCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Load a demo PDF on initial mount so users can immediately test the tool
  useEffect(() => {
    generateSamplePdf();
  }, []);

  // Generate a starter sample PDF using pdf-lib
  const generateSamplePdf = async () => {
    try {
      setLoading(true);
      const doc = await PDFDocument.create();
      const page1 = doc.addPage([600, 800]);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

      // Header Banner
      page1.drawRectangle({
        x: 0,
        y: 720,
        width: 600,
        height: 80,
        color: rgb(0.8, 0, 0), // Star Graphix Brand Red
      });

      page1.drawText('STAR GRAPHIX — CREATIVE DESIGN STUDIO', {
        x: 40,
        y: 750,
        size: 18,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page1.drawText('Sample Client Project Order & Invoice', {
        x: 40,
        y: 730,
        size: 12,
        font: fontRegular,
        color: rgb(1, 0.9, 0.9),
      });

      // Body Content
      page1.drawText('Document Title: Brand Identity & Commercial Printing', {
        x: 40,
        y: 670,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.18),
      });

      const sampleLines = [
        'Welcome to the Star Graphix Online PDF Editor!',
        'You can edit any uploaded PDF document in 100% original lossless quality.',
        '',
        'Key Editing Capabilities Included:',
        '• Click "Add Text" to type new text or insert contract details.',
        '• Use "Highlight" to emphasize critical clauses or prices.',
        '• Use "White-out / Redact" to cover confidential information.',
        '• Draw your handwritten Signature or upload a brand stamp logo.',
        '• Draw freehand annotations directly with the pen tool.',
        '• Rotate, reorder, or delete pages in the thumbnail sidebar.',
        '',
        'Invoice Amount: $1,250.00 USD (Sample Fee)',
        'Status: Approved & Print Ready',
        'Authorized Signatory: __________________________',
      ];

      let yPos = 630;
      for (const line of sampleLines) {
        page1.drawText(line, {
          x: 40,
          y: yPos,
          size: 11,
          font: line.startsWith('•') || line.startsWith('Invoice') ? fontBold : fontRegular,
          color: line.startsWith('Invoice') ? rgb(0.8, 0, 0) : rgb(0.2, 0.2, 0.2),
        });
        yPos -= 22;
      }

      // Add a page 2
      const page2 = doc.addPage([600, 800]);
      page2.drawRectangle({
        x: 0,
        y: 720,
        width: 600,
        height: 80,
        color: rgb(0.1, 0.1, 0.18),
      });
      page2.drawText('PAGE 2 — TERMS & DESIGN SPECIFICATIONS', {
        x: 40,
        y: 750,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      page2.drawText('High-resolution 300 DPI vector printing standards applied.', {
        x: 40,
        y: 660,
        size: 12,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      const sampleBytes = await doc.save();
      setPdfBytes(sampleBytes);
      setFileName('Star_Graphix_Sample_Document.pdf');
      await loadPdfBytes(sampleBytes);
    } catch (err) {
      console.error('Error generating sample PDF:', err);
      toast.error('Failed to create sample PDF.');
    } finally {
      setLoading(false);
    }
  };

  // Load PDF ArrayBuffer into pdfjs for high-fidelity canvas rendering
  const loadPdfBytes = async (bytes) => {
    try {
      setLoading(true);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
      const doc = await loadingTask.promise;
      setPdfDocProxy(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setAnnotations({});
      setPageRotations({});
      setDeletedPages([]);
      setSelectedAnnotationId(null);
    } catch (err) {
      console.error('Error loading PDF:', err);
      toast.error('Could not load PDF document.');
    } finally {
      setLoading(false);
    }
  };

  // Render current page onto canvas whenever pdfDocProxy, currentPage, zoom, or rotation changes
  useEffect(() => {
    if (!pdfDocProxy || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDocProxy.getPage(currentPage);
        if (isCancelled) return;

        const rotationOverride = pageRotations[currentPage] || 0;
        const totalRotation = (page.rotate + rotationOverride) % 360;

        // Render at 2x scale for sharp retina rendering
        const viewport = page.getViewport({ scale: zoom * 1.5, rotation: totalRotation });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / 1.5}px`;
        canvas.style.height = `${viewport.height / 1.5}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Sync pen canvas size
        if (penCanvasRef.current) {
          penCanvasRef.current.width = viewport.width / 1.5;
          penCanvasRef.current.height = viewport.height / 1.5;
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDocProxy, currentPage, zoom, pageRotations]);

  // Handle PDF file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = new Uint8Array(evt.target.result);
      setPdfBytes(buffer);
      setFileName(file.name);
      await loadPdfBytes(buffer);
      toast.success(`Loaded "${file.name}" ready for editing!`);
    };
    reader.readAsArrayBuffer(file);
  };

  // Rotate Current Page 90 degrees
  const handleRotateCurrentPage = () => {
    setPageRotations((prev) => {
      const current = prev[currentPage] || 0;
      return {
        ...prev,
        [currentPage]: (current + 90) % 360,
      };
    });
    toast.success(`Rotated page ${currentPage} by 90°`);
  };

  // Delete Current Page
  const handleDeleteCurrentPage = () => {
    if (numPages - deletedPages.length <= 1) {
      toast.error('Cannot delete the only remaining page in the PDF.');
      return;
    }
    setDeletedPages((prev) => [...prev, currentPage]);
    toast.success(`Page ${currentPage} marked for removal.`);
    // Navigate to next available page
    for (let p = 1; p <= numPages; p++) {
      if (p !== currentPage && !deletedPages.includes(p)) {
        setCurrentPage(p);
        break;
      }
    }
  };

  // Add a Text Annotation
  const handleAddText = () => {
    const newAnno = {
      id: 'text_' + Date.now(),
      type: 'text',
      text: 'Click to edit text',
      x: 60,
      y: 100,
      color: textColor,
      size: textSize,
      font: fontFamily,
    };
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAnno],
    }));
    setSelectedAnnotationId(newAnno.id);
    setActiveTool('select');
    toast.success('Text added! Drag to reposition or edit content.', { icon: '✍️' });
  };

  // Add a Highlight Box
  const handleAddHighlight = () => {
    const newAnno = {
      id: 'highlight_' + Date.now(),
      type: 'highlight',
      x: 60,
      y: 140,
      width: 240,
      height: 28,
      color: highlightColor,
      opacity: 0.45,
    };
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAnno],
    }));
    setSelectedAnnotationId(newAnno.id);
    setActiveTool('select');
    toast.success('Highlight box added! Drag & resize over text.', { icon: '🖍️' });
  };

  // Add Redact / Whiteout Box
  const handleAddRedact = (isBlackout = false) => {
    const newAnno = {
      id: 'redact_' + Date.now(),
      type: 'redact',
      x: 60,
      y: 180,
      width: 200,
      height: 32,
      color: isBlackout ? '#000000' : redactColor,
    };
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAnno],
    }));
    setSelectedAnnotationId(newAnno.id);
    setActiveTool('select');
    toast.success(isBlackout ? 'Blackout redaction added.' : 'Whiteout erase box added.');
  };

  // Add Image / Stamp Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const targetWidth = 140;
        const targetHeight = targetWidth / aspect;

        const newAnno = {
          id: 'img_' + Date.now(),
          type: 'image',
          dataUrl: evt.target.result,
          x: 80,
          y: 200,
          width: targetWidth,
          height: targetHeight,
        };

        setAnnotations((prev) => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newAnno],
        }));
        setSelectedAnnotationId(newAnno.id);
        setActiveTool('select');
        toast.success('Image stamp added to page!');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  // Save Signature from Modal
  const handleSaveSignature = () => {
    let dataUrl = '';

    if (signatureMode === 'draw') {
      const sigCanvas = sigCanvasRef.current;
      if (!sigCanvas) return;
      dataUrl = sigCanvas.toDataURL('image/png');
    } else {
      // Create cursive text signature on temporary canvas
      if (!typedSignature.trim()) {
        toast.error('Please type your signature first.');
        return;
      }
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 120;
      const ctx = tempCanvas.getContext('2d');
      ctx.font = '38px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature, 200, 60);
      dataUrl = tempCanvas.toDataURL('image/png');
    }

    const newAnno = {
      id: 'sig_' + Date.now(),
      type: 'signature',
      dataUrl,
      x: 100,
      y: 350,
      width: 160,
      height: 60,
    };

    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAnno],
    }));

    setSelectedAnnotationId(newAnno.id);
    setShowSignatureModal(false);
    setActiveTool('select');
    toast.success('Signature stamped! Drag to position on the signature line.');
  };

  // Dragging annotations on canvas
  const [draggingAnno, setDraggingAnno] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDownAnno = (e, anno) => {
    e.stopPropagation();
    setSelectedAnnotationId(anno.id);
    setDraggingAnno(anno.id);
    setDragOffset({
      x: e.clientX - anno.x,
      y: e.clientY - anno.y,
    });
  };

  const handleMouseMoveStage = (e) => {
    if (draggingAnno) {
      const stageRect = stageRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(stageRect.width - 20, e.clientX - stageRect.left - dragOffset.x + (stageRef.current.scrollLeft || 0)));
      const newY = Math.max(0, Math.min(stageRect.height - 20, e.clientY - stageRect.top - dragOffset.y + (stageRef.current.scrollTop || 0)));

      setAnnotations((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((a) =>
          a.id === draggingAnno ? { ...a, x: newX, y: newY } : a
        ),
      }));
    }

    // Freehand pen drawing
    if (isPenDrawing && activeTool === 'pen') {
      const canvas = penCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ctx = canvas.getContext('2d');
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineTo(x, y);
      ctx.stroke();

      setCurrentPenPath((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseUpStage = () => {
    setDraggingAnno(null);
    if (isPenDrawing && activeTool === 'pen') {
      setIsPenDrawing(false);
      // Save current pen drawing as an image annotation
      const canvas = penCanvasRef.current;
      if (canvas && currentPenPath.length > 1) {
        const dataUrl = canvas.toDataURL('image/png');
        const newAnno = {
          id: 'pen_' + Date.now(),
          type: 'drawing',
          dataUrl,
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        };
        setAnnotations((prev) => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newAnno],
        }));
        // Clear pen canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setCurrentPenPath([]);
    }
  };

  // Start Pen drawing
  const handleMouseDownPenCanvas = (e) => {
    if (activeTool !== 'pen') return;
    setIsPenDrawing(true);
    const canvas = penCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setCurrentPenPath([{ x, y }]);
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter((a) => a.id !== id),
    }));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
    toast.success('Annotation removed.');
  };

  // Update text value
  const handleUpdateText = (id, newText) => {
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map((a) =>
        a.id === id ? { ...a, text: newText } : a
      ),
    }));
  };

  // Convert Hex Color to pdf-lib rgb(0..1)
  const hexToPdfRgb = (hex) => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) / 255;
    const g = ((num >> 8) & 0xff) / 255;
    const b = (num & 0xff) / 255;
    return rgb(r, g, b);
  };

  // 100% Lossless High-Quality Export using pdf-lib
  const handleDownloadPdf = async () => {
    if (!pdfBytes) {
      toast.error('No PDF to export.');
      return;
    }

    try {
      const toastId = toast.loading('Generating vector high-quality PDF...');

      // Load original vector PDF with pdf-lib (keeps existing vector elements 100% lossless)
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      // Embed standard fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

      const fontMap = {
        Helvetica: helveticaFont,
        Times: timesFont,
        Courier: courierFont,
      };

      const canvas = canvasRef.current;
      const stageWidth = canvas ? parseFloat(canvas.style.width) : 600;
      const stageHeight = canvas ? parseFloat(canvas.style.height) : 800;

      const pageCount = pdfDoc.getPageCount();

      // Process each page
      for (let pIdx = 0; pIdx < pageCount; pIdx++) {
        const pageNum = pIdx + 1;

        // Skip deleted pages
        if (deletedPages.includes(pageNum)) {
          continue;
        }

        const page = pdfDoc.getPage(pIdx);
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        // Apply rotation override
        if (pageRotations[pageNum]) {
          const currentRot = page.getRotation().angle;
          page.setRotation(degrees((currentRot + pageRotations[pageNum]) % 360));
        }

        const pageAnnos = annotations[pageNum] || [];

        for (const anno of pageAnnos) {
          // Calculate scale ratios from screen stage pixels to PDF points
          const scaleX = pdfWidth / stageWidth;
          const scaleY = pdfHeight / stageHeight;

          if (anno.type === 'text') {
            const pdfFont = fontMap[anno.font] || helveticaFont;
            const pdfFontSize = anno.size * (pdfWidth / 600);
            const textX = anno.x * scaleX;
            // PDF coordinates start from bottom-left
            const textY = pdfHeight - (anno.y * scaleY) - (pdfFontSize * 0.8);

            page.drawText(anno.text, {
              x: Math.max(0, textX),
              y: Math.max(0, textY),
              size: pdfFontSize,
              font: pdfFont,
              color: hexToPdfRgb(anno.color || '#000000'),
            });
          } else if (anno.type === 'highlight') {
            const hX = anno.x * scaleX;
            const hY = pdfHeight - ((anno.y + anno.height) * scaleY);
            const hW = anno.width * scaleX;
            const hH = anno.height * scaleY;

            page.drawRectangle({
              x: hX,
              y: hY,
              width: hW,
              height: hH,
              color: hexToPdfRgb(anno.color || '#FEF08A'),
              opacity: anno.opacity || 0.45,
            });
          } else if (anno.type === 'redact') {
            const rX = anno.x * scaleX;
            const rY = pdfHeight - ((anno.y + anno.height) * scaleY);
            const rW = anno.width * scaleX;
            const rH = anno.height * scaleY;

            page.drawRectangle({
              x: rX,
              y: rY,
              width: rW,
              height: rH,
              color: hexToPdfRgb(anno.color || '#FFFFFF'),
            });
          } else if (anno.type === 'image' || anno.type === 'signature' || anno.type === 'drawing') {
            // Embed PNG image
            const imgData = anno.dataUrl;
            if (imgData && imgData.startsWith('data:image')) {
              const imageBytes = await fetch(imgData).then((res) => res.arrayBuffer());
              const embeddedImage = await pdfDoc.embedPng(imageBytes);

              const imgX = anno.x * scaleX;
              const imgY = pdfHeight - ((anno.y + anno.height) * scaleY);
              const imgW = anno.width * scaleX;
              const imgH = anno.height * scaleY;

              page.drawImage(embeddedImage, {
                x: imgX,
                y: imgY,
                width: imgW,
                height: imgH,
              });
            }
          }
        }
      }

      // Remove deleted pages in reverse order so indices remain stable
      const sortedDeleted = [...deletedPages].sort((a, b) => b - a);
      for (const delPageNum of sortedDeleted) {
        if (delPageNum <= pdfDoc.getPageCount()) {
          pdfDoc.removePage(delPageNum - 1);
        }
      }

      // Save modified vector PDF
      const modifiedPdfBytes = await pdfDoc.save();

      // Download file to browser
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      const cleanBaseName = fileName.replace('.pdf', '');
      downloadLink.download = `${cleanBaseName}_edited.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      toast.dismiss(toastId);
      toast.success('High-quality PDF downloaded successfully!', { icon: '📄' });
    } catch (err) {
      console.error('Error saving PDF:', err);
      toast.error('Failed to export PDF.');
    }
  };

  const currentAnnotations = annotations[currentPage] || [];
  const activeAnno = currentAnnotations.find((a) => a.id === selectedAnnotationId);

  return (
    <div className="space-y-6 font-outfit text-left animate-fade-in select-none">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Top Main Command Bar */}
      <div className="bg-white rounded-3xl border border-gray-150 p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-primary-200 flex-shrink-0">
            <Icon name="FileText" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Vector PDF Editor & Annotator
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Lossless Quality
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Current File: <strong className="text-gray-700 font-semibold">{fileName || 'Untitled.pdf'}</strong>
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs active:scale-95"
          >
            <Icon name="Upload" size={15} /> Upload PDF
          </button>

          <button
            type="button"
            onClick={generateSamplePdf}
            className="px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-primary-50 text-primary-600 border border-primary-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Icon name="Refresh" size={14} /> Try Sample
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-rose-600 hover:from-primary-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-primary-200 hover:shadow-lg flex items-center gap-2 active:scale-95 animate-pulse"
          >
            <Icon name="Download" size={16} /> Download Quality PDF
          </button>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Tool Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'select'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon name="MousePointer" size={14} /> Select & Drag
          </button>

          <button
            type="button"
            onClick={handleAddText}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Icon name="Type" size={14} /> + Add Text
          </button>

          <button
            type="button"
            onClick={handleAddHighlight}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-yellow-50 hover:text-yellow-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Highlight
          </button>

          <button
            type="button"
            onClick={() => handleAddRedact(false)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="w-2.5 h-2.5 rounded border border-gray-400 bg-white inline-block" /> White-out
          </button>

          <button
            type="button"
            onClick={() => handleAddRedact(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="w-2.5 h-2.5 rounded bg-gray-900 inline-block" /> Redact
          </button>

          <button
            type="button"
            onClick={() => setShowSignatureModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Icon name="Edit" size={14} /> + Signature
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Icon name="Image" size={14} /> + Stamp Logo
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'pen' ? 'select' : 'pen')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'pen'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-700 bg-gray-100 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <Icon name="Edit" size={14} /> {activeTool === 'pen' ? 'Pen Active (Draw)' : 'Freehand Pen'}
          </button>
        </div>

        {/* Page Operation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRotateCurrentPage}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 transition-all"
            title="Rotate Page 90° Clockwise"
          >
            <Icon name="Rotate" size={15} />
            <span className="hidden sm:inline">Rotate 90°</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteCurrentPage}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 transition-all"
            title="Delete Current Page"
          >
            <Icon name="Trash" size={15} />
            <span className="hidden sm:inline">Remove Page</span>
          </button>
        </div>
      </div>

      {/* Contextual Properties Inspector Bar (shown when an annotation is selected or text tool is active) */}
      {activeAnno?.type === 'text' && (
        <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-3 flex flex-wrap items-center gap-4 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase">Text:</span>
            <input
              type="text"
              value={activeAnno.text}
              onChange={(e) => handleUpdateText(activeAnno.id, e.target.value)}
              className="bg-white border border-primary-200 rounded-lg px-3 py-1 text-gray-900 outline-none w-48 sm:w-64 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase">Font Size:</span>
            <select
              value={activeAnno.size}
              onChange={(e) => {
                const s = parseInt(e.target.value, 10);
                setAnnotations((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((a) =>
                    a.id === activeAnno.id ? { ...a, size: s } : a
                  ),
                }));
              }}
              className="bg-white border border-primary-200 rounded-lg px-2 py-1 outline-none text-gray-800"
            >
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase">Font:</span>
            <select
              value={activeAnno.font}
              onChange={(e) => {
                const f = e.target.value;
                setAnnotations((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((a) =>
                    a.id === activeAnno.id ? { ...a, font: f } : a
                  ),
                }));
              }}
              className="bg-white border border-primary-200 rounded-lg px-2 py-1 outline-none text-gray-800"
            >
              <option value="Helvetica">Helvetica (Clean Sans)</option>
              <option value="Times">Times Roman (Serif)</option>
              <option value="Courier">Courier (Monospace)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase">Color:</span>
            <input
              type="color"
              value={activeAnno.color}
              onChange={(e) => {
                const c = e.target.value;
                setAnnotations((prev) => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map((a) =>
                    a.id === activeAnno.id ? { ...a, color: c } : a
                  ),
                }));
              }}
              className="w-7 h-7 rounded cursor-pointer border border-gray-300"
            />
          </div>

          <button
            type="button"
            onClick={() => handleDeleteAnnotation(activeAnno.id)}
            className="text-red-600 hover:text-red-700 bg-red-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 ml-auto"
          >
            <Icon name="Trash" size={13} /> Delete Text
          </button>
        </div>
      )}

      {/* Main Workspace Grid (Left Thumbnails Sidebar + Center High-DPI Stage) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Thumbnails Sidebar */}
        <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-sm space-y-3 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
              Document Pages ({numPages - deletedPages.length} active)
            </span>
          </div>

          <div className="space-y-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => {
              const isDeleted = deletedPages.includes(pNum);
              const isActive = currentPage === pNum;
              const annoCount = (annotations[pNum] || []).length;

              if (isDeleted) {
                return (
                  <div
                    key={pNum}
                    className="p-2.5 rounded-xl bg-red-50/50 border border-dashed border-red-200 text-xs text-red-400 flex items-center justify-between opacity-60"
                  >
                    <span>Page {pNum} (Removed)</span>
                    <button
                      type="button"
                      onClick={() => setDeletedPages((prev) => prev.filter((p) => p !== pNum))}
                      className="text-[10px] font-bold text-red-600 underline"
                    >
                      Restore
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pNum);
                    setSelectedAnnotationId(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {pNum}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      Page {pNum}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    {annoCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                        {annoCount} edits
                      </span>
                    )}
                    {pageRotations[pNum] ? (
                      <span className="text-primary-600 font-bold">
                        {pageRotations[pNum]}°
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Main High-DPI Canvas Stage */}
        <div className="lg:col-span-3 bg-gray-100/90 rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-inner flex flex-col items-center">
          {/* Zoom & Page Pager Bar */}
          <div className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-2 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700">
                Page <strong className="text-primary-600 font-mono">{currentPage}</strong> of {numPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronRight" size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
              <span>Zoom:</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <span className="font-mono text-gray-900 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.0)}
                className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-500 uppercase"
              >
                Fit 100%
              </button>
            </div>
          </div>

          {/* Interactive Document Stage */}
          <div
            ref={stageRef}
            onMouseMove={handleMouseMoveStage}
            onMouseUp={handleMouseUpStage}
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300 max-w-full"
            style={{ minHeight: '500px' }}
          >
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-40">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs font-bold text-gray-600">Rendering PDF Page...</p>
              </div>
            )}

            {/* Base Vector Render Canvas */}
            <canvas ref={canvasRef} className="block mx-auto" />

            {/* Freehand Pen Canvas Overlay */}
            <canvas
              ref={penCanvasRef}
              onMouseDown={handleMouseDownPenCanvas}
              className={`absolute inset-0 z-20 ${
                activeTool === 'pen' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
              }`}
            />

            {/* Annotation Interactive Items Overlay Layer */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              {currentAnnotations.map((anno) => {
                const isSelected = selectedAnnotationId === anno.id;

                if (anno.type === 'text') {
                  return (
                    <div
                      key={anno.id}
                      onMouseDown={(e) => handleMouseDownAnno(e, anno)}
                      className={`absolute pointer-events-auto cursor-move select-none p-1 rounded transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-primary-600 bg-primary-50/30'
                          : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                      style={{
                        left: `${anno.x}px`,
                        top: `${anno.y}px`,
                        color: anno.color,
                        fontSize: `${anno.size}px`,
                        fontFamily: anno.font,
                      }}
                    >
                      <span>{anno.text}</span>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(anno.id);
                          }}
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                }

                if (anno.type === 'highlight') {
                  return (
                    <div
                      key={anno.id}
                      onMouseDown={(e) => handleMouseDownAnno(e, anno)}
                      className={`absolute pointer-events-auto cursor-move select-none rounded transition-shadow ${
                        isSelected ? 'ring-2 ring-primary-600' : 'hover:ring-1 hover:ring-yellow-500'
                      }`}
                      style={{
                        left: `${anno.x}px`,
                        top: `${anno.y}px`,
                        width: `${anno.width}px`,
                        height: `${anno.height}px`,
                        backgroundColor: anno.color,
                        opacity: anno.opacity,
                      }}
                    >
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(anno.id);
                          }}
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                }

                if (anno.type === 'redact') {
                  return (
                    <div
                      key={anno.id}
                      onMouseDown={(e) => handleMouseDownAnno(e, anno)}
                      className={`absolute pointer-events-auto cursor-move select-none border border-gray-300 ${
                        isSelected ? 'ring-2 ring-primary-600' : ''
                      }`}
                      style={{
                        left: `${anno.x}px`,
                        top: `${anno.y}px`,
                        width: `${anno.width}px`,
                        height: `${anno.height}px`,
                        backgroundColor: anno.color,
                      }}
                    >
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(anno.id);
                          }}
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                }

                if (anno.type === 'image' || anno.type === 'signature') {
                  return (
                    <div
                      key={anno.id}
                      onMouseDown={(e) => handleMouseDownAnno(e, anno)}
                      className={`absolute pointer-events-auto cursor-move select-none p-1 ${
                        isSelected ? 'ring-2 ring-primary-600' : 'hover:ring-1 hover:ring-indigo-300'
                      }`}
                      style={{
                        left: `${anno.x}px`,
                        top: `${anno.y}px`,
                        width: `${anno.width}px`,
                        height: `${anno.height}px`,
                      }}
                    >
                      <img
                        src={anno.dataUrl}
                        alt="Stamp"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(anno.id);
                          }}
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">Create Digital Signature</h3>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`py-2 rounded-lg transition-all ${
                  signatureMode === 'draw' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                ✍️ Draw by Hand
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`py-2 rounded-lg transition-all ${
                  signatureMode === 'type' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                ⌨️ Type Script Signature
              </button>
            </div>

            {signatureMode === 'draw' ? (
              <div>
                <canvas
                  ref={sigCanvasRef}
                  width={380}
                  height={140}
                  onMouseDown={(e) => {
                    setIsDrawingSig(true);
                    const rect = e.target.getBoundingClientRect();
                    const ctx = sigCanvasRef.current.getContext('2d');
                    ctx.lineWidth = 2.5;
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawingSig) return;
                    const rect = e.target.getBoundingClientRect();
                    const ctx = sigCanvasRef.current.getContext('2d');
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  }}
                  onMouseUp={() => setIsDrawingSig(false)}
                  className="w-full h-36 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl cursor-crosshair"
                />
                <button
                  type="button"
                  onClick={() => {
                    const ctx = sigCanvasRef.current?.getContext('2d');
                    ctx?.clearRect(0, 0, 380, 140);
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 underline font-semibold mt-1"
                >
                  Clear Drawing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your full name..."
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-base font-medium outline-none focus:border-primary-600"
                />
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center min-h-[90px] flex items-center justify-center">
                  <span className="text-3xl text-gray-800 font-serif italic" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                    {typedSignature || 'Signature Preview'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
              >
                Stamp Signature Onto PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
