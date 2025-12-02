'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login, signup, forgotPassword } from '@/store/authSlice';
import { mergeCarts } from '@/store/slices/cartSlice';
import Swal from 'sweetalert2';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

// Brand colors
const BRAND_PRIMARY = '#D8234B';
const BRAND_SECONDARY = '#FFD3D5';

export default function AuthForm({ redirectAfterAuth = null, onAuthenticated, initialMode = 'login', logoSrc = '/logo.png' }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [formData, setFormData] = useState({
    identifier: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must contain at least one capital letter and one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password' && view === 'signup') validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (view === 'signup' && formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Passwords do not match', confirmButtonColor: BRAND_PRIMARY });
      setLoading(false);
      return;
    }
    if (view === 'signup' && !validatePassword(formData.password)) {
      setLoading(false);
      return;
    }

    try {
     const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      if (view === 'login') {
        const userData = await dispatch(login({ 
          identifier: formData.identifier, 
          password: formData.password,
          guestCart: localCart 
        })).unwrap();
        
        // Clear local cart as it's now merged on server
        if (localCart.length > 0) localStorage.removeItem('cart');
        
        if (redirectAfterAuth) {
          router.push(redirectAfterAuth);
        } else if (userData?.role === 'superadmin' || userData?.role === 'admin') {
          router.push(`${userData?.role}/dashboard`);
        } else {
          router.push('/');
        }
        if (onAuthenticated) onAuthenticated(userData);
      } else if (view === 'signup') {
        const userData = await dispatch(
          signup({
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            firstName: formData.firstName,
            lastName: formData.lastName,
            guestCart: localCart
          })
        ).unwrap();
        
        // Clear local cart as it's now merged on server
        if (localCart.length > 0) localStorage.removeItem('cart');

        if (redirectAfterAuth) {
          router.push(redirectAfterAuth);
        } else {
          router.push('/');
        }
        if (onAuthenticated) onAuthenticated();
      } else if (view === 'forgot') {
        await dispatch(forgotPassword({ identifier: formData.identifier })).unwrap();
        Swal.fire({ icon: 'success', title: 'Check your email', text: 'Reset link sent!', confirmButtonColor: BRAND_PRIMARY });
        setView('login');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Try again', confirmButtonColor: BRAND_PRIMARY });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const target = redirectAfterAuth || '/';
    try {
      // Persist intent in localStorage
      localStorage.setItem('postAuthRedirect', target);
    } catch (_) {}
    try {
      // Also set a short-lived cookie (10 minutes) for robustness across redirects
      const maxAgeSeconds = 600;
      document.cookie = `postAuthRedirect=${encodeURIComponent(target)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
    } catch (_) {}
    // Kick off Google OAuth, include redirect hint for backend
    const redirectParam = encodeURIComponent(target);
    const base = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    const url = `${base}?redirect=${redirectParam}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-7">
      {/* Logo */}
      <div className="flex justify-center">
        <img src={logoSrc} alt="U&I Naturals" className="h-12 w-auto" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identifier (login & forgot) */}
        {(view === 'login' || view === 'forgot') && (
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5" style={{ color: BRAND_PRIMARY }} />
            <input
              type="text"
              name="identifier"
              placeholder="Email or Phone"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none transition"
              required
            />
          </div>
        )}

        {/* Signup extra fields */}
        {view === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5" style={{ color: BRAND_PRIMARY }} />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
                  required
                />
              </div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5" style={{ color: BRAND_PRIMARY }} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5" style={{ color: BRAND_PRIMARY }} />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Password (login + signup) */}
        {(view === 'login' || view === 'signup') && (
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5" style={{ color: BRAND_PRIMARY }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-12 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-[#D8234B]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* Confirm Password (signup) */}
        {view === 'signup' && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm focus:border-[#D8234B] focus:ring-2 focus:ring-[#FFD3D5] focus:outline-none"
            required
          />
        )}

        {passwordError && view === 'signup' && (
          <p className="text-xs text-red-500 -mt-2">{passwordError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-[#D8234B] to-[#FFD3D5] py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : view === 'login' ? (
            'Sign In'
          ) : view === 'signup' ? (
            'Create Account'
          ) : (
            'Send Reset Link'
          )}
        </button>

        {(view === 'login' || view === 'signup') && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.46-.62-.73-1.36-.73-2.09 0-.73.27-1.47.73-2.09V7.16H2.18C1.43 8.87 1 10.71 1 12.66s.43 3.79 1.18 5.5l3.66-2.87z" />
              <path fill="#EA4335" d="M12 6.73c1.61 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84C6.71 7.53 9.14 6.73 12 6.73z" />
            </svg>
            Continue with Google
          </button>
        )}

        {/* Toggles */}
        {view === 'login' && (
          <div className="space-y-2 text-center text-sm text-gray-600">
            <p>
              New here?{' '}
              <button type="button" onClick={() => setView('signup')} className="font-semibold" style={{ color: BRAND_PRIMARY }}>
                Create an account
              </button>
            </p>
            <p>
              <button type="button" onClick={() => setView('forgot')} className="font-semibold" style={{ color: BRAND_PRIMARY }}>
                Forgot password?
              </button>
            </p>
          </div>
        )}
        {view === 'signup' && (
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button type="button" onClick={() => setView('login')} className="font-semibold" style={{ color: BRAND_PRIMARY }}>
              Sign in
            </button>
          </p>
        )}
        {view === 'forgot' && (
          <p className="text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <button type="button" onClick={() => setView('login')} className="font-semibold" style={{ color: BRAND_PRIMARY }}>
              Back to login
            </button>
          </p>
        )}
      </form>
    </div>
  );
}