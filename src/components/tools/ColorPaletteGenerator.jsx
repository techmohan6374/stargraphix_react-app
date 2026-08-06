import { useState } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function ColorPaletteGenerator() {
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteColors, setPaletteColors] = useState(['#CC0000', '#F5A623', '#1A1A2E', '#F7F8FA', '#FFFFFF']);
  const [paletteName, setPaletteName] = useState('Star Graphix Palette');

  const generatePalette = (e) => {
    e.preventDefault();
    const query = paletteQuery.trim().toLowerCase();
    if (!query) return;

    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      hash = query.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hToHex = (h, s, l) => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    let colors = [];
    let baseHue = Math.abs(hash) % 360;

    if (query.includes('neon') || query.includes('bright')) {
      colors = [hToHex(baseHue, 95, 55), hToHex((baseHue + 40) % 360, 95, 50), hToHex((baseHue + 120) % 360, 95, 60), hToHex((baseHue + 200) % 360, 95, 55), '#0E0F19'];
    } else if (query.includes('pastel') || query.includes('soft')) {
      colors = [hToHex(baseHue, 60, 85), hToHex((baseHue + 30) % 360, 60, 85), hToHex((baseHue + 60) % 360, 50, 90), hToHex((baseHue + 180) % 360, 50, 88), '#F9FAFB'];
    } else if (query.includes('vintage') || query.includes('retro')) {
      colors = [hToHex(baseHue, 45, 45), hToHex((baseHue + 30) % 360, 35, 65), hToHex((baseHue + 180) % 360, 30, 75), '#D97706', '#1E293B'];
    } else if (query.includes('ocean') || query.includes('sea') || query.includes('water')) {
      colors = ['#0369A1', '#0284C7', '#0EA5E9', '#38BDF8', '#E0F2FE'];
    } else {
      colors = [hToHex(baseHue, 75, 45), hToHex((baseHue + 30) % 360, 70, 55), hToHex((baseHue + 60) % 360, 60, 65), hToHex((baseHue + 180) % 360, 15, 95), hToHex((baseHue + 200) % 360, 80, 20)];
    }

    setPaletteColors(colors);
    setPaletteName(query.charAt(0).toUpperCase() + query.slice(1) + ' Palette');
    toast.success('Palette generated!');
  };

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied: ${hex}`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="Layers" size={24} className="text-primary-600" /> AI Color Palette Generator
        </h2>
        <p className="text-xs text-gray-400 mt-1">Generate mood-based design color schemes instantly</p>
      </div>

      <p className="text-sm text-gray-500">
        Type any design theme or keyword (e.g. vintage neon, cozy autumn, clean tech, pastel candy) to generate a matching color palette.
      </p>

      <form onSubmit={generatePalette} className="flex gap-2 max-w-lg">
        <input
          type="text"
          value={paletteQuery}
          onChange={(e) => setPaletteQuery(e.target.value)}
          placeholder="e.g. vintage neon, cozy autumn, clean tech..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all font-outfit"
        />
        <button type="submit" className="bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md">
          Generate
        </button>
      </form>

      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-150">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{paletteName}</span>
          <span className="text-[10px] text-gray-400">Click any color to copy hex code</span>
        </div>
        <div className="grid grid-cols-5 h-24 rounded-xl overflow-hidden border border-gray-250 shadow-sm">
          {paletteColors.map((color) => (
            <button
              key={color}
              onClick={() => copyHex(color)}
              style={{ backgroundColor: color }}
              className="h-full flex flex-col justify-end p-2 text-white hover:opacity-90 transition-opacity relative group text-left"
            >
              <span className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] font-mono font-bold bg-black/45 px-1.5 py-0.5 rounded shadow truncate">{color}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
