import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import toast from 'react-hot-toast';

const statusColors = {
  Confirmed: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};
const statusList = ['Confirmed', 'Processing', 'In Progress', 'Completed', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem('sg_orders') || '[]'));
  }, []);

  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('sg_orders', JSON.stringify(updated));
    toast.success(`Order status updated to "${newStatus}"`);
  };

  const deleteOrder = (orderId) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem('sg_orders', JSON.stringify(updated));
    toast.success('Order deleted');
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.address?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.address?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100 font-outfit">
      <div className="hidden md:flex"><AdminSidebar /></div>
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-10"><AdminSidebar mobile onClose={() => setMobileNav(false)} /></div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"><Icon name="Menu" size={20} /></button>
          <h1 className="text-lg font-bold text-gray-900">Orders</h1>
        </header>

        <div className="p-4 sm:p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-600' },
              { label: 'Pending', value: orders.filter(o => ['Confirmed', 'Processing'].includes(o.status)).length, color: 'text-yellow-600' },
              { label: 'Completed', value: orders.filter(o => o.status === 'Completed').length, color: 'text-primary-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="input-field pl-9" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['All', ...statusList].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Orders list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 text-center py-16">
              <Icon name="ShoppingBag" size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div>
                        <p className="text-xs text-gray-400">Order ID</p>
                        <p className="font-bold text-gray-800 text-sm font-mono">#{order.id?.slice(-10)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-gray-400">Customer</p>
                        <p className="font-medium text-gray-700 text-sm truncate max-w-[120px]">{order.address?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-gray-900 text-sm">₹{order.total?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="text-sm text-gray-600">{new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={order.status}
                        onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={e => { e.stopPropagation(); deleteOrder(order.id); }}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Icon name="Trash" size={14} />
                      </button>
                      <Icon name={expandedOrder === order.id ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-gray-400" />
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-50 p-4 bg-gray-50 animate-slide-down">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Customer Details</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-400">Name:</span> <span className="font-medium">{order.address?.name}</span></p>
                            <p><span className="text-gray-400">Email:</span> <span className="font-medium">{order.address?.email}</span></p>
                            <p><span className="text-gray-400">Phone:</span> <span className="font-medium">{order.address?.phone}</span></p>
                            <p><span className="text-gray-400">City:</span> <span className="font-medium">{order.address?.city}, {order.address?.state}</span></p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Order Items</p>
                          <div className="space-y-2">
                            {order.items?.map(item => (
                              <div key={item.id} className="flex items-center gap-2">
                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {order.address?.notes && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <p className="text-xs font-semibold text-yellow-700">Notes: {order.address.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
