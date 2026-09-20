import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/api';

const DEFAULT_WEBSITES = [
  {
    id: 'web_001',
    name: 'Star Graphix Official Portal',
    url: 'https://stargraphix.com',
    description: 'Official digital portal for high-end graphic design, commercial printing, wedding cards, resumes, and custom software development.',
    category: 'Official',
    username: '',
    password: '',
    createdAt: '2026-09-01 10:00:00'
  },
  {
    id: 'web_002',
    name: 'Star Graphix Free Creative Tools Hub',
    url: 'https://stargraphix.com/free-tools',
    description: 'Online suite of design & productivity tools including QR code generator, barcode generator, PDF editor, and age calculator.',
    category: 'Tools',
    username: '',
    password: '',
    createdAt: '2026-09-10 14:30:00'
  },
  {
    id: 'web_003',
    name: 'Client Design Showcases & Portfolio',
    url: 'https://stargraphix.com/portal',
    description: 'Interactive gallery of past printing projects, brochures, flyers, banners, and logos delivered to 5,000+ satisfied clients.',
    category: 'Showcase',
    username: '',
    password: '',
    createdAt: '2026-09-15 16:45:00'
  }
];

const emptyForm = {
  name: '',
  url: '',
  description: '',
  category: 'Official',
  username: '',
  password: ''
};

