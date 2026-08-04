import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Icon from '../icons/Icons';
import { navCategories } from '../../data/categories';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-header' : 'border-b border-gray-100'}`}>
      {/* Top announcement bar */}
      <div className="bg-primary-600 text-white text-center text-xs font-medium py-1.5 px-4">
        <span>Free consultation on all orders above ₹999 &nbsp;•&nbsp; Call us: +91 98765 43210</span>
      </div>

      {/* Main header */}
      <div className="container-custom py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Star Graphix" className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-primary-600 leading-none">STAR</span>
              <br />
              <span className="text-xs font-semibold text-gray-500 tracking-widest leading-none">GRAPHIX</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 sm:mx-4">
            <div className="relative flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for flyers, business cards, web apps..."
                className="w-full border-2 border-gray-200 focus:border-primary-600 rounded-l-lg px-4 py-2.5 text-sm outline-none transition-colors duration-200 font-outfit"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-r-lg transition-colors duration-200 flex items-center"
              >
                <Icon name="Search" size={18} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Wishlist */}
            <Link to={user ? '/wishlist' : '/login'} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              <Icon name="Heart" size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              <Icon name="Cart" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <Icon name="ChevronDown" size={14} className="text-gray-400 hidden md:block" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-gray-100 py-2 animate-slide-down z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
                        <Icon name="Grid" size={16} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon name="User" size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon name="Package" size={16} /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon name="Heart" size={16} /> Wishlist
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Icon name="LogOut" size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4 hidden sm:flex">
                <Icon name="User" size={16} /> Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 md:hidden rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="hidden md:block border-t border-gray-100 bg-white">
        <div className="container-custom">
          <div className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide">
            <Link to="/products" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg mr-2 hover:bg-primary-700 transition-colors whitespace-nowrap">
              <Icon name="Grid" size={14} />All Services
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all whitespace-nowrap">About</Link>
            <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all whitespace-nowrap">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-dropdown animate-slide-down">
          <div className="container-custom py-4">
            {!user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary mb-4 w-full justify-center">
                <Icon name="User" size={18} /> Login / Sign Up
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              {navCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all border border-gray-100"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg transition-all">About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg transition-all">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
