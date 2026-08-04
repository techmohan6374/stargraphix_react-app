import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, cartSavings, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const gst = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + gst;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-outfit">
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Cart" size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Browse our services and add something to get started</p>
          <Link to="/products" className="btn-primary">
            <Icon name="ArrowRight" size={16} /> Browse Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">
            <Icon name="Trash" size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="font-semibold text-gray-800 text-sm hover:text-primary-600 transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  {item.badge && (
                    <span className="text-xs text-orange-600 font-medium">{item.badge}</span>
                  )}
                  <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
                        <Icon name="Minus" size={13} />
                      </button>
                      <span className="px-3 py-1.5 font-bold text-sm text-gray-800">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
                        <Icon name="Plus" size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                        {item.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <Icon name="Trash" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                {cartSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount Savings</span>
                    <span className="text-green-600 font-semibold">−₹{cartSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Grand Total</span>
                  <span className="font-black text-xl text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {cartSavings > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 mb-4">
                  <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    You save ₹{cartSavings.toLocaleString('en-IN')} on this order!
                  </p>
                </div>
              )}

              <button
                onClick={() => user ? navigate('/checkout') : navigate('/login')}
                className="btn-primary w-full py-3.5 mb-3"
              >
                <Icon name="CreditCard" size={16} />
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>

              <Link to="/products" className="text-center block text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <Icon name="ChevronLeft" size={12} className="inline" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
