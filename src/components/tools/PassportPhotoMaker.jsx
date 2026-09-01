import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function PassportPhotoMaker() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [hasBgRemoved, setHasBgRemoved] = useState(false);
  
  // Positioning and photo adjustments
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  
  // Background & Layout state
  const [bgColor, setBgColor] = useState('#B0C4DE'); // Default standard Indian Passport light blue
  const [photoFormat, setPhotoFormat] = useState('in'); // 'in' (3.5x4.5cm), 'us' (2x2in), 'stamp' (3.5x3.5cm)
  const [exportLayout, setExportLayout] = useState('maxi_4x6'); // 'single', 'maxi_4x6' (8 photos landscape), 'portrait_4x6' (8 photos portrait), 'gridA4'
  const [a4Count, setA4Count] = useState(30); // Number of photos on A4 sheet (12, 24, 30, 36)
  const [showGuideOverlay, setShowGuideOverlay] = useState(true);

  const canvasRef = useRef(null);
  const printCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const rawFileRef = useRef(null);

  // Background presets for passports
  const bgPresets = [
    { name: 'Passport Light Blue', hex: '#B0C4DE' },
    { name: 'Pure White (US/EU)', hex: '#FFFFFF' },
    { name: 'Off White', hex: '#F3F4F6' },
    { name: 'Studio Red', hex: '#DC2626' },
    { name: 'Royal Blue', hex: '#1E40AF' },
    { name: 'Light Grey', hex: '#D1D5DB' },
    { name: 'Sky Blue', hex: '#38BDF8' },
  ];

  // Photo dimensions in pixels (at 300 DPI scale)
  // Indian standard: 3.5cm x 4.5cm -> 413 x 531 px
  // US standard: 2" x 2" (5.08cm x 5.08cm) -> 600 x 600 px
  // Stamp size: 3.5cm x 3.5cm -> 413 x 413 px
  const getPhotoDimensions = () => {
    switch (photoFormat) {
      case 'us':
        return { w: 600, h: 600, label: '2.0 x 2.0 inches (US Visa / Passport)' };
      case 'stamp':
        return { w: 413, h: 413, label: '3.5 x 3.5 cm (PAN / Stamp Size)' };
      case 'in':
      default:
        return { w: 413, h: 531, label: '3.5 x 4.5 cm (Indian / Int. Passport)' };
    }
  };

  // Upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (JPG, PNG, WebP)');
        return;
      }
      rawFileRef.current = file;
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result);
        setProcessedImage(null);
        setHasBgRemoved(false);
        // Reset crop offsets on new image
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
        setRotate(0);
        setBrightness(100);
        setContrast(100);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove background using remove.bg API with local fallback
  const handleRemoveBackground = async () => {
    if (!originalImage) return;
    setIsRemovingBg(true);
    const toastId = toast.loading('Removing background using AI...');

    try {
      let fileToSend = rawFileRef.current;
      if (!fileToSend && originalImage) {
        const resBlob = await fetch(originalImage);
        fileToSend = await resBlob.blob();
      }

      if (fileToSend) {
        const formData = new FormData();
        formData.append('image_file', fileToSend);
        formData.append('size', 'auto');

        const res = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-API-Key': 'vMoRkTseQhpsCVF4opd4U2mN'
          },
          body: formData
        });

        if (res.ok) {
          const blob = await res.blob();
          const resultUrl = URL.createObjectURL(blob);
          setProcessedImage(resultUrl);
          setHasBgRemoved(true);
          setIsRemovingBg(false);
          toast.success('Background removed successfully via Remove.bg!', { id: toastId });
          return;
        } else {
          console.warn("Remove.bg API failed, trying local automatic color key fallback.");
        }
      }
    } catch (err) {
      console.warn("Remove.bg API network error, switching to local fallback:", err);
    }

    // Local fallback background removal (sampled corner chroma key)
    runLocalBgRemoval(toastId);
  };

  const runLocalBgRemoval = (toastId) => {
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // Sample 4 corners to detect background color
        const corners = [
          { r: data[0], g: data[1], b: data[2] },
          { r: data[(img.width - 1) * 4], g: data[(img.width - 1) * 4 + 1], b: data[(img.width - 1) * 4 + 2] },
          { r: data[(img.height - 1) * img.width * 4], g: data[(img.height - 1) * img.width * 4 + 1], b: data[(img.height - 1) * img.width * 4 + 2] },
          { r: data[(img.height * img.width - 1) * 4], g: data[(img.height * img.width - 1) * 4 + 1], b: data[(img.height * img.width - 1) * 4 + 2] }
        ];

        const tolerance = 45;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let match = false;
          for (const corner of corners) {
            const dist = Math.sqrt(
              Math.pow(r - corner.r, 2) +
              Math.pow(g - corner.g, 2) +
              Math.pow(b - corner.b, 2)
            );
            if (dist < tolerance * 2) {
              match = true;
              break;
            }
          }

          if (match) {
            data[i + 3] = 0; // Make pixel transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedImage(c.toDataURL('image/png'));
        setHasBgRemoved(true);
        setIsRemovingBg(false);
        toast.success('Background auto-removed (Local AI Fallback)!', { id: toastId });
      };
      img.src = originalImage;
    }, 300);
  };

  const activeImageSrc = hasBgRemoved && processedImage ? processedImage : originalImage;

  // Render photo canvas preview and printable layout
  const drawPhotoCanvas = () => {
    if (!activeImageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { w, h } = getPhotoDimensions();

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = activeImageSrc;
    img.onload = () => {
      // Helper function to draw single cropped photo on any target context
      const renderSingleCroppedPhoto = (targetCtx, targetW, targetH) => {
        // 1. Draw solid background color
        targetCtx.fillStyle = bgColor;
        targetCtx.fillRect(0, 0, targetW, targetH);

        // 2. Save context state & apply filters
        targetCtx.save();
        targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        
        // 3. Apply position, rotation & scale
        targetCtx.translate(targetW / 2 + offsetX, targetH / 2 + offsetY);
        targetCtx.rotate((rotate * Math.PI) / 180);
        targetCtx.scale(scale, scale);

        // 4. Calculate cover aspect ratio
        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;
        let drawW, drawH;

        if (imgRatio > targetRatio) {
          drawH = targetH;
          drawW = targetH * imgRatio;
        } else {
          drawW = targetW;
          drawH = targetW / imgRatio;
        }

        targetCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        targetCtx.restore();
      };

      if (exportLayout === 'single') {
        // Single passport photo
        canvas.width = w;
        canvas.height = h;
        renderSingleCroppedPhoto(ctx, w, h);
      } else if (exportLayout === 'maxi_4x6' || exportLayout === 'portrait_4x6') {
        // 4" x 6" Photo Paper Format (300 DPI -> 1200 x 1800 px)
        // Maxi 4x6 (Landscape): 1800 width x 1200 height (4 cols x 2 rows = 8 photos) - EXACT MATCH TO PSD SCREENSHOT!
        // Portrait 4x6: 1200 width x 1800 height (2 cols x 4 rows = 8 photos)
        const isLandscape = exportLayout === 'maxi_4x6';
        const sheetW = isLandscape ? 1800 : 1200;
        const sheetH = isLandscape ? 1200 : 1800;

        canvas.width = sheetW;
        canvas.height = sheetH;

        // White paper background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, sheetW, sheetH);

        // Render single photo to offscreen canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        renderSingleCroppedPhoto(tempCtx, w, h);

        // Grid config for 8 photos
        const cols = isLandscape ? 4 : 2;
        const rows = isLandscape ? 2 : 4;

        // Calculate card scale to fit neatly on 4x6 paper with margin space
        const targetPhotoW = isLandscape ? 380 : 500;
        const targetPhotoH = (targetPhotoW / w) * h;

        const totalGridW = cols * targetPhotoW;
        const totalGridH = rows * targetPhotoH;

        const gapX = (sheetW - totalGridW) / (cols + 1);
        const gapY = (sheetH - totalGridH) / (rows + 1);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gapX + c * (targetPhotoW + gapX);
            const y = gapY + r * (targetPhotoH + gapY);

            // Thin outer cutting border outline
            ctx.strokeStyle = '#D1D5DB';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 2, y - 2, targetPhotoW + 4, targetPhotoH + 4);

            // Draw passport photo onto sheet
            ctx.drawImage(tempCanvas, x, y, targetPhotoW, targetPhotoH);
          }
        }

        // Draw crosshair cut lines at edges
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        // Horizontal dividing guide
        ctx.beginPath();
        ctx.moveTo(0, sheetH / 2);
        ctx.lineTo(sheetW, sheetH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (exportLayout === 'gridA4') {
        // A4 Paper Sheet at 300 DPI (2480 x 3508 px)
        const sheetW = 2480;
        const sheetH = 3508;

        canvas.width = sheetW;
        canvas.height = sheetH;

        // White paper background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, sheetW, sheetH);

        // Render single photo to offscreen canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        renderSingleCroppedPhoto(tempCtx, w, h);

        // Determine columns & rows based on a4Count (12, 24, 30, 36)
        let cols = 5;
        let rows = 6;
        if (a4Count <= 12) { cols = 3; rows = 4; }
        else if (a4Count <= 24) { cols = 4; rows = 6; }
        else if (a4Count <= 30) { cols = 5; rows = 6; }
        else { cols = 6; rows = 6; }

        const photoW = 360;
        const photoH = (photoW / w) * h;

        const totalGridW = cols * photoW;
        const totalGridH = rows * photoH;

        const startX = (sheetW - totalGridW) / (cols + 1);
        const startY = (sheetH - totalGridH) / (rows + 1);

        let countDrawn = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (countDrawn >= a4Count) break;
            const x = startX + c * (photoW + startX);
            const y = startY + r * (photoH + startY);

            // Draw passport border outline & photo
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(x - 2, y - 2, photoW + 4, photoH + 4);
            ctx.drawImage(tempCanvas, x, y, photoW, photoH);

            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - 2, y - 2, photoW + 4, photoH + 4);

            countDrawn++;
          }
        }
      }
    };
  };

  useEffect(() => {
    drawPhotoCanvas();
  }, [
    activeImageSrc,
    scale,
    offsetX,
    offsetY,
    rotate,
    brightness,
    contrast,
    bgColor,
    photoFormat,
    exportLayout,
    a4Count
  ]);

  // Download printable sheet
  const handleDownload = (format = 'image/jpeg') => {
    if (!activeImageSrc || !canvasRef.current) return;
    try {
      const extension = format === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvasRef.current.toDataURL(format, 0.95);
      const link = document.createElement('a');
      link.download = `stargraphix_passport_${exportLayout}_${Date.now()}.${extension}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded ${exportLayout.toUpperCase()} Passport Photo Sheet!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export photo sheet.');
    }
  };

  // Direct Print handler (1:1 physical print scaling)
  const handlePrint = () => {
    if (!activeImageSrc || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 1.0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to open the print dialog');
      return;
    }

    const isLandscape = exportLayout === 'maxi_4x6';
    const isA4 = exportLayout === 'gridA4';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photos - StarGraphix</title>
          <style>
            @page {
              size: ${isA4 ? 'A4' : '4in 6in'} ${isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }
            img {
              width: 100%;
              height: auto;
              max-width: 100vw;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left font-outfit">
      
      {/* LEFT: Controls & Customizer Column */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-xs">
              <Icon name="Camera" size={22} />
            </span>
            Passport Size Photo Maker
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Upload portrait, remove background with AI, choose custom background color, and create 8-photo Maxi or A4 print layouts.
          </p>
        </div>

        {/* Upload Dropzone */}
        {!originalImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-250 hover:border-primary-600 rounded-3xl p-10 text-center cursor-pointer transition-all bg-gray-50/60 hover:bg-primary-50/30 flex flex-col items-center justify-center min-h-[240px] group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 text-primary-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
              <Icon name="Upload" size={26} />
            </div>
            <p className="text-sm font-bold text-gray-700">Upload Portrait / Headshot Photo</p>
            <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, or WebP. Front-facing clear photo works best.</p>
            <button className="btn-primary mt-4 text-xs py-2 px-5 pointer-events-none">
              Choose Photo File
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Top Toolbar Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-150">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs py-2 px-3 rounded-xl text-gray-700 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Icon name="Refresh" size={14} /> Change Photo
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>

              {/* Remove Background AI Button */}
              <button
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                  hasBgRemoved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white'
                }`}
              >
                {isRemovingBg ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Removing BG...</span>
                  </>
                ) : hasBgRemoved ? (
                  <>
                    <Icon name="CheckCircle" size={15} className="text-emerald-600" />
                    <span>BG Removed (AI Active)</span>
                  </>
                ) : (
                  <>
                    <Icon name="Zap" size={15} />
                    <span>Remove Background (Remove.bg)</span>
                  </>
                )}
              </button>

              {hasBgRemoved && (
                <button
                  onClick={() => setHasBgRemoved(!hasBgRemoved)}
                  className="text-[11px] text-gray-500 hover:text-gray-800 underline font-semibold"
                >
                  {hasBgRemoved ? 'View Original Photo' : 'Use Transparent Photo'}
                </button>
              )}
            </div>

            {/* Background Color Customizer */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="Layers" size={14} className="text-primary-600" /> Passport Background Color
                </span>
                <span className="text-xs font-mono font-bold text-gray-500 uppercase">{bgColor}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-gray-300 cursor-pointer bg-white p-0.5 shadow-xs"
                  title="Custom Color Picker"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {bgPresets.map((bg) => (
                    <button
                      key={bg.hex}
                      onClick={() => setBgColor(bg.hex)}
                      className={`w-7 h-7 rounded-xl border transition-all ${
                        bgColor === bg.hex ? 'ring-2 ring-primary-600 scale-110 border-white shadow-sm' : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: bg.hex }}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Positioning & Alignments Panel */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="Grid" size={14} className="text-primary-600" /> Position & Alignment
                </h3>
                <button
                  onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); setRotate(0); setBrightness(100); setContrast(100); }}
                  className="text-[11px] font-bold text-primary-600 hover:underline"
                >
                  Reset Positioning
                </button>
              </div>

              {/* Scale / Zoom */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Zoom / Scale</span>
                  <span className="font-mono text-gray-400">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                />
              </div>

              {/* Position Offset X & Y */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>Shift Horizontal</span>
                    <span className="font-mono text-gray-400">{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>Shift Vertical</span>
                    <span className="font-mono text-gray-400">{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                  />
                </div>
              </div>

              {/* Rotate & Lighting */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                    <span>Rotate</span>
                    <span className="font-mono text-gray-400">{rotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotate}
                    onChange={(e) => setRotate(parseInt(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-gray-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono text-gray-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-primary-600 h-1.5 bg-gray-200 cursor-pointer rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Standard Format & Paper Layout Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                  Photo Standard Format
                </label>
                <select
                  value={photoFormat}
                  onChange={(e) => setPhotoFormat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:border-primary-600 outline-none bg-white font-outfit shadow-xs"
                >
                  <option value="in">Indian / International Passport (3.5 x 4.5 cm)</option>
                  <option value="us">US Visa / Passport / OCI (2 x 2 inches)</option>
                  <option value="stamp">PAN Card / Stamp Photo (3.5 x 3.5 cm)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">
                  Print Layout Format
                </label>
                <select
                  value={exportLayout}
                  onChange={(e) => setExportLayout(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:border-primary-600 outline-none bg-white font-outfit shadow-xs"
                >
                  <option value="maxi_4x6">Maxi Photo Paper (4" x 6" Landscape - 8 Photos)</option>
                  <option value="portrait_4x6">4" x 6" Portrait Paper (8 Photos)</option>
                  <option value="gridA4">Full A4 Sheet Paper (Multi-Photos)</option>
                  <option value="single">Single Photo Export</option>
                </select>
              </div>
            </div>

            {/* A4 Photo Count Selector */}
            {exportLayout === 'gridA4' && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-150 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900">Photos count on A4 sheet:</span>
                <div className="flex gap-2">
                  {[12, 24, 30, 36].map((count) => (
                    <button
                      key={count}
                      onClick={() => setA4Count(count)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                        a4Count === count ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      {count} Photos
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* RIGHT: Preview, Download & Print Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-start p-6 border border-gray-150 rounded-3xl bg-gray-50/60 self-start sticky top-24">
        
        <div className="w-full flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="Eye" size={14} className="text-primary-600" /> Print Sheet Live Preview
          </span>

          {originalImage && exportLayout === 'single' && (
            <button
              onClick={() => setShowGuideOverlay(!showGuideOverlay)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                showGuideOverlay ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              Head Guide
            </button>
          )}
        </div>

        {originalImage ? (
          <div className="w-full flex flex-col items-center">
            
            {/* Live Canvas Preview Frame */}
            <div className="p-4 bg-white rounded-2xl shadow-card border border-gray-200 inline-block mb-6 relative overflow-hidden max-w-full">
              <div className="max-h-[340px] overflow-auto rounded border border-gray-150 flex items-center justify-center bg-gray-100 p-2">
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                  className="shadow-sm rounded bg-white"
                />
              </div>

              {/* Head Alignment Guide Overlay for Single Photo */}
              {exportLayout === 'single' && showGuideOverlay && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                  <div className="w-28 h-36 rounded-full border-2 border-dashed border-primary-500/70 bg-transparent flex flex-col items-center justify-center">
                    <div className="w-16 h-0.5 bg-primary-500/40 mb-3"></div>
                    <span className="text-[8px] font-bold text-primary-700 bg-white/80 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                      Align Head Here
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Layout Specifications Banner */}
            <div className="w-full p-3 bg-white border border-gray-200 rounded-xl mb-4 text-center">
              <span className="text-xs font-bold text-gray-700 block">
                {exportLayout === 'maxi_4x6' && 'Maxi Landscape Sheet (4" x 6" - 8 Passport Photos Grid)'}
                {exportLayout === 'portrait_4x6' && 'Portrait Sheet (4" x 6" - 8 Passport Photos Grid)'}
                {exportLayout === 'gridA4' && `Full A4 Sheet (${a4Count} Passport Photos)`}
                {exportLayout === 'single' && 'Individual High-DPI Passport Photo'}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Photo Format: {getPhotoDimensions().label}
              </span>
            </div>

            {/* Action Buttons: Download & Print */}
            <div className="w-full space-y-2.5">
              <button
                onClick={handlePrint}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Icon name="Print" size={16} /> Print Sheet (Direct 1:1 Scale)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload('image/jpeg')}
                  className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Icon name="Download" size={14} /> Download JPG
                </button>

                <button
                  onClick={() => handleDownload('image/png')}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Icon name="Download" size={14} /> Download PNG
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
              300 DPI high-resolution output with trim guidelines. Use <strong>Print Sheet</strong> for exact photo studio paper printing without scaling distortion.
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
              <Icon name="Image" size={32} />
            </div>
            <p className="text-xs font-medium max-w-xs">
              Upload your photo on the left panel to generate your 8-photo Maxi or A4 passport print sheet.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
