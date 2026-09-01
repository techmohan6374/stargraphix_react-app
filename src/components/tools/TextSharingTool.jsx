import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function TextSharingTool() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = useState('');
  const [encodedData, setEncodedData] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isLoadedFromUrl, setIsLoadedFromUrl] = useState(false);

  // UTF-8 Safe Base64 Encoding (supports Tamil, Unicode, Emojis, line breaks)
  const safeBtoa = (str) => {
    try {
      return btoa(encodeURIComponent(str));
    } catch (err) {
      console.error('Encoding error:', err);
      return '';
    }
  };

  // UTF-8 Safe Base64 Decoding
  const safeAtob = (str) => {
    try {
      return decodeURIComponent(atob(str));
    } catch (err) {
      console.error('Decoding error:', err);
      return '';
    }
  };

  // Check URL query parameters on mount to auto-decode shared text
  useEffect(() => {
    const dataParam = searchParams.get('data') || searchParams.get('text');
    if (dataParam) {
      const decoded = safeAtob(dataParam);
      if (decoded) {
        setText(decoded);
        setIsLoadedFromUrl(true);
        toast.success('Loaded shared text from link!', { icon: '🔗' });
      }
    }
  }, []);

  // Update encoded data, URL, and QR Code as text changes
  useEffect(() => {
    if (!text.trim()) {
      setEncodedData('');
      setShareUrl('');
      setQrCodeDataUrl('');
      return;
    }

    const encoded = safeBtoa(text);
    setEncodedData(encoded);

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const generatedUrl = `${baseUrl}?data=${encoded}`;
    setShareUrl(generatedUrl);

    // Generate QR Code for the shareable URL
    QRCode.toDataURL(generatedUrl, { width: 200, margin: 2 }, (err, url) => {
      if (!err && url) {
        setQrCodeDataUrl(url);
      }
    });
  }, [text]);

  // Copy Shareable URL
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Shareable link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Raw Text
  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Text copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Clear text and URL search params
  const handleClear = () => {
    setText('');
    setSearchParams({});
    setIsLoadedFromUrl(false);
  };

  // Stats
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  return (
    <div className="space-y-6 text-left font-outfit">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Icon name="Share" size={22} />
          </span>
          Encrypted Text Sharing Tool
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Type or paste any secret text, Tamil Unicode message, or notes to encode into a shareable URL (<span className="font-mono text-purple-600 font-bold">btoa / atob</span>). Anyone with the link can view it instantly!
        </p>
      </div>

      {/* Auto-Loaded Banner */}
      {isLoadedFromUrl && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} className="text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Shared Text Loaded!</strong> Decoded payload from incoming link parameter (<span className="font-mono text-emerald-700">btoa / atob</span>).
            </span>
          </div>
          <button
            onClick={() => setIsLoadedFromUrl(false)}
            className="text-[11px] font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Input Editor vs Share Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Textarea Input Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="Edit" size={14} className="text-gray-500" /> Enter Text to Share
            </span>
            {text && (
              <button
                onClick={handleClear}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <Icon name="Trash" size={13} /> Clear
              </button>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here (English, Tamil தமிழ், notes, links, formatting)..."
            rows={10}
            className="w-full p-4 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none bg-white text-sm text-gray-800 placeholder-gray-400 font-outfit resize-none shadow-inner transition-all leading-relaxed"
          />

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-1 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-3">
              <span>Words: <strong className="text-gray-700 font-mono">{wordCount}</strong></span>
              <span>•</span>
              <span>Chars: <strong className="text-gray-700 font-mono">{charCount}</strong></span>
              <span>•</span>
              <span>Lines: <strong className="text-gray-700 font-mono">{lineCount}</strong></span>
            </div>

            {text && (
              <button
                onClick={handleCopyText}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <Icon name={copiedText ? 'Check' : 'FileText'} size={13} />
                {copiedText ? 'Copied Text!' : 'Copy Text'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Share URL & QR Code Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 border border-gray-200 rounded-3xl bg-gray-50/60 space-y-5">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Shareable Encoded Link
            </span>

            {shareUrl ? (
              <div className="space-y-4">
                
                {/* Encoded URL Display Box */}
                <div className="p-3 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Generated Link (btoa Payload):
                  </span>
                  <p className="text-xs font-mono text-purple-700 break-all line-clamp-3 select-all bg-purple-50/50 p-2 rounded-xl border border-purple-100">
                    {shareUrl}
                  </p>
                </div>

                {/* Base64 Encoded Payload string */}
                <div className="p-3 bg-white border border-gray-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Raw Base64 Data String:
                  </span>
                  <p className="text-[11px] font-mono text-gray-600 break-all select-all">
                    {encodedData}
                  </p>
                </div>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition-all shadow-md ${
                    copiedLink ? 'bg-emerald-600 text-white' : 'btn-primary'
                  }`}
                >
                  <Icon name={copiedLink ? 'Check' : 'Share'} size={16} />
                  {copiedLink ? 'Share Link Copied!' : 'Copy Shareable Link'}
                </button>

              </div>
            ) : (
              <div className="text-center text-gray-400 py-8 text-xs italic">
                Type any message on the left to generate its encoded URL parameter link.
              </div>
            )}
          </div>

          {/* QR Code Container */}
          {qrCodeDataUrl && (
            <div className="pt-4 border-t border-gray-200 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Scan to View on Phone
              </span>
              <div className="p-2 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <img src={qrCodeDataUrl} alt="Share QR Code" className="w-36 h-36 object-contain" />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Instructional Footer */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-500 leading-relaxed">
        <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-1.5">
          <Icon name="Info" size={14} className="text-purple-600" /> How Text Sharing Works:
        </h4>
        <p>
          Your text is encoded into a UTF-8 safe Base64 string (<code className="bg-white px-1.5 py-0.5 rounded border text-purple-700 font-mono font-bold">btoa</code>) and appended directly into the web URL parameters. When someone opens your shared link, our tool automatically decodes the payload (<code className="bg-white px-1.5 py-0.5 rounded border text-purple-700 font-mono font-bold">atob</code>) to display the original message.
        </p>
      </div>

    </div>
  );
}
