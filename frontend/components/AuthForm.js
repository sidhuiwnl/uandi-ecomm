'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login, signup, forgotPassword } from '@/store/authSlice';
import { mergeCarts } from '@/store/slices/cartSlice';
import Swal from 'sweetalert2';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthForm({ mode, redirectAfterAuth = null, onAuthenticated }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    if (name === 'password' && (mode === 'signup')) validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Passwords do not match', confirmButtonColor: '#f59e0b' });
      setLoading(false);
      return;
    }
    if (mode === 'signup' && !validatePassword(formData.password)) {
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const userData = await dispatch(login({ identifier: formData.identifier, password: formData.password })).unwrap();
        console.log('Logged in user data:', userData);
        // Merge any guest cart items into user's cart
        try { await dispatch(mergeCarts()).unwrap(); } catch (mergeErr) { console.warn('Failed to merge local cart after login:', mergeErr); }

        // Redirect priority: explicit redirectAfterAuth > role-based fallback
        if (redirectAfterAuth) {
          router.push(redirectAfterAuth);
        } else if (userData?.role === 'superadmin' || userData?.role === 'admin') {
          router.push(`${userData?.role}/dashboard`);
        } else {
          router.push('/');
        }
        if (onAuthenticated) onAuthenticated(userData);
      } else if (mode === 'signup') {
        await dispatch(
          signup({
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            confirmPassword: formData.confirmPassword, 
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
        ).unwrap();
        // After signup, merge any guest cart items into the new user's cart
        try { await dispatch(mergeCarts()).unwrap(); } catch (mergeErr) { console.warn('Failed to merge local cart after signup:', mergeErr); }
        if (redirectAfterAuth) {
          router.push(redirectAfterAuth);
        } else {
          router.push('/dashboard');
        }
        if (onAuthenticated) onAuthenticated();
      } else if (mode === 'forgot') {
        await dispatch(forgotPassword({ identifier: formData.identifier })).unwrap();
        Swal.fire({ icon: 'success', title: 'Check your email', text: 'Reset link sent!', confirmButtonColor: '#f59e0b' });
        router.push('/login');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Try again', confirmButtonColor: '#f59e0b' });
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleLogin = () => {
    // Persist redirect intent for Google OAuth round-trip
    if (redirectAfterAuth) {
      try { localStorage.setItem('postAuthRedirect', redirectAfterAuth); } catch (_) {}
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Login / Forgot */}
      {(mode === 'login' || mode === 'forgot') && (
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-amber-600" />
          <input
            type="text"
            name="identifier"
            placeholder={mode === 'forgot' ? 'Email or Phone' : 'Email or Phone'}
            value={formData.identifier}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm placeholder-gray-400 
                       focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition"
            required
          />
        </div>
      )}

      {/* Signup Fields */}
      {mode === 'signup' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-amber-600" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm 
                           focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                required
              />
            </div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-sm 
                         focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-amber-600" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm 
                         focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-amber-600" />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm 
                         focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>
        </>
      )}

      {/* Password */}
      {(mode === 'login' || mode === 'signup') && (
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-amber-600" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-12 text-sm 
                       focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-amber-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      )}

      {/* Confirm Password */}
      {mode === 'signup' && (
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 px-4 text-sm 
                     focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          required
        />
      )}

      {passwordError && mode === 'signup' && (
        <p className="text-xs text-red-500 -mt-2">{passwordError}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 
                   py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-amber-500/30 
                   hover:from-amber-600 hover:to-orange-600 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : mode === 'login' ? (
          'Sign In'
        ) : mode === 'signup' ? (
          'Create Account'
        ) : (
          'Send Reset Link'
        )}
      </button>

      {/* Google Button */}
      {(mode === 'login' || mode === 'signup') && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white 
                     py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:shadow-md"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.46-.62-.73-1.36-.73-2.09 0-.73.27-1.47.73-2.09V7.16H2.18C1.43 8.87 1 10.71 1 12.66s.43 3.79 1.18 5.5l3.66-2.87z"
            />
            <path
              fill="#EA4335"
              d="M12 6.73c1.61 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84C6.71 7.53 9.14 6.73 12 6.73z"
            />
          </svg>
          Continue with Google
        </button>
      )}

      {/* Links */}
      {mode === 'login' && (
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <button type="button" onClick={() => setMode('signup')} className="font-semibold text-amber-600 hover:underline">
            Sign up
          </button>
        </p>
      )}
      {mode === 'signup' && (
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button type="button" onClick={() => setMode('login')} className="font-semibold text-amber-600 hover:underline">
            Sign in
          </button>
        </p>
      )}
    </form>
  );
}