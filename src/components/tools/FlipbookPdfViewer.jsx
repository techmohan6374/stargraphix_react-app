import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';
import { toast } from 'react-hot-toast';

export default function FlipbookPdfViewer() {
  const [pdfPages, setPdfPages] = useState([]); // array of page canvases (data URLs)
  const [loading, setLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(0); // 0-indexed sheet number
  const [fileName, setFileName] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(6); // Default 6 pages for mock brochure

  const containerRef = useRef(null);

  // Initialize with built-in beautiful sample slides if no PDF is uploaded
  const useSampleBrochure = () => {
    setLoading(true);
    setFileName('stargraphix_portfolio_brochure.pdf');
    
    // Simulate loading the pages
    setTimeout(() => {
      setPdfPages([]); // Empty pages will trigger rendering of beautiful mock HTML slides
      setTotalPages(6);
      setActiveSheet(0);
      setLoading(false);
      toast.success('Loaded mock portfolio brochure!');
    }, 600);
  };

  useEffect(() => {
    // Start with sample brochure automatically
    useSampleBrochure();
  }, []);

  // Handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setActiveSheet(0);

    try {
      // Dynamically load PDF.js from CDN if not already loaded
      const pdfjs = await loadPdfJs();
      
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        
        try {
          const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
          const pagesCount = pdf.numPages;
          setTotalPages(pagesCount);

          const renderedPages = [];
          for (let i = 1; i <= pagesCount; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Create offscreen canvas to render page
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            renderedPages.push(canvas.toDataURL('image/jpeg', 0.85));
          }

          setPdfPages(renderedPages);
          setLoading(false);
          toast.success(`Successfully loaded ${pagesCount} pages from PDF!`);
        } catch (err) {
          console.error(err);
          setLoading(false);
          toast.error('Error rendering PDF pages.');
        }
      };
      fileReader.readAsArrayBuffer(file);

    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Could not load PDF rendering engine from CDN.');
    }
  };

  // Dynamic PDF.js Loader from CDNJS
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Flipbook sheet count: Page 1 is on Sheet 0 (right page, or cover).
  // Pages are mapped: 
  // Page 1: Sheet 0 Front
  // Page 2: Sheet 0 Back
  // Page 3: Sheet 1 Front
  // Page 4: Sheet 1 Back
  // Page 5: Sheet 2 Front
  // Page 6: Sheet 2 Back, etc.
  // So total sheets = Math.ceil((totalPages + 1) / 2) if we include outer covers, 
  // or simply Math.ceil(totalPages / 2) if we count sheets directly.
  // Let's implement a clean sheet structure:
  // Sheet 0: Front = Page 1 (Cover), Back = Page 2
  // Sheet 1: Front = Page 3, Back = Page 4
  // Sheet 2: Front = Page 5, Back = Page 6
  // Sheet 3: Front = Page 7, Back = Page 8 (if exists)
  // Let's compute total sheets:
  const totalSheets = Math.ceil(totalPages / 2);

  const nextPage = () => {
    if (activeSheet < totalSheets - 1) {
      setActiveSheet(activeSheet + 1);
      playFlipSound();
    }
  };

  const prevPage = () => {
    if (activeSheet > 0) {
      setActiveSheet(activeSheet - 1);
      playFlipSound();
    }
  };

  const playFlipSound = () => {
    try {
      // Subtle audio feedback simulation or animated effect
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // browser blocked audio or not supported
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSheet, totalSheets]);

  // Mock template slide details (rendered if pdfPages is empty)
  const renderMockSlide = (pageNum) => {
    const slidesData = {
      1: {
        title: 'STAR GRAPHIX',
        subtitle: 'CREATIVE BRANDING & PRINT CO.',
        desc: 'Brochure Catalogue 2026',
        bg: 'from-brand-dark via-gray-900 to-indigo-950',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-white text-center font-outfit">
            <div className="mt-8 flex justify-center">
              <span className="px-3 py-1 rounded-full border border-indigo-500/30 text-xs font-semibold text-indigo-400 bg-indigo-950/50">
                ★ Creative Portfolio
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-indigo-200 via-rose-200 to-amber-200 bg-clip-text text-transparent">
                STAR GRAPHIX
              </h1>
              <p className="text-xs tracking-widest text-gray-400 font-bold">
                DESIGN STUDIO & LABEL GENERATORS
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 text-[10px] text-gray-500 uppercase tracking-widest">
              Volume 1.0 • Salem Core
            </div>
          </div>
        )
      },
      2: {
        title: 'WHO WE ARE',
        subtitle: 'THE DESIGN HUB',
        bg: 'from-gray-50 to-gray-100',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-gray-800 font-outfit">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">01. Identity</span>
              <h2 className="text-2xl font-black text-gray-900">Elite Creative Tools</h2>
              <div className="w-10 h-1 bg-indigo-600 rounded mt-2 mb-6"></div>
              <p className="text-xs text-gray-500 leading-relaxed">
                We craft state-of-the-art vector label templates, barcodes, QR overlays, and high-impact layouts. Built directly for fast, client-side digital marketing.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Layers" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Vector Generators</h4>
                <p className="text-[10px] text-gray-400">Print-ready barcode & design labels</p>
              </div>
            </div>
          </div>
        )
      },
      3: {
        title: 'OUR PRODUCTS',
        subtitle: 'WHAT WE DESIGN',
        bg: 'from-gray-50 to-gray-100',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-gray-800 font-outfit border-l border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">02. Catalog</span>
              <h2 className="text-2xl font-black text-gray-900">Custom Packaging</h2>
              <div className="w-10 h-1 bg-indigo-600 rounded mt-2 mb-6"></div>
              <ul className="space-y-3.5 text-xs text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> Matte Finished Retail Labels
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> QR Smart Business Cards
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> Vector Barcodes & Security Seals
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> Die-cut Sticker Sheets
                </li>
              </ul>
            </div>
            <div className="text-[9px] text-gray-400 font-semibold uppercase text-right tracking-wider">
              Salem Print Shop
            </div>
          </div>
        )
      },
      4: {
        title: 'OUR RECENT WORKS',
        subtitle: 'CREATIVE DESIGNS',
        bg: 'from-indigo-600 to-violet-700',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-white font-outfit">
            <div>
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block mb-2">03. Gallery</span>
              <h2 className="text-2xl font-black">Modern Aesthetics</h2>
              <div className="w-10 h-1 bg-white rounded mt-2 mb-6"></div>
            </div>
            
            {/* Visual Grid Mockup */}
            <div className="grid grid-cols-2 gap-2 my-auto">
              <div className="aspect-square bg-white/10 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-100 hover:bg-white/20 transition-colors">
                Branding
              </div>
              <div className="aspect-square bg-white/10 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-100 hover:bg-white/20 transition-colors">
                Labels
              </div>
            </div>

            <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
              Salem Design Team
            </div>
          </div>
        )
      },
      5: {
        title: 'CLIENT TESTIMONIALS',
        subtitle: 'FEEDBACK',
        bg: 'from-gray-50 to-gray-100 border-r border-gray-200',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-gray-800 font-outfit">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">04. Clients</span>
              <h2 className="text-2xl font-black text-gray-900">What Partners Say</h2>
              <div className="w-10 h-1 bg-indigo-600 rounded mt-2 mb-6"></div>
              
              <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm relative">
                <span className="text-4xl text-indigo-200 font-serif absolute -top-2 left-2 select-none">“</span>
                <p className="text-[11px] text-gray-500 italic leading-relaxed pl-6 relative z-10">
                  Star Graphix generators saved us hours of custom label designs. The barcodes scanned perfectly in our inventory check!
                </p>
                <div className="mt-3 pl-6">
                  <h5 className="text-[10px] font-bold text-gray-800">Mohan Kumar</h5>
                  <p className="text-[8px] text-gray-400">Inventory Lead, Salem Textiles</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      6: {
        title: 'GET IN TOUCH',
        subtitle: 'CONTACT INFORMATION',
        bg: 'from-brand-dark via-gray-900 to-indigo-950',
        content: (
          <div className="flex flex-col justify-between h-full p-8 text-white font-outfit text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="Mail" size={20} className="text-indigo-400" />
              </div>
              <h2 className="text-xl font-black">Let's Create Together</h2>
              <p className="text-[11px] text-gray-400 mt-2 max-w-xs mx-auto">
                Ready to customize your creative assets? Get in touch with our design workshop.
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <p className="font-bold hover:text-indigo-400 transition-colors cursor-pointer">support@stargraphix.com</p>
              <p className="text-[10px] text-gray-500">Salem, Tamil Nadu, India</p>
            </div>

            <div className="text-[8px] text-gray-600 uppercase tracking-widest">
              © 2026 Star Graphix Ltd.
            </div>
          </div>
        )
      }
    };

    const slide = slidesData[pageNum] || { bg: 'from-gray-50 to-gray-100', content: pageNum };

    return (
      <div className={`w-full h-full bg-gradient-to-br ${slide.bg} shadow-inner flex flex-col justify-between select-none`}>
        {slide.content}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Icon name="Layers" size={18} />
            </span>
            3D Flipbook PDF Viewer
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Upload any product catalogue or brochure PDF to view it in an interactive 3D folding page-flip format.
          </p>
        </div>

        {/* Action Button: Upload */}
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={useSampleBrochure}
            className="border border-indigo-200 hover:bg-indigo-50 text-indigo-600 bg-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="Cpu" size={14} className="text-indigo-600" /> Preload Demo
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold">
              <Icon name="Upload" size={14} /> Upload Catalog PDF
            </button>
          </div>
        </div>
      </div>

      {/* METADATA BAR */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-xs text-gray-600">
        <div className="flex items-center gap-2 truncate">
          <Icon name="FileText" size={14} className="text-gray-400" />
          <span className="font-bold truncate max-w-[200px] md:max-w-xs">{fileName}</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
            {totalPages} Pages
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timeline slider for sheet index navigation */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Go to Sheet</span>
            <input
              type="range"
              min="0"
              max={totalSheets - 1}
              value={activeSheet}
              onChange={(e) => setActiveSheet(parseInt(e.target.value))}
              className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center shadow-sm"
            title="Toggle Fullscreen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* DUAL PAGE 3D FLIPBOOK VIEWPORT */}
      <div
        ref={containerRef}
        className="w-full border border-gray-200 bg-gray-100/50 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden select-none"
        style={{ minHeight: '520px' }}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-500">Generating 3D folding pages...</p>
          </div>
        )}

        {/* 3D BOOK CONTAINER */}
        <div
          className="w-full max-w-[840px] aspect-[1.4] relative transition-transform duration-300 flex items-center justify-center"
          style={{
            transform: `scale(${zoom / 100})`,
            perspective: '1800px' // High depth perspective for 3D curling effect
          }}
        >
          {/* BACKDROP HARDCOVER LEFT */}
          <div className="absolute left-[2%] w-[48%] h-[102%] top-[-1%] bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 rounded-l-2xl shadow-2xl border-r border-black/20 origin-right transition-transform"></div>
          {/* BACKDROP HARDCOVER RIGHT */}
          <div className="absolute right-[2%] w-[48%] h-[102%] top-[-1%] bg-gradient-to-l from-gray-900 via-gray-850 to-gray-900 rounded-r-2xl shadow-2xl border-l border-black/20 origin-left transition-transform"></div>

          {/* INNER PAGES (3D STACKED PAPER) */}
          <div className="w-[96%] h-[96%] bg-white rounded-lg shadow-xl relative overflow-hidden flex">
            
            {/* The actual sheets stack */}
            <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* Loop sheets */}
              {Array.from({ length: totalSheets }).map((_, index) => {
                const isFlipped = index < activeSheet;
                // Calculate 3D stacking order
                const zIndex = isFlipped ? index : totalSheets - index;

                // Page numbering mapping
                const frontPageNum = index * 2 + 1;
                const backPageNum = index * 2 + 2;

                return (
                  <div
                    key={index}
                    className="absolute top-0 right-0 w-1/2 h-full origin-left transition-transform duration-700 ease-out sheet"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                      zIndex: zIndex
                    }}
                  >
                    {/* SHEET FRONT (Visible when sheet is on the right) */}
                    <div
                      className="absolute inset-0 bg-white shadow-l-edge border-l border-gray-150 backface-hidden overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      {/* Render either uploaded PDF canvas image or beautiful mockup HTML slide */}
                      {pdfPages.length > 0 && pdfPages[frontPageNum - 1] ? (
                        <img
                          src={pdfPages[frontPageNum - 1]}
                          alt={`Page ${frontPageNum}`}
                          className="w-full h-full object-fill select-none pointer-events-none"
                        />
                      ) : (
                        renderMockSlide(frontPageNum)
                      )}

                      {/* Hardcover fold line */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
                      
                      {/* Page number badge */}
                      <div className="absolute bottom-2 right-4 text-[9px] font-bold text-gray-400 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                        {frontPageNum}
                      </div>
                    </div>

                    {/* SHEET BACK (Visible when sheet flips over to the left side) */}
                    <div
                      className="absolute inset-0 bg-white shadow-r-edge border-r border-gray-150 overflow-hidden"
                      style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      {pdfPages.length > 0 && pdfPages[backPageNum - 1] ? (
                        <img
                          src={pdfPages[backPageNum - 1]}
                          alt={`Page ${backPageNum}`}
                          className="w-full h-full object-fill select-none pointer-events-none"
                        />
                      ) : (
                        renderMockSlide(backPageNum)
                      )}

                      {/* Hardcover fold line */}
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none"></div>

                      {/* Page number badge */}
                      <div className="absolute bottom-2 left-4 text-[9px] font-bold text-gray-400 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                        {backPageNum}
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* BOOK SPINE CENTER SHADOW */}
              <div className="absolute left-1/2 top-0 w-[4px] h-full bg-gradient-to-r from-black/25 via-black/5 to-black/25 z-20 pointer-events-none transform -translate-x-1/2"></div>
            </div>

          </div>

          {/* PAGE TURN ACTION TOUCH OVERLAYS */}
          <button
            onClick={prevPage}
            disabled={activeSheet === 0}
            className="absolute left-0 w-[12%] h-[90%] bg-transparent flex items-center justify-start pl-4 group disabled:opacity-0 cursor-left z-30"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
              <Icon name="ChevronLeft" size={24} />
            </div>
          </button>
          <button
            onClick={nextPage}
            disabled={activeSheet === totalSheets - 1}
            className="absolute right-0 w-[12%] h-[90%] bg-transparent flex items-center justify-end pr-4 group disabled:opacity-0 cursor-right z-30"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
              <Icon name="ChevronRight" size={24} />
            </div>
          </button>

        </div>

        {/* ZOOM & CONTROLS FOOTER */}
        <div className="mt-8 flex items-center justify-center gap-6 z-10">
          <button
            onClick={prevPage}
            disabled={activeSheet === 0}
            className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent flex items-center gap-1 bg-white border border-gray-250 text-gray-600 hover:bg-gray-50"
          >
            <Icon name="ChevronLeft" size={14} /> Prev Sheet
          </button>

          <span className="text-xs font-bold text-gray-500">
            Sheet {activeSheet + 1} of {totalSheets} (Pages {activeSheet * 2 + 1}-{activeSheet * 2 + 2})
          </span>

          <button
            onClick={nextPage}
            disabled={activeSheet === totalSheets - 1}
            className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent flex items-center gap-1 bg-white border border-gray-255 text-gray-600 hover:bg-gray-50"
          >
            Next Sheet <Icon name="ChevronRight" size={14} />
          </button>
        </div>

      </div>

      {/* QUICK INSTRUCTION TIPS */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Icon name="Info" size={16} className="text-indigo-500" />
          <span>Use the **Left / Right Keyboard Arrow Keys** to flip pages, or click the outer left/right hover regions.</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-white border border-gray-200 font-semibold font-mono text-[10px]">← Left Arrow</span>
          <span className="px-2 py-1 rounded bg-white border border-gray-200 font-semibold font-mono text-[10px]">→ Right Arrow</span>
        </div>
      </div>

    </div>
  );
}
