import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/api';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import Pagination from '../../components/ui/Pagination';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchUsersAndOrders = async () => {
    const storedUser = localStorage.getItem('sg_user');
    let token = null;
    if (storedUser) {
      token = JSON.parse(storedUser).token;
    }
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(u => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          provider: u.provider,
          joinedAt: u.joinedAt || u.joinedDate || u.createdAt || new Date().toISOString(),
          photo: u.picture || u.photo || null
        }));
        setUsers(mapped);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.warn("Backend not running, falling back to local users:", err);
      const stored = JSON.parse(localStorage.getItem('sg_users') || '[]');
      const adminUser = {
        id: 'admin_001', name: 'Admin', email: 'admin@stargraphix.com',
        role: 'admin', provider: 'static', joinedAt: new Date().toISOString(), photo: null,
      };
      const hasAdmin = stored.find(u => u.role === 'admin');
      setUsers(hasAdmin ? stored : [adminUser, ...stored]);
    }

    try {
      const resOrders = await fetch(`${API_BASE}/orders`, { headers });
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
      } else {
        setOrders(JSON.parse(localStorage.getItem('sg_orders') || '[]'));
      }
    } catch (err) {
      console.warn("Backend offline, falling back to local orders for users page:", err);
      setOrders(JSON.parse(localStorage.getItem('sg_orders') || '[]'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOrders();
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getUserOrders = (user) => {
    if (!user) return [];
    return orders.filter(o => {
      const matchId = (o.userId && user.id && String(o.userId) === String(user.id)) ||
                      (o.userId && user._id && String(o.userId) === String(user._id));
      const orderEmail = (o.email || o.address?.email || '').toLowerCase().trim();
      const userEmail = (user.email || '').toLowerCase().trim();
      const matchEmail = Boolean(userEmail && orderEmail && orderEmail === userEmail);
      return matchId || matchEmail;
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('User removed');
      fetchUsers();
    } catch (err) {
      console.error(err);
      const updated = users.filter(u => u.id !== userId);
      setUsers(updated);
      localStorage.setItem('sg_users', JSON.stringify(updated));
      toast.success('User removed (Local Fallback)');
    }
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setMobileNav(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"><Icon name="Menu" size={20} /></button>
          <h1 className="text-lg font-bold text-gray-900">Users</h1>
        </header>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total Users', value: users.length, color: 'text-blue-600' },
              { label: 'Google Users', value: users.filter(u => u.provider === 'google').length, color: 'text-primary-600' },
              { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." className="input-field pl-9 bg-white" />
          </div>

          {/* Users table */}
          {loading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3">Role</th>
                        <th className="text-left px-4 py-3">Orders</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedUsers.map((user) => {
                        const userOrders = getUserOrders(user);
                        return (
                          <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {user.photo ? (
                                  <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === 'admin' ? 'bg-primary-600' : 'bg-gray-500'}`}>
                                    {user.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                                {user.role === 'admin' ? 'Admin' : 'Customer'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${userOrders.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className="flex items-center gap-1.5 text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100 px-3 py-1.5 rounded-lg transition-all shadow-xs"
                                >
                                  <Icon name="Eye" size={14} /> View
                                </button>
                                {user.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <Icon name="Trash" size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <Icon name="Users" size={32} className="mx-auto mb-2" />
                      <p className="text-sm">No users found</p>
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

      {/* Comprehensive User Details View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 transition-all" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {selectedUser.photo ? (
                  <img src={selectedUser.photo} alt={selectedUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-100" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${selectedUser.role === 'admin' ? 'bg-primary-600' : 'bg-gray-600'}`}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedUser.name}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedUser.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedUser.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">Auth Provider</p>
                  <p className="text-sm font-bold text-gray-800 capitalize mt-0.5 flex items-center gap-1.5">
                    <Icon name={selectedUser.provider === 'google' ? 'Google' : 'Shield'} size={14} className="text-primary-600" />
                    {selectedUser.provider || 'Static'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">Total Orders</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">
                    {getUserOrders(selectedUser).length} Placed
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-400 font-medium">Total Lifetime Spent</p>
                  <p className="text-sm font-bold text-green-600 mt-0.5">
                    ₹{getUserOrders(selectedUser).reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Joined Information */}
              <div className="bg-gray-50/60 rounded-xl p-3.5 border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Account Created / Joined:</span>
                <span className="font-bold text-gray-800">
                  {selectedUser.joinedAt ? new Date(selectedUser.joinedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                </span>
              </div>

              {/* User Orders History */}
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                  <Icon name="ShoppingBag" size={16} className="text-primary-600" /> Order History ({getUserOrders(selectedUser).length})
                </h3>
                {getUserOrders(selectedUser).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <Icon name="ShoppingBag" size={28} className="mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs font-semibold text-gray-500">No orders placed yet</p>
                    <p className="text-[11px] text-gray-400">This user hasn't made any purchases on Star Graphix.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {getUserOrders(selectedUser).map((order) => (
                      <div key={order.id} className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-gray-800">#{order.id?.slice(-8)}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{order.items?.length || 1} item(s)</span>
                          <span className="font-bold text-gray-900">₹{order.total?.toLocaleString('en-IN')}</span>
                        </div>
                        {order.placedAt && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(order.placedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button onClick={() => setSelectedUser(null)} className="btn-secondary text-xs py-2 px-5 font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
