import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';
import { API_BASE } from '../utils/api';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Initialize form with existing profile data
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
  });

  // Sync form whenever user object updates
  useEffect(() => {
    if (user) {
      const savedPhone = user.phone || localStorage.getItem(`sg_phone_${user.id || user.email}`) || '';
      setForm({
        name: user.name || '',
        phone: savedPhone,
      });
    }
  }, [user]);

  // Dynamically fetch user orders from backend API
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchUserOrders = async () => {
      setOrdersLoading(true);
      const storedUser = localStorage.getItem('sg_user');
      let token = null;
      if (storedUser) {
        try {
          token = JSON.parse(storedUser).token;
        } catch {}
      }

      try {
        const queryParams = new URLSearchParams();
        if (user.id) queryParams.append('userId', user.id);
        if (user.email) queryParams.append('email', user.email);

        const res = await fetch(`${API_BASE}/orders?${queryParams.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setOrders(Array.isArray(data) ? data : []);
            setOrdersLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch orders from backend API, using local fallback:', err);
      }

      // Local fallback if backend is offline
      if (isMounted) {
        const allOrders = JSON.parse(localStorage.getItem('sg_orders') || '[]');
        const userOrders = allOrders.filter(
          (o) =>
            (user.id && o.userId === user.id) ||
            (user.email && o.email && o.email.toLowerCase() === user.email.toLowerCase())
        );
        setOrders(userOrders);
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      toast.error('Display Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        id: user?.id,
        email: user?.email,
      });

      if (user?.id || user?.email) {
        localStorage.setItem(`sg_phone_${user.id || user.email}`, form.phone.trim());
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            {user?.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-100 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900 truncate">{user?.name}</h2>
                {user?.role === 'admin' && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="Shield" size={12} /> Admin
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-0.5">
                <span className="truncate">{user?.email}</span>
                {form.phone && (
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <Icon name="Phone" size={13} className="text-gray-400" />
                    {form.phone}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-1.5">
                Member since{' '}
                {user?.joinedAt
                  ? new Date(user.joinedAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'September 2026'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="btn-secondary text-sm py-2 px-4 whitespace-nowrap self-start sm:self-auto"
            >
              <Icon name={editing ? 'X' : 'Edit'} size={14} />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {editing && (
            <form onSubmit={handleSave} className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200/70">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Icon name="User" size={15} className="text-primary-600" /> Edit Profile Details
              </h3>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Display Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  className="input-field bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 80565 80402"
                  className="input-field bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Check" size={16} /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary text-sm py-2.5 px-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Dynamic User Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total Orders Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-xs">
            <div className="w-11 h-11 rounded-xl text-blue-600 bg-blue-50 flex items-center justify-center mx-auto mb-2.5">
              <Icon name="Package" size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900">
              {ordersLoading ? (
                <span className="inline-block w-8 h-6 bg-gray-200 rounded-sm animate-pulse" />
              ) : (
                totalOrders
              )}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Total Orders</p>
          </div>

          {/* Total Spent Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-xs">
            <div className="w-11 h-11 rounded-xl text-green-600 bg-green-50 flex items-center justify-center mx-auto mb-2.5">
              <Icon name="CreditCard" size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900">
              {ordersLoading ? (
                <span className="inline-block w-16 h-6 bg-gray-200 rounded-sm animate-pulse" />
              ) : (
                `₹${totalSpent.toLocaleString('en-IN')}`
              )}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Total Spent</p>
          </div>

          {/* Account Type Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-xs">
            <div className="w-11 h-11 rounded-xl text-primary-600 bg-primary-50 flex items-center justify-center mx-auto mb-2.5">
              <Icon name="Shield" size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900">
              {user?.role === 'admin' ? 'Admin' : 'Customer'}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Account Type</p>
          </div>
        </div>

        {/* View Orders Quick Link */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Icon name="ShoppingBag" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-500">Track shipments, verify payment, or download invoices</p>
              </div>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-lg transition-colors"
            >
              View Orders <Icon name="ArrowRight" size={12} />
            </Link>
          </div>
        )}

        {/* Sign Out */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
          <h3 className="font-bold text-gray-800 mb-4">Account Actions</h3>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-lg transition-all hover:bg-red-50"
          >
            <Icon name="LogOut" size={16} /> Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
