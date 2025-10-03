import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

// Giả lập icon chat như trong hình
const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C10.5364 21 9.60477 20.8434 8.75 20.5501L4 22L5.44992 17.25C3.15659 15.3952 2 12.8952 2 10C2 4.75329 6.25329 0.5 11.5 0.5C16.7467 0.5 21 4.75329 21 11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { handleGoogleLogin, googleLoading } = useGoogleLogin();
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = () => {
      try {
        if (!googleButtonRef.current) return;
        if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (!clientId) {
          console.warn('VITE_GOOGLE_CLIENT_ID is missing');
          return;
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              if (response?.credential) {
                console.log('LoginModal: Starting Google login...');
                await handleGoogleLogin(response.credential);
                console.log('LoginModal: Google login successful, closing modal...');
                handleClose();
                // useGoogleLogin hook đã xử lý navigate, không cần redirect thủ công
              }
            } catch (e) {
              console.error('Google login failed', e);
            }
          }
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large'
        });
      } catch (e) {
        console.warn('Failed to initialize Google button', e);
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      init();
    }
  }, [isOpen]);

  useEffect(() => { 
    setMounted(true); 
    return () => setMounted(false); 
  }, []);

  useEffect(() => {
    if (isOpen) { 
      document.body.style.overflow = 'hidden'; 
    } else { 
      document.body.style.overflow = 'unset'; 
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email: loginForm.email });
      const result = await authService.login(loginForm.email, loginForm.password);
      
      // Login thành công
      console.log('Login successful:', result);
      
      // Đóng modal và redirect
      handleClose();
      
      // Redirect to post-auth checker
      window.location.href = '/post-auth';
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Hiển thị lỗi chi tiết hơn
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
        
        // Xử lý các lỗi cụ thể
        if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Nếu bạn vừa đăng ký, vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.';
        } else if (error.message.toLowerCase().includes('oauth') || error.message.toLowerCase().includes('google')) {
          errorMessage = 'Tài khoản này đã liên kết Google. Vui lòng đăng nhập bằng Google hoặc đặt lại mật khẩu.';
        } else if (error.message.includes('Email hoặc mật khẩu không đúng')) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Nếu bạn vừa đăng ký, vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.';
        }
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.name === 'SyntaxError') {
        errorMessage = 'Server response error. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleClose = () => {
    setLoginForm({ email: '', password: '' });
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSwitchToSignup = () => {
    handleClose();
    onSwitchToSignup();
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 max-w-md w-full relative animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] border border-[#00A9FF]/30 p-3 rounded-xl inline-block mb-4">
            <ChatIcon />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
          <p className="text-gray-400 text-sm">Sign in to your TradeGPT account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={loginForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 flex items-center justify-center mt-6"
          >
            {isSubmitting ? 'Signing In...' : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate('/forgot-password');
              }}
              className="text-gray-400 hover:text-white underline text-sm"
            >
              Forgot your password?
            </button>
          </div>
        </form>


        {/* Google Login */}
        <div className="mt-4">
          <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <button
              type="button"
              disabled={googleLoading}
              onClick={async () => {
                try {
                  const idToken = window.prompt('Dán Google ID Token (tạm thời)');
                  if (!idToken) return;
                  await handleGoogleLogin(idToken);
                  handleClose();
                  window.location.href = '/post-auth';
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full border border-gray-600/50 rounded-lg py-2.5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
            >
              <span>{googleLoading ? 'Signing in with Google...' : 'Sign in with Google (fallback)'}</span>
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <button
              onClick={handleSwitchToSignup}
              className="text-gray-400 hover:text-white underline font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-400 hover:text-white underline">
            Terms of Service
          </a> and <a href="#" className="text-gray-400 hover:text-white underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LoginModal;
