import { useState } from 'react';
import Icon from '../icons/Icons';
import { openRazorpay } from '../../utils/razorpay';
import toast from 'react-hot-toast';

export default function DonateModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDonate = async () => {
    const amt = Number(amount);
    if (!amt || amt < 1) {
      toast.error('Please enter a valid donation amount.');
      return;
    }
    setLoading(true);
    await openRazorpay({
      amount: amt,
      name: 'Star Graphix',
      description: 'Donate to support Star Graphix',
      onSuccess: (response) => {
        setLoading(false);
        toast.success(`Thank you! Payment ID: ${response.razorpay_payment_id}`);
        onClose();
      },
      onDismiss: () => {
        setLoading(false);
      },
    });
    // fallback in case handler fires without success
    setLoading(false);
  };

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
        <div className="p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center mb-4">
            Your contributions keep us running! Support our design &amp; publishing operations via Razorpay.
          </p>

          {/* Quick Amount Selector */}
          <div className="mb-4">
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

          {/* Pay Button */}
          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full btn-primary py-3 hover:shadow-lg transition-all text-sm font-bold flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-70"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <Icon name="CreditCard" size={16} />
            )}
            {loading ? 'Opening Razorpay...' : `Donate ₹${amount || '0'} via Razorpay`}
          </button>

          {/* Razorpay badge */}
          <p className="text-center text-[10px] text-gray-400 mt-3 font-semibold">
            🔒 Secured by Razorpay · UPI · Cards · Netbanking · Wallets
          </p>
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
