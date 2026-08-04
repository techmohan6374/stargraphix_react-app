import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import { products } from '../../data/products';

const statusColors = {
  Confirmed: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem('sg_orders') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('sg_users') || '[]'));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const pendingOrders = orders.filter(o => ['Confirmed', 'Processing'].includes(o.status)).length;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: 'TrendingUp', color: 'text-green-600 bg-green-50', change: '+12%' },
    { label: 'Total Orders', value: orders.length, icon: 'ShoppingBag', color: 'text-blue-600 bg-blue-50', change: '+8%' },
    { label: 'Registered Users', value: users.length, icon: 'Users', color: 'text-purple-600 bg-purple-50', change: '+5%' },
    { label: 'Total Products', value: products.length, icon: 'Package', color: 'text-primary-600 bg-primary-50', change: 'Active' },
  ];

  const recentOrders = orders.slice(0, 6);

  // Simple bar chart (revenue by status)
  const statusCounts = { Confirmed: 0, Processing: 0, 'In Progress': 0, Completed: 0, Cancelled: 0 };
  orders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div className="flex min-h-screen bg-gray-100 font-outfit">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-10">
            <AdminSidebar mobile onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Icon name="Menu" size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Welcome back, Admin</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all">
            <Icon name="Globe" size={14} /> View Store
          </Link>
        </header>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon name={stat.icon} size={18} />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Order status chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="BarChart" size={16} className="text-primary-600" /> Order Status
              </h2>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{status}</span>
                      <span className="text-xs font-bold text-gray-800">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Add New Product', icon: 'Plus', path: '/admin/products', color: 'bg-primary-50 text-primary-700 hover:bg-primary-100' },
                  { label: 'View All Orders', icon: 'ShoppingBag', path: '/admin/orders', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'Manage Users', icon: 'Users', path: '/admin/users', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                ].map((action) => (
                  <Link key={action.label} to={action.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${action.color}`}>
                    <Icon name={action.icon} size={16} /> {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Top products */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Top Products</h2>
              <div className="space-y-3">
                {products.filter(p => p.badge).slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-xs text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full flex-shrink-0">{p.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Icon name="ShoppingBag" size={16} className="text-primary-600" /> Recent Orders
              </h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-primary-600 hover:underline">View All</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Icon name="Package" size={32} className="mx-auto mb-2" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Order ID</th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell">Customer</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Items</th>
                      <th className="text-left px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">#{order.id?.slice(-8)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="font-medium text-gray-800">{order.address?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.address?.city}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{order.total?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                          {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
