import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { forgotPassword, verifyForgotPassword, resetPassword } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Giả lập icon chat như trong LoginModal
const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C10.5364 21 9.60477 20.8434 8.75 20.5501L4 22L5.44992 17.25C3.15659 15.3952 2 12.8952 2 10C2 4.75329 6.25329 0.5 11.5 0.5C16.7467 0.5 21 4.75329 21 11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Bước 1: Gửi email để nhận mã
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Vui lòng nhập email.');
      setLoading(false);
      return;
    }
    
    try {
      const data = await forgotPassword(email);
      console.log('Forgot password response:', data);
      
      if (data && data.success !== false) {
        setSuccess('Mã xác thực đã được gửi đến email của bạn.');
        setStep('verify');
      } else {
        setError(data?.message || data?.error || 'Không thể gửi email.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi gửi email.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực mã
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!code) {
      setError('Vui lòng nhập mã xác thực.');
      setLoading(false);
      return;
    }
    
    try {
      const data = await verifyForgotPassword(email, code);
      console.log('Verify code response:', data);
      
      if (data && data.success !== false) {
        setSuccess('Mã xác thực hợp lệ.');
        setStep('reset');
      } else {
        setError(data?.message || data?.error || 'Mã xác nhận không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      console.error('Verify code error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi xác thực mã.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!new_password) {
      setError('Vui lòng nhập mật khẩu mới.');
      setLoading(false);
      return;
    }
    
    if (new_password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      setLoading(false);
      return;
    }
    
    if (new_password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }
    
    try {
      const data = await resetPassword(email, code, new_password);
      console.log('Reset password response:', data);
      
      if (data && data.success !== false) {
        setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data?.message || data?.error || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative',
        // Sử dụng dark theme như LoginModal
        'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black'
      )}
    >
      <div className="w-full max-w-md">
        {/* Header với icon và nút back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại đăng nhập</span>
          </button>
        </div>

        {/* Card chính */}
        <div className="bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Icon và title */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] border border-[#00A9FF]/30 p-3 rounded-xl inline-block mb-4">
              <ChatIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 'email' && 'Quên mật khẩu?'}
              {step === 'verify' && 'Xác thực mã'}
              {step === 'reset' && 'Đặt lại mật khẩu'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {step === 'email' && 'Nhập email để nhận mã xác thực'}
              {step === 'verify' && 'Nhập mã 6 số đã gửi đến email của bạn'}
              {step === 'reset' && 'Tạo mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Forms */}
          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Đang gửi...' : (
                  <>
                    Gửi mã xác thực
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mã xác thực đã được gửi đến: <span className="text-blue-400">{email}</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg tracking-widest"
                    placeholder="Nhập mã 6 số"
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Đang xác nhận...' : (
                  <>
                    Xác nhận mã
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full bg-transparent border border-gray-600/60 text-white font-semibold py-3 rounded-lg hover:bg-white/10"
              >
                Nhập lại email
              </Button>
            </form>
          )}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tạo mật khẩu mới cho: <span className="text-blue-400">{email}</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={new_password}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                    minLength={8}
                    disabled={loading}
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
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                    minLength={8}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Đang đặt lại...' : (
                  <>
                    Đặt lại mật khẩu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                onClick={() => setStep('verify')}
                className="w-full bg-transparent border border-gray-600/60 text-white font-semibold py-3 rounded-lg hover:bg-white/10"
              >
                Quay lại xác thực mã
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;