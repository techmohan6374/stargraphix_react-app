import { useState } from 'react';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Save to localStorage as an inquiry
      const inquiries = JSON.parse(localStorage.getItem('sg_inquiries') || '[]');
      inquiries.push({ ...form, id: `INQ${Date.now()}`, submittedAt: new Date().toISOString() });
      localStorage.setItem('sg_inquiries', JSON.stringify(inquiries));
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setSent(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      {/* Hero */}
      <section className="bg-gradient-brand py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-black text-white mb-2">Contact Us</h1>
          <p className="text-red-200">We'd love to hear from you. Send us a message and we'll respond ASAP.</p>
        </div>
      </section>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Get In Touch</h2>
            {[
              { icon: 'MapPin', title: 'Our Branches', detail: '📍 Ponnammapet Gate, Salem, Tamilnadu\n📍 New Bus Stand, Salem, Tamilnadu' },
              { icon: 'Phone', title: 'Customer Support', detail: '+91 98940 33883\n+91 80565 80402', isLink: true, linkPrefix: 'tel:' },
              { icon: 'Mail', title: 'Email Support', detail: 'stargraphix2010@gmail.com\nstarveera2010@gmail.com', isLink: true, linkPrefix: 'mailto:' },
              { icon: 'Clock', title: 'Support Hours', detail: 'Mon – Sun: 10:00 AM – 9:00 PM' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                  {item.isLink ? (
                    <div className="text-gray-500 text-xs leading-relaxed flex flex-col">
                      {item.detail.split('\n').map((val, idx) => (
                        <a key={idx} href={`${item.linkPrefix}${val.replace(/\s+/g, '')}`} className="hover:text-primary-600 transition-colors">
                          {val}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-line">{item.detail}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="font-semibold text-gray-800 text-sm mb-3">Follow Us</p>
              <div className="flex gap-2">
                {[
                  { icon: 'Facebook', color: 'hover:bg-blue-600', url: 'https://www.facebook.com/veera.samy.104' },
                  { icon: 'Instagram', color: 'hover:bg-pink-600', url: 'https://www.instagram.com/stargraphix_official?igsh=MXYycXpmejFtdGs4OA==' },
                  { icon: 'Telegram', color: 'hover:bg-sky-500', url: 'https://t.me/mntechy' },
                  { icon: 'Whatsapp', color: 'hover:bg-green-600', url: 'https://api.whatsapp.com/send?phone=+919894033883' },
                ].map((s) => (
                  <a key={s.icon} href={s.url} target="_blank" rel="noreferrer" className={`w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-white ${s.color} transition-all duration-200`}>
                    <Icon name={s.icon} size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Donate Card */}
            <div className="p-4 bg-gradient-to-br from-gold-50 to-amber-50 rounded-xl border border-gold-200/50 shadow-sm flex flex-col items-center text-center">
              <Icon name="HeartFilled" size={24} className="text-gold-500 mb-2 animate-pulse" />
              <p className="font-bold text-gray-800 text-sm mb-1">Support Star Graphix</p>
              <p className="text-gray-500 text-[11px] leading-relaxed mb-3">Help us keep developing creative tools and solutions for businesses.</p>
              <button
                onClick={() => window.dispatchEvent(new Event('trigger-donate'))}
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                Donate via UPI
              </button>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm">
                  Thank you for reaching out! Our team will get back to you within 24 business hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="btn-secondary text-sm py-2.5 px-6">
                  <Icon name="Plus" size={16} /> Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">Send Us a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Service Needed</label>
                    <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field">
                      <option value="">Select a service...</option>
                      <option>Flyers Design</option>
                      <option>Business Cards</option>
                      <option>Resume Design</option>
                      <option>Instagram Posts</option>
                      <option>Wedding Cards</option>
                      <option>Web Development</option>
                      <option>Mobile App Development</option>
                      <option>Logo Design</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Message *</label>
                  <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Tell us about your project, requirements, and any specific details..."
                    rows={5} className="input-field resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary py-3.5 px-8 disabled:opacity-70">
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : <Icon name="Mail" size={16} />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
