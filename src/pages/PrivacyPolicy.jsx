import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icons';

export default function PrivacyPolicy() {
  const lastUpdated = 'September 1, 2026';

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 font-outfit text-left">
      <div className="container-custom max-w-4xl">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-gray-150 p-8 sm:p-10 shadow-card mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
            <Icon name="Shield" size={14} className="text-blue-600" /> Data Privacy & Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Your privacy is paramount. Learn how Star Graphix collects, uses, and safeguards your personal information when using our website, tools, and printing services.
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
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">1</span>
              Information We Collect
            </h2>
            <p>
              We collect information to provide superior design, printing, and software services:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li><strong>Google Authentication Data:</strong> When you sign in via Google OAuth, we receive your basic profile info (Full Name, Email Address, Profile Picture URL, and unique Google ID). We do not request or store your password.</li>
              <li><strong>Order & Shipping Information:</strong> Phone number, delivery address, and print artwork specifications necessary to fulfill print orders.</li>
              <li><strong>Usage Telemetry:</strong> Anonymized statistics on tool usage and page interactions to improve performance.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">2</span>
              How We Use Your Information
            </h2>
            <p>
              Your data is strictly utilized for core operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>Authenticating users to access the Creative Tools Workspace and Portal.</li>
              <li>Processing print orders, shipping packages, and sending order status notifications via email/WhatsApp.</li>
              <li>Providing customer support and responding to inquiries.</li>
              <li>Maintaining application security and preventing fraudulent activity.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">3</span>
              Client-Side Creative Tools Privacy
            </h2>
            <p>
              Our web-based tools (such as Passport Photo Maker, Thanglish Tamil Typing, Universal File Converter, and OCR Extractor) execute file transformations directly inside your web browser. Uploaded images, documents, and videos processed in these tools remain confidential on your device.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">4</span>
              Data Protection & Third-Party Sharing
            </h2>
            <p>
              We implement industry-standard encryption protocols (HTTPS/TLS) to protect data in transit:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>We never sell, rent, or trade your personal information to third-party advertisers.</li>
              <li>Information is shared only with trusted service infrastructure providers (such as Google OAuth for authentication, payment gateways, and delivery courier partners) solely to deliver services.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">5</span>
              Your Rights & Choice
            </h2>
            <p>
              You have full control over your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              <li>You can update your profile details anytime from your Account Profile dashboard.</li>
              <li>You can request complete deletion of your account and order history by contacting <a href="mailto:stargraphix2010@gmail.com" className="text-primary-600 hover:underline">stargraphix2010@gmail.com</a>.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-mono font-bold">6</span>
              Contact Us
            </h2>
            <p>
              If you have any questions or privacy concerns, please contact our Data Protection team:
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <p className="font-bold text-gray-800">Star Graphix Privacy Team</p>
              <p>Email: <a href="mailto:stargraphix2010@gmail.com" className="text-primary-600 hover:underline">stargraphix2010@gmail.com</a></p>
              <p>Phone: <a href="tel:+919894033883" className="text-primary-600 hover:underline">+91 98940 33883</a> / <a href="tel:+918056580402" className="text-primary-600 hover:underline">+91 80565 80402</a></p>
              <p>Location: Salem, Tamil Nadu, India</p>
            </div>
          </section>

          {/* Navigation Back */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link to="/terms" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
              Read Terms of Service <Icon name="ArrowRight" size={12} />
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
