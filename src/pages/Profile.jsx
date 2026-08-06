import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', bio: '' });

  const handleSave = () => {
    updateProfile({ name: form.name });
    toast.success('Profile updated!');
    setEditing(false);
  };

  const orders = JSON.parse(localStorage.getItem('sg_orders') || '[]')
    .filter(o => o.userId === user?.id);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-primary-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                {user?.role === 'admin' && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="Shield" size={10} /> Admin
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm py-2 px-4">
              <Icon name="Edit" size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Display Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 80565 80402" className="input-field" />
              </div>
              <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-5">
                <Icon name="Check" size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length, icon: 'Package', color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: 'CreditCard', color: 'text-green-600 bg-green-50' },
            { label: 'Account Type', value: user?.role === 'admin' ? 'Admin' : 'Customer', icon: 'Shield', color: 'text-primary-600 bg-primary-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon name={stat.icon} size={18} />
              </div>
              <p className="text-lg font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Account Actions</h3>
          <button onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-lg transition-all hover:bg-red-50">
            <Icon name="LogOut" size={16} /> Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
