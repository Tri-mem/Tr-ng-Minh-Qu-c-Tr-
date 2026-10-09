import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Product, UserProfile } from '../types';
import { formatVND } from '../data/mockData';
import {
  signInWithGooglePopup,
  USER_VALIDATION_RULES,
  sanitizeUserProfileInput,
} from '../firebase';

export interface PendingPurchaseContext {
  type: 'buy_now' | 'buy_from_card' | 'add_to_cart' | 'proceed_to_checkout' | 'open_installment';
  product?: Product;
  quantity?: number;
  color?: string;
  cartCount?: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
  pendingPurchase?: PendingPurchaseContext | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
  pendingPurchase,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Error & loading
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setForgotSuccess(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const profile = await signInWithGooglePopup();
      onLoginSuccess(profile);
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup-closed-by-user')) {
        setErrorMessage('Bạn đã đóng cửa sổ đăng nhập Google. Vui lòng thử lại.');
      } else if (msg.includes('Quota exceeded')) {
        setErrorMessage('Hệ thống đang quá tải. Vui lòng thử lại sau.');
      } else {
        setErrorMessage('Không thể đăng nhập bằng Google lúc này. Vui lòng sử dụng Email hoặc Số điện thoại.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = loginIdentifier.trim();
    if (!trimmedId) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    const isEmail = trimmedId.includes('@');
    if (isEmail && !USER_VALIDATION_RULES.emailPattern.test(trimmedId)) {
      setErrorMessage('Định dạng Email không hợp lệ');
      return;
    }
    if (!isEmail && !USER_VALIDATION_RULES.phonePattern.test(trimmedId)) {
      setErrorMessage('Số điện thoại không hợp lệ (9 - 15 chữ số)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const generatedId = 'user-' + Date.now();
      const sanitized = sanitizeUserProfileInput(
        {
          fullName: isEmail ? trimmedId.split('@')[0] : 'Khách hàng',
          email: isEmail ? trimmedId : `${trimmedId}@novashop.vn`,
          phone: !isEmail ? trimmedId : '',
          city: '',
          district: '',
          address: '',
          joinedDate: new Date().toLocaleDateString('vi-VN'),
        },
        generatedId,
        'member@novashop.vn'
      );

      const loggedUser: UserProfile = {
        id: sanitized.uid,
        fullName: sanitized.fullName,
        email: sanitized.email,
        phone: sanitized.phone,
        memberTier: 'Bronze',
        novaPoints: 1000,
        city: sanitized.city,
        district: sanitized.district,
        address: sanitized.address,
        joinedDate: sanitized.joinedDate,
      };

      onLoginSuccess(loggedUser);
      onClose();
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanName || cleanName.length > USER_VALIDATION_RULES.fullNameMaxLength) {
      setErrorMessage(`Vui lòng nhập họ và tên (tối đa ${USER_VALIDATION_RULES.fullNameMaxLength} ký tự)`);
      return;
    }
    if (
      !cleanEmail ||
      cleanEmail.length > USER_VALIDATION_RULES.emailMaxLength ||
      !USER_VALIDATION_RULES.emailPattern.test(cleanEmail)
    ) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    if (
      !cleanPhone ||
      cleanPhone.length < USER_VALIDATION_RULES.phoneMinLength ||
      cleanPhone.length > USER_VALIDATION_RULES.phoneMaxLength ||
      !USER_VALIDATION_RULES.phonePattern.test(cleanPhone)
    ) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (9 - 15 chữ số)');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const generatedId = 'user-' + Date.now();
      const sanitized = sanitizeUserProfileInput(
        {
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          city: '',
          district: '',
          address: '',
          joinedDate: new Date().toLocaleDateString('vi-VN'),
        },
        generatedId,
        cleanEmail
      );

      const newUser: UserProfile = {
        id: sanitized.uid,
        fullName: sanitized.fullName,
        email: sanitized.email,
        phone: sanitized.phone,
        memberTier: 'Bronze',
        novaPoints: 1000,
        city: sanitized.city,
        district: sanitized.district,
        address: sanitized.address,
        joinedDate: sanitized.joinedDate,
      };

      onLoginSuccess(newUser);
      onClose();
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Vui lòng nhập email hoặc số điện thoại để khôi phục');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
      setErrorMessage('');
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Clean, minimal header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900">
              {mode === 'login' && (pendingPurchase ? 'Đăng nhập để mua hàng' : 'Đăng nhập')}
              {mode === 'register' && (pendingPurchase ? 'Đăng ký để tiếp tục mua hàng' : 'Đăng ký tài khoản')}
              {mode === 'forgot' && 'Quên mật khẩu'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'login' &&
                (pendingPurchase
                  ? 'Vui lòng đăng nhập tài khoản để tiếp tục thực hiện các bước đặt mua sản phẩm.'
                  : 'Nhập thông tin tài khoản của bạn để tiếp tục.')}
              {mode === 'register' &&
                (pendingPurchase
                  ? 'Tạo tài khoản nhanh để tiếp tục hoàn tất đơn hàng của bạn.'
                  : 'Điền thông tin bên dưới để tạo tài khoản mới.')}
              {mode === 'forgot' && 'Nhập email hoặc số điện thoại để nhận hướng dẫn đặt lại mật khẩu.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Purchase Context Banner */}
        {pendingPurchase && mode !== 'forgot' && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center gap-3">
            {pendingPurchase.product ? (
              <>
                <img
                  src={pendingPurchase.product.image}
                  alt={pendingPurchase.product.name}
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 shrink-0" />
                    <span>
                      {pendingPurchase.type === 'open_installment'
                        ? 'Đang chờ đăng ký trả góp 0%'
                        : 'Sản phẩm đang chọn mua'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {pendingPurchase.product.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                    <span className="font-extrabold text-blue-700">
                      {formatVND(pendingPurchase.product.price * (pendingPurchase.quantity || 1))}
                    </span>
                    {pendingPurchase.quantity && pendingPurchase.quantity > 1 && (
                      <span>· SL: {pendingPurchase.quantity}</span>
                    )}
                    {pendingPurchase.color && <span>· Màu: {pendingPurchase.color}</span>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    Tiếp tục thanh toán giỏ hàng ({pendingPurchase.cartCount || 1} sản phẩm)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sau khi đăng nhập, hệ thống sẽ chuyển ngay đến bước xác nhận giao hàng & thanh toán.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mode switch tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 mx-6 mt-4 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    maxLength={USER_VALIDATION_RULES.emailMaxLength}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Nhập email hoặc số điện thoại"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
                  />
                  <span>Duy trì đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{pendingPurchase ? 'Đăng nhập & Tiếp tục mua hàng' : 'Đăng nhập'}</span>
                    {pendingPurchase && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    maxLength={USER_VALIDATION_RULES.fullNameMaxLength}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      maxLength={USER_VALIDATION_RULES.emailMaxLength}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      maxLength={USER_VALIDATION_RULES.phoneMaxLength}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 border-slate-300"
                />
                <span>Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật</span>
              </label>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{pendingPurchase ? 'Tạo tài khoản & Tiếp tục mua hàng' : 'Tạo tài khoản'}</span>
                    {pendingPurchase && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Google Sign-In option at bottom of Login / Register */}
          {mode !== 'forgot' && (
            <div className="pt-1 space-y-3">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink-0 mx-3 text-xs text-slate-400">Hoặc</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>Tiếp tục với Google</span>
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div>
              {forgotSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Đã gửi yêu cầu khôi phục</h3>
                  <p className="text-xs text-slate-600">
                    Vui lòng kiểm tra hộp thư hoặc tin nhắn gửi đến <strong>{forgotEmail}</strong> để đặt lại mật khẩu mới.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotSuccess(false);
                    }}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email hoặc Số điện thoại đã đăng ký
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={forgotEmail}
                        maxLength={USER_VALIDATION_RULES.emailMaxLength}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Nhập email hoặc số điện thoại"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Gửi yêu cầu đặt lại mật khẩu</span>
                    )}
                  </button>
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Quay lại Đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
