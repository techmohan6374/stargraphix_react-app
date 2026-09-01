import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import { products as defaultProducts } from '../../data/products';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/api';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import Pagination from '../../components/ui/Pagination';

const emptyForm = { name: '', price: '', originalPrice: '', category: 'design-printing', subcategory: 'flyers', description: '', badge: '', features: '', image: '', inStock: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [previewImageProduct, setPreviewImageProduct] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.warn("Backend not running, falling back to static products:", err);
      const stored = localStorage.getItem('sg_products');
      setProducts(stored ? JSON.parse(stored) : defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/products/upload-image`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm({ ...form, image: data.imageUrl });
      toast.success('Image uploaded to Cloudinary!');
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    
    const product = {
      ...form,
      id: editId || `p${Date.now()}`,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      features: form.features ? form.features.split(',').map(f => f.trim()) : [],
      rating: 4.5, reviewCount: 0, tags: [], slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      images: form.image ? [form.image] : [],
    };

    try {
      const url = editId 
        ? `${API_BASE}/products/${editId}` 
        : `${API_BASE}/products`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('API failed');

      toast.success(editId ? 'Product updated!' : 'Product added!');
      fetchProducts();
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      let updated;
      if (editId) {
        updated = products.map(p => p.id === editId ? product : p);
        toast.success('Product updated (Local Fallback)!');
      } else {
        updated = [product, ...products];
        toast.success('Product added (Local Fallback)!');
      }
      setProducts(updated);
      localStorage.setItem('sg_products', JSON.stringify(updated));
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, price: product.price, originalPrice: product.originalPrice || '',
      category: product.category, subcategory: product.subcategory, description: product.description,
      badge: product.badge || '', features: product.features?.join(', ') || '',
      image: product.image || '', inStock: product.inStock,
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      console.error(err);
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('sg_products', JSON.stringify(updated));
      toast.success('Product deleted (Local Fallback)');
    }
    setDeleteConfirm(null);
    setDeleteModalProduct(null);
  };

  const toggleStock = async (id) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    const updatedItem = { ...item, inStock: !item.inStock };
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) throw new Error('Update failed');
      fetchProducts();
    } catch (err) {
      console.error(err);
      const updated = products.map(p => p.id === id ? updatedItem : p);
      setProducts(updated);
      localStorage.setItem('sg_products', JSON.stringify(updated));
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.subcategory?.includes(search.toLowerCase())
  );

  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100 font-outfit">
      <div className="hidden md:block w-56 fixed inset-y-0 left-0 z-20"><AdminSidebar /></div>
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-10">
            <AdminSidebar mobile onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-56 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"><Icon name="Menu" size={20} /></button>
            <h1 className="text-lg font-bold text-gray-900">Products</h1>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="btn-primary text-sm py-2 px-4">
            <Icon name="Plus" size={15} /> Add Product
          </button>
        </header>

        <div className="p-4 sm:p-6">
          {/* Add/Edit form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 animate-slide-down">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">{editId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-600">
                  <Icon name="X" size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="499" className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} placeholder="799" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    <option value="design-printing">Design & Printing</option>
                    <option value="software-development">Software Development</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Subcategory</label>
                  <select value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} className="input-field">
                    <option value="flyers">Flyers</option>
                    <option value="business-cards">Business Cards</option>
                    <option value="resumes">Resumes</option>
                    <option value="instagram-posters">Instagram Posters</option>
                    <option value="wedding-cards">Wedding Cards</option>
                    <option value="brochures">Brochures</option>
                    <option value="banners">Banners</option>
                    <option value="certificates">Certificates</option>
                    <option value="letterheads">Letterheads</option>
                    <option value="id-cards">ID Cards</option>
                    <option value="web-applications">Web Applications</option>
                    <option value="mobile-applications">Mobile Applications</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="logo-design">Logo Design</option>
                    <option value="seo-marketing">SEO & Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Badge</label>
                  <select value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} className="input-field">
                    <option value="">None</option>
                    <option>Best Seller</option><option>Popular</option><option>Top Rated</option>
                    <option>Trending</option><option>Best Value</option><option>Premium</option><option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Product Image</label>
                  <div className="flex items-center gap-3">
                    {form.image && (
                      <img src={form.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                    {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Features (comma separated)</label>
                  <input value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="Feature 1, Feature 2, Feature 3" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-field resize-none" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} className="accent-primary-600 w-4 h-4" />
                    In Stock
                  </label>
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary text-sm py-2.5 px-6">
                    <Icon name={editId ? 'Check' : 'Plus'} size={16} /> {editId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="btn-secondary text-sm py-2.5 px-5">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 mb-4 flex items-center gap-2 px-4 py-2.5">
            <Icon name="Search" size={16} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" />
            {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><Icon name="X" size={14} /></button>}
          </div>

          {/* Stats & Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Stat Cards */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Total Products', value: products.length, color: 'text-primary-600', icon: 'Package', bg: 'bg-primary-50' },
                { label: 'In Stock Products', value: products.filter(p => p.inStock).length, color: 'text-green-600', icon: 'CheckCircle', bg: 'bg-green-50' },
                { label: 'Out of Stock', value: products.filter(p => !p.inStock).length, color: 'text-red-600', icon: 'AlertCircle', bg: 'bg-red-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                    <Icon name={s.icon} size={20} />
                  </div>
                </div>
              ))}
            </div>

            {/* ECharts - Category Breakdown Doughnut */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
                <Icon name="PieChart" size={16} className="text-primary-600" /> Category Breakdown
              </h3>
              <div className="h-48 w-full">
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'item',
                      formatter: '{b}: <b>{c} products</b> ({d}%)',
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      textStyle: { color: '#fff', fontSize: 11, fontFamily: 'Outfit' }
                    },
                    legend: {
                      bottom: '0%',
                      left: 'center',
                      itemWidth: 8,
                      itemHeight: 8,
                      textStyle: { fontSize: 10, color: '#6b7280', fontFamily: 'Outfit' }
                    },
                    series: [
                      {
                        name: 'Category',
                        type: 'pie',
                        radius: ['45%', '72%'],
                        center: ['50%', '40%'],
                        avoidLabelOverlap: false,
                        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
                        label: {
                          show: true,
                          position: 'center',
                          formatter: () => `{total|${products.length}}\n{label|Products}`,
                          rich: {
                            total: { fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Outfit' },
                            label: { fontSize: 10, color: '#6b7280', fontFamily: 'Outfit' }
                          }
                        },
                        data: (() => {
                          const catMap = {};
                          products.forEach(p => {
                            const name = p.subcategory ? p.subcategory.replace(/-/g, ' ') : 'Other';
                            catMap[name] = (catMap[name] || 0) + 1;
                          });
                          return Object.entries(catMap).map(([name, value]) => ({ name, value }));
                        })()
                      }
                    ]
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>

            {/* ECharts - Stock vs Pricing Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
                <Icon name="BarChart" size={16} className="text-primary-600" /> Stock Status Distribution
              </h3>
              <div className="h-48 w-full">
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      axisPointer: { type: 'shadow' },
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      textStyle: { color: '#fff', fontSize: 11, fontFamily: 'Outfit' }
                    },
                    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                    xAxis: {
                      type: 'category',
                      data: ['In Stock', 'Out of Stock'],
                      axisLine: { lineStyle: { color: '#e5e7eb' } },
                      axisLabel: { color: '#6b7280', fontFamily: 'Outfit' }
                    },
                    yAxis: {
                      type: 'value',
                      axisLabel: { color: '#6b7280', fontFamily: 'Outfit' },
                      splitLine: { lineStyle: { color: '#f3f4f6' } }
                    },
                    series: [
                      {
                        name: 'Product Count',
                        type: 'bar',
                        barWidth: '40%',
                        data: [
                          { value: products.filter(p => p.inStock).length, itemStyle: { color: '#22c55e', borderRadius: [6, 6, 0, 0] } },
                          { value: products.filter(p => !p.inStock).length, itemStyle: { color: '#ef4444', borderRadius: [6, 6, 0, 0] } }
                        ]
                      }
                    ]
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Products table */}
          {loading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                        <th className="text-left px-4 py-3">Price</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">Badge</th>
                        <th className="text-left px-4 py-3">Stock</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setPreviewImageProduct(product)}
                                className="relative group cursor-pointer w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200"
                                title="Click to view image preview"
                              >
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Icon name="Eye" size={14} />
                                </div>
                              </div>
                              <p className="font-medium text-gray-800 text-xs line-clamp-2 max-w-[180px]">{product.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-gray-500 capitalize">{product.subcategory?.replace(/-/g, ' ')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900 text-xs">₹{product.price?.toLocaleString('en-IN')}</p>
                            {product.originalPrice && <p className="text-xs text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</p>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {product.badge ? (
                              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">{product.badge}</span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleStock(product.id)}
                              className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${product.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                              {product.inStock ? 'In Stock' : 'Out'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setPreviewImageProduct(product)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Preview Image">
                                <Icon name="Eye" size={14} />
                              </button>
                              <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product">
                                <Icon name="Edit" size={14} />
                              </button>
                              <button onClick={() => setDeleteModalProduct(product)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product">
                                <Icon name="Trash" size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <Icon name="Package" size={32} className="mx-auto mb-2" />
                      <p className="text-sm">No products found</p>
                    </div>
                  )}
                </div>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImageProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={() => setPreviewImageProduct(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-all transform scale-100" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gray-950 p-4 flex items-center justify-center min-h-[200px] max-h-[280px] flex-shrink-0">
              <img src={previewImageProduct.image} alt={previewImageProduct.name} className="max-h-[240px] w-auto object-contain rounded-lg shadow-md" />
              <button onClick={() => setPreviewImageProduct(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors z-20 shadow-md">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 text-base">{previewImageProduct.name}</h3>
                <span className="text-lg font-black text-primary-600">₹{previewImageProduct.price?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md capitalize font-medium">{previewImageProduct.subcategory?.replace(/-/g, ' ')}</span>
                {previewImageProduct.badge && (
                  <span className="bg-orange-50 text-orange-600 font-bold px-2.5 py-1 rounded-md">{previewImageProduct.badge}</span>
                )}
                <span className={`px-2.5 py-1 rounded-md font-bold ${previewImageProduct.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {previewImageProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {previewImageProduct.description && (
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">{previewImageProduct.description}</p>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { handleEdit(previewImageProduct); setPreviewImageProduct(null); }} className="btn-primary text-xs py-2 px-4">
                  <Icon name="Edit" size={14} /> Edit Product
                </button>
                <button onClick={() => setPreviewImageProduct(null)} className="btn-secondary text-xs py-2 px-4">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModalProduct(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transition-all text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
              <Icon name="Trash" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteModalProduct.name}"</span>? This action cannot be undone.
            </p>
            {deleteModalProduct.image && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5 text-left border border-gray-100">
                <img src={deleteModalProduct.image} alt={deleteModalProduct.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{deleteModalProduct.name}</p>
                  <p className="text-xs text-gray-400">₹{deleteModalProduct.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDeleteModalProduct(null)} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteModalProduct.id)} className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-200 flex items-center justify-center gap-1.5">
                <Icon name="Trash" size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
