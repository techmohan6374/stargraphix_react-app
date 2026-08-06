import { useState, useRef, useEffect } from 'react';
import Icon from '../icons/Icons';
import { toast } from 'react-hot-toast';

export default function RemoveBackgroundAI() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('auto'); // 'auto', 'chroma', 'manual'
  const [brushMode, setBrushMode] = useState('erase'); // 'erase', 'restore'
  const [brushSize, setBrushSize] = useState(25);
  const [tolerance, setTolerance] = useState(20);
  const [feather, setFeather] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [hasProcessed, setHasProcessed] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const imageObj = useRef(null);
  const selectedColor = useRef({ r: 255, g: 255, b: 255 });

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    loadImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const loadImage = (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        imageObj.current = img;
        setupCanvases(img);
        setLoading(false);
        setHasProcessed(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const setupCanvases = (img) => {
    // Setup original canvas (hidden)
    const origCanvas = originalCanvasRef.current;
    origCanvas.width = img.width;
    origCanvas.height = img.height;
    const origCtx = origCanvas.getContext('2d');
    origCtx.drawImage(img, 0, 0);

    // Setup mask canvas (stores transparency mask)
    const maskCanvas = maskCanvasRef.current;
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    // Initialize mask to fully opaque white
    maskCtx.fillStyle = '#ffffff';
    maskCtx.fillRect(0, 0, img.width, img.height);

    // Setup visible preview canvas
    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    setImage(img.src);
    renderPreview();
  };

  // Render original image + mask to preview canvas
  const renderPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(imageObj.current, 0, 0);

    // Apply the mask as transparent container
    ctx.globalCompositeOperation = 'destination-in';
    
    // Apply feathering if set
    if (feather > 0) {
      // Use an offscreen canvas to blur the mask slightly for smooth edges
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.filter = `blur(${feather}px)`;
      tempCtx.drawImage(maskCanvasRef.current, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
    } else {
      ctx.drawImage(maskCanvasRef.current, 0, 0);
    }
  };

  // Smart Auto-Clear background simulation using dominant edge colors
  const runAutoBackgroundRemove = () => {
    if (!imageObj.current) return;
    setLoading(true);
    
    setTimeout(() => {
      const origCanvas = originalCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const w = origCanvas.width;
      const h = origCanvas.height;

      const origCtx = origCanvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');

      const imgData = origCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample background colors from 4 corners
      const corners = [
        getPixelColor(data, 0, 0, w),
        getPixelColor(data, w - 1, 0, w),
        getPixelColor(data, 0, h - 1, w),
        getPixelColor(data, w - 1, h - 1, w)
      ];

      const maskData = maskCtx.getImageData(0, 0, w, h);
      const mData = maskData.data;

      // Simple threshold distance checking
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
          // Tolerance scale
          if (dist < tolerance * 2.5) {
            match = true;
            break;
          }
        }

        if (match) {
          mData[i] = 0;     // R
          mData[i + 1] = 0; // G
          mData[i + 2] = 0; // B
          mData[i + 3] = 0; // A (transparent)
        } else {
          mData[i] = 255;
          mData[i + 1] = 255;
          mData[i + 2] = 255;
          mData[i + 3] = 255;
        }
      }

      maskCtx.putImageData(maskData, 0, 0);
      renderPreview();
      setLoading(false);
      setHasProcessed(true);
      toast.success('Background auto-removed!');
    }, 500);
  };

  const getPixelColor = (data, x, y, width) => {
    const idx = (y * width + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2]
    };
  };

  // Run Chroma Key selection based on picked color
  const runChromaKey = (targetColor) => {
    if (!imageObj.current) return;
    
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const w = origCanvas.width;
    const h = origCanvas.height;

    const origCtx = origCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');

    const imgData = origCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const maskData = maskCtx.getImageData(0, 0, w, h);
    const mData = maskData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
      );

      // Map tolerance
      if (dist < tolerance * 2.5) {
        mData[i] = 0;
        mData[i + 1] = 0;
        mData[i + 2] = 0;
        mData[i + 3] = 0;
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
    renderPreview();
    setHasProcessed(true);
  };

  // Triggered on slider changes to update live preview
  useEffect(() => {
    if (image && activeTab !== 'manual') {
      if (activeTab === 'auto' && hasProcessed) {
        runAutoBackgroundRemove();
      } else if (activeTab === 'chroma' && hasProcessed) {
        runChromaKey(selectedColor.current);
      }
    }
  }, [tolerance]);

  useEffect(() => {
    if (image) {
      renderPreview();
    }
  }, [feather]);

  // Manual Eraser / Restore Brush drawing coordinates mapping
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Account for zoom styling
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const handleStartDraw = (e) => {
    if (activeTab === 'chroma') {
      // Pick color mode
      const coords = getCanvasCoords(e);
      const origCtx = originalCanvasRef.current.getContext('2d');
      const pixel = origCtx.getImageData(coords.x, coords.y, 1, 1).data;
      selectedColor.current = { r: pixel[0], g: pixel[1], b: pixel[2] };
      runChromaKey(selectedColor.current);
      return;
    }

    if (activeTab !== 'manual') return;

    isDrawing.current = true;
    drawBrush(e);
  };

  const handleDrawing = (e) => {
    if (!isDrawing.current || activeTab !== 'manual') return;
    e.preventDefault();
    drawBrush(e);
  };

  const handleStopDraw = () => {
    isDrawing.current = false;
    if (activeTab === 'manual') {
      setHasProcessed(true);
    }
  };

  const drawBrush = (e) => {
    const coords = getCanvasCoords(e);
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');

    maskCtx.save();
    maskCtx.beginPath();
    maskCtx.arc(coords.x, coords.y, brushSize, 0, Math.PI * 2);
    
    if (brushMode === 'erase') {
      // destination-out removes color
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      // source-over restores background (draws solid opaque color)
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = '#ffffff';
    }
    
    maskCtx.fill();
    maskCtx.restore();

    renderPreview();
  };

  // Reset canvases
  const handleReset = () => {
    if (!imageObj.current) return;
    setupCanvases(imageObj.current);
    setHasProcessed(false);
    toast.success('Image reset to original state.');
  };

  // Download Transparent PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'stargraphix_no_bg.png';
    link.href = dataUrl;
    link.click();
    toast.success('Downloaded PNG!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-150 text-red-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </span>
            Remove Background AI
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Isolate products and portraits instantly. Use our AI Chroma model or precision brush tools to erase backgrounds locally in your browser.
          </p>
        </div>
      </div>

      {!image ? (
        // UPLOAD DROPZONE
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-3xl p-12 text-center bg-gray-50 hover:bg-indigo-50/20 transition-all duration-300 group cursor-pointer relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Icon name="Upload" size={28} />
            </div>
            <div>
              <p className="font-bold text-gray-700 text-base mb-1">
                Drag and drop your image here
              </p>
              <p className="text-gray-400 text-xs">
                Supports PNG, JPEG, or WebP. Processing is 100% private and runs fully client-side.
              </p>
            </div>
            <button className="btn-primary mt-2 pointer-events-none">
              Browse Files
            </button>
          </div>
        </div>
      ) : (
        // WORKSPACE EDITOR
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Controls Panel */}
          <div className="lg:col-span-4 bg-gray-55 p-6 rounded-2xl border border-gray-200 flex flex-col gap-6 self-start">
            
            {/* Tabs for operation mode */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Eraser Mode</label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => { setActiveTab('auto'); setBrushMode('erase'); }}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'auto'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  AI Auto
                </button>
                <button
                  onClick={() => { setActiveTab('chroma'); setBrushMode('erase'); }}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'chroma'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Color Key
                </button>
                <button
                  onClick={() => { setActiveTab('manual'); }}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'manual'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Precision
                </button>
              </div>
            </div>

            {/* AI Auto Options */}
            {activeTab === 'auto' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Automatically samples border pixels to isolate the main subject. Ideal for studio product shots with consistent backdrops.
                </p>
                <button
                  onClick={runAutoBackgroundRemove}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
                >
                  <Icon name="Zap" size={14} /> Remove Background
                </button>
              </div>
            )}

            {/* Chroma Key / Color Picker Options */}
            {activeTab === 'chroma' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs rounded-xl flex items-start gap-2">
                  <Icon name="Info" size={14} className="mt-0.5" />
                  <span>Click anywhere on the preview image on the right to select the background color you want to key out.</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-600">Color Similarity</label>
                    <span className="text-xs font-bold text-indigo-600">{tolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Manual Edit / Precision Brush Options */}
            {activeTab === 'manual' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Brush Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBrushMode('erase')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        brushMode === 'erase'
                          ? 'border-red-600 bg-red-50 text-red-700 font-extrabold shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-700"></span>
                      Erase Brush
                    </button>
                    <button
                      onClick={() => setBrushMode('restore')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        brushMode === 'restore'
                          ? 'border-green-600 bg-green-50 text-green-700 font-extrabold shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-green-500 border border-green-700"></span>
                      Restore Brush
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-600">Brush Size</label>
                    <span className="text-xs font-bold text-indigo-600">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Edge Feathering (Applied globally on canvas rendering) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-600">Edge Smoothing (Feather)</label>
                <span className="text-xs font-bold text-indigo-600">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={feather}
                onChange={(e) => setFeather(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <hr className="border-gray-200" />

            {/* Control buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 border border-gray-200 hover:bg-gray-100 bg-white py-3 rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="Refresh" size={14} /> Reset Image
              </button>
              <button
                onClick={() => { setImage(null); setHasProcessed(false); }}
                className="border border-gray-200 hover:bg-gray-100 bg-white p-3 rounded-xl text-xs font-bold text-red-600 transition-colors"
                title="Upload New"
              >
                <Icon name="Trash" size={14} />
              </button>
            </div>

            <button
              onClick={handleDownload}
              disabled={!hasProcessed}
              className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 uppercase transition-all shadow-md ${
                hasProcessed
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Icon name="Download" size={14} /> Download PNG (Transparent)
            </button>

          </div>

          {/* RIGHT: Preview Workspace Canvas */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">
            
            {/* Viewport bar (Zoom and details) */}
            <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Workspace Preview</span>
                {activeTab === 'chroma' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgb(${selectedColor.current.r}, ${selectedColor.current.g}, ${selectedColor.current.b})` }}></span>
                    Chroma Key Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="w-7 h-7 rounded bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-semibold w-12 text-center text-gray-600">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="w-7 h-7 rounded bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Main Image View Container */}
            <div
              ref={containerRef}
              className="w-full border border-gray-200 rounded-3xl flex items-center justify-center bg-checkerboard relative overflow-auto select-none"
              style={{ minHeight: '450px', maxHeight: '600px' }}
            >
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-gray-500">Processing background subtraction...</p>
                </div>
              )}

              {/* Original Canvas (Hidden, source pixels) */}
              <canvas ref={originalCanvasRef} className="hidden" />
              {/* Mask Canvas (Hidden, stores black/white/transparent transparency path) */}
              <canvas ref={maskCanvasRef} className="hidden" />

              {/* Visible Preview Canvas */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDrawing}
                onMouseUp={handleStopDraw}
                onMouseLeave={handleStopDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleDrawing}
                onTouchEnd={handleStopDraw}
                className={`max-w-full max-h-full transition-transform duration-100 shadow-md ${
                  activeTab === 'chroma' ? 'cursor-crosshair' : activeTab === 'manual' ? 'cursor-none' : 'cursor-default'
                }`}
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  touchAction: 'none'
                }}
              />
            </div>

            {/* Instruction Footer */}
            <div className="text-center text-[10px] text-gray-400 font-medium">
              {activeTab === 'manual' ? (
                <span>Hold mouse click and drag to paint transparency (Erase) or restore pixels (Restore).</span>
              ) : activeTab === 'chroma' ? (
                <span>Click anywhere on the image to select a color, then drag the Color Similarity slider to clean it.</span>
              ) : (
                <span>Click "Remove Background" to test the automated subject isolating model.</span>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
