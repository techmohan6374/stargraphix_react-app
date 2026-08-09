import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import Icon from '../components/icons/Icons';
import { products, getBestSellers } from '../data/products';
import { categories } from '../data/categories';

// Hero slides
const heroSlides = [
  {
    title: 'Premium Design & Printing Services',
    subtitle: 'Flyers, Business Cards, Wedding Cards & More',
    desc: 'Professional designs delivered in 24 hours. Print-ready files with unlimited revisions.',
    cta: 'Explore Printing',
    ctaLink: '/products?category=design-printing',
    ctaSecondary: 'Get Free Quote',
    bg: 'from-primary-800 via-primary-600 to-red-700',
    tag: 'Design & Print',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  },
  {
    title: 'Custom Software Development',
    subtitle: 'Web Apps, Mobile Apps & E-commerce Solutions',
    desc: 'End-to-end digital solutions built with modern technology. From idea to launch.',
    cta: 'View Software Services',
    ctaLink: '/products?category=software-development',
    ctaSecondary: 'Free Consultation',
    bg: 'from-gray-900 via-gray-800 to-primary-900',
    tag: 'Software Development',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
  },
  {
    title: 'Instagram & Social Media Designs',
    subtitle: 'Posts, Stories & Reels Templates',
    desc: 'Engage your audience with stunning social media content. Brand-consistent, scroll-stopping designs.',
    cta: 'Browse Social Media',
    ctaLink: '/products?category=instagram-posters',
    ctaSecondary: 'View Portfolio',
    bg: 'from-purple-800 via-pink-700 to-primary-700',
    tag: 'Social Media',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop',
  },
  {
    title: 'Wedding Cards & Invitations',
    subtitle: 'Traditional • Modern • Royal Designs',
    desc: 'Beautiful wedding invitations crafted with love. Gold foil, embossed prints and digital formats available.',
    cta: 'View Wedding Cards',
    ctaLink: '/products?category=wedding-cards',
    ctaSecondary: 'Get a Quote',
    bg: 'from-rose-800 via-pink-700 to-rose-600',
    tag: 'Wedding Designs',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
  },
  {
    title: 'Brand Identity & Logo Design',
    subtitle: 'Make Your Brand Unforgettable',
    desc: 'We craft logos and brand identities that stand out. Unique, memorable, and built to last.',
    cta: 'Design My Logo',
    ctaLink: '/products?category=logo-design',
    ctaSecondary: 'See Portfolio',
    bg: 'from-amber-700 via-orange-600 to-yellow-600',
    tag: 'Branding',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop',
  },
  {
    title: 'E-Commerce Solutions',
    subtitle: 'Sell Online — Start Earning Today',
    desc: 'Full-featured online stores built fast. Payment gateway, inventory, and delivery integration included.',
    cta: 'Build My Store',
    ctaLink: '/products?category=ecommerce',
    ctaSecondary: 'Free Consultation',
    bg: 'from-teal-800 via-teal-700 to-emerald-700',
    tag: 'E-Commerce',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
  },
];

