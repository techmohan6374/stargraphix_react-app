// Razorpay integration utility
export const RAZORPAY_KEY = 'rzp_test_TNbigzU9c0yE2y';

/**
 * Dynamically load Razorpay checkout.js if not already loaded.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay payment popup.
 *
 * @param {Object} options
 * @param {number}   options.amount       - Amount in INR (will be converted to paise)
 * @param {string}   options.name         - Merchant / product name
 * @param {string}   options.description  - Payment description
 * @param {string}   [options.customerName]
 * @param {string}   [options.customerEmail]
 * @param {string}   [options.customerPhone]
 * @param {Function} options.onSuccess    - Called with Razorpay response object
 * @param {Function} [options.onDismiss]  - Called if user closes modal
 */
export async function openRazorpay({
  amount,
  name = 'Star Graphix',
  description = 'Payment to Star Graphix',
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  onSuccess,
  onDismiss,
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Failed to load Razorpay. Please check your internet connection.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(Number(amount) * 100), // paise
    currency: 'INR',
    name,
    description,
    image: '/logo.png',
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    theme: {
      color: '#CC0000',
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
    handler: (response) => {
      if (onSuccess) onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
