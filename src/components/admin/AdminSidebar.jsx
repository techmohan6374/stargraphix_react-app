import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../icons/Icons';

const adminNav = [
  { name: 'Dashboard', path: '/admin', icon: 'BarChart' },
  { name: 'Products', path: '/admin/products', icon: 'Package' },
  { name: 'Orders', path: '/admin/orders', icon: 'ShoppingBag' },
  { name: 'Users', path: '/admin/users', icon: 'Users' },
  { name: 'Inquiries', path: '/admin/inquiries', icon: 'Mail' },
];

export default function AdminSidebar({ mobile = false, onClose }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`${mobile ? 'w-full' : 'w-56 flex-shrink-0'} bg-gray-950 min-h-screen flex flex-col font-outfit`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="Star Graphix" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-sm font-black text-white">STAR GRAPHIX</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Admin info */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              <span className="text-xs text-gray-400">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-2">Management</p>
        <div className="space-y-1">
          {adminNav.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
            <Icon name="Home" size={16} /> View Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900 hover:text-red-400 transition-all">
            <Icon name="LogOut" size={16} /> Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
}
