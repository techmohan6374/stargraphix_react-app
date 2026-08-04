import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Icon from '../components/icons/Icons';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-outfit">
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Heart" size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Save services you love to view them here later</p>
          <Link to="/products" className="btn-primary">
            <Icon name="ArrowRight" size={16} /> Explore Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={clearWishlist} className="text-sm text-gray-500 hover:text-red-500 font-medium flex items-center gap-1 transition-colors">
            <Icon name="Trash" size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="card overflow-hidden flex flex-col">
              <div className="relative">
                <Link to={`/products/${item.id}`}>
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                </Link>
                <button onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Icon name="X" size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <Link to={`/products/${item.id}`} className="font-semibold text-sm text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                  {item.name}
                </Link>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={isInCart(item.id)}
                  className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    isInCart(item.id) ? 'bg-green-50 text-green-700 border border-green-200' : 'btn-primary'
                  }`}
                >
                  <Icon name={isInCart(item.id) ? 'Check' : 'Cart'} size={15} />
                  {isInCart(item.id) ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
