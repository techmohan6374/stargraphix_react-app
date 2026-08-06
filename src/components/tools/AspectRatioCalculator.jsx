import { useState, useEffect } from 'react';
import Icon from '../icons/Icons';

export default function AspectRatioCalculator() {
  const [ratioWidth, setRatioWidth] = useState(1920);
  const [ratioHeight, setRatioHeight] = useState(1080);
  const [ratioResult, setRatioResult] = useState('16:9');

  const getGCD = (a, b) => {
    return b ? getGCD(b, a % b) : a;
  };

  useEffect(() => {
    const w = parseInt(ratioWidth) || 0;
    const h = parseInt(ratioHeight) || 0;
    if (w > 0 && h > 0) {
      const gcd = getGCD(w, h);
      setRatioResult(`${w / gcd}:${h / gcd}`);
    } else {
      setRatioResult('Invalid');
    }
  }, [ratioWidth, ratioHeight]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="Grid" size={24} className="text-primary-600" /> Aspect Ratio Calculator
        </h2>
        <p className="text-xs text-gray-400 mt-1">Compute scaling ratios dynamically for prints and canvas screens</p>
      </div>

      <p className="text-sm text-gray-500">
        Enter pixel or physical dimensions (e.g. width and height) to calculate the simplest mathematical aspect ratio for your layout designs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Width (e.g., Pixels / Inches)</label>
            <input
              type="number"
              value={ratioWidth}
              onChange={(e) => setRatioWidth(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-600 outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Height (e.g., Pixels / Inches)</label>
            <input
              type="number"
              value={ratioHeight}
              onChange={(e) => setRatioHeight(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-600 outline-none font-mono"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-150 p-6 flex flex-col justify-center items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Aspect Ratio Result</span>
          <span className="text-4xl font-black text-primary-600 leading-none">{ratioResult}</span>
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-500">
              {ratioResult === '16:9' ? 'Standard Landscape' : ratioResult === '4:3' ? 'Classic Screen' : ratioResult === '1:1' ? 'Square Post' : 'Custom Ratio'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
