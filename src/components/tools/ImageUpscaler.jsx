import { useState, useRef, useCallback } from 'react';
import Icon from '../icons/Icons';
import { toast } from 'react-hot-toast';

const CLIPDROP_API_KEY = '248477557bf6742b8d120922b3cdcf28bb59d474143778d0f888dadd1e49ffc1e83d4599dc5072c1fddee79409928b8c';

const SCALE_PRESETS = [
  { label: '2×', description: 'Double res', multiplier: 2 },
  { label: '3×', description: 'Triple res', multiplier: 3 },
  { label: '4×', description: 'Max 4096px', multiplier: 4 },
];

export default function ImageUpscaler() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [upscaledUrl, setUpscaledUrl] = useState(null);
  const [upscaledDims, setUpscaledDims] = useState({ w: 0, h: 0 });
  const [selectedScale, setSelectedScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef(null);
  const compareRef = useRef(null);

  // ─── File Handling ────────────────────────────────────────────────────────
  const loadFile = useCallback((file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG, JPEG, or WebP images are supported.');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error('File size exceeds the 30 MB limit.');
      return;
    }
    setUpscaledUrl(null);
    setUpscaledDims({ w: 0, h: 0 });
    setCreditsLeft(null);
    setSliderPos(50);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    const img = new Image();
    img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, []);

  const handleFileChange = (e) => loadFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = () => setIsDraggingFile(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    loadFile(e.dataTransfer.files[0]);
  };

  // ─── Compute target dims capped at 4096 ──────────────────────────────────
  const computeTarget = () => {
    const maxDim = 4096;
    let tw = originalDims.w * selectedScale;
    let th = originalDims.h * selectedScale;
    if (tw > maxDim || th > maxDim) {
      const ratio = Math.min(maxDim / tw, maxDim / th);
      tw = Math.round(tw * ratio);
      th = Math.round(th * ratio);
    }
    return { tw, th };
  };

  // ─── Upscale via Clipdrop API ─────────────────────────────────────────────
  const handleUpscale = async () => {
    if (!originalFile) {
      toast.error('Please upload an image first.');
      return;
    }
    const { tw, th } = computeTarget();
    setLoading(true);
    setProgress(10);
    try {
      const form = new FormData();
      form.append('image_file', originalFile);
      form.append('target_width', String(tw));
      form.append('target_height', String(th));

      const progressTick = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 85));
      }, 400);

      const res = await fetch('https://clipdrop-api.co/image-upscaling/v1/upscale', {
        method: 'POST',
        headers: { 'x-api-key': CLIPDROP_API_KEY },
        body: form,
      });

      clearInterval(progressTick);
      setProgress(90);

      if (!res.ok) {
        let errMsg = `API error ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson?.error) errMsg = errJson.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const remaining = res.headers.get('x-remaining-credits');
      const consumed = res.headers.get('x-credits-consumed');
      if (remaining !== null) setCreditsLeft(Number(remaining));

      const blob = await res.blob();
      const resultUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => setUpscaledDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = resultUrl;

      setUpscaledUrl(resultUrl);
      setProgress(100);
      toast.success(`✨ Upscaled to ${tw}×${th}px!${consumed ? ` (${consumed} credit used)` : ''}`);
    } catch (err) {
      console.error('Upscale error:', err);
      toast.error(err.message || 'Upscaling failed. Please try again.');
    } finally {
      setTimeout(() => { setLoading(false); setProgress(0); }, 600);
    }
  };

  // ─── Before/After Slider ─────────────────────────────────────────────────
  const handleSliderMouseDown = (e) => { e.preventDefault(); setIsDraggingSlider(true); };

  const handleSliderMove = useCallback((e) => {
    if (!isDraggingSlider || !compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, [isDraggingSlider]);

  const handleSliderUp = useCallback(() => setIsDraggingSlider(false), []);

  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!upscaledUrl) return;
    const link = document.createElement('a');
    link.href = upscaledUrl;
    link.download = `stargraphix_upscaled_${selectedScale}x.jpg`;
    link.click();
    toast.success('Upscaled image downloaded!');
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setOriginalDims({ w: 0, h: 0 });
    setUpscaledUrl(null);
    setUpscaledDims({ w: 0, h: 0 });
    setCreditsLeft(null);
    setSliderPos(50);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { tw, th } = originalDims.w ? computeTarget() : { tw: 0, th: 0 };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M4 14l4-4 4 4 4-8 4 8"/>
                <rect x="2" y="2" width="20" height="20" rx="3"/>
              </svg>
            </span>
            AI Image Upscaler
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Enhance and upscale your images up to 4× using Clipdrop AI — perfect for print, posters, and product photography.
          </p>
        </div>
        {creditsLeft !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {creditsLeft} Credits Remaining
          </div>
        )}
      </div>

      {!originalUrl ? (
        /* Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-14 text-center transition-all duration-300 group cursor-pointer relative select-none
            ${isDraggingFile
              ? 'border-violet-500 bg-violet-50/30 scale-[1.01]'
              : 'border-gray-300 hover:border-violet-400 bg-gray-50 hover:bg-violet-50/10'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-5 max-w-sm mx-auto pointer-events-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-9 h-9">
                  <path d="M4 14l4-4 4 4 4-8 4 8"/>
                  <rect x="2" y="2" width="20" height="20" rx="3"/>
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-md">✨</span>
            </div>
            <div>
              <p className="font-bold text-gray-700 text-base mb-1">Drop your image here to upscale</p>
              <p className="text-gray-400 text-xs leading-relaxed">PNG, JPEG or WebP · Max 30 MB · Up to 4096 × 4096 px output</p>
            </div>
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-6 py-2.5 text-sm rounded-xl shadow-md shadow-violet-200">
              Browse Files
            </div>
          </div>
        </div>
      ) : (
        /* Main Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Control Panel */}
          <div className="lg:col-span-4 flex flex-col gap-5 self-start">

            {/* Original info card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Original Image</p>
              <div className="flex items-center gap-3">
                <img
                  src={originalUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                />
                <div className="text-xs text-gray-600 space-y-0.5 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{originalFile?.name}</p>
                  <p>{originalDims.w} × {originalDims.h} px</p>
                  <p>{(originalFile?.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>

            {/* Scale selector */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Scale Factor</label>
              <div className="grid grid-cols-3 gap-2">
                {SCALE_PRESETS.map(({ label, description, multiplier }) => (
                  <button
                    key={multiplier}
                    onClick={() => setSelectedScale(multiplier)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border font-bold transition-all duration-200
                      ${selectedScale === multiplier
                        ? 'bg-gradient-to-b from-violet-600 to-indigo-600 text-white border-violet-500 shadow-md shadow-violet-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50'}`}
                  >
                    <span className="text-xl font-black">{label}</span>
                    <span className="text-[9px] font-medium mt-0.5 opacity-80">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target preview */}
            {originalDims.w > 0 && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-3.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Output Preview</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-center">
                    <p className="font-bold text-gray-700">{originalDims.w} × {originalDims.h}</p>
                    <p className="text-gray-400 text-[10px]">Current</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
                    <polyline points="13 17 18 12 13 7"/>
                    <polyline points="6 17 11 12 6 7"/>
                  </svg>
                  <div className="text-center">
                    <p className="font-bold text-violet-700">{tw} × {th}</p>
                    <p className="text-violet-400 text-[10px]">Upscaled</p>
                  </div>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-violet-100">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (selectedScale / 4) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upscale Button */}
            <button
              onClick={handleUpscale}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 uppercase transition-all relative overflow-hidden
                ${loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl active:scale-[0.98]'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                  Upscaling... {progress > 0 ? `${progress}%` : ''}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M4 14l4-4 4 4 4-8 4 8"/>
                  </svg>
                  Upscale with AI
                </>
              )}
              {loading && progress > 0 && (
                <span
                  className="absolute bottom-0 left-0 h-1 bg-violet-400 transition-all duration-500 rounded-b-2xl"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>

            <hr className="border-gray-200" />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 border border-gray-200 hover:bg-gray-100 bg-white py-3 rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="Refresh" size={14} /> Upload New
              </button>
              <button
                onClick={handleDownload}
                disabled={!upscaledUrl}
                className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                  ${upscaledUrl
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Icon name="Download" size={14} /> Download
              </button>
            </div>

            {/* Result info */}
            {upscaledUrl && upscaledDims.w > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-emerald-700">
                  Output: {upscaledDims.w} × {upscaledDims.h} px
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Compare Viewer */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">

            {/* Viewer toolbar */}
            <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                {upscaledUrl ? 'Before / After Comparison' : 'Original Preview'}
              </span>
              {upscaledUrl && (
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                  Drag slider to compare
                </span>
              )}
            </div>

            {/* Image Comparison Container */}
            <div
              ref={compareRef}
              className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow-lg select-none bg-checkerboard"
              style={{ minHeight: 380, cursor: upscaledUrl ? 'col-resize' : 'default' }}
              onMouseMove={handleSliderMove}
              onMouseUp={handleSliderUp}
              onMouseLeave={handleSliderUp}
              onTouchMove={(e) => { if (isDraggingSlider) handleSliderMove(e.touches[0]); }}
              onTouchEnd={handleSliderUp}
            >
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">Upscaling your image...</p>
                    <p className="text-xs text-gray-400 mt-1">Clipdrop AI is enhancing every pixel</p>
                  </div>
                  {progress > 0 && (
                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {upscaledUrl ? (
                <>
                  {/* AFTER (upscaled) - full background */}
                  <img
                    src={upscaledUrl}
                    alt="Upscaled"
                    draggable={false}
                    className="w-full h-full object-contain"
                    style={{ minHeight: 380 }}
                  />

                  {/* BEFORE (original) - clipped left portion */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={originalUrl}
                      alt="Original"
                      draggable={false}
                      className="absolute inset-0 object-contain"
                      style={{
                        width: `${(100 / sliderPos) * 100}%`,
                        height: '100%',
                        minWidth: '100%',
                        minHeight: 380,
                      }}
                    />
                  </div>

                  {/* Divider line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                  />

                  {/* Slider handle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center gap-1"
                    style={{ left: `${sliderPos}%`, transform: 'translate(-50%, -50%)' }}
                    onMouseDown={handleSliderMouseDown}
                    onTouchStart={handleSliderMouseDown}
                  >
                    <div className="w-9 h-9 rounded-full bg-white shadow-xl border-2 border-violet-500 flex items-center justify-center cursor-col-resize">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" className="w-4 h-4">
                        <polyline points="15 18 9 12 15 6"/>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg pointer-events-none z-10">
                    BEFORE
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-violet-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg pointer-events-none z-10">
                    AFTER {selectedScale}×
                  </div>
                </>
              ) : (
                <img
                  src={originalUrl}
                  alt="Original"
                  draggable={false}
                  className="w-full h-full object-contain"
                  style={{ minHeight: 380 }}
                />
              )}
            </div>

            <p className="text-[10px] text-gray-400 font-medium text-center">
              {upscaledUrl
                ? 'Drag the center handle left or right to compare original vs. upscaled image.'
                : 'Click "Upscale with AI" to enhance this image using the Clipdrop API.'}
            </p>
          </div>
        </div>
      )}

      {/* Feature Pills */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {[
          { icon: '🔮', text: 'Powered by Clipdrop AI' },
          { icon: '🖼️', text: 'Up to 4096 × 4096 px' },
          { icon: '🎨', text: 'Preserves colors & detail' },
          { icon: '⚡', text: 'Fast synchronous API' },
        ].map(({ icon, text }) => (
          <span key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-medium rounded-full">
            <span>{icon}</span> {text}
          </span>
        ))}
      </div>
    </div>
  );
}
