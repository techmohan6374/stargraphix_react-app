import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';

const statusColors = {
  Confirmed: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(location.state?.newOrder || null);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem('sg_orders') || '[]');
    const userOrders = user?.role === 'admin'
      ? allOrders
      : allOrders.filter(o => o.userId === user?.id);
    setOrders(userOrders);
  }, [user]);

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-outfit">
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Package" size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-50 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-bold text-gray-800 text-sm">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <Icon name={expandedOrder === order.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Order details (expanded) */}
              {expandedOrder === order.id && (
                <div className="p-4 animate-slide-down">
                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                          <p className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
                      <p className="font-semibold text-gray-700 capitalize">{order.paymentMethod?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Delivery Address</p>
                      <p className="font-semibold text-gray-700">{order.address?.city}, {order.address?.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Items Count</p>
                      <p className="font-semibold text-gray-700">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Progress</p>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {['Confirmed', 'Processing', 'In Progress', 'Completed'].map((s, i, arr) => (
                        <div key={s} className="flex items-center gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            ['Confirmed', 'Processing', 'In Progress', 'Completed'].indexOf(order.status) >= i
                              ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon name="CheckCircle" size={12} /> {s}
                          </div>
                          {i < arr.length - 1 && <div className={`w-6 h-0.5 ${['Confirmed', 'Processing', 'In Progress', 'Completed'].indexOf(order.status) > i ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
