import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function PassportPhotoMaker() {
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [bgColor, setBgColor] = useState('#B0C4DE'); // Default light blue/steel blue background for passports
  const [photoFormat, setPhotoFormat] = useState('in'); // in (3.5x4.5cm / Indian standard), us (2x2" / US standard)
  const [exportLayout, setExportLayout] = useState('single'); // single, grid4x6, gridA4

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Background presets
  const bgPresets = [
    { name: 'Light Blue', hex: '#B0C4DE' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Off White', hex: '#F3F4F6' },
    { name: 'Royal Blue', hex: '#1E40AF' },
  ];

  // Indian standard standard size: 35mm x 45mm (350x450 px on canvas)
  // US standard standard size: 2" x 2" (400x400 px on canvas)
  const getPhotoDimensions = () => {
    return photoFormat === 'in' ? { w: 350, h: 450 } : { w: 400, h: 400 };
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        // Reset crop offsets on new image
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
        setRotate(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawPhoto = () => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { w, h } = getPhotoDimensions();

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Step 1: Handle single photo vs tiled grid export layout
      if (exportLayout === 'single') {
        canvas.width = w;
        canvas.height = h;

        // Draw solid background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        // Apply transformations and draw image centered
        ctx.save();
        ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);

        // Calculate aspect ratios to cover centered
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let drawWidth, drawHeight;

        if (imgRatio > targetRatio) {
          drawHeight = h;
          drawWidth = h * imgRatio;
        } else {
          drawWidth = w;
          drawHeight = w / imgRatio;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      } else {
        // Tiled Grid layout
        // grid4x6: 4x6 inches at 300 DPI = 1200 x 1800 px. Fits 8 passport photos (2 columns, 4 rows)
        // gridA4: 2480 x 3508 px at 300 DPI. Fits 32 passport photos (4 columns, 8 rows)
        const isA4 = exportLayout === 'gridA4';
        const sheetWidth = isA4 ? 2480 : 1200;
        const sheetHeight = isA4 ? 3508 : 1800;

        canvas.width = sheetWidth;
        canvas.height = sheetHeight;

        // Draw sheet white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, sheetWidth, sheetHeight);

        // Create a temporary offscreen canvas for a single cropped photo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.fillStyle = bgColor;
        tempCtx.fillRect(0, 0, w, h);
        tempCtx.save();
        tempCtx.translate(w / 2 + offsetX, h / 2 + offsetY);
        tempCtx.rotate((rotate * Math.PI) / 180);
        tempCtx.scale(scale, scale);

        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let drawWidth, drawHeight;

        if (imgRatio > targetRatio) {
          drawHeight = h;
          drawWidth = h * imgRatio;
        } else {
          drawWidth = w;
          drawHeight = w / imgRatio;
        }

        tempCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        tempCtx.restore();

        // Tile cropped photo onto sheet with borders/margins
        // For 4x6 sheet (1200x1800): 8 photos total (2x4 grid)
        // Photo w: 350/400. Let's compute padding.
        const cols = isA4 ? 6 : 2;
        const rows = isA4 ? 6 : 4;
        
        // Calculate margins
        const totalW = cols * w;
        const totalH = rows * h;
        const startX = (sheetWidth - totalW) / (cols + 1);
        const startY = (sheetHeight - totalH) / (rows + 1);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * (w + startX);
            const y = startY + r * (h + startY);

            // Draw passport photo border outline
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

            // Draw photo
            ctx.drawImage(tempCanvas, x, y, w, h);

            // Draw thin crop boundary marks
            ctx.strokeStyle = '#D1D5DB';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
          }
        }
      }
    };
  };

  useEffect(() => {
    drawPhoto();
  }, [imageSrc, scale, offsetX, offsetY, rotate, bgColor, photoFormat, exportLayout]);

  const handleDownload = () => {
    if (!imageSrc || !canvasRef.current) return;
    try {
      const url = canvasRef.current.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `stargraphix-passport-${exportLayout}-${Date.now()}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Passport layout downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export photo');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
      {/* Controls Column */}
      <div className="lg:col-span-7 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="Camera" size={24} className="text-primary-600" /> Passport Size Photo Maker
          </h2>
          <p className="text-xs text-gray-400 mt-1">Prepare and crop photos for official IDs and printing grids</p>
        </div>

        {/* Upload Button */}
        {!imageSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-250 hover:border-primary-600 rounded-2xl p-10 text-center cursor-pointer transition-all bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px]"
          >
            <Icon name="Camera" size={42} className="text-gray-400 mb-3" />
            <p className="text-sm font-bold text-gray-700">Upload Portrait / Self Photo</p>
            <p className="text-xs text-gray-400 mt-1">Make sure face is centered and lit well</p>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-200 hover:border-gray-350 bg-white font-bold text-xs py-2 px-3 rounded-lg text-gray-700 transition-all shadow-sm"
              >
                Change Photo
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            </div>

            {/* Adjustments Panel */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3.5">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Adjust Photo Positioning</h3>
              
              {/* Scale */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Zoom / Scale</span>
                  <span className="font-mono text-gray-400">{Math.round(scale * 100)}%</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
              </div>

              {/* Offset X */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Shift Horizontal</span>
                  <span className="font-mono text-gray-400">{offsetX}px</span>
                </div>
                <input type="range" min="-150" max="150" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
              </div>

              {/* Offset Y */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Shift Vertical</span>
                  <span className="font-mono text-gray-400">{offsetY}px</span>
                </div>
                <input type="range" min="-150" max="150" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
              </div>

              {/* Rotate */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Rotate Image</span>
                  <span className="font-mono text-gray-400">{rotate}°</span>
                </div>
                <input type="range" min="-45" max="45" value={rotate} onChange={(e) => setRotate(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
              </div>
            </div>

            {/* Background Color preset */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2">
              <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Passport Background Color</span>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer bg-white p-0.5" />
                <div className="flex gap-2">
                  {bgPresets.map((bg) => (
                    <button
                      key={bg.hex}
                      onClick={() => setBgColor(bg.hex)}
                      className={`w-6 h-6 rounded-full border border-gray-300 transition-transform ${bgColor === bg.hex ? 'ring-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: bg.hex }}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Layout formats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Standard Photo Format</label>
                <select
                  value={photoFormat}
                  onChange={(e) => setPhotoFormat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:border-primary-600 outline-none bg-white font-outfit"
                >
                  <option value="in">Indian Passport (3.5 x 4.5 cm)</option>
                  <option value="us">US Visa / ID (2 x 2 inches)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Print Layout Output</label>
                <select
                  value={exportLayout}
                  onChange={(e) => setExportLayout(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:border-primary-600 outline-none bg-white font-outfit"
                >
                  <option value="single">Single Cropped Photo</option>
                  <option value="grid4x6">Print Grid Sheet (4" x 6" Card)</option>
                  <option value="gridA4">Print Grid Sheet (A4 size page)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview and Downloads Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 border border-gray-150 rounded-2xl bg-gray-50/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Print Layout Preview</span>
        
        {imageSrc ? (
          <div className="w-full flex flex-col items-center">
            {/* Live Cropping Guide wrapper */}
            <div className="p-4 bg-white rounded-2xl shadow-card border border-gray-150 inline-block mb-6 relative">
              {exportLayout === 'single' ? (
                <>
                  <canvas ref={canvasRef} style={{ width: '160px', height: photoFormat === 'in' ? '205px' : '160px' }} className="rounded relative z-0 border border-gray-200" />
                  {/* Face outline overlay to help align cropping */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                    <div className="w-24 h-32 rounded-full border-2 border-dashed border-white/60 bg-transparent flex items-center justify-center">
                      <span className="text-[8px] text-white/50 bg-black/30 px-1 rounded uppercase tracking-wider">Align Head</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-h-[220px] overflow-auto border border-gray-200 rounded">
                  <canvas ref={canvasRef} style={{ width: '180px', height: exportLayout === 'gridA4' ? '255px' : '270px' }} />
                </div>
              )}
            </div>

            <button onClick={handleDownload} className="btn-primary w-full text-xs py-2.5 shadow-md">
              <Icon name="Download" size={14} /> Download Printable JPEG
            </button>
            <p className="text-[9px] text-gray-400 text-center mt-3 leading-tight">
              {exportLayout === 'single'
                ? 'Downloads individual cropped high-DPI photo.'
                : 'Generates tiled grid layout with borders and cut guides, ready for direct printing.'}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 italic text-xs">
            Upload a portrait photo to edit and align passport grid printable layouts.
          </div>
        )}
      </div>
    </div>
  );
}