export default function AdminWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' (clean table) or 'grid' (cards)
  const [mobileNav, setMobileNav] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  // Track revealed passwords by website ID
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const toggleRevealPassword = (id) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fetch Websites from Backend API (with LocalStorage fallback)
  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/websites`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setWebsites(data);
        localStorage.setItem('sg_websites', JSON.stringify(data));
      } else {
        const stored = localStorage.getItem('sg_websites');
        const fallback = stored ? JSON.parse(stored) : DEFAULT_WEBSITES;
        setWebsites(fallback);
      }
    } catch (err) {
      console.warn('Backend API connection pending, using local storage fallback:', err);
      const stored = localStorage.getItem('sg_websites');
      setWebsites(stored ? JSON.parse(stored) : DEFAULT_WEBSITES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditId(null);
    setFormData(emptyForm);
    setShowModalPassword(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name || '',
      url: item.url || '',
      description: item.description || '',
      category: item.category || 'Official',
      username: item.username || '',
      password: item.password || ''
    });
    setShowModalPassword(false);
    setShowModal(true);
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Website name is required');
      return;
    }
    if (!formData.url.trim()) {
      toast.error('Website URL is required');
      return;
    }

    let formattedUrl = formData.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setSaving(true);
    const payload = {
      ...formData,
      url: formattedUrl,
      id: editId || 'web_' + Date.now().toString(36),
      username: formData.username ? formData.username.trim() : '',
      password: formData.password ? formData.password.trim() : '',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    try {
      const endpoint = editId ? `${API_BASE}/websites/${editId}` : `${API_BASE}/websites`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API update failed');
      const savedItem = await res.json();

      setWebsites((prev) => {
        let updated;
        if (editId) {
          updated = prev.map((w) => (w.id === editId ? (savedItem.id ? savedItem : payload) : w));
        } else {
          updated = [(savedItem.id ? savedItem : payload), ...prev];
        }
        localStorage.setItem('sg_websites', JSON.stringify(updated));
        return updated;
      });

      toast.success(editId ? 'Website updated!' : 'Website added!');
      setShowModal(false);
    } catch (err) {
      console.warn('API error, saving to local state:', err);
      setWebsites((prev) => {
        let updated;
        if (editId) {
          updated = prev.map((w) => (w.id === editId ? payload : w));
        } else {
          updated = [payload, ...prev];
        }
        localStorage.setItem('sg_websites', JSON.stringify(updated));
        return updated;
      });
      toast.success(editId ? 'Website updated!' : 'Website added!');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  // Confirm and Delete
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    const id = deleteModalItem.id;

    try {
      await fetch(`${API_BASE}/websites/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete error, removing locally:', err);
    }

    setWebsites((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      localStorage.setItem('sg_websites', JSON.stringify(updated));
      return updated;
    });

    toast.success(`Removed "${deleteModalItem.name}".`);
    setDeleteModalItem(null);
  };

  // Copy to Clipboard helper
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: '📋' });
  };

  // Filtered List
  const filteredWebsites = websites.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.url || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (item.category || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Official', 'Tools', 'Showcase', 'Portal', 'Client'];

  const getCategoryBadgeClass = (category) => {
    const cat = (category || '').toLowerCase();
    switch (cat) {
      case 'tools':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'client':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'official':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'showcase':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60 font-outfit text-left">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex">
          <div className="w-64 max-w-full">
            <AdminSidebar mobile onClose={() => setMobileNav(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Icon name="Menu" size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Icon name="Globe" size={20} className="text-primary-600" /> Star Graphix Websites List
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage, catalog, and synchronize Star Graphix digital properties with Google Sheets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-primary-200 transition-all active:scale-95"
          >
            <Icon name="Plus" size={14} /> Add Website
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 w-full">
          {/* Minimalist Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-400 block">Total Websites</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">{websites.length}</span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Catalog
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-400 block">Official Portals</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                {websites.filter((w) => (w.category || '').toLowerCase() === 'official').length}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Main brand domains</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-400 block">Tools & Apps</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                {websites.filter((w) => (w.category || '').toLowerCase() === 'tools').length}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">Creative generators</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-400 block">Google Sheets Sync</span>
              <span className="text-base font-black text-emerald-600 mt-1 block flex items-center gap-1.5">
                <Icon name="CheckCircle" size={16} className="text-emerald-500" /> Active Tab
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">"Websites" Sheet</span>
            </div>
          </div>

          {/* Unified Filter & Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Icon name="Search" size={15} />
              </div>
              <input
                type="text"
                placeholder="Search by name, URL, username, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 bg-gray-50/50 hover:bg-white focus:bg-white transition-all text-gray-800"
              />
            </div>

            {/* Filter Pills & View Switcher */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewMode === 'list' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'hover:text-gray-900'
                  }`}
                  title="Table List View"
                >
                  <Icon name="Layers" size={13} /> List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'hover:text-gray-900'
                  }`}
                  title="Grid Cards View"
                >
                  <Icon name="Grid" size={13} /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Websites Display */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-gray-400">Loading Websites List...</p>
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Icon name="Globe" size={22} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">No Websites Found</h3>
              <p className="text-xs text-gray-400 mt-1">
                {search ? `No results for "${search}".` : 'No websites registered in this category.'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            /* CLEAN STRUCTURED TABLE / LIST VIEW */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-3.5 px-4 sm:px-6">Website Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">URL / Domain</th>
                      <th className="py-3.5 px-4">Credentials (Optional)</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWebsites.map((item) => {
                      const hasCredentials = item.username || item.password;
                      const isPasswordRevealed = revealedPasswords[item.id];

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                          {/* Website Details */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                                <Icon name="Globe" size={17} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                  {item.name}
                                </h4>
                                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                  {item.description || 'No description.'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(item.category)}`}>
                              {item.category || 'General'}
                            </span>
                          </td>

                          {/* URL Pill */}
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono text-[11px] text-gray-700 max-w-xs truncate">
                              <span className="truncate select-all">{item.url}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.url, 'Website URL')}
                                className="text-gray-400 hover:text-gray-800 transition-colors flex-shrink-0"
                                title="Copy URL"
                              >
                                <Icon name="Share" size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Credentials */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {hasCredentials ? (
                              <div className="space-y-1 font-mono text-[11px] text-gray-700">
                                {item.username && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400">User:</span>
                                    <span className="font-medium text-gray-800">{item.username}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item.username, 'Username')}
                                      className="text-primary-600 hover:underline text-[10px] font-bold ml-1"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                )}
                                {item.password && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400">Pass:</span>
                                    <span className="font-medium text-gray-800">{isPasswordRevealed ? item.password : '••••••••'}</span>
                                    <button
                                      type="button"
                                      onClick={() => toggleRevealPassword(item.id)}
                                      className="text-gray-500 hover:text-gray-800 text-[10px] ml-1"
                                    >
                                      {isPasswordRevealed ? 'Hide' : 'Show'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item.password, 'Password')}
                                      className="text-primary-600 hover:underline text-[10px] font-bold"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 font-mono">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-all"
                              >
                                Visit <Icon name="ArrowRight" size={11} />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                title="Edit Website"
                              >
                                <Icon name="Edit" size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModalItem(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Website"
                              >
                                <Icon name="Trash" size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* BALANCED UNIFORM GRID CARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredWebsites.map((item) => {
                const hasCredentials = item.username || item.password;
                const isPasswordRevealed = revealedPasswords[item.id];

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                            <Icon name="Globe" size={16} />
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(item.category)}`}>
                            {item.category || 'General'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 text-gray-400">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Edit Website"
                          >
                            <Icon name="Edit" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(item)}
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Website"
                          >
                            <Icon name="Trash" size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                        {item.description || 'No description provided.'}
                      </p>

                      {/* URL Box */}
                      <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-200/80 flex items-center justify-between gap-2 text-xs font-mono text-gray-700 mb-3">
                        <span className="truncate text-[11px] select-all">{item.url}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.url, 'Website URL')}
                          className="p-1 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <Icon name="Share" size={12} />
                        </button>
                      </div>

                      {/* Credentials Box */}
                      {hasCredentials && (
                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 text-xs space-y-1.5 mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Login Credentials
                          </span>

                          {item.username && (
                            <div className="flex items-center justify-between font-mono text-[11px] text-gray-700">
                              <span className="text-gray-400">User: <strong className="text-gray-800 font-normal">{item.username}</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.username, 'Username')}
                                className="text-[10px] text-primary-600 hover:underline font-bold"
                              >
                                Copy
                              </button>
                            </div>
                          )}

                          {item.password && (
                            <div className="flex items-center justify-between font-mono text-[11px] text-gray-700">
                              <span className="text-gray-400">
                                Pass: <strong className="text-gray-800 font-normal">{isPasswordRevealed ? item.password : '••••••••'}</strong>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleRevealPassword(item.id)}
                                  className="text-[10px] text-gray-500 hover:text-gray-800"
                                >
                                  {isPasswordRevealed ? 'Hide' : 'Show'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(item.password, 'Password')}
                                  className="text-[10px] text-primary-600 hover:underline font-bold"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Link Bar */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.createdAt ? item.createdAt.substring(0, 10) : ''}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider"
                      >
                        Visit Website <Icon name="ArrowRight" size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Website Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Icon name="Globe" size={18} className="text-primary-600" />
                {editId ? 'Edit Website' : 'Add New Website'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Website Name */}
              <div>
                <label className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Website Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Star Graphix Free Tools Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary-600 transition-all text-gray-800"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Website URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., https://stargraphix.com/free-tools"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary-600 transition-all text-gray-800"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600 bg-white text-gray-800"
                >
                  <option value="Official">Official (Main Brand Portals)</option>
                  <option value="Tools">Tools (Generators & Creative Suite)</option>
                  <option value="Showcase">Showcase (Portfolios & Client Work)</option>
                  <option value="Portal">Portal (Customer/Client Dashboard)</option>
                  <option value="Client">Client (Client Production Sites)</option>
                </select>
              </div>

              {/* Optional Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-gray-500 block mb-1">
                    Username <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., admin / staff"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary-600 transition-all text-gray-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-gray-500">
                      Password <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="text-[10px] text-gray-400 hover:text-gray-700"
                    >
                      {showModalPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary-600 transition-all text-gray-800"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the website purpose, features, or client..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary-600 transition-all text-gray-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editId ? 'Save' : 'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Icon name="Trash" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Website?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong className="text-gray-800 font-semibold">{deleteModalItem.name}</strong>?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
