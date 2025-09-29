import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { registerWithEmail, verifyEmail } from "../services/api";
import { isApiError } from "../utils/errorHandler";
import gsap from 'gsap';
import { useTheme } from "../hooks/useTheme";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { cn } from "../lib/utils";
import { useLanguage } from "../hooks/useLanguage";

// Close button (SVG) to match TradeGPT minimal style
const CloseIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// Modal props kept for backward compatibility with Header/Hero/CTA
// isOpen: boolean, onClose: () => void, onSwitchToLogin?: () => void, title?: string, subtitle?: string
const SignupModal = ({ isOpen, onClose, onSwitchToLogin, title, subtitle }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { googleLoading, error: googleError, handleGoogleLogin } = useGoogleLogin();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const registerCardRef = useRef(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (registerCardRef.current) {
      gsap.set(registerCardRef.current, { opacity: 0, y: 20 });
      gsap.to(registerCardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await registerWithEmail({ email, password, name });
      if (res && res.tag === "REGISTER_VERIFICATION_SENT") {
        setSuccess("Đã gửi mã xác thực về email. Vui lòng kiểm tra email và nhập mã xác thực để hoàn tất đăng ký.");
        setShowVerify(true);
      } else {
        setSuccess("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");
        setShowVerify(true);
      }
    } catch (err) {
      setShowVerify(false); // lỗi thì quay lại màn đăng ký
      if (isApiError(err)) {
        if (err.tag === "REGISTER_PASSWORD_TOO_SHORT") {
          setError("Mật khẩu phải có ít nhất 8 ký tự");
        } else if (err.tag === "REGISTER_EMAIL_ALREADY_EXISTS" || err.tag === "REGISTER_EMAIL_EXISTS") {
          setError("Email đã được sử dụng");
        } else {
          setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response) => {
          handleGoogleLogin(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: theme === 'dark' ? "filled_black" : "outline",
        size: "large",
      });
    }
  }, [theme, isOpen, handleGoogleLogin]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError("");
    setVerifySuccess("");
    try {
      const res = await verifyEmail(email, verifyCode);
      if (res.success) {
        setVerifySuccess("Xác thực email thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/post-auth", { replace: true }), 800);
      } else {
        setVerifyError("Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.");
      }
    } catch (err) {
      setVerifyError("Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.");
    }
  };

  const handleResendCode = async () => {
    setVerifyError("");
    setVerifySuccess("");
    setResendCooldown(60);
    try {
      const res = await registerWithEmail({ email, password, name });
      if (res.success) {
        setVerifySuccess("Đã gửi lại mã xác thực về email. Vui lòng kiểm tra email.");
      } else {
        setVerifySuccess("Đã gửi lại mã xác thực về email. Vui lòng kiểm tra email.");
      }
    } catch (err) {
      setVerifyError("Không thể gửi lại mã. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose && onClose(); };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div ref={registerCardRef} className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-[#18181B] border border-gray-700/50 text-gray-400 hover:text-white rounded-full p-2 shadow z-10"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
        <Card className="bg-[#18181B] border border-gray-700/50 rounded-2xl shadow-2xl">
          <CardHeader className="space-y-1.5 p-6 border-b border-gray-700/50">
            <CardTitle className="text-2xl font-bold text-center text-white">{title || 'Start Your Free Trial'}</CardTitle>
            <CardDescription className="text-center text-gray-400 text-sm">
              {subtitle || "Create your account and get instant access to TradeGPT's AI-powered investment analysis"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} style={{ display: showVerify ? 'none' : undefined }}>
            <CardContent className="space-y-6 p-6">
              {(error || googleError) && (
                <Alert variant="destructive" className="mb-4">
                  {error || googleError}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-medium text-sm text-gray-300">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-medium text-sm text-gray-300">{t('auth.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 underline">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-medium text-sm text-gray-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={loading || googleLoading}
                  className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 rounded-lg transition-all"
                size="lg"
                disabled={loading || googleLoading}
              >
                {loading ? "Creating Account..." : "Create Account & Start Trial"}
              </Button>
              <div className="relative pt-2 pb-1">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-700/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#18181B] px-2 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
              <div ref={googleButtonRef} className="w-full flex justify-center" />
            </CardContent>
          </form>
          {showVerify && (
            <form onSubmit={handleVerify} className="space-y-6 p-6">
              <Alert variant="info" className="mb-4">
                Đã gửi mã xác thực về email <b>{email}</b>. Vui lòng kiểm tra email và nhập mã xác thực gồm 6 số để hoàn tất đăng ký.
              </Alert>
              {verifyError && <Alert variant="destructive">{verifyError}</Alert>}
              {verifySuccess && <Alert variant="success">{verifySuccess}</Alert>}
              <div className="space-y-1.5">
                <Label htmlFor="verifyCode" className="font-medium text-sm text-gray-300">Mã xác thực</Label>
                <Input
                  id="verifyCode"
                  type="text"
                  placeholder="Nhập mã xác thực 6 số"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  required
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]{6}"
                  className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] hover:opacity-90 text-black font-semibold py-3 rounded-lg transition-all" size="lg">
                Xác thực email & hoàn tất
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : "Gửi lại mã"}
              </Button>
            </form>
          )}
          <CardFooter className="flex justify-center p-6 border-t border-gray-700/50 rounded-b-2xl">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              {onSwitchToLogin ? (
                <button onClick={onSwitchToLogin} className="font-medium text-blue-400 hover:text-blue-300 underline">
                  Sign in
                </button>
              ) : (
                <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 underline">Sign in</Link>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignupModal;