import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function GradientGenerator() {
  const [type, setType] = useState('linear'); // linear, radial
  const [angle, setAngle] = useState(135); // 0 to 360
  const [color1, setColor1] = useState('#CC0000');
  const [color2, setColor2] = useState('#F5A623');
  const [color3, setColor3] = useState('#1A1A2E');
  const [useThreeColors, setUseThreeColors] = useState(false);

  const canvasRef = useRef(null);

  // Generate CSS Gradient string for visual inline preview style
  const getGradientCSS = () => {
    if (type === 'linear') {
      return useThreeColors
        ? `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`
        : `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      return useThreeColors
        ? `radial-gradient(circle, ${color1} 0%, ${color2} 50%, ${color3} 100%)`
        : `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
    }
  };

  // Draw gradient on Canvas (for PNG export)
  const drawGradient = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    let gradient;

    if (type === 'linear') {
      // Calculate start and end coordinates based on angle
      const rad = (angle * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(rad) * width) / 2;
      const y1 = height / 2 - (Math.sin(rad) * height) / 2;
      const x2 = width / 2 + (Math.cos(rad) * width) / 2;
      const y2 = height / 2 + (Math.sin(rad) * height) / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      // Radial centered
      gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    }

    // Add color stops
    if (useThreeColors) {
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color3);
    } else {
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  useEffect(() => {
    drawGradient();
  }, [type, angle, color1, color2, color3, useThreeColors]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    try {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `stargraphix-gradient-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Gradient downloaded as PNG');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PNG');
    }
  };

  const downloadSVG = () => {
    try {
      const width = 800;
      const height = 600;

      let gradDefinition = '';
      if (type === 'linear') {
        // Simple angle coordinate conversion
        const rad = (angle * Math.PI) / 180;
        const x1 = Math.round(50 - Math.cos(rad) * 50);
        const y1 = Math.round(50 - Math.sin(rad) * 50);
        const x2 = Math.round(50 + Math.cos(rad) * 50);
        const y2 = Math.round(50 + Math.sin(rad) * 50);

        gradDefinition = `
    <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${color1}" />
      ${useThreeColors ? `<stop offset="50%" stop-color="${color2}" />` : ''}
      <stop offset="100%" stop-color="${useThreeColors ? color3 : color2}" />
    </linearGradient>`;
      } else {
        gradDefinition = `
    <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="${color1}" />
      ${useThreeColors ? `<stop offset="50%" stop-color="${color2}" />` : ''}
      <stop offset="100%" stop-color="${useThreeColors ? color3 : color2}" />
    </radialGradient>`;
      }

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${gradDefinition}
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>`;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `stargraphix-gradient-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Gradient downloaded as SVG');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download SVG');
    }
  };

  const copyCSS = () => {
    const css = `background: ${getGradientCSS()};`;
    navigator.clipboard.writeText(css);
    toast.success('CSS code copied to clipboard!');
  };

  const randomizeColors = () => {
    const getRandomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    setColor1(getRandomHex());
    setColor2(getRandomHex());
    setColor3(getRandomHex());
    toast.success('Random colors applied!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in text-left">
      {/* Controls Column */}
      <div className="md:col-span-7 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="Gradient" size={24} className="text-primary-600" /> Background Gradient Generator
          </h2>
          <p className="text-xs text-gray-400 mt-1">Design linear and radial vector gradients for layouts</p>
        </div>

        {/* Gradient type and angle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Gradient Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:border-primary-600 outline-none bg-white font-outfit"
            >
              <option value="linear">Linear Gradient</option>
              <option value="radial">Radial Gradient</option>
            </select>
          </div>

          {type === 'linear' ? (
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                <span>Angle</span>
                <span className="font-mono text-gray-400">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded mt-2.5"
              />
            </div>
          ) : (
            <div className="pt-6 text-xs text-gray-400 italic">
              Radial center fits standard aspect scaling.
            </div>
          )}
        </div>

        {/* Colors Setup */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">Colors Palette</span>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={useThreeColors}
                onChange={(e) => setUseThreeColors(e.target.checked)}
                className="accent-primary-600"
              />
              Use 3 Colors
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">Color 1 (Start)</label>
              <div className="flex gap-1.5 items-center">
                <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
                <input type="text" value={color1} onChange={(e) => setColor1(e.target.value)} className="border border-gray-200 rounded-lg px-1 py-1 text-[10px] w-16 text-center font-mono focus:border-primary-600 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">Color 2 (End)</label>
              <div className="flex gap-1.5 items-center">
                <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
                <input type="text" value={color2} onChange={(e) => setColor2(e.target.value)} className="border border-gray-200 rounded-lg px-1 py-1 text-[10px] w-16 text-center font-mono focus:border-primary-600 outline-none" />
              </div>
            </div>

            {useThreeColors && (
              <div className="animate-scale-in">
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Color 3 (Outer)</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={color3} onChange={(e) => setColor3(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
                  <input type="text" value={color3} onChange={(e) => setColor3(e.target.value)} className="border border-gray-200 rounded-lg px-1 py-1 text-[10px] w-16 text-center font-mono focus:border-primary-600 outline-none" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={randomizeColors}
              className="border border-gray-200 hover:border-gray-300 bg-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg text-gray-700 transition-all flex items-center gap-1 shadow-sm"
            >
              Randomize Colors
            </button>
          </div>
        </div>

        {/* Copy CSS Code Area */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex justify-between items-center">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-gray-400 block mb-1">Generated CSS Background</span>
            <code className="text-[11px] font-mono text-gray-700 block truncate select-all">{`background: ${getGradientCSS()};`}</code>
          </div>
          <button onClick={copyCSS} className="btn-secondary text-[10px] py-1.5 px-3 flex-shrink-0 ml-3 shadow-sm font-bold">
            Copy CSS
          </button>
        </div>
      </div>

      {/* Visual Canvas Output Preview */}
      <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border border-gray-150 rounded-2xl bg-gray-50/50">
        <span className="text-[10px] font-bold text-gray-400 tracking-wider mb-4">Live Preview</span>
        <div className="w-full h-40 rounded-2xl shadow-card border border-gray-150 relative overflow-hidden" style={{ background: getGradientCSS() }} />
        {/* Hidden canvas for drawing PNG output */}
        <canvas ref={canvasRef} className="hidden" />
        <div className="w-full mt-6 space-y-2.5">
          <button onClick={downloadPNG} className="btn-primary w-full text-xs py-2.5">
            <Icon name="Download" size={14} /> Download PNG Image
          </button>
          <button onClick={downloadSVG} className="border border-gray-200 bg-white hover:bg-gray-50 font-bold text-xs py-2.5 w-full rounded-lg transition-all flex items-center justify-center gap-1.5 text-gray-700">
            <Icon name="Download" size={14} /> Download SVG (Vector)
          </button>
        </div>
      </div>
    </div>
  );
}
