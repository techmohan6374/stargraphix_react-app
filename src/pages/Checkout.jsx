import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';
import { openRazorpay } from '../utils/razorpay';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const gst = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + gst;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || form.pincode.length < 6) e.pincode = 'Valid pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5149/api/orders/upload-screenshot', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setScreenshotUrl(data.imageUrl);
      toast.success('Screenshot uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload screenshot.');
    } finally {
      setScreenshotUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!screenshotUrl) {
      toast.error('Please upload your payment screenshot to place the order.');
      return;
    }

    setLoading(true);
    const orderData = {
      userId: user?.id,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image
      })),
      subtotal: cartTotal,
      gst,
      total: grandTotal,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      notes: form.notes,
      status: 'Pending Verification',
      paymentMethod: 'upi',
      paymentScreenshotUrl: screenshotUrl
    };

    try {
      const res = await fetch('http://localhost:5149/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      clearCart();
      toast.success('Order placed! Awaiting admin approval.');
      navigate('/orders', { state: { newOrder: data.id } });
    } catch (err) {
      console.warn("Backend not running, saving order to local storage fallback:", err);
      
      const localOrder = {
        ...orderData,
        id: `SGLocal_${Date.now()}`,
        placedAt: new Date().toISOString()
      };
      const orders = JSON.parse(localStorage.getItem('sg_orders') || '[]');
      orders.unshift(localOrder);
      localStorage.setItem('sg_orders', JSON.stringify(orders));
      
      clearCart();
      toast.success('Order placed (Local Fallback)! Awaiting verification.');
      navigate('/orders', { state: { newOrder: localOrder.id } });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `input-field ${errors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`;

  return (
    <main className="min-h-screen bg-gray-50 font-outfit">
      <div className="container-custom py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          {['Delivery Details', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? <Icon name="Check" size={12} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <Icon name="ChevronRight" size={14} className="text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon name="MapPin" size={18} className="text-primary-600" /> Delivery Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" className={inputClass('name')} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Email *</label>
                    <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email address" className={inputClass('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number *</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 80565 80402" maxLength={10} className={inputClass('phone')} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">City *</label>
                    <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className={inputClass('city')} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Address *</label>
                    <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street address, area, landmark" rows={2} className={`${inputClass('address')} resize-none`} />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">State</label>
                    <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Pincode *</label>
                    <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="600001" maxLength={6} className={inputClass('pincode')} />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Special Instructions</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special requirements or notes for this order..." rows={2} className="input-field resize-none" />
                  </div>
                </div>
                <button onClick={() => { if (validate()) setStep(2); }} className="btn-primary mt-5">
                  Continue to Payment <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon name="CreditCard" size={18} className="text-primary-600" /> UPI QR Code Payment
                </h2>
                
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    Scan using GPay, PhonePe, Paytm, or BHIM
                  </p>
                  
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=stargraphix2010@okaxis&pn=StarGraphix&am=${grandTotal}&cu=INR`)}`} 
                    alt="UPI Payment QR Code" 
                    className="w-48 h-48 object-contain rounded-lg border-4 border-white shadow-md bg-white p-2 mb-4"
                  />
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Merchant Name</p>
                    <p className="text-sm font-bold text-gray-800">STAR GRAPHIX</p>
                    <p className="text-xs text-gray-400 mt-2">Amount to Pay</p>
                    <p className="text-lg font-black text-primary-600">₹{grandTotal.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 mt-1 select-all font-mono">UPI ID: stargraphix2010@okaxis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <Icon name="Info" size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Please make the payment of <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> to the above UPI address or QR, then upload the receipt/screenshot below. The admin will verify and approve your order.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Upload Payment Screenshot *</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleScreenshotUpload} 
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" 
                      />
                      {screenshotUploading && (
                        <div className="flex items-center gap-1">
                          <svg className="animate-spin w-4 h-4 text-primary-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          <span className="text-xs text-gray-400">Uploading...</span>
                        </div>
                      )}
                    </div>
                    {screenshotUrl && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 text-xs font-semibold">
                        <Icon name="CheckCircle" size={16} /> Screenshot uploaded successfully!
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-secondary py-2.5 px-5 text-sm">
                    <Icon name="ChevronLeft" size={16} /> Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!screenshotUrl) {
                        toast.error('Please upload your payment screenshot before reviewing the order.');
                        return;
                      }
                      setStep(3);
                    }} 
                    className="btn-primary py-2.5 px-6 text-sm"
                  >
                    Review Order <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon name="Eye" size={18} className="text-primary-600" /> Review Order
                </h2>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        <p className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg mb-4 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">Delivery to:</span><span className="font-medium text-gray-800">{form.name}, {form.city}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Payment:</span><span className="font-medium text-gray-800 capitalize">{form.paymentMethod.toUpperCase()}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary py-2.5 px-5 text-sm">
                    <Icon name="ChevronLeft" size={16} /> Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3 text-sm disabled:opacity-70">
                    {loading ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : <Icon name="CheckCircle" size={16} />}
                    {loading ? 'Placing Order...' : `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 mb-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="text-green-600">Free</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                  <span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: 'Shield', text: '100% Secure Payment' },
                  { icon: 'Refresh', text: 'Free Revisions Included' },
                  { icon: 'Zap', text: 'Fast Delivery' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name={b.icon} size={12} className="text-green-500" /> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
