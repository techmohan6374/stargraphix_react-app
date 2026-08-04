import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <Icon key={s} name={s <= Math.round(rating) ? 'StarFilled' : 'Star'} size={16}
          className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = getProductById(id);
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Icon name="AlertCircle" size={48} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Service Not Found</h2>
        <Link to="/products" className="btn-primary">Browse All Services</Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.subcategory === product.subcategory && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, qty);
    navigate('/cart');
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <Icon name="ChevronRight" size={12} />
          <Link to="/products" className="hover:text-primary-600 transition-colors">Services</Link>
          <Icon name="ChevronRight" size={12} />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Image section */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3">
              <img
                src={product.images?.[activeImg] || product.image}
                alt={product.name}
                className="w-full h-80 md:h-96 object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === activeImg ? 'border-primary-600' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.badge && (
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span className="font-bold text-sm text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-3xl font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

            {/* Features */}
            <div className="mb-5">
              <p className="font-bold text-gray-800 text-sm mb-2">What's Included:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features?.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon name="CheckCircle" size={16} className="text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
                  <Icon name="Minus" size={14} />
                </button>
                <span className="px-4 py-2 font-bold text-gray-800 text-sm min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
                  <Icon name="Plus" size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button onClick={handleBuyNow} className="btn-primary flex-1 py-3.5 text-sm">
                <Icon name="Zap" size={16} /> Order Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isInCart(product.id)}
                className={`flex-1 py-3.5 text-sm flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ${
                  isInCart(product.id) ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'btn-secondary'
                }`}
              >
                <Icon name={isInCart(product.id) ? 'Check' : 'Cart'} size={16} />
                {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-2 mb-5">
              <button onClick={() => toggleWishlist(product)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 border border-gray-200 rounded-lg hover:border-primary-200">
                <Icon name={isInWishlist(product.id) ? 'HeartFilled' : 'Heart'} size={16} className={isInWishlist(product.id) ? 'text-primary-600' : ''} />
                {isInWishlist(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300">
                <Icon name="Share" size={16} /> Share
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
              {[
                { icon: 'Shield', text: 'Secure Order' },
                { icon: 'Refresh', text: 'Free Revisions' },
                { icon: 'Zap', text: 'Fast Delivery' },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                  <Icon name={b.icon} size={18} className="text-primary-600" />
                  <span className="text-xs text-gray-600 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-10">
          <div className="flex border-b border-gray-100">
            {['description', 'features', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            )}
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {product.features?.map((f) => (
                  <div key={f} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                    <span className="text-sm text-gray-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-4xl font-black text-gray-900">{product.rating}</p>
                    <StarRating rating={product.rating} />
                    <p className="text-xs text-gray-500 mt-1">{product.reviewCount} reviews</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">Detailed reviews coming soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="section-title mb-4">Related Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
