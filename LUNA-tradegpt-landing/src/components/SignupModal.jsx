import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import authService from '../services/authService';

// Giả lập icon chat như trong hình
const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C10.5364 21 9.60477 20.8434 8.75 20.5501L4 22L5.44992 17.25C3.15659 15.3952 2 12.8952 2 10C2 4.75329 6.25329 0.5 11.5 0.5C16.7467 0.5 21 4.75329 21 11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Thêm state cho email verification
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authService.register(
        signupForm.email, 
        signupForm.password, 
        signupForm.fullName
      );
      
      // Registration thành công - hiển thị form verification
      console.log('Registration successful:', result);
      setShowVerification(true);
      setError('');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const result = await authService.verifyEmail(signupForm.email, verificationCode);
      
      // Verification thành công
      console.log('Email verification successful:', result);
      
      // Đóng modal và redirect
      handleClose();
      
      // Redirect to post-auth checker
      window.location.href = '/post-auth';
      
    } catch (error) {
      console.error('Email verification error:', error);
      setError(error.message || 'Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleClose = () => {
    setSignupForm({ fullName: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowVerification(false);
    setVerificationCode('');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSwitchToLogin = () => {
    handleClose();
    onSwitchToLogin();
  };

  useEffect(() => {
    const handleEscKey = (e) => { if (e.key === 'Escape' && isOpen) { handleClose(); } };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* SỬA LỖI: 
        1. Đã xóa class `h-full` để modal tự co giãn theo nội dung.
        2. Thay đổi màu nền và border để khớp với ảnh.
      */}
      <div 
        className="bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 max-w-md w-full relative animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()} // Ngăn click bên trong modal đóng modal
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
          <h3 className="text-2xl font-bold text-white mb-2">
            {showVerification ? 'Verify Your Email' : 'Start Your Free Trial'}
          </h3>
          <p className="text-gray-400 text-sm">
            {showVerification 
              ? `We've sent a verification code to ${signupForm.email}. Please check your email and enter the code below.`
              : 'Create your account and get instant access to TradeGPT\'s AI-powered investment analysis'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={showVerification ? handleVerifyEmail : handleSignupSubmit} className="space-y-4">
          {!showVerification ? (
            <>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={signupForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={signupForm.email}
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
                    value={signupForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={signupForm.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Verification Code</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg tracking-widest"
                  placeholder="Enter verification code"
                  maxLength="8"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                Didn't receive the code? Check your spam folder or{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 underline">
                  resend code
                </button>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={showVerification ? isVerifying : isSubmitting}
            className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 flex items-center justify-center mt-6"
          >
            {showVerification ? (
              isVerifying ? 'Verifying...' : 'Verify Email & Complete Registration'
            ) : (
              isSubmitting ? 'Creating Account...' : (
                <>
                  Create Account & Start Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )
            )}
          </button>
        </form>

        {!showVerification && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={handleSwitchToLogin}
                className="text-gray-400 hover:text-white underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-4">
          By creating an account, you agree to our{' '}
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
}

export default SignupModal;