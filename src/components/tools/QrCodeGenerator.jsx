import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function QrCodeGenerator() {
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(300);
  const [qrMargin, setQrMargin] = useState(3);
  const [fgColor, setFgColor] = useState('#1A1A2E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorCorrection, setErrorCorrection] = useState('H'); // L, M, Q, H
  const [useLogo, setUseLogo] = useState(true);
  const [logoType, setLogoType] = useState('brand'); // brand, custom
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [logoScale, setLogoScale] = useState(22); // percent of QR size (10-30%)
  const [clearLogoBg, setClearLogoBg] = useState(true);

  const canvasRef = useRef(null);
  const logoInputRef = useRef(null);

  const swatches = [
    { name: 'Dark Blue', hex: '#1A1A2E' },
    { name: 'Star Red', hex: '#CC0000' },
    { name: 'Sleek Gold', hex: '#F5A623' },
    { name: 'Forest Green', hex: '#10B981' },
    { name: 'Royal Purple', hex: '#8B5CF6' },
  ];

  const generateQR = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const textToEncode = qrText.trim() || 'https://stargraphix.in';

    try {
      await QRCode.toCanvas(canvas, textToEncode, {
        width: qrSize,
        margin: qrMargin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      });

      if (useLogo) {
        let logoSource = '';
        if (logoType === 'brand') {
          logoSource = '/logo.png';
        } else if (logoType === 'custom' && customLogoUrl) {
          logoSource = customLogoUrl;
        }

        if (logoSource) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = logoSource;
          img.onload = () => {
            const logoPixels = (qrSize * logoScale) / 100;
            const x = (qrSize - logoPixels) / 2;
            const y = (qrSize - logoPixels) / 2;

            if (clearLogoBg) {
              ctx.fillStyle = bgColor;
              ctx.fillRect(x - 4, y - 4, logoPixels + 8, logoPixels + 8);
            }

            ctx.drawImage(img, x, y, logoPixels, logoPixels);
          };
        }
      }
    } catch (err) {
      console.error('QR Generation error:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => generateQR(), 50);
    return () => clearTimeout(timer);
  }, [
    qrText,
    qrSize,
    qrMargin,
    fgColor,
    bgColor,
    errorCorrection,
    useLogo,
    logoType,
    customLogoUrl,
    logoScale,
    clearLogoBg,
  ]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result);
        setLogoType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = (format = 'png') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    try {
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const url = canvas.toDataURL(mime);
      const link = document.createElement('a');
      link.download = `stargraphix-qr-${Date.now()}.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`QR Code downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download');
    }
  };

  const copyQRImage = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          toast.success('QR Code copied to clipboard!');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy to clipboard. Try downloading instead.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in text-left">
      <div className="md:col-span-7 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icon name="QrCode" size={24} className="text-primary-600" /> QR Code Generator
          </h2>
          <p className="text-xs text-gray-400 mt-1">Generate high-quality custom QR codes with center branding</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">QR Content (URL or Text)</label>
          <textarea
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="Enter URL e.g., https://stargraphix.in or contact details..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all min-h-[80px] resize-none font-outfit"
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Foreground Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
              <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 text-center font-mono focus:border-primary-600 outline-none" />
            </div>
            <div className="flex gap-1.5 mt-2">
              {swatches.map((s) => (
                <button key={s.hex} onClick={() => setFgColor(s.hex)} className={`w-5 h-5 rounded-full border border-gray-250 ${fgColor === s.hex ? 'ring-2 ring-primary-500 scale-105' : ''}`} style={{ backgroundColor: s.hex }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Background Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 text-center font-mono focus:border-primary-600 outline-none" />
            </div>
            <div className="flex gap-1.5 mt-2">
              {['#FFFFFF', '#F7F8FA', '#F3F4F6', '#FEF3C7'].map((hex) => (
                <button key={hex} onClick={() => setBgColor(hex)} className={`w-5 h-5 rounded-full border border-gray-250 ${bgColor === hex ? 'ring-2 ring-primary-500 scale-105' : ''}`} style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
              <span>QR SIZE</span>
              <span className="font-mono text-gray-400">{qrSize}px</span>
            </div>
            <input type="range" min="150" max="500" step="10" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
              <span>MARGIN</span>
              <span className="font-mono text-gray-400">{qrMargin} modules</span>
            </div>
            <input type="range" min="0" max="10" value={qrMargin} onChange={(e) => setQrMargin(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-255 cursor-pointer rounded" />
          </div>
        </div>

        {/* Logo overlay setup */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Icon name="Image" size={14} className="text-primary-600" /> Center Logo Overlay
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={useLogo} onChange={(e) => setUseLogo(e.target.checked)} className="sr-only peer" />
              <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {useLogo && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 font-semibold text-gray-600 cursor-pointer">
                  <input type="radio" name="logoType" checked={logoType === 'brand'} onChange={() => setLogoType('brand')} className="accent-primary-600" /> Star Graphix Logo
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-600 cursor-pointer">
                  <input type="radio" name="logoType" checked={logoType === 'custom'} onChange={() => setLogoType('custom')} className="accent-primary-600" /> Custom Upload
                </label>
              </div>

              {logoType === 'custom' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => logoInputRef.current?.click()} className="bg-white border border-gray-255 hover:border-primary-600 text-[10px] py-1.5 px-3 rounded-lg font-semibold shadow-sm transition-all">
                    Upload Logo
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  {customLogoUrl ? <span className="text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">Loaded</span> : <span className="text-[9px] text-gray-400">2MB Max</span>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                    <span>Logo Size</span>
                    <span>{logoScale}%</span>
                  </div>
                  <input type="range" min="10" max="30" value={logoScale} onChange={(e) => setLogoScale(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-gray-250 cursor-pointer rounded" />
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[10px] font-bold text-gray-500">Remove background behind logo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={clearLogoBg} onChange={(e) => setClearLogoBg(e.target.checked)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border border-gray-150 rounded-2xl bg-gray-50/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</span>
        <div className="p-4 bg-white rounded-2xl shadow-card border border-gray-150 inline-block mb-6">
          <canvas ref={canvasRef} style={{ width: '200px', height: '200px' }} className="rounded" />
        </div>
        <div className="w-full space-y-2">
          <button onClick={() => downloadQR('png')} className="btn-primary w-full text-xs py-2.5">
            <Icon name="Download" size={14} /> Download PNG
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => downloadQR('jpeg')} className="btn-secondary text-[10px] py-2 w-full">JPEG</button>
            <button onClick={copyQRImage} className="border border-gray-200 bg-white hover:bg-gray-50 text-[10px] py-2 w-full rounded-lg font-bold transition-all flex items-center justify-center gap-1">Copy Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}
