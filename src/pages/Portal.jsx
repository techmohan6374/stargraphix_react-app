import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icons';
import { portalItems } from '../data/portalItems';

export default function Portal() {
  const [activeTab, setActiveTab] = useState('all'); // all, designs, websites, pdfs
  const [activeSubcat, setActiveSubcat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default, name-asc, name-desc

  // Modal / Lightbox States
  const [lightboxIndex, setLightboxIndex] = useState(null); // index in activeFilteredItems
  const [activePdf, setActivePdf] = useState(null); // pdf object

  // 1. Filtered Items based on search and active tabs
  const filteredItems = useMemo(() => {
    return portalItems.filter(item => {
      // Tab Filtering
      if (activeTab === 'designs') {
        if (item.type !== 'image' || item.category === 'websites') return false;
      } else if (activeTab === 'websites') {
        if (item.category !== 'websites') return false;
      } else if (activeTab === 'pdfs') {
        if (item.type !== 'pdf') return false;
      }

      // Subcategory Filtering (Only applies when "designs" or "all" is selected)
      if (activeTab === 'designs' || activeTab === 'all') {
        if (activeSubcat !== 'all' && item.category !== activeSubcat) {
          // Special cases: group book cover, book wrapper and notebook into 'books' subcategory
          if (activeSubcat === 'books') {
            if (item.category !== 'books') return false;
          } else {
            return false;
          }
        }
      }

      // Search Query Filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCat = item.categoryLabel.toLowerCase().includes(query);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [activeTab, activeSubcat, searchQuery]);

  // 2. Sorted Items
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (sortBy === 'name-asc') {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      return items.sort((a, b) => b.name.localeCompare(a.name));
    }
    return items; // Default order in portalItems
  }, [filteredItems, sortBy]);

  // Subcategory options for Designs
  const designSubcats = [
    { value: 'all', label: 'All Designs', count: portalItems.filter(i => i.type === 'image' && i.category !== 'websites').length },
    { value: 'logos', label: 'Logos', count: portalItems.filter(i => i.category === 'logos').length },
    { value: 'business-cards', label: 'Business Cards', count: portalItems.filter(i => i.category === 'business-cards').length },
    { value: 'digital-cards', label: 'Digital Cards', count: portalItems.filter(i => i.category === 'digital-cards').length },
    { value: 'books', label: 'Books & Covers', count: portalItems.filter(i => i.category === 'books').length },
    { value: 'flyers', label: 'Flyers', count: portalItems.filter(i => i.category === 'flyers').length },
    { value: 'social', label: 'Instagram Posters', count: portalItems.filter(i => i.category === 'social').length },
    { value: 'wedding', label: 'Wedding Cards', count: portalItems.filter(i => i.category === 'wedding').length },
    { value: 'banners', label: 'Banners & Invoices', count: portalItems.filter(i => i.category === 'banners').length },
  ];

  // Helper for counts
  const stats = useMemo(() => {
    const images = portalItems.filter(i => i.type === 'image');
    return {
      total: portalItems.length,
      designs: images.filter(i => i.category !== 'websites').length,
      websites: images.filter(i => i.category === 'websites').length,
      pdfs: portalItems.filter(i => i.type === 'pdf').length,
    };
  }, []);

  // Lightbox Navigation
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    // Find previous image index in sortedItems
    let prevIdx = lightboxIndex - 1;
    while (prevIdx >= 0) {
      if (sortedItems[prevIdx].type === 'image') {
        setLightboxIndex(prevIdx);
        return;
      }
      prevIdx--;
    }
    // Loop to end if not found
    prevIdx = sortedItems.length - 1;
    while (prevIdx > lightboxIndex) {
      if (sortedItems[prevIdx].type === 'image') {
        setLightboxIndex(prevIdx);
        return;
      }
      prevIdx--;
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    // Find next image index in sortedItems
    let nextIdx = lightboxIndex + 1;
    while (nextIdx < sortedItems.length) {
      if (sortedItems[nextIdx].type === 'image') {
        setLightboxIndex(nextIdx);
        return;
      }
      nextIdx++;
    }
    // Loop to start if not found
    nextIdx = 0;
    while (nextIdx < lightboxIndex) {
      if (sortedItems[nextIdx].type === 'image') {
        setLightboxIndex(nextIdx);
        return;
      }
      nextIdx++;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-outfit pb-16">
      {/* ===== HERO PORTAL HEADER ===== */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 py-16 text-white overflow-hidden">
        {/* Decorative Glowing Orbs */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-600 opacity-20 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold-500 opacity-10 rounded-full blur-[80px]" />

        <div className="container-custom relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white bg-opacity-10 text-gold-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white border-opacity-10 backdrop-blur-sm animate-fade-in">
            <Icon name="Zap" size={12} className="text-gold-400" /> STAR GRAPHIX CREATIVE HUB
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Our Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gold-400">Design Portal</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base mb-8 font-medium">
            Explore our curated database of custom graphic designs, live website prototypes, and downloadable PDF portfolios. Sort, search, and view live interactive documents in real-time.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { label: 'Total Projects', count: stats.total, color: 'border-gray-800' },
              { label: 'Graphic Designs', count: stats.designs, color: 'border-primary-900/50' },
              { label: 'Website Interfaces', count: stats.websites, color: 'border-blue-900/50' },
              { label: 'Interactive PDFs', count: stats.pdfs, color: 'border-green-900/50' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gray-900/60 backdrop-blur-md rounded-xl p-4 border ${stat.color} shadow-lg transition-transform duration-300 hover:scale-105`}>
                <p className="text-2xl sm:text-3xl font-black text-white">{stat.count}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Live Search and Sort Controls */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by design name, type, or folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700 focus:border-primary-500 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-all duration-300 focus:ring-2 focus:ring-primary-900/50 font-outfit"
              />
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900/80 border border-gray-700 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors cursor-pointer font-outfit"
            >
              <option value="default">Default Ordering</option>
              <option value="name-asc">Alphabetical: A to Z</option>
              <option value="name-desc">Alphabetical: Z to A</option>
            </select>
          </div>
        </div>
      </section>

      {/* ===== PORTAL TABS & MAIN LAYOUT ===== */}
      <section className="container-custom mt-10">
        {/* Main Tab Controls */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200 pb-4 mb-8">
          {[
            { id: 'all', label: 'All Works', count: stats.total, icon: 'Grid' },
            { id: 'designs', label: 'Graphic Designs', count: stats.designs, icon: 'Image' },
            { id: 'websites', label: 'Website Mockups', count: stats.websites, icon: 'Globe' },
            { id: 'pdfs', label: 'Interactive PDFs', count: stats.pdfs, icon: 'FileText' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveSubcat('all'); // reset design subcategory
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:text-primary-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Design Subcategory Sidebar - Only visible when All Works or Graphic Designs active */}
          {(activeTab === 'all' || activeTab === 'designs') && (
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-28 shadow-sm">
                <h3 className="font-bold text-gray-800 text-sm mb-3 uppercase tracking-wider text-xs">Filter Graphic Designs</h3>
                <div className="space-y-1">
                  {designSubcats.map((sub) => (
                    <button
                      key={sub.value}
                      onClick={() => setActiveSubcat(sub.value)}
                      className={`w-full flex items-center justify-between text-left text-sm px-3 py-2.5 rounded-lg transition-colors font-medium ${
                        activeSubcat === sub.value
                          ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${activeSubcat === sub.value ? 'bg-primary-100 text-primary-800 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                        {sub.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Grid Content */}
          <div className={`${(activeTab === 'all' || activeTab === 'designs') ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {sortedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Search" size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No portal assets found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any design files or PDFs matching "{searchQuery}". Try modifying your search query or switching categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                    setActiveSubcat('all');
                  }}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortedItems.map((item, index) => {
                  const isPdf = item.type === 'pdf';
                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                    >
                      {/* Badge / Category Label */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`badge text-[10px] uppercase font-bold py-1 px-2.5 rounded-lg shadow-sm border ${
                          isPdf 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : item.category === 'websites'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-primary-50 text-primary-700 border-primary-100'
                        }`}>
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Top Asset Preview Section */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center border-b border-gray-50">
                        {isPdf ? (
                          // PDF Card Icon & Preview Mockup
                          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6 text-center group-hover:scale-105 transition-transform duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100">
                              <Icon name="FileText" size={32} />
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Interactive Document</span>
                            <p className="text-xs text-gray-400 font-medium mt-1">{item.fileSize}</p>
                          </div>
                        ) : (
                          // Image Display
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        )}

                        {/* Lightbox / PDF View Hover Overlay */}
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          {isPdf ? (
                            <>
                              <button
                                onClick={() => setActivePdf(item)}
                                className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors duration-200 shadow-md"
                                title="Open Interactive Viewer"
                              >
                                <Icon name="Eye" size={18} />
                              </button>
                              <a
                                href={item.url}
                                download={item.fileName}
                                className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 shadow-md"
                                title="Download PDF File"
                              >
                                <Icon name="Download" size={18} />
                              </a>
                            </>
                          ) : (
                            <button
                              onClick={() => setLightboxIndex(index)}
                              className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors duration-200 shadow-md"
                              title="Zoom Design"
                            >
                              <Icon name="Plus" size={18} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Info & Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium">
                            📁 {item.type === 'pdf' ? 'documents/pdf/' : 'documents/images/'}
                          </p>
                        </div>

                        {/* Order similar / view action */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          {isPdf ? (
                            <button
                              onClick={() => setActivePdf(item)}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                            >
                              Open Document <Icon name="ChevronRight" size={12} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setLightboxIndex(index)}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                            >
                              View Detail <Icon name="ChevronRight" size={12} />
                            </button>
                          )}

                          <Link
                            to="/contact"
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            Order Similar
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM PORTAL CTA ===== */}
      <section className="container-custom mt-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-red-600 p-8 sm:p-12 text-white shadow-xl text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Like Our Creative Showcase?</h2>
          <p className="text-red-100 max-w-xl mx-auto text-sm sm:text-base mb-6 font-medium">
            Get high-end designs, custom brochures, premium business cards, or fully-functional software engineered for your business requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold px-6 py-2.5 text-sm hover:shadow-lg">
              <Icon name="ArrowRight" size={16} /> Get Free Quote
            </Link>
            <Link to="/products" className="bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 border border-white border-opacity-20">
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PORTAL LIGHTBOX MODAL ===== */}
      {lightboxIndex !== null && sortedItems[lightboxIndex]?.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>

          {/* Left Navigation */}
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <Icon name="ChevronLeft" size={24} />
          </button>

          {/* Image & Detail Panel */}
          <div
            className="relative max-w-5xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sortedItems[lightboxIndex].url}
              alt={sortedItems[lightboxIndex].name}
              className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl animate-scale-in"
            />
            <div className="text-center text-white max-w-xl">
              <span className="badge bg-primary-600 text-white text-[10px] uppercase font-bold py-0.5 px-2 rounded mb-2">
                {sortedItems[lightboxIndex].categoryLabel}
              </span>
              <h3 className="text-lg font-bold">{sortedItems[lightboxIndex].name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Asset path: <code className="text-red-400">{sortedItems[lightboxIndex].url}</code>
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <a
                  href={sortedItems[lightboxIndex].url}
                  download={sortedItems[lightboxIndex].name}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="Download" size={14} /> Download Asset
                </a>
                <Link
                  to="/contact"
                  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Order Design
                </Link>
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <Icon name="ChevronRight" size={24} />
          </button>
        </div>
      )}

      {/* ===== PORTAL INTERACTIVE PDF MODAL ===== */}
      {activePdf && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setActivePdf(null)}
        >
          <div
            className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white bg-opacity-15 flex items-center justify-center">
                  <Icon name="FileText" size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-none">{activePdf.name}</h3>
                  <p className="text-[11px] text-emerald-200 mt-1">
                    Folder: {activePdf.category === 'pdf-dbc' ? 'Digital Business Cards' : 'Studio Albums'} &nbsp;•&nbsp; Size: {activePdf.fileSize}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePdf.url}
                  download={activePdf.fileName}
                  className="bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all"
                  title="Download File"
                >
                  <Icon name="Download" size={14} /> Download
                </a>
                <button
                  onClick={() => setActivePdf(null)}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Modal PDF Iframe Content */}
            <div className="flex-1 bg-gray-100 relative">
              <iframe
                src={`${activePdf.url}#toolbar=1`}
                title={activePdf.name}
                className="w-full h-full border-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500 font-medium">
                Note: Standard PDF tools are available inside the viewer panel.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20ordering%20a%20service%20similar%20to%20your%20design:%20${encodeURIComponent(activePdf.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="Whatsapp" size={14} /> Inquire via WhatsApp
                </a>
                <Link
                  to="/contact"
                  className="btn-primary text-xs px-4 py-2 hover:shadow"
                >
                  Get Custom Design
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
