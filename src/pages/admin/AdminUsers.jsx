import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Icon from '../../components/icons/Icons';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('sg_users') || '[]');
    // Add admin as first user if not already present
    const adminUser = {
      id: 'admin_001', name: 'Admin', email: 'admin@stargraphix.com',
      role: 'admin', provider: 'static', joinedAt: new Date().toISOString(), photo: null,
    };
    const hasAdmin = stored.find(u => u.role === 'admin');
    setUsers(hasAdmin ? stored : [adminUser, ...stored]);
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getOrders = (userId) => {
    const orders = JSON.parse(localStorage.getItem('sg_orders') || '[]');
    return orders.filter(o => o.userId === userId);
  };

  const handleDeleteUser = (userId) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('sg_users', JSON.stringify(updated));
    toast.success('User removed');
  };

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
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Provider</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Orders</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => {
                    const userOrders = getOrders(user.id);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.photo ? (
                              <img src={user.photo} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === 'admin' ? 'bg-primary-600' : 'bg-gray-400'}`}>
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                              <p className="text-xs text-gray-400 sm:hidden truncate max-w-[120px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs truncate max-w-[160px]">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Icon name={user.provider === 'google' ? 'Google' : 'Shield'} size={14} />
                            <span className="text-xs text-gray-500 capitalize">{user.provider}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm font-semibold text-gray-700">{userOrders.length}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {user.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Icon name="Trash" size={14} />
                            </button>
                          )}
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
        </div>
      </div>
    </div>
  );
}
