import { Link } from 'react-router-dom';
import Icon from '../icons/Icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white font-outfit">
      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Star Graphix" className="h-12 w-12 object-contain" />
              <div>
                <div className="text-xl font-bold text-white">STAR GRAPHIX</div>
                <div className="text-xs text-gray-400 tracking-widest">DESIGN & PRINT</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your trusted partner for premium design, printing & software development solutions. Crafting excellence since 2015.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/veera.samy.104" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200">
                <Icon name="Facebook" size={16} />
              </a>
              <a href="https://www.instagram.com/stargraphix_official?igsh=MXYycXpmejFtdGs4OA==" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200">
                <Icon name="Instagram" size={16} />
              </a>
              <a href="https://t.me/mntechy" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200">
                <Icon name="Telegram" size={16} />
              </a>
              <a href="https://api.whatsapp.com/send?phone=+919894033883" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all duration-200">
                <Icon name="Whatsapp" size={16} />
              </a>
            </div>
          </div>

          {/* Design & Printing */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon name="Print" size={14} className="text-primary-400" /> Design & Printing
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Flyers', slug: 'flyers' },
                { name: 'Business Cards', slug: 'business-cards' },
                { name: 'Resumes / CVs', slug: 'resumes' },
                { name: 'Instagram Posters', slug: 'instagram-posters' },
                { name: 'Wedding Cards', slug: 'wedding-cards' },
                { name: 'Brochures', slug: 'brochures' },
                { name: 'Banners', slug: 'banners' },
                { name: 'Certificates', slug: 'certificates' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link to={`/products?category=${item.slug}`} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <Icon name="ChevronRight" size={12} className="text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Software Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon name="Code" size={14} className="text-primary-400" /> Software Services
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Web Applications', slug: 'web-applications' },
                { name: 'Mobile Applications', slug: 'mobile-applications' },
                { name: 'E-commerce Solutions', slug: 'ecommerce' },
                { name: 'UI/UX Design', slug: 'ui-ux' },
                { name: 'Logo Design', slug: 'logo-design' },
                { name: 'SEO & Marketing', slug: 'seo-marketing' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link to={`/products?category=${item.slug}`} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <Icon name="ChevronRight" size={12} className="text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon name="MapPin" size={14} className="text-primary-400" /> Our Branches
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Icon name="MapPin" size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Ponnammapet Gate, Salem, Tamilnadu</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400 border-b border-gray-900 pb-2">
                <Icon name="MapPin" size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>New Bus Stand, Salem, Tamilnadu</span>
              </li>
              <li className="flex flex-col gap-1 text-sm text-gray-400">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Customer Support</span>
                <div className="flex flex-col pl-6 relative">
                  <Icon name="Phone" size={14} className="text-primary-400 absolute left-0 top-1" />
                  <a href="tel:+919894033883" className="hover:text-white transition-colors">+91 98940 33883</a>
                  <a href="tel:+918056580402" className="hover:text-white transition-colors">+91 80565 80402</a>
                </div>
              </li>
              <li className="flex flex-col gap-1 text-sm text-gray-400">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Email Support</span>
                <div className="flex flex-col pl-6 relative">
                  <Icon name="Mail" size={14} className="text-primary-400 absolute left-0 top-1" />
                  <a href="mailto:stargraphix2010@gmail.com" className="hover:text-white transition-colors text-xs truncate">stargraphix2010@gmail.com</a>
                  <a href="mailto:starveera2010@gmail.com" className="hover:text-white transition-colors text-xs truncate">starveera2010@gmail.com</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Icon name="Clock" size={16} className="text-primary-400 flex-shrink-0" />
                <span>Mon - Sun: 10:00 AM – 9:00 PM</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">WhatsApp Order Support</p>
              <a href="https://api.whatsapp.com/send?phone=+919894033883" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">
                <Icon name="Whatsapp" size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'Shield', title: '100% Secure', desc: 'Safe & secure payments' },
              { icon: 'Zap', title: 'Fast Delivery', desc: 'Quick turnaround times' },
              { icon: 'Award', title: 'Premium Quality', desc: 'Satisfaction guaranteed' },
              { icon: 'Refresh', title: 'Free Revisions', desc: 'Until you\'re happy' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-primary-400 flex-shrink-0">
                  <Icon name={badge.icon} size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} Star Graphix. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/portal" className="text-primary-400 hover:text-primary-300 text-xs font-semibold transition-colors">Creative Portal</Link>
              <button 
                onClick={() => window.dispatchEvent(new Event('trigger-donate'))}
                className="text-gold-400 hover:text-gold-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Donate Star Graphix
              </button>
              <Link to="/about" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">About</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Contact</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
