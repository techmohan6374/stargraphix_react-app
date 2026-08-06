import { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function BarcodeGenerator() {
  const [barcodeText, setBarcodeText] = useState('SG8056580402');
  const [format, setFormat] = useState('CODE128'); // CODE128, EAN13, EAN8, UPC, ITF
  const [barWidth, setBarWidth] = useState(2); // 1 to 4
  const [barHeight, setBarHeight] = useState(80); // 40 to 150
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState('#1A1A2E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [margin, setMargin] = useState(10);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  const generateBarcode = () => {
    const textToEncode = barcodeText.trim();
    if (!textToEncode) return;

    try {
      // Step 1: Draw on Canvas (for PNG/JPEG downloads)
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, textToEncode, {
          format: format,
          width: barWidth,
          height: barHeight,
          displayValue: displayValue,
          lineColor: lineColor,
          background: bgColor,
          margin: margin,
        });
      }

      // Step 2: Draw on SVG (for SVG download)
      if (svgRef.current) {
        JsBarcode(svgRef.current, textToEncode, {
          format: format,
          width: barWidth,
          height: barHeight,
          displayValue: displayValue,
          lineColor: lineColor,
          background: bgColor,
          margin: margin,
        });
      }
    } catch (err) {
      console.error('Barcode generation error:', err);
    }
  };

  useEffect(() => {
    generateBarcode();
  }, [barcodeText, format, barWidth, barHeight, displayValue, lineColor, bgColor, margin]);

  // Download Barcode as PNG
  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `stargraphix-barcode-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Barcode downloaded as PNG');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PNG');
    }
  };

  // Download Barcode as SVG
  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `stargraphix-barcode-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Barcode downloaded as SVG');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download SVG');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in text-left">
      <div className="md:col-span-7 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="Barcode" size={24} className="text-primary-600" /> Barcode Generator
          </h2>
          <p className="text-xs text-gray-400 mt-1">Generate print-quality vector and raster barcodes</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Barcode Value</label>
          <input
            type="text"
            value={barcodeText}
            onChange={(e) => setBarcodeText(e.target.value)}
            placeholder="e.g. SG8056580402"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all font-mono"
          />
        </div>

        {/* Code Format and display toggle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Barcode Type</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:border-primary-600 outline-none bg-white font-outfit"
            >
              <option value="CODE128">CODE128 (Standard)</option>
              <option value="EAN13">EAN-13 (Retail numbers)</option>
              <option value="EAN8">EAN-8</option>
              <option value="UPC">UPC-A</option>
              <option value="ITF">ITF</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-5">
            <span className="text-xs font-bold text-gray-600">Display Text below bar</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={displayValue} onChange={(e) => setDisplayValue(e.target.checked)} className="sr-only peer" />
              <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Bar Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
              <input type="text" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 text-center font-mono focus:border-primary-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Background Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 text-center font-mono focus:border-primary-600 outline-none" />
            </div>
          </div>
        </div>

        {/* Dimension sliders */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Bar Width</span>
              <span>{barWidth}px</span>
            </div>
            <input type="range" min="1" max="4" value={barWidth} onChange={(e) => setBarWidth(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Bar Height</span>
              <span>{barHeight}px</span>
            </div>
            <input type="range" min="40" max="150" value={barHeight} onChange={(e) => setBarHeight(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Margin</span>
              <span>{margin}px</span>
            </div>
            <input type="range" min="0" max="30" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
          </div>
        </div>
      </div>

      {/* Barcode Output Preview */}
      <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border border-gray-150 rounded-2xl bg-gray-50/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</span>
        <div className="p-4 bg-white rounded-2xl shadow-card border border-gray-150 flex items-center justify-center min-h-[160px] w-full">
          <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
        </div>
        {/* Hidden SVG element for vector downloads */}
        <div className="hidden">
          <svg ref={svgRef} />
        </div>
        <div className="w-full mt-6 space-y-2.5">
          <button onClick={downloadPNG} className="btn-primary w-full text-xs py-2.5">
            <Icon name="Download" size={14} /> Download PNG (Standard)
          </button>
          <button onClick={downloadSVG} className="border border-gray-200 bg-white hover:bg-gray-50 font-bold text-xs py-2.5 w-full rounded-lg transition-all flex items-center justify-center gap-1.5 text-gray-700">
            <Icon name="Download" size={14} /> Download SVG (Vector)
          </button>
        </div>
      </div>
    </div>
  );
}
