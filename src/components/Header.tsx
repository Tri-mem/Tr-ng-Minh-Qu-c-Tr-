import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Package, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Star,
  ArrowRight,
  TrendingUp,
  Plus,
  Building2,
  Briefcase,
  Gift,
  CalendarClock,
  HelpCircle,
  Bell,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Award,
  Sun,
  Moon,
  Headphones,
} from 'lucide-react';
import { CATEGORIES, formatVND } from '../data/mockData';
import { PolicyTabId } from './PolicyModal';
import { Product, UserProfile } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  onOpenPolicy?: (tab: PolicyTabId) => void;
  onOpenAbout?: () => void;
  onOpenPromo?: () => void;
  onOpenInstallment?: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  currentPage?: 'home' | 'about' | 'policy' | 'faq';
  onNavigate?: (page: 'home' | 'about' | 'policy' | 'faq', tab?: any) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenChatbot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  orderCount,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenOrders,
  onOpenWishlist,
  onOpenPolicy,
  onOpenAbout,
  onOpenPromo,
  onOpenInstallment,
  notificationCount = 0,
  onOpenNotifications,
  currentPage = 'home',
  onNavigate,
  products = [],
  onSelectProduct,
  onAddToCart,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenChatbot,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close search and user dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsSearchFocused(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter matching products live
  const matchingProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || !products.length) return [];
    return products.filter((prod) => {
      const matchName = prod.name.toLowerCase().includes(q);
      const matchCat = prod.categoryName.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchHighlights = prod.highlights?.some((h) => h.toLowerCase().includes(q));
      return matchName || matchCat || matchDesc || matchHighlights;
    });
  }, [searchQuery, products]);

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-250">
      {/* Balanced Multi-Color Brand Top Accent Strip */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-1 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="order-1 flex items-center shrink-0">
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (onNavigate) onNavigate('home');
                onSelectCategory('all'); 
                onSearchChange(''); 
              }}
              className="flex items-center gap-2 group cursor-pointer"
              id="brand-logo-link"
            >
              <span className="sm:hidden">
                <Logo size="sm" />
              </span>
              <span className="hidden sm:inline-flex">
                <Logo size="md" />
              </span>
            </a>
          </div>

          {/* Search Input Bar with Live Interactive Dropdown (Full-width row 2 on mobile, centered row 1 on desktop) */}
          <div ref={searchContainerRef} className="order-3 md:order-2 w-full md:w-auto md:flex-1 max-w-none md:max-w-xl md:mx-2 lg:mx-4 relative">
            <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
              isSearchFocused 
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white shadow-sm' 
                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 hover:border-slate-300'
            }`}>
              <Search className="w-4 h-4 text-slate-400 ml-3 sm:ml-3.5 shrink-0" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsSearchOpen(true);
                }}
                placeholder="Tìm iPhone 16, MacBook Pro, tai nghe, sạc nhanh..."
                className="w-full py-2 sm:py-2.5 px-2.5 sm:px-3 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => {
                    onSearchChange('');
                    setIsSearchOpen(false);
                  }}
                  className="p-1 mr-1.5 sm:mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchOpen && (
              <div 
                id="search-live-dropdown"
                className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {searchQuery.trim().length > 0 ? (
                  <>
                    <div className="p-2.5 sm:p-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Sản phẩm phù hợp ({matchingProducts.length})</span>
                      {matchingProducts.length > 0 && (
                        <span className="text-[11px] text-indigo-600 font-semibold">Chọn xem chi tiết</span>
                      )}
                    </div>

                    {matchingProducts.length > 0 ? (
                      <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                        {matchingProducts.slice(0, 6).map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 sm:p-3 hover:bg-indigo-50/40 flex items-center gap-2.5 sm:gap-3 transition-colors cursor-pointer group"
                            onClick={() => {
                              if (onNavigate) onNavigate('home');
                              onSelectProduct?.(prod);
                              setIsSearchOpen(false);
                            }}
                          >
                            <img
                              src={prod.image}
                              alt={prod.name}
                              width={48}
                              height={48}
                              loading="lazy"
                              decoding="async"
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain p-1 bg-white border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                              style={{ objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                  {prod.categoryName}
                                </span>
                                {prod.badge && (
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                    {prod.badge}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs sm:text-sm font-extrabold text-indigo-600">
                                  {formatVND(prod.price)}
                                </span>
                                {prod.originalPrice && prod.originalPrice > prod.price && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    {formatVND(prod.originalPrice)}
                                  </span>
                                )}
                                <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-0.5 ml-auto">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {prod.rating}
                                </span>
                              </div>
                            </div>

                            {onAddToCart && (
                              <button
                                type="button"
                                title="Thêm nhanh vào giỏ"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(prod);
                                }}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white transition-all shrink-0 cursor-pointer shadow-2xs"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        {matchingProducts.length > 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigate) onNavigate('home');
                              setIsSearchOpen(false);
                              const el = document.getElementById('products-grid-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Xem tất cả {matchingProducts.length} sản phẩm phù hợp</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 sm:p-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Search className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-600">
                          Không tìm thấy sản phẩm nào khớp với từ khóa <strong className="text-indigo-600">"{searchQuery}"</strong>
                        </p>
                        <div className="text-[11px] text-slate-400 font-medium pt-1">Gợi ý từ khóa tìm kiếm:</div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {['Giá trung bình', 'Galaxy A55', 'Redmi Note 13', 'iPad Gen 10', 'Apple Watch SE', 'Vivobook 15', 'Marshall', 'JBL Flip 6'].map((kw) => (
                            <button
                              key={kw}
                              type="button"
                              onClick={() => {
                                onSearchChange(kw);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Xu hướng & Tìm kiếm phổ biến</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Giá trung bình',
                        'Galaxy A55 5G',
                        'Redmi Note 13 Pro+',
                        'iPad Gen 10',
                        'Apple Watch SE',
                        'Laptop Vivobook 15',
                        'POCO X6 Pro',
                        'Marshall Major IV',
                        'JBL Flip 6',
                        'Xiaomi Pad 6',
                      ].map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => {
                            onSearchChange(kw);
                            setIsSearchOpen(false);
                            const el = document.getElementById('products-grid-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] sm:text-xs font-semibold border border-transparent transition-all cursor-pointer"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User actions */}
          <div className="order-2 md:order-3 flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Dark Mode Toggle button */}
            {onToggleDarkMode && (
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={onToggleDarkMode}
                className={`relative flex items-center gap-1.5 p-1.5 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-xs'
                    : 'bg-slate-200/70 text-slate-700 border-slate-300/80 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isDarkMode ? 'Đang bật Chế độ tối • Nhấn để chuyển sang Chế độ sáng' : 'Đang bật Chế độ sáng • Nhấn để chuyển sang Chế độ tối'}
                aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 transition-transform duration-300" />
                )}
                <span className="hidden xl:inline text-xs font-bold">
                  {isDarkMode ? 'Tối' : 'Sáng'}
                </span>
              </button>
            )}

            {/* Promo Vouchers button */}
            <button
              id="header-promo-vouchers-btn"
              onClick={onOpenPromo}
              className="relative p-1.5 sm:p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-150 cursor-pointer"
              title="Kho mã giảm giá & voucher ưu đãi"
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums rounded-full flex items-center justify-center px-1 shadow-xs">
                4
              </span>
            </button>

            {/* Notifications button */}
            <button
              id="notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-150 cursor-pointer"
              title="Trung tâm thông báo & ưu đãi hệ thống"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums rounded-full flex items-center justify-center px-1 shadow-xs">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-1.5 sm:p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-150 cursor-pointer"
              title="Danh sách yêu thích"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums rounded-full flex items-center justify-center px-1 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Orders history */}
            <button
              id="orders-history-btn"
              onClick={onOpenOrders}
              className="relative flex items-center gap-1.5 p-1.5 sm:py-2 sm:px-3 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all duration-150 border border-slate-200/80 text-xs sm:text-sm font-semibold cursor-pointer"
              title="Đơn hàng của tôi"
            >
              <Package className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden lg:inline">Đơn hàng</span>
              {orderCount > 0 && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[9px] sm:text-[10px] font-bold tabular-nums px-1 sm:px-1.5 py-0.2 rounded-full">
                  {orderCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Dropdown or Login Button */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="header-user-btn"
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-150 border border-slate-200/80 text-xs sm:text-sm font-semibold cursor-pointer select-none"
                  title={`Tài khoản: ${currentUser.fullName}`}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      width={24}
                      height={24}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover shrink-0 shadow-2xs border border-blue-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[90px] truncate font-bold text-slate-800">
                    {currentUser.fullName.split(' ').slice(-1)[0]}
                  </span>
                  <span className="hidden lg:inline px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[9px] uppercase tracking-wider border border-amber-200">
                    {currentUser.memberTier}
                  </span>
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl mb-1.5 border border-blue-100/60">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-blue-200/40 text-[10px]">
                        <span className="font-bold text-blue-700">VIP {currentUser.memberTier}</span>
                        <span className="text-amber-700 font-bold">{currentUser.novaPoints.toLocaleString('vi-VN')} pts</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile?.();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Hồ sơ & Địa chỉ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>Đơn hàng của tôi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenPromo?.();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span>Kho Voucher ưu đãi</span>
                    </button>

                    {onToggleDarkMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleDarkMode();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {isDarkMode ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-indigo-500" />
                          )}
                          <span>Giao diện: {isDarkMode ? 'Chế độ Tối' : 'Chế độ Sáng'}</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/80">
                          Đổi
                        </span>
                      </button>
                    )}

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="flex items-center gap-1 sm:gap-1.5 py-1.5 px-2 sm:py-2 sm:px-3 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all duration-150 border border-slate-200/80 text-xs sm:text-sm font-bold cursor-pointer shrink-0"
                title="Đăng nhập / Đăng ký tài khoản"
              >
                <LogIn className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="hidden min-[390px]:inline text-[11px] sm:text-sm">Đăng nhập</span>
              </button>
            )}

            {/* Shopping Cart button */}
            <button
              id="cart-drawer-trigger"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-xs transition-all duration-150 text-xs sm:text-sm cursor-pointer"
              title="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-amber-400 text-slate-950 font-extrabold text-[9px] sm:text-[10px] tabular-nums rounded-full flex items-center justify-center px-1 shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Giỏ hàng</span>
            </button>
          </div>

        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0b1324] overflow-x-auto scrollbar-none transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center lg:flex-wrap gap-1.5 sm:gap-2">
          {CATEGORIES.map((category) => {
            const isSelected = currentPage === 'home' && selectedCategory === category.id;
            return (
              <button
                key={category.id}
                id={`cat-filter-${category.id}`}
                onClick={() => {
                  onSelectCategory(category.id);
                  if (onNavigate) onNavigate('home');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 shrink-0 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 border border-slate-200/90'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
