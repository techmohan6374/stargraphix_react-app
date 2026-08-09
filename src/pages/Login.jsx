import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons/Icons';
import toast from 'react-hot-toast';

export default function Login() {
  const { loginWithGoogle, loginAdmin, loginTestUser, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isLoggedIn) {
    navigate(isAdmin ? '/admin' : '/');
    return null;
  }

  const validateAdmin = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!validateAdmin()) return;
    setLoading(true);
    setTimeout(() => {
      const result = loginAdmin(email, password);
      if (result.success) {
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials');
        setErrors({ general: 'Invalid email or password' });
      }
      setLoading(false);
    }, 800);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        loginWithGoogle(userInfo);
        toast.success(`Welcome, ${userInfo.name}!`);
        navigate('/');
      } catch {
        toast.error('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed.');
      setLoading(false);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex font-outfit">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white opacity-30"
              style={{ width: `${150 + i * 80}px`, height: `${150 + i * 80}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <img src="/logo.png" alt="Star Graphix" className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">STAR GRAPHIX</h1>
          <p className="text-red-200 text-lg mb-8">Design • Print • Develop</p>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[
              { icon: 'Print', title: 'Premium Printing', desc: 'Business cards, flyers & more' },
              { icon: 'Code', title: 'Web & Apps', desc: 'Custom software solutions' },
              { icon: 'Image', title: 'Graphic Design', desc: 'Creative visual identity' },
              { icon: 'Award', title: '10+ Years', desc: 'Trusted by 5000+ clients' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 text-left border border-white border-opacity-20">
                <Icon name={feature.icon} size={20} className="text-gold-400 mb-1.5" />
                <p className="text-white font-semibold text-sm">{feature.title}</p>
                <p className="text-red-200 text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.png" alt="Star Graphix" className="h-12 w-12 object-contain" />
            <div>
              <p className="text-xl font-black text-primary-600">STAR GRAPHIX</p>
              <p className="text-xs text-gray-500 tracking-widest">DESIGN • PRINT • DEVELOP</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isAdminMode ? 'Admin Login' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isAdminMode ? 'Sign in to access the admin panel' : 'Sign in to your Star Graphix account'}
          </p>

          {/* Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setIsAdminMode(false); setErrors({}); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${!isAdminMode ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              <Icon name="User" size={15} /> User Login
            </button>
            <button
              onClick={() => { setIsAdminMode(true); setErrors({}); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isAdminMode ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              <Icon name="Shield" size={15} /> Admin Login
            </button>
          </div>

          {!isAdminMode ? (
            /* Google Login */
            <div>
              <button
                onClick={() => { setLoading(true); googleLogin(); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <Icon name="Google" size={20} />
                )}
                <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* Test User Login */}
              <div className="relative flex items-center my-3">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <button
                onClick={() => {
                  const testUser = loginTestUser();
                  toast.success(`Welcome, ${testUser.name}! (Test Account)`);
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95"
              >
                <Icon name="User" size={18} />
                <span>Continue as Test User</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Demo</span>
              </button>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-2">
                  <Icon name="Info" size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    We use Google Sign-In for secure authentication. No password needed — just click and sign in with your Google account.
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By signing in, you agree to our{' '}
                  <span className="text-primary-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </div>
            </div>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Icon name="AlertCircle" size={16} className="text-red-500" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Icon name="Mail" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                    placeholder="admin@stargraphix.com"
                    className={`input-field pl-9 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Icon name="Shield" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                    placeholder="Enter admin password"
                    className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Icon name="Eye" size={16} />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Demo credentials:</p>
                <p className="text-xs text-amber-600">Email: admin@stargraphix.com</p>
                <p className="text-xs text-amber-600">Password: Admin@123</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <Icon name="Shield" size={18} />}
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors">
              <Icon name="ChevronLeft" size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
