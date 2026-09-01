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
  const [navOpen, setNavOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);

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

  useEffect(() => {
    const handleNavOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleNavOutside);
    return () => document.removeEventListener('mousedown', handleNavOutside);
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
      <div className="bg-primary-600 text-white text-center text-[11px] font-medium py-1.5 px-4 leading-snug">
        <span className="flex flex-wrap items-center justify-center gap-x-1">
          <span className="hidden sm:inline">Free consultation on all orders above ₹999 •</span>
          <span className="sm:hidden">Free consultation above ₹999 •</span>
          <span className="flex items-center gap-1">
            Call:
            <a href="tel:+919894033883" className="underline underline-offset-2 font-bold whitespace-nowrap">98940 33883</a>
            <span>/</span>
            <a href="tel:+918056580402" className="underline underline-offset-2 font-bold whitespace-nowrap">80565 80402</a>
          </span>
        </span>
      </div>

      {/* Main header */}
      <div className="container-custom py-3">
        <div className="flex items-center gap-4">
          {/* Logo - always visible */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Star Graphix" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-sm sm:text-base font-black text-primary-600 tracking-tight leading-none">Star Graphix</span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 tracking-widest leading-none mt-0.5">DIGITAL SOLUTIONS</span>
            </div>
          </Link>

          {/* Search bar — desktop only */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative flex w-full">
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
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Icon name="Search" size={20} />
            </button>

            {/* Wishlist — hidden on mobile */}
            <Link to={user ? '/wishlist' : '/login'} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50 hidden sm:flex">
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

      {/* Mobile search bar — expands below header on tap */}
      {mobileSearch && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 animate-slide-down">
          <form onSubmit={(e) => { handleSearch(e); setMobileSearch(false); }} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              placeholder="Search flyers, cards, web apps..."
              className="flex-1 border-2 border-gray-200 focus:border-primary-600 rounded-lg px-3 py-2 text-sm outline-none font-outfit"
            />
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-lg flex items-center transition-colors">
              <Icon name="Search" size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Navigation bar */}
      <nav className="hidden md:block border-t border-gray-100 bg-white">
        <div className="container-custom">
          <div className="flex items-center gap-0 py-1">

            {/* Services mega dropdown */}
            <div className="relative" ref={navRef}>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg mr-3 transition-all duration-200 ${
                  navOpen
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white border border-primary-100'
                }`}
              >
                <Icon name="Grid" size={14} />
                All Services
                <Icon name={navOpen ? 'ChevronUp' : 'ChevronDown'} size={13} />
              </button>

              {navOpen && (
                <div className="absolute left-0 top-full mt-2 w-[520px] bg-white rounded-2xl shadow-dropdown border border-gray-100 p-5 animate-slide-down z-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Design &amp; Printing</p>
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {[
                      { name: 'Flyers', slug: 'flyers', icon: 'Image' },
                      { name: 'Business Cards', slug: 'business-cards', icon: 'FileText' },
                      { name: 'Wedding Cards', slug: 'wedding-cards', icon: 'Heart' },
                      { name: 'Resumes / CVs', slug: 'resumes', icon: 'FileText' },
                      { name: 'Instagram Posters', slug: 'instagram-posters', icon: 'Instagram' },
                      { name: 'Brochures', slug: 'brochures', icon: 'Layers' },
                      { name: 'Banners', slug: 'banners', icon: 'Image' },
                      { name: 'ID Cards', slug: 'id-cards', icon: 'CreditCard' },
                      { name: 'Letter Heads', slug: 'letterheads', icon: 'FileText' },
                    ].map((item) => (
                      <Link
                        key={item.slug}
                        to={`/products?category=${item.slug}`}
                        onClick={() => setNavOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 group"
                      >
                        <Icon name={item.icon} size={14} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Software &amp; Tech</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: 'Web Applications', slug: 'web-applications', icon: 'Globe' },
                        { name: 'Mobile Apps', slug: 'mobile-applications', icon: 'Smartphone' },
                        { name: 'E-commerce', slug: 'ecommerce', icon: 'ShoppingBag' },
                        { name: 'Logo Design', slug: 'logo-design', icon: 'Award' },
                        { name: 'UI/UX Design', slug: 'ui-ux', icon: 'Layers' },
                        { name: 'SEO & Marketing', slug: 'seo-marketing', icon: 'TrendingUp' },
                      ].map((item) => (
                        <Link
                          key={item.slug}
                          to={`/products?category=${item.slug}`}
                          onClick={() => setNavOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 group"
                        >
                          <Icon name={item.icon} size={14} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mr-3" />

            {/* Key standalone tabs */}
            <Link to="/portal" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-all whitespace-nowrap">
              <Icon name="Zap" size={14} className="text-primary-600" />Creative Portal
            </Link>
            <Link to="/free-tools" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all whitespace-nowrap">
              <Icon name="Cpu" size={14} className="text-indigo-600" />Tools
            </Link>
            <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all whitespace-nowrap">About</Link>
            <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all whitespace-nowrap">Contact</Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Donate button — right-aligned */}
            <button
              onClick={() => window.dispatchEvent(new Event('trigger-donate'))}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-all whitespace-nowrap"
            >
              <Icon name="HeartFilled" size={13} className="text-amber-500 animate-pulse" />Donate
            </button>
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
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link to="/portal" onClick={() => setMobileMenuOpen(false)} className="w-full text-center block px-3 py-2.5 text-sm font-bold text-primary-600 bg-primary-50 border border-primary-100 rounded-lg transition-all flex items-center justify-center gap-1.5 mb-2">
                <Icon name="Zap" size={14} className="text-primary-600" /> Creative Portal
              </Link>
              <Link to="/free-tools" onClick={() => setMobileMenuOpen(false)} className="w-full text-center block px-3 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg transition-all flex items-center justify-center gap-1.5 mb-2">
                <Icon name="Cpu" size={14} className="text-indigo-600" /> Tools
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new Event('trigger-donate'));
                }}
                className="w-full text-center block px-3 py-2.5 text-sm font-bold text-gold-600 bg-gold-50/50 border border-gold-200 rounded-lg transition-all flex items-center justify-center gap-1.5 mb-2"
              >
                <Icon name="HeartFilled" size={14} className="text-gold-500 animate-pulse" /> Donate Star Graphix
              </button>
            </div>
            <div className="flex gap-2">
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg transition-all">About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg transition-all">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
