import { Link } from 'react-router-dom';
import Icon from '../icons/Icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>
          <Icon name={star <= Math.round(rating) ? 'StarFilled' : 'Star'} size={size} />
        </span>
      ))}
    </div>
  );
}

export default function ProductCard({ product, compact = false }) {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  const badgeColor = {
    'Best Seller': 'bg-orange-500',
    'Popular': 'bg-blue-500',
    'Top Rated': 'bg-purple-600',
    'Trending': 'bg-pink-500',
    'Best Value': 'bg-green-600',
    'Premium': 'bg-yellow-600',
    'Enterprise': 'bg-gray-700',
  };

  return (
    <div className="card group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${compact ? 'h-40' : 'h-48 md:h-52'}`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor[product.badge] || 'bg-primary-600'}`}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Icon
            name={isInWishlist(product.id) ? 'HeartFilled' : 'Heart'}
            size={16}
            className={isInWishlist(product.id) ? 'text-primary-600' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="group-hover:text-primary-600 transition-colors">
          <h3 className={`font-semibold text-gray-800 line-clamp-2 leading-tight mb-1 ${compact ? 'text-sm' : 'text-sm md:text-base'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} size={12} />
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Features - only on non-compact */}
        {!compact && product.features && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.features.slice(0, 2).map((f) => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{f}</span>
            ))}
          </div>
        )}

        {/* Add to cart */}
        <div className="mt-auto pt-2">
          <button
            onClick={() => addToCart(product)}
            disabled={isInCart(product.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isInCart(product.id)
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95'
            }`}
          >
            <Icon name={isInCart(product.id) ? 'Check' : 'Cart'} size={15} />
            {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { StarRating };
