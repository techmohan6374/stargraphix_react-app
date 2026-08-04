import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icons';

const team = [
  { name: 'Mohan Kumar', role: 'Founder & Creative Director', initials: 'MK', color: 'bg-primary-600' },
  { name: 'Priya Rajan', role: 'Senior Graphic Designer', initials: 'PR', color: 'bg-purple-600' },
  { name: 'Karthik S.', role: 'Lead Developer', initials: 'KS', color: 'bg-blue-600' },
  { name: 'Anitha R.', role: 'Client Relations', initials: 'AR', color: 'bg-green-600' },
];

const values = [
  { icon: 'Award', title: 'Quality First', desc: 'We never compromise on quality. Every design and code we deliver is crafted to perfection.' },
  { icon: 'Zap', title: 'Speed & Efficiency', desc: 'Fast turnarounds without sacrificing quality. Most projects delivered within 24-48 hours.' },
  { icon: 'Users', title: 'Client-Centric', desc: 'Your satisfaction is our priority. We work closely with you until you love the result.' },
  { icon: 'Shield', title: 'Trust & Reliability', desc: 'With 10+ years in the industry, we have built a reputation of trust with 5000+ happy clients.' },
];

export default function About() {
  return (
    <main className="min-h-screen bg-white font-outfit">
      {/* Hero */}
      <section className="bg-gradient-brand py-16 md:py-20">
        <div className="container-custom text-center">
          <img src="/logo.png" alt="Star Graphix" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">About Star Graphix</h1>
          <p className="text-red-200 text-lg max-w-xl mx-auto">Your trusted partner for premium design, printing, and software development since 2015</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Star Graphix was founded in 2015 with a simple mission: to make premium design and printing services accessible to businesses of all sizes. What started as a small graphic design studio in Chennai has grown into a full-service creative and technology company.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Today, we serve over 5,000 clients across India, offering everything from business cards and wedding invitations to custom software development and mobile applications. Our team of passionate designers and developers work together to deliver exceptional results.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe that great design has the power to transform businesses, and we're committed to helping our clients stand out in a crowded market.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '5000+', label: 'Happy Clients', icon: 'Users' },
                { number: '25K+', label: 'Projects Done', icon: 'Package' },
                { number: '10+', label: 'Years Experience', icon: 'Award' },
                { number: '15+', label: 'Team Members', icon: 'Heart' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-5 text-center">
                  <Icon name={stat.icon} size={24} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-black text-gray-900">{stat.number}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="section-title">Our Values</h2>
            <p className="text-gray-500 text-sm mt-2">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <div key={v.title} className="card p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <Icon name={v.icon} size={22} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="section-title">Meet the Team</h2>
            <p className="text-gray-500 text-sm mt-2">The talented people behind Star Graphix</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center text-white font-black text-xl mx-auto mb-3`}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary-600">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Work With Us?</h2>
          <p className="text-red-200 text-sm mb-6">Get in touch and let's create something amazing together</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold py-3 px-7">
              <Icon name="Mail" size={16} /> Contact Us
            </Link>
            <Link to="/products" className="flex items-center gap-2 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-semibold py-3 px-7 rounded-lg text-sm transition-all border border-white border-opacity-30">
              <Icon name="ArrowRight" size={16} /> View Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
