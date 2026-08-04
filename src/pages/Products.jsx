import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Icon from '../components/icons/Icons';
import { products } from '../data/products';
import { categories } from '../data/categories';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { label: '₹10,000+', min: 10000, max: Infinity },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState('grid');

  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';

  // Filter products
  let filtered = [...products];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)) ||
      p.subcategory.includes(q) ||
      p.category.includes(q)
    );
  }
  if (categoryFilter) {
    filtered = filtered.filter(p => p.subcategory === categoryFilter || p.category === categoryFilter);
  }
  if (selectedPriceRange) {
    filtered = filtered.filter(p => p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max);
  }

  // Sort
  filtered = filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  const allSubcats = [...new Set(products.map(p => p.subcategory))];
  const activeCategoryName = categoryFilter
    ? categories.flatMap(c => c.subcategories).find(s => s.slug === categoryFilter)?.name || categoryFilter
    : '';

  const clearFilters = () => {
    setSearchParams({});
    setSortBy('featured');
    setSelectedPriceRange(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <Icon name="ChevronRight" size={12} />
            <span className="text-gray-800 font-medium">
              {query ? `Search: "${query}"` : activeCategoryName || 'All Services'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {query ? `Results for "${query}"` : activeCategoryName || 'All Services'}
              </h1>
              <p className="text-sm text-gray-500">{filtered.length} services found</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="sm:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary-600 transition-colors"
              >
                <Icon name="Filter" size={16} /> Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-primary-600 bg-white"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Icon name="Grid" size={16} />
                </button>
                <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Icon name="Sort" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-56 flex-shrink-0 ${filterOpen ? 'block' : 'hidden'} sm:block`}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm">Filters</h3>
                {(categoryFilter || selectedPriceRange) && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 font-semibold hover:underline">Clear All</button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSearchParams({})}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!categoryFilter ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Services
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs font-semibold text-gray-400 px-2 pt-2 pb-1 uppercase">{cat.name}</p>
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSearchParams({ category: sub.slug })}
                          className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${categoryFilter === sub.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                <div className="space-y-1">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(selectedPriceRange?.label === range.label ? null : range)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${selectedPriceRange?.label === range.label ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="Search" size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No services found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-primary py-2 px-6">
                  <Icon name="Refresh" size={16} /> Clear Filters
                </button>
              </div>
            ) : (
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
              }>
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} compact={view === 'list'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
