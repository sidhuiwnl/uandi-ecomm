'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthForm from './AuthForm';

export default function AuthModal({ isOpen, onClose, redirectAfterAuth = null }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const modalRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5
                   animate-slideUp md:max-w-lg"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 pt-10 pb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join U&I' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login'
              ? 'Sign in to continue shopping'
              : mode === 'signup'
              ? 'Create your account in seconds'
              : 'Enter your email to reset'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {['login', 'signup', 'forgot'].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`relative flex-1 py-4 text-sm font-semibold capitalize transition-all duration-300
                ${mode === tab ? 'text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab === 'forgot' ? 'Forgot Password' : tab}
              {mode === tab && (
                <span className="absolute bottom-0 left-0 h-1 w-full bg-amber-500 rounded-t-md" />
              )}
            </button>
          ))}
        </div>

        {/* Form Wrapper */}
        <div className="p-6 md:p-8">
          <AuthForm
            mode={mode}
            redirectAfterAuth={redirectAfterAuth}
            onAuthenticated={() => onClose()}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-amber-600">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-amber-600">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}