import { useState } from 'react';
import Icon from '../icons/Icons';

export default function DonateModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('100');
  const [copied, setCopied] = useState(false);
  const upiId = 'mohanmano2020@oksbi';
  const payeeName = 'Tech Mohan';

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamically build the UPI URI
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Donate%20Star%20Graphix`;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-in text-gray-800 dark:text-gray-100 font-outfit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white px-5 py-4 flex items-center justify-between border-b border-primary-800">
          <div className="flex items-center gap-2">
            <Icon name="HeartFilled" size={20} className="text-gold-400" />
            <h3 className="font-bold text-lg leading-none">Donate Star Graphix</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center mb-6">
            Your contributions keep us running! Support our design, development, and publishing operations by making a quick UPI donation.
          </p>

          {/* Quick Amount Selector */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2 text-center">
              Select Donation Amount (₹)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['50', '100', '200', '500'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                    amount === val
                      ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-300'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 font-outfit font-semibold"
              />
            </div>
          </div>

          {/* UPI Address Box */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800/80 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">UPI VPA Address</span>
              <button 
                onClick={handleCopyUpi}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Icon name="Check" size={12} /> Copied
                  </>
                ) : (
                  'Copy ID'
                )}
              </button>
            </div>
            <p className="font-mono text-sm text-gray-800 dark:text-gray-200 font-semibold select-all bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-100 dark:border-gray-700">
              {upiId}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
              Account Name: <strong className="text-gray-600 dark:text-gray-300">{payeeName}</strong>
            </p>
          </div>

          {/* QR Code Scan Mock & Pay Button */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
              {/* Styled Visual Representation of a QR Code */}
              <div className="w-36 h-36 bg-white dark:bg-gray-900 rounded-xl p-2.5 flex flex-col justify-between border-2 border-primary-500/30">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-4 border-gray-900 dark:border-white rounded-md flex-shrink-0" />
                  <div className="w-8 h-8 border-4 border-gray-900 dark:border-white rounded-md flex-shrink-0" />
                </div>
                {/* Simulated QR blocks */}
                <div className="flex-1 flex flex-col gap-1 py-2 justify-center">
                  <div className="flex justify-around">
                    <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-sm" />
                    <div className="w-4 h-2 bg-gray-400 rounded-sm" />
                    <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-sm" />
                  </div>
                  <div className="flex justify-around">
                    <div className="w-3 h-2 bg-gray-400 rounded-sm" />
                    <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-sm" />
                    <div className="w-3 h-2 bg-gray-400 rounded-sm" />
                  </div>
                  <div className="flex justify-around">
                    <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-sm" />
                    <div className="w-4 h-2 bg-gray-400 rounded-sm" />
                    <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-sm" />
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 border-4 border-gray-900 dark:border-white rounded-md flex-shrink-0" />
                  <div className="w-4 h-4 bg-primary-600 rounded flex items-center justify-center text-white text-[9px] font-black font-outfit shadow-sm">
                    SG
                  </div>
                </div>
              </div>
            </div>

            <a
              href={upiUri}
              className="w-full btn-primary py-3 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
            >
              <Icon name="CreditCard" size={16} /> Pay ₹{amount || '0'} via UPI App
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-3 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 font-semibold">Secure Payment Gateway</span>
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
