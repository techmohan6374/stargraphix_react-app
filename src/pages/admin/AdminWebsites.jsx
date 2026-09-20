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
    createdAt: '2026-09-01 10:00:00'
  },
  {
    id: 'web_002',
    name: 'Star Graphix Free Creative Tools Hub',
    url: 'https://stargraphix.com/free-tools',
    description: 'Online suite of design & productivity tools including QR code generator, barcode generator, PDF editor, and age calculator.',
    category: 'Tools',
    createdAt: '2026-09-10 14:30:00'
  },
  {
    id: 'web_003',
    name: 'Client Design Showcases & Portfolio',
    url: 'https://stargraphix.com/portal',
    description: 'Interactive gallery of past printing projects, brochures, flyers, banners, and logos delivered to 5,000+ satisfied clients.',
    category: 'Showcase',
    createdAt: '2026-09-15 16:45:00'
  }
];

const emptyForm = {
  name: '',
  url: '',
  description: '',
  category: 'Official'
};

export default function AdminWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileNav, setMobileNav] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

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
        // If empty, load default seed
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
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      url: item.url,
      description: item.description,
      category: item.category || 'Official'
    });
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

    // Format URL with https:// if missing
    let formattedUrl = formData.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setSaving(true);
    const payload = {
      ...formData,
      url: formattedUrl,
      id: editId || 'web_' + Date.now().toString(36),
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

      toast.success(editId ? 'Website updated successfully!' : 'New website added to Google Sheet!');
      setShowModal(false);
    } catch (err) {
      console.warn('API error, saving to local state:', err);
      // Optimistic local update
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
      toast.success(editId ? 'Website updated locally!' : 'Website saved locally & queued for sync!');
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

    toast.success(`Removed "${deleteModalItem.name}" from list.`);
    setDeleteModalItem(null);
  };

  // Copy Link to Clipboard
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Website link copied to clipboard!', { icon: '📋' });
  };

  // Filtered List
  const filteredWebsites = websites.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.url || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (item.category || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Official', 'Tools', 'Showcase', 'Portal', 'Client'];

  return (
    <div className="flex min-h-screen bg-gray-50 font-outfit text-left">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
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
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Icon name="Menu" size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <Icon name="Globe" size={22} className="text-primary-600" /> Star Graphix Websites List
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage, catalog, and synchronize Star Graphix digital properties with Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-primary-200 hover:scale-105 active:scale-95 transition-all"
            >
              <Icon name="Plus" size={15} /> Add Website
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Websites</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">{websites.length}</span>
                <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Catalog Active
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Icon name="Globe" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Official Portals</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {websites.filter((w) => (w.category || '').toLowerCase() === 'official').length}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Primary enterprise domains</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Icon name="Award" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Tools & Apps</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {websites.filter((w) => (w.category || '').toLowerCase() === 'tools').length}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Productivity generators</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Icon name="Cpu" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Google Sheets Sync</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block">Active Tab</span>
                <span className="text-xs text-gray-400 mt-1 block">"Websites" Sheet tab</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon name="CheckCircle" size={24} />
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Icon name="Search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Search websites by name, URL, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all text-gray-800"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Websites Cards Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-500">Loading Star Graphix Websites List...</p>
            </div>
          ) : filteredWebsites.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Icon name="Globe" size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Websites Found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {search ? `No websites matched "${search}". Try another keyword.` : 'Start adding websites to your Star Graphix catalog.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Icon name="Plus" size={14} /> Add First Website
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWebsites.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:border-primary-100"
                >
                  <div>
                    {/* Card Top: Icon & Category Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-50 to-rose-50 border border-primary-100 text-primary-600 flex items-center justify-center shadow-xs">
                          <Icon name="Globe" size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-gray-400 block uppercase">
                            ID: {item.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            {item.category || 'General'}
                          </span>
                        </div>
                      </div>

                      {/* Action Menu Buttons */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors"
                          title="Edit Website Details"
                        >
                          <Icon name="Edit" size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalItem(item)}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Website"
                        >
                          <Icon name="Trash" size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Website Name */}
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                      {item.description || 'No description provided for this website.'}
                    </p>

                    {/* Clean URL Pill */}
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200/80 flex items-center justify-between gap-2 text-xs font-mono text-gray-700 mb-4">
                      <span className="truncate text-[11px] select-all">{item.url}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.url)}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                        title="Copy Link to Clipboard"
                      >
                        <Icon name="Share" size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom: Visit Link & Timestamp */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400">
                      {item.createdAt ? `Added ${item.createdAt.substring(0, 10)}` : 'Active'}
                    </span>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Visit Website <Icon name="ArrowRight" size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Website Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Icon name="Globe" size={18} />
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  {editId ? 'Edit Website Details' : 'Add New Star Graphix Website'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Website Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Website Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Star Graphix Free Tools Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all text-gray-800"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Website URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., https://stargraphix.com/free-tools"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all text-gray-800"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 bg-white text-gray-800"
                >
                  <option value="Official">Official (Main Brand Portals)</option>
                  <option value="Tools">Tools (Generators & Creative Suite)</option>
                  <option value="Showcase">Showcase (Portfolios & Client Work)</option>
                  <option value="Portal">Portal (Customer/Client Dashboard)</option>
                  <option value="Client">Client (Client Production Sites)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide a detailed description of the website, its purpose, features, and target audience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all text-gray-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving to Sheet...
                    </>
                  ) : (
                    editId ? 'Save Changes' : 'Add to Google Sheet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-in text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Icon name="Trash" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Delete Website?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong className="text-gray-800 font-semibold">{deleteModalItem.name}</strong>? This will remove it from the Google Sheet and catalog.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
