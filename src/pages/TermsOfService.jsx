import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icons';

export default function TermsOfService() {
  const lastUpdated = 'September 1, 2026';

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 font-outfit text-left">
      <div className="container-custom max-w-4xl">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-gray-150 p-8 sm:p-10 shadow-card mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-red-100">
            <Icon name="FileText" size={14} className="text-red-600" /> Legal Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Please read these terms carefully before using Star Graphix design, printing, software development services, or online creative tools.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Last Updated: {lastUpdated}</span>
            <span>Star Graphix Digital Solutions</span>
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white rounded-3xl border border-gray-150 p-8 sm:p-10 shadow-card space-y-8 text-gray-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using Star Graphix website (<code className="text-primary-600 bg-red-50 px-1.5 py-0.5 rounded font-mono">stargraphix.in</code>), signing in via Google Auth, purchasing custom printing products, or utilizing our free creative tools, you agree to be bound by these Terms of Service. If you do not agree to all terms, please refrain from using our platform and services.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">2</span>
              User Accounts & Google Authentication
            </h2>
            <p>
              Our application uses Google Sign-In for seamless, passwordless authentication. By logging in, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>You provide accurate account information associated with your Google profile.</li>
              <li>You are responsible for maintaining the confidentiality of your Google login credentials.</li>
              <li>You will notify us immediately if you suspect unauthorized access to your account.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">3</span>
              Printing & Custom Design Orders
            </h2>
            <p>
              For all custom printing orders (including business cards, flyers, wedding cards, brochures, banners, and resumes):
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li><strong>Design Approvals:</strong> Digital artwork proofs sent via email or WhatsApp must be carefully reviewed and approved by the customer before printing begins.</li>
              <li><strong>Color Accuracy:</strong> Due to screen RGB to print CMYK color space differences, slight variations in shade may occur on physical paper stock.</li>
              <li><strong>Turnaround Times:</strong> Standard orders are dispatched within 24 to 48 hours following artwork approval.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">4</span>
              Online Creative Tools Usage
            </h2>
            <p>
              Star Graphix provides free web-based creative tools (Passport Photo Maker, Thanglish Tamil Typing, Universal File Converter, QR Code Generator, etc.) for personal and business utility:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>Client-side processing: Files processed in tools remain private in your browser.</li>
              <li>Prohibited Content: You must not upload offensive, illegal, defamatory, or copyright-infringing material.</li>
              <li>Service Availability: Tools are provided "as is". We continuously optimize tools but do not guarantee uninterrupted uptime.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">5</span>
              Cancellation & Refund Policy
            </h2>
            <p>
              Because printing products are customized with individual business details and graphics:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>Orders can be cancelled with full refund prior to artwork approval and print production start.</li>
              <li>Once an order has entered physical printing, cancellations are non-refundable.</li>
              <li>If a manufacturing defect occurs, Star Graphix will reprint the order at zero additional cost.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-primary-600 flex items-center justify-center text-xs font-mono font-bold">6</span>
              Contact Information
            </h2>
            <p>
              For questions regarding these Terms of Service, please contact our legal and customer care team:
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <p className="font-bold text-gray-800">Star Graphix Digital Solutions</p>
              <p>Email: <a href="mailto:stargraphix2010@gmail.com" className="text-primary-600 hover:underline">stargraphix2010@gmail.com</a></p>
              <p>Phone: <a href="tel:+919894033883" className="text-primary-600 hover:underline">+91 98940 33883</a> / <a href="tel:+918056580402" className="text-primary-600 hover:underline">+91 80565 80402</a></p>
              <p>Address: Ponnammapet Gate & New Bus Stand, Salem, Tamil Nadu, India</p>
            </div>
          </section>

          {/* Navigation Back */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link to="/privacy" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
              Read Privacy Policy <Icon name="ArrowRight" size={12} />
            </Link>
            <Link to="/" className="btn-primary py-2 px-4 text-xs">
              Back to Home
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
