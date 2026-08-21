import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import { toast } from 'react-hot-toast';

const DEFAULT_PDF_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/web/compressed.tracemonkey.pdf';
const DEFAULT_PDF_NAME = 'Star Graphix Portfolio Brochure.pdf';

export default function FlipbookPdfViewer() {
  const [activePdfUrl, setActivePdfUrl] = useState(DEFAULT_PDF_URL);
  const [fileName, setFileName] = useState(DEFAULT_PDF_NAME);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Initialize or re-render DearFlip FlipBook
  const loadFlipbook = (sourceUrl) => {
    setLoading(true);

    const init = () => {
      if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.flipBook === 'undefined') {
        setTimeout(init, 200);
        return;
      }

      const $container = window.jQuery(containerRef.current);
      if ($container.length) {
        // Clear previous DearFlip instance
        $container.empty();

        // Initialize DearFlip WebGL 3D FlipBook
        $container.flipBook(sourceUrl, {
          webgl: true,
          height: 600,
          backgroundColor: '#0f172a',
          soundEnable: true,
          autoEnableOutline: true,
          autoEnableThumbnail: true,
          overwritePDFConfig: true,
        });

        setLoading(false);
      }
    };

    init();
  };

  useEffect(() => {
    loadFlipbook(activePdfUrl);
  }, [activePdfUrl]);

  // Handle PDF upload from user
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setActivePdfUrl(objectUrl);
    toast.success(`Loaded "${file.name}" in DearFlip 3D Flipbook!`);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6 font-outfit">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Icon name="Layers" size={20} />
            </span>
            DearFlip 3D Flipbook Viewer
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Powered by <strong>DearFlip WebGL 3D FlipBook</strong>. Upload any brochure or catalog PDF to flip pages interactively.
          </p>
        </div>

        {/* Action Button: Upload PDF */}
        <div className="self-start md:self-auto">
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="btn-primary py-3 px-6 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all">
              <Icon name="Upload" size={18} /> Upload Your PDF File
            </button>
          </div>
        </div>
      </div>

      {/* METADATA BAR */}
      <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3 rounded-2xl text-xs">
        <div className="flex items-center gap-2 truncate">
          <Icon name="FileText" size={16} className="text-indigo-400" />
          <span className="font-bold truncate max-w-[220px] md:max-w-md">{fileName}</span>
          <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-400/20">
            DearFlip 3D Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Icon name="Eye" size={16} />
          </button>
        </div>
      </div>

      {/* DEARFLIP 3D CONTAINER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800 bg-slate-900 min-h-[580px]">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3 text-white">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-300">Initializing DearFlip 3D Engine...</p>
          </div>
        )}

        {/* DearFlip dynamic container target */}
        <div ref={containerRef} className="w-full h-full min-h-[580px]" />
      </div>

      {/* INFO BADGE */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <Icon name="Info" size={16} className="text-indigo-600 flex-shrink-0" />
          <span>
            <strong>DearFlip 3D WebGL Library</strong> active. Includes sound effects, page shadow effects, zoom controls, and thumbnail overview drawer.
          </span>
        </div>
      </div>
    </div>
  );
}
