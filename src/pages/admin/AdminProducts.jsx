import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import { products as defaultProducts } from '../../data/products';
import toast from 'react-hot-toast';

const emptyForm = { name: '', price: '', originalPrice: '', category: 'design-printing', subcategory: 'flyers', description: '', badge: '', features: '', image: '', inStock: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5149/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.warn("Backend not running, falling back to static products:", err);
      const stored = localStorage.getItem('sg_products');
      setProducts(stored ? JSON.parse(stored) : defaultProducts);
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
      const res = await fetch('http://localhost:5149/api/products/upload-image', {
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
        ? `http://localhost:5149/api/products/${editId}` 
        : 'http://localhost:5149/api/products';
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
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5149/api/products/${id}`, {
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
  };

  const toggleStock = async (id) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    const updatedItem = { ...item, inStock: !item.inStock };
    try {
      const res = await fetch(`http://localhost:5149/api/products/${id}`, {
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

  return (
    <div className="flex min-h-screen bg-gray-100 font-outfit">
      <div className="hidden md:flex"><AdminSidebar /></div>
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-10">
            <AdminSidebar mobile onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
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

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total Products', value: products.length, color: 'text-primary-600' },
              { label: 'In Stock', value: products.filter(p => p.inStock).length, color: 'text-green-600' },
              { label: 'Out of Stock', value: products.filter(p => !p.inStock).length, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Products table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                          <p className="font-medium text-gray-800 text-xs line-clamp-2 max-w-[160px]">{product.name}</p>
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
                          <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icon name="Edit" size={14} />
                          </button>
                          {deleteConfirm === product.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(product.id)} className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Icon name="Trash" size={14} />
                            </button>
                          )}
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
        </div>
      </div>
    </div>
  );
}