// Service category cards
const serviceCards = [
  { icon: 'Image', name: 'Flyers', slug: 'flyers', count: '50+ Designs', color: 'bg-red-50', iconColor: 'text-primary-600' },
  { icon: 'FileText', name: 'Business Cards', slug: 'business-cards', count: '30+ Styles', color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: 'FileText', name: 'Resumes', slug: 'resumes', count: 'ATS Ready', color: 'bg-purple-50', iconColor: 'text-purple-600' },
  { icon: 'Instagram', name: 'Instagram Posters', slug: 'instagram-posters', count: '100+ Templates', color: 'bg-pink-50', iconColor: 'text-pink-600' },
  { icon: 'Heart', name: 'Wedding Cards', slug: 'wedding-cards', count: 'Royal Designs', color: 'bg-rose-50', iconColor: 'text-rose-600' },
  { icon: 'Layers', name: 'Brochures', slug: 'brochures', count: 'Tri & Bi Fold', color: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: 'Globe', name: 'Web Applications', slug: 'web-applications', count: 'Full Stack', color: 'bg-teal-50', iconColor: 'text-teal-600' },
  { icon: 'Smartphone', name: 'Mobile Apps', slug: 'mobile-applications', count: 'iOS & Android', color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { icon: 'ShoppingBag', name: 'E-commerce', slug: 'ecommerce', count: 'Complete Store', color: 'bg-green-50', iconColor: 'text-green-600' },
  { icon: 'Award', name: 'Logo Design', slug: 'logo-design', count: 'Brand Identity', color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Business Owner', text: 'Star Graphix designed our business cards and they look absolutely stunning. The quality is exceptional and delivery was super fast!', rating: 5, avatar: 'PS' },
  { name: 'Rahul Verma', role: 'Digital Marketer', text: 'We\'ve been using Star Graphix for all our social media content. The Instagram templates are creative and very on-brand for our business.', rating: 5, avatar: 'RV' },
  { name: 'Anitha R.', role: 'Bride', text: 'Our wedding cards were designed beautifully by Star Graphix. The traditional design with gold foil was exactly what we wanted. Highly recommended!', rating: 5, avatar: 'AR' },
  { name: 'Karthik M.', role: 'Startup Founder', text: 'They built our entire web application from scratch. The team is professional, delivers on time and the quality of work is top-notch.', rating: 5, avatar: 'KM' },
];

const stats = [
  { number: '5000+', label: 'Happy Clients', icon: 'Users' },
  { number: '25000+', label: 'Projects Completed', icon: 'Package' },
  { number: '10+', label: 'Years of Excellence', icon: 'Award' },
  { number: '24hr', label: 'Average Turnaround', icon: 'Clock' },
];

const liveActivity = [
  { item: 'Business Cards dispatched for Salem Bakery', time: '2 mins ago', icon: 'FileText', badge: 'Printing', color: 'bg-blue-50 text-blue-600' },
  { item: 'Web App launched for Salem Agri Farm', time: '15 mins ago', icon: 'Globe', badge: 'Software', color: 'bg-teal-50 text-teal-600' },
  { item: 'Flyer Design approved for Grand Opening Sale', time: '35 mins ago', icon: 'Image', badge: 'Design', color: 'bg-red-50 text-red-600' },
  { item: 'Instagram Templates set created for Fitness Center', time: '1 hr ago', icon: 'Instagram', badge: 'Socials', color: 'bg-pink-50 text-pink-600' },
  { item: 'Banners dispatched for Salem Exhibition Gate', time: '2 hrs ago', icon: 'Print', badge: 'Printing', color: 'bg-orange-50 text-orange-600' },
  { item: 'Logo Design approved for Apex Tech Solutions', time: '4 hrs ago', icon: 'Award', badge: 'Branding', color: 'bg-yellow-50 text-yellow-600' },
  { item: 'Mobile App updated on App Store for RideSalem', time: '6 hrs ago', icon: 'Smartphone', badge: 'Software', color: 'bg-indigo-50 text-indigo-600' },
  { item: 'Wedding Invitations shipped to Salem Central', time: '8 hrs ago', icon: 'Heart', badge: 'Design', color: 'bg-rose-50 text-rose-600' },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [goToSlide]);

  const slide = heroSlides[currentSlide];
  const featuredProducts = products.slice(0, 8);
  const bestSellers = getBestSellers();

  return (
    <main className="font-outfit">
      {/* ===== HERO SECTION ===== */}
      <section className={`relative bg-gradient-to-r ${slide.bg} overflow-hidden min-h-[520px] flex items-center transition-all duration-700`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container-custom py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-1.5 bg-white bg-opacity-20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                <Icon name="Zap" size={12} /> {slide.tag}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg text-white text-opacity-90 font-semibold mb-2">{slide.subtitle}</p>
              <p className="text-sm text-white text-opacity-75 mb-6 max-w-lg leading-relaxed">{slide.desc}</p>

              <div className="flex flex-wrap gap-3">
                <Link to={slide.ctaLink} className="btn-gold text-sm py-2.5 px-6 hover:shadow-lg">
                  <Icon name="ArrowRight" size={16} /> {slide.cta}
                </Link>
                <Link to="/contact" className="flex items-center gap-2 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30">
                  {slide.ctaSecondary}
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { label: '5000+ Clients', icon: 'Users' },
                  { label: '24hr Delivery', icon: 'Zap' },
                  { label: '100% Quality', icon: 'Shield' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5 text-white text-opacity-90 text-xs font-medium">
                    <Icon name={stat.icon} size={14} className="text-gold-400" />
                    {stat.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-80 object-cover rounded-2xl shadow-2xl border-4 border-white border-opacity-20"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Print Ready</p>
                    <p className="text-xs text-gray-500">Delivered in 24hrs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 border border-white/30"
          aria-label="Previous slide"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 border border-white/30"
          aria-label="Next slide"
        >
          <Icon name="ChevronRight" size={20} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white bg-opacity-40'}`}
            />
          ))}
        </div>
      </section>

      {/* ===== CATEGORY CARDS ===== */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Our Services</h2>
            <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View All <Icon name="ChevronRight" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
            {serviceCards.map((service) => (
              <Link key={service.slug} to={`/products?category=${service.slug}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon name={service.icon} size={22} className={service.iconColor} />
                </div>
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{service.name}</p>
                <span className="text-xs text-gray-400">{service.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section className="py-8 bg-primary-600">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon name={stat.icon} size={20} className="text-gold-400" />
                  <span className="text-2xl md:text-3xl font-black">{stat.number}</span>
                </div>
                <p className="text-red-200 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      {bestSellers.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Best Sellers</h2>
                <p className="text-sm text-gray-500 mt-1">Our most popular services loved by clients</p>
              </div>
              <Link to="/products?filter=bestseller" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                View All <Icon name="ChevronRight" size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== PROMO BANNERS ===== */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 p-6 md:p-8">
              <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Icon name="Print" size={32} className="text-gold-400 mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Design & Printing</h3>
              <p className="text-red-200 text-sm mb-4">Get 20% off on your first order of business cards, flyers & wedding cards</p>
              <Link to="/products?category=design-printing" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-2.5 px-5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Order Now <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8">
              <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Icon name="Code" size={32} className="text-blue-400 mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Software Development</h3>
              <p className="text-gray-400 text-sm mb-4">Custom web & mobile apps, e-commerce solutions with free consultation</p>
              <Link to="/products?category=software-development" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2.5 px-5 rounded-lg text-sm hover:bg-primary-700 transition-colors">
                Get Started <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CLIENT TRUST STRIP ===== */}
      <section className="py-10 bg-white border-t border-gray-100">
        {/* Label */}
        <div className="container-custom mb-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">Trusted by businesses across India</p>
        </div>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee-horizontal cursor-pointer" style={{width: 'max-content'}}>
            {[
              { name: 'SSA Invoice',         initials: 'SSA', color: '#CC0000' },
              { name: 'Aadhira Books',       initials: 'AB',  color: '#7c3aed' },
              { name: 'Salem Agri Farm',     initials: 'SAF', color: '#059669' },
              { name: 'Apex Tech Solutions', initials: 'ATS', color: '#2563eb' },
              { name: 'RideSalem',           initials: 'RS',  color: '#d97706' },
              { name: 'Grand Furnishings',   initials: 'GF',  color: '#0891b2' },
              { name: 'Priya Sweets',        initials: 'PS',  color: '#db2777' },
              { name: 'Nova Clinic',         initials: 'NC',  color: '#16a34a' },
              { name: 'StyleHub',            initials: 'SH',  color: '#9333ea' },
              { name: 'Salem Bakery',        initials: 'SB',  color: '#ea580c' },
              // duplicate for seamless loop
              { name: 'SSA Invoice',         initials: 'SSA', color: '#CC0000' },
              { name: 'Aadhira Books',       initials: 'AB',  color: '#7c3aed' },
              { name: 'Salem Agri Farm',     initials: 'SAF', color: '#059669' },
              { name: 'Apex Tech Solutions', initials: 'ATS', color: '#2563eb' },
              { name: 'RideSalem',           initials: 'RS',  color: '#d97706' },
              { name: 'Grand Furnishings',   initials: 'GF',  color: '#0891b2' },
              { name: 'Priya Sweets',        initials: 'PS',  color: '#db2777' },
              { name: 'Nova Clinic',         initials: 'NC',  color: '#16a34a' },
              { name: 'StyleHub',            initials: 'SH',  color: '#9333ea' },
              { name: 'Salem Bakery',        initials: 'SB',  color: '#ea580c' },
            ].map((client, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 mx-3 px-5 py-2.5 rounded-full flex-shrink-0 transition-all duration-200 group"
                style={{ border: '1px solid #e5e7eb', background: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                {/* Tiny brand dot */}
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: client.color, flexShrink: 0, display: 'inline-block', opacity: 0.9 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                  {client.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== ALL PRODUCTS ===== */}
      <section className="py-10 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Featured Services</h2>
              <p className="text-sm text-gray-500 mt-1">Explore our complete range of design and tech solutions</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View All <Icon name="ChevronRight" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE ACTIVITY FEED (Vertical Infinite Scroller) ===== */}
      <section className="py-12 bg-white border-t border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center font-outfit">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold uppercase tracking-wider">
                <Icon name="Activity" size={12} className="text-primary-600 animate-pulse" /> Live Activity Feed
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-dark leading-tight">
                Our Studios are <span className="text-gradient">Active & Buzzing</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We're continuously designing, printing, and coding for businesses. Check out what's currently processing in our Salem print shops and software development queues.
              </p>
              <div className="pt-2">
                <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider">
                  Launch Your Project Now <Icon name="ArrowRight" size={12} />
                </Link>
              </div>
            </div>

            {/* Right Infinite Scroll Ticker Column */}
            <div className="lg:col-span-7 bg-gray-50/50 rounded-2xl border border-gray-150 p-4 md:p-6 overflow-hidden h-[280px] relative">
              {/* Fade top/bottom overlay for premium looks */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none" />
              
              {/* Scroller container */}
              <div className="relative h-full overflow-hidden">
                <div className="flex flex-col gap-3 animate-marquee-vertical hover:[animation-play-state:paused] cursor-pointer">
                  {/* Render twice for seamless looping */}
                  {[...liveActivity, ...liveActivity].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-primary-100 transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${activity.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={activity.icon} size={16} className={activity.color.split(' ')[1]} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{activity.item}</p>
                          <span className="text-[9px] text-gray-400 font-semibold">{activity.time}</span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${activity.color} bg-opacity-10 flex-shrink-0`}>
                        {activity.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="text-gray-500 text-sm mt-2">Trusted by 5000+ happy clients across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-5">
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="StarFilled" size={14} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-14 bg-gradient-brand">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Get Started?</h2>
          <p className="text-red-200 mb-6 text-sm max-w-lg mx-auto">Join 5000+ satisfied clients. Professional designs delivered fast with unlimited revisions.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-gold py-3 px-8">
              <Icon name="ArrowRight" size={18} /> Explore Services
            </Link>
            <Link to="/contact" className="flex items-center gap-2 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold py-3 px-8 rounded-lg text-sm transition-all duration-200 border border-white border-opacity-30">
              <Icon name="Phone" size={16} /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
