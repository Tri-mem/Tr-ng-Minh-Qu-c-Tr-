/**
 * NovaShop - E-Commerce & Online Payment Platform
 * Hệ thống phân phối thiết bị công nghệ & Thanh toán trực tuyến hàng đầu Việt Nam
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  ArrowUpDown, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Headphones, 
  RotateCcw, 
  CheckCircle2, 
  Filter, 
  PackageCheck,
  Building2,
  Briefcase,
  Gift,
  HelpCircle,
  X
} from 'lucide-react';
import { Header } from './components/Header';
import { BannerHero } from './components/BannerHero';
import { PartnerAdBanner } from './components/PartnerAdBanner';
import { ProductCard, ProductCardSkeleton } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { WishlistModal } from './components/WishlistModal';
import { PolicyModal, PolicyTabId } from './components/PolicyModal';
import { PolicyPage } from './components/PolicyPage';
import { AboutModal } from './components/AboutModal';
import { AboutPage } from './components/AboutPage';
import { FaqPage } from './components/FaqPage';
import { ShareModal } from './components/ShareModal';
import { PromoModal } from './components/PromoModal';
import { InstallmentModal } from './components/InstallmentModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal, PendingPurchaseContext } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { UserProfileBanner } from './components/UserProfileBanner';
import { CustomerSupportChatbot } from './components/CustomerSupportChatbot';
import {
  auth,
  onAuthStateChanged,
  syncFirebaseUserProfile,
  updateFirestoreUserProfileDetails,
  updateFirestoreUserPoints,
  signOutFirebase,
} from './firebase';
import { Logo } from './components/Logo';
import { ToastContainer, ToastMessage } from './components/Toast';
import { useDraggable } from './hooks/useDraggable';
import { PRODUCTS, VOUCHERS, CATEGORIES, formatVND, INITIAL_NOTIFICATIONS } from './data/mockData';
import { CartItem, Order, Product, Voucher, AppNotification, NotificationType, UserProfile } from './types';

// Sample initial orders (empty by default so each user only sees orders they place)
const INITIAL_DEMO_ORDERS: Order[] = [];

export default function App() {
  // Cart state stored in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novashop_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial cart item for immediate exploration
    return [
      {
        product: PRODUCTS[6], // AirPods Pro 2
        quantity: 1,
        selectedColor: 'Trắng',
      }
    ];
  });

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('novashop_wishlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['prod-1', 'prod-2'];
  });

  // Orders history state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('novashop_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.filter((o) => o.id !== 'NOVA-782910' && o.id !== 'NOVA-551029');
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_ORDERS;
  });

  // Applied Voucher
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(() => VOUCHERS[0]);

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [shareProductModal, setShareProductModal] = useState<Product | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTabId>('warranty');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState<boolean>(false);
  const [installmentProduct, setInstallmentProduct] = useState<Product | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'policy' | 'faq'>('home');

  // Dark Mode state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('novashop_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      const savedBool = localStorage.getItem('novashop_dark_mode');
      if (savedBool !== null) return savedBool === 'true';
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('novashop_theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('novashop_dark_mode', String(isDarkMode));
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    addToast(
      'info',
      next ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng'
    );
  };

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('novashop_auth_user');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        if (parsed.id === 'user-vip-01') {
          localStorage.removeItem('novashop_auth_user');
          return null;
        }
        const leakedAddresses = new Set([
          '219/20 đường số 12, phường Bình Hưng Hòa',
          '123 Nguyễn Huệ, Phường Bến Nghé',
          '123 Nguyễn Huệ',
          'Địa chỉ chưa cập nhật',
        ]);
        const hadLeaked =
          parsed.phone === '0908061843' || leakedAddresses.has(parsed.address || '');
        if (hadLeaked) {
          const cleaned: UserProfile = {
            ...parsed,
            phone: parsed.phone === '0908061843' ? '' : parsed.phone,
            city: '',
            district: '',
            address: '',
          };
          localStorage.setItem('novashop_auth_user', JSON.stringify(cleaned));
          return cleaned;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchaseContext | null>(null);
  const pendingPurchaseRef = useRef<PendingPurchaseContext | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'overview' | 'orders' | 'wishlist' | 'edit'>('overview');

  const setPendingPurchaseState = (action: PendingPurchaseContext | null) => {
    pendingPurchaseRef.current = action;
    setPendingPurchase(action);
  };

  const addItemToCartState = (product: Product, quantity = 1, color?: string) => {
    const itemColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === itemColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor: itemColor }];
      }
    });

    setAddedJustNowId(product.id);
    setTimeout(() => setAddedJustNowId(null), 1500);
  };

  const executePendingPurchase = (action: PendingPurchaseContext, user: UserProfile) => {
    if (action.type === 'add_to_cart') {
      if (action.product) {
        addItemToCartState(action.product, action.quantity || 1, action.color);
      }
      setSelectedProductModal(null);
      setIsWishlistOpen(false);
      addToast(
        'success',
        'Đăng nhập thành công & Đã thêm vào giỏ hàng!',
        action.product
          ? `${action.product.name} (SL: ${action.quantity || 1}) đã được thêm vào giỏ hàng.`
          : `Chào mừng ${user.fullName} trở lại với NovaShop.`
      );
    } else if (action.type === 'buy_now' || action.type === 'buy_from_card') {
      if (action.product) {
        addItemToCartState(action.product, action.quantity || 1, action.color);
      }
      setSelectedProductModal(null);
      setIsWishlistOpen(false);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
      addToast(
        'success',
        'Đăng nhập thành công! Tiếp tục mua hàng',
        action.product
          ? `Đã chọn ${action.product.name} — Vui lòng hoàn tất thông tin nhận hàng & thanh toán.`
          : `Chào mừng ${user.fullName}, vui lòng hoàn tất các bước đặt hàng.`
      );
    } else if (action.type === 'proceed_to_checkout') {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
      addToast(
        'success',
        'Đăng nhập thành công! Tiếp tục thanh toán',
        'Vui lòng kiểm tra thông tin nhận hàng và chọn phương thức thanh toán.'
      );
    } else if (action.type === 'open_installment') {
      setSelectedProductModal(null);
      setIsCartOpen(false);
      setInstallmentProduct(action.product || selectedProductModal || cartItems[0]?.product || PRODUCTS[0]);
      setIsInstallmentOpen(true);
      addToast(
        'success',
        'Đăng nhập thành công! Tiếp tục mua trả góp',
        'Vui lòng hoàn tất thông tin đăng ký trả góp 0%.'
      );
    }
  };

  // Listen to Firebase Auth state changes and sync profile with Cloud Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await syncFirebaseUserProfile(fbUser);
          setCurrentUser(profile);
          localStorage.setItem('novashop_auth_user', JSON.stringify(profile));
          if (pendingPurchaseRef.current) {
            const action = pendingPurchaseRef.current;
            setPendingPurchaseState(null);
            setIsAuthOpen(false);
            executePendingPurchase(action, profile);
          }
        } catch (err) {
          console.error('Error syncing Firebase user profile:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('novashop_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    const action = pendingPurchaseRef.current;
    if (action) {
      setPendingPurchaseState(null);
      setIsAuthOpen(false);
      executePendingPurchase(action, user);
      return;
    }

    addToast(
      'success',
      'Đăng nhập thành công!',
      `Chào mừng ${user.fullName} trở lại với NovaShop. Chúc bạn mua sắm vui vẻ!`
    );
  };

  const handleLogout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('novashop_auth_user');
    } catch (e) {
      console.error(e);
    }
    addToast(
      'info',
      'Đã đăng xuất',
      'Bạn đã đăng xuất tài khoản an toàn.'
    );
  };

  const handleUpdateUser = async (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('novashop_auth_user', JSON.stringify(updatedUser));
      await updateFirestoreUserProfileDetails(updatedUser);
    } catch (e) {
      console.error(e);
    }
    addToast(
      'success',
      'Cập nhật thành công',
      'Thông tin tài khoản và địa chỉ giao hàng đã được lưu.'
    );
  };

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('novashop_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('novashop_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Draggable floating promo button state and handlers
  const [isFloatingPromoVisible, setIsFloatingPromoVisible] = useState<boolean>(true);
  const [isPartnerAdVisible, setIsPartnerAdVisible] = useState<boolean>(true);
  const {
    elementRef: floatingBtnRef,
    isDragging: isFloatingBtnDragging,
    dragProps: floatingBtnDragProps,
    handleClick: handleFloatingBtnClick,
    resetPosition: resetFloatingBtnPosition,
  } = useDraggable<HTMLDivElement>({
    storageKey: 'novashop_floating_promo_pos_v2',
    margin: 8,
  });

  const handleOpenInstallment = (productToInstall?: Product) => {
    const targetProd = productToInstall || selectedProductModal || cartItems[0]?.product || PRODUCTS[0];
    if (!currentUser) {
      setPendingPurchaseState({
        type: 'open_installment',
        product: targetProd,
        quantity: 1,
        color: targetProd?.colors?.[0],
      });
      setSelectedProductModal(null);
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      addToast(
        'info',
        'Vui lòng đăng nhập để mua trả góp',
        'Sau khi đăng nhập, hệ thống sẽ tự động chuyển đến bước đăng ký trả góp 0%.'
      );
      return;
    }
    setInstallmentProduct(targetProd);
    setIsInstallmentOpen(true);
  };

  // Auto show Entrance Promotional Advertisement pop-up when opening the website (respecting 'dontShowToday')
  useEffect(() => {
    try {
      const dismissedDate = localStorage.getItem('novashop_promo_dismissed_date');
      if (dismissedDate === new Date().toDateString()) {
        return;
      }
    } catch {
      // ignore storage read error
    }
    const timer = setTimeout(() => {
      setIsPromoOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync hash routing and URL search params (?product=id)
  useEffect(() => {
    // Check if a direct product link was opened (?product=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productParam = urlParams.get('product');
      if (productParam) {
        const found = PRODUCTS.find((p) => p.id === productParam);
        if (found) {
          setSelectedProductModal(found);
        }
      }
    } catch (e) {
      console.error(e);
    }

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/about' || hash === '#/gioi-thieu' || hash === '#about') {
        setCurrentPage('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/chinh-sach' || hash === '#/policy' || hash === '#policy' || hash === '#chinh-sach') {
        setCurrentPage('policy');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/faq' || hash === '#/hoi-dap' || hash === '#faq' || hash === '#hoi-dap') {
        setCurrentPage('faq');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/' || hash === '' || hash === '#home') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: 'home' | 'about' | 'policy' | 'faq', tab?: PolicyTabId) => {
    if (tab) {
      setActivePolicyTab(tab);
    }
    setCurrentPage(page);
    if (page === 'about') {
      window.location.hash = '#/about';
    } else if (page === 'policy') {
      window.location.hash = '#/chinh-sach';
    } else if (page === 'faq') {
      window.location.hash = '#/hoi-dap';
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPolicy = (tab: PolicyTabId = 'warranty') => {
    setActivePolicyTab(tab);
    handleNavigate('policy', tab);
  };

  const handleOpenPolicyModal = (tab: PolicyTabId = 'warranty') => {
    setActivePolicyTab(tab);
    setIsPolicyOpen(true);
  };

  const handleOpenAbout = () => {
    handleNavigate('about');
  };

  const handleOpenAboutModal = () => {
    setIsAboutOpen(true);
  };

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount-desc' | 'newest'>('featured');
  const [priceFilter, setPriceFilter] = useState<number>(60000000); // max filter
  const [priceTier, setPriceTier] = useState<'all' | 'under1m' | '1to3m' | 'midrange' | '3to10m' | 'above10m'>('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const isFirstRender = useRef(true);

  // Initial skeleton loading for smooth visual entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Brief skeleton refresh on changing category, price tier or sort for responsive feedback
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsLoadingProducts(true);
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [selectedCategory, sortBy, priceTier]);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [addedJustNowId, setAddedJustNowId] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('novashop_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('novashop_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {}
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('novashop_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('novashop_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('novashop_sound_enabled', String(notificationSoundEnabled));
    } catch (e) {}
  }, [notificationSoundEnabled]);

  // Subtle web audio chime for new notifications
  const playNotificationSound = () => {
    if (!notificationSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio autoplay may be guarded by user gesture
    }
  };

  const addAppNotification = (
    type: NotificationType,
    title: string,
    message: string,
    options?: Partial<AppNotification>
  ) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now().toString(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...options,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound();
    addToast(type === 'order' ? 'success' : 'info', title, message);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('success', 'Đã đánh dấu đã đọc', 'Tất cả thông báo đã được cập nhật.');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    addToast('info', 'Đã xóa hộp thư thông báo', 'Toàn bộ danh sách thông báo đã được dọn sạch.');
  };

  const handleNotificationAction = (notification: AppNotification) => {
    setIsNotificationsOpen(false);
    if (!notification.isRead) {
      handleMarkNotificationRead(notification.id);
    }

    if (notification.actionType === 'open_orders') {
      setIsOrdersOpen(true);
    } else if (notification.actionType === 'open_promo') {
      setIsPromoOpen(true);
    } else if (notification.actionType === 'open_cart') {
      setIsCartOpen(true);
    } else if (notification.actionType === 'open_policy') {
      handleNavigate('policy');
    } else if (notification.actionType === 'open_installment') {
      handleOpenInstallment();
    } else if (notification.actionType === 'open_product' && notification.targetId) {
      const prod = PRODUCTS.find((p) => p.id === notification.targetId);
      if (prod) setSelectedProductModal(prod);
    }
  };

  const handleSendTestNotification = () => {
    const testSamples = [
      {
        type: 'promo' as NotificationType,
        title: '⚡ Chớp Nhoáng: Flash Sale Phụ Kiện Giảm 45%',
        message: 'Duy nhất trong 2 giờ tới! Loa Bluetooth Marshall & sạc nhanh Nexode giảm sập sàn đến 45%.',
        badge: 'FLASH SALE',
        actionType: 'open_promo' as const,
      },
      {
        type: 'voucher' as NotificationType,
        title: '🎟️ Bạn Nhận Được Mã Giảm Giá 200.000₫',
        message: 'Mã VIPTECH200 đã sẵn sàng sử dụng cho đơn hàng phụ kiện & laptop từ 2.000.000₫.',
        badge: 'VOUCHER VIP',
        actionType: 'open_promo' as const,
      },
      {
        type: 'system' as NotificationType,
        title: '🚀 Tính Năng Mới: Trung Tâm Thông Báo NovaShop',
        message: 'Chào mừng bạn đến với hệ thống thông báo đa kênh, cập nhật hành trình đơn hàng và ưu đãi chớp nhoáng 24/7!',
        badge: 'TÍNH NĂNG MỚI',
        actionType: 'open_policy' as const,
      },
    ];

    const pick = testSamples[Math.floor(Math.random() * testSamples.length)];
    addAppNotification(pick.type, pick.title, pick.message, {
      badge: pick.badge,
      actionType: pick.actionType,
    });
  };

  const addToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    description?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => {
      const isThemeToast =
        title === 'Đã chuyển sang chế độ tối' || title === 'Đã chuyển sang chế độ sáng';
      const filtered = prev.filter((t) => {
        if (
          isThemeToast &&
          (t.title === 'Đã chuyển sang chế độ tối' || t.title === 'Đã chuyển sang chế độ sáng')
        ) {
          return false;
        }
        return !(t.title === title && t.description === description);
      });
      return [...filtered, { id, type, title, description }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart & Purchase operations (redirecting unauthenticated users to login before continuing purchase steps)
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    options?: { openCheckout?: boolean }
  ) => {
    const itemColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);

    if (!currentUser) {
      setPendingPurchaseState({
        type: options?.openCheckout ? 'buy_from_card' : 'add_to_cart',
        product,
        quantity,
        color: itemColor,
      });
      setSelectedProductModal(null);
      setIsWishlistOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      addToast(
        'info',
        'Vui lòng đăng nhập để mua sản phẩm',
        'Sau khi đăng nhập, hệ thống sẽ tự động tiếp tục các bước mua hàng của bạn.'
      );
      return;
    }

    addItemToCartState(product, quantity, itemColor);

    if (options?.openCheckout) {
      setSelectedProductModal(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
      return;
    }

    addToast(
      'success',
      'Đã thêm vào giỏ hàng!',
      `${product.name} (SL: ${quantity})`
    );
  };

  const handleUpdateQuantity = (productId: string, newQty: number, color?: string) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedColor === color))
    );
    addToast('info', 'Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleClearCart = () => {
    setCartItems([]);
    addToast('info', 'Đã làm trống giỏ hàng');
  };

  const handleBuyNow = (product: Product, quantity = 1, color?: string) => {
    const itemColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);

    if (!currentUser) {
      setPendingPurchaseState({
        type: 'buy_now',
        product,
        quantity,
        color: itemColor,
      });
      setSelectedProductModal(null);
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      addToast(
        'info',
        'Vui lòng đăng nhập để mua sản phẩm',
        'Sau khi đăng nhập, hệ thống sẽ tự động chuyển bạn đến bước đặt hàng & thanh toán.'
      );
      return;
    }

    addItemToCartState(product, quantity, itemColor);
    setSelectedProductModal(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setPendingPurchaseState({
        type: 'proceed_to_checkout',
        cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      });
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      addToast(
        'info',
        'Vui lòng đăng nhập để thanh toán',
        'Sau khi đăng nhập, bạn sẽ tiếp tục thực hiện các bước đặt mua hàng.'
      );
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    const isSaved = wishlistIds.includes(productId);
    if (isSaved) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      addToast('info', 'Đã bỏ khỏi danh sách yêu thích');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      addToast('success', 'Đã lưu vào danh sách yêu thích');
    }
  };

  // Checkout completion
  const handleOrderSuccess = (order: Order, options?: { fromInstallmentModal?: boolean }) => {
    setOrders((prev) => [order, ...prev]);

    // Reward member NovaPoints (1 point per 10,000 VND, capped at 50,000 per order per security rules)
    if (currentUser) {
      const earnedPoints = Math.min(50000, Math.max(10, Math.round(order.total / 10000)));
      const nextPoints = Math.min(1000000, currentUser.novaPoints + earnedPoints);
      const updatedUser: UserProfile = {
        ...currentUser,
        novaPoints: nextPoints,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('novashop_auth_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
      updateFirestoreUserPoints(currentUser.id, nextPoints).catch((err) =>
        console.error('Error updating NovaPoints:', err)
      );
    }

    if (!options?.fromInstallmentModal) {
      setCartItems([]);
      setIsCheckoutOpen(false);
      setSuccessOrder(order);
      addToast('success', 'Thanh toán & Đặt hàng thành công!', `Mã đơn hàng: ${order.id}`);
    } else if (!installmentProduct) {
      // If installment was initiated from the entire cart, clear the cart
      setCartItems([]);
    }

    addAppNotification(
      'order',
      `📦 Đặt hàng thành công #${order.id}`,
      `Đơn hàng trị giá ${formatVND(order.total)} đã được hệ thống xác nhận thành công và bàn giao cho bộ phận xử lý đóng gói.`,
      {
        badge: 'ĐÃ XÁC NHẬN',
        actionType: 'open_orders',
        targetId: order.id,
      }
    );
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const isMidRangeQuery =
          q.includes('trung bình') ||
          q.includes('tầm trung') ||
          q.includes('tam trung') ||
          q.includes('gia trung binh') ||
          q.includes('giá trung bình') ||
          q.includes('mid-range') ||
          q.includes('midrange') ||
          q.includes('bình dân') ||
          q.includes('vừa túi tiền');

        if (isMidRangeQuery) {
          if (product.price >= 2000000 && product.price <= 13500000) {
            // Include all products in the mid-range segment
          } else {
            const matchesName = product.name.toLowerCase().includes(q);
            const matchesCat = product.categoryName.toLowerCase().includes(q);
            const matchesDesc = product.description.toLowerCase().includes(q);
            const matchesHighlights = product.highlights?.some((h) => h.toLowerCase().includes(q));
            if (!matchesName && !matchesCat && !matchesDesc && !matchesHighlights) {
              return false;
            }
          }
        } else {
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesCat = product.categoryName.toLowerCase().includes(q);
          const matchesDesc = product.description.toLowerCase().includes(q);
          const matchesHighlights = product.highlights?.some((h) => h.toLowerCase().includes(q));
          if (!matchesName && !matchesCat && !matchesDesc && !matchesHighlights) {
            return false;
          }
        }
      }
      // Price filter
      if (product.price > priceFilter) {
        return false;
      }
      // Quick price tier filter
      if (priceTier === 'under1m' && product.price >= 1000000) return false;
      if (priceTier === '1to3m' && (product.price < 1000000 || product.price > 3000000)) return false;
      if (priceTier === 'midrange' && (product.price < 2000000 || product.price > 13500000)) return false;
      if (priceTier === '3to10m' && (product.price < 3000000 || product.price > 10000000)) return false;
      if (priceTier === 'above10m' && product.price < 10000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount-desc') {
        const discA = (a.originalPrice && a.originalPrice > a.price) ? a.originalPrice - a.price : 0;
        const discB = (b.originalPrice && b.originalPrice > b.price) ? b.originalPrice - b.price : 0;
        return discB - discA;
      }
      if (sortBy === 'newest') {
        const isNewA = a.badge === 'Mới' ? 1 : 0;
        const isNewB = b.badge === 'Mới' ? 1 : 0;
        if (isNewA !== isNewB) return isNewB - isNewA;
        const idNumA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const idNumB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return idNumB - idNumA;
      }
      return 0; // featured default
    });
  }, [selectedCategory, searchQuery, sortBy, priceFilter, priceTier]);

  const wishlistProducts = useMemo(() => {
    return PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-250 ${
        isDarkMode
          ? 'dark bg-[#0b0f19] text-slate-100'
          : 'bg-[#f6f7f9] text-slate-900'
      }`}
    >
      
      {/* Site Header */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        orderCount={orders.length}
        notificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenPolicy={handleOpenPolicy}
        onOpenAbout={handleOpenAbout}
        onOpenPromo={() => setIsPromoOpen(true)}
        onOpenInstallment={() => handleOpenInstallment()}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        products={PRODUCTS}
        onSelectProduct={(product) => setSelectedProductModal(product)}
        onAddToCart={(product) => handleAddToCart(product, 1)}
        currentUser={currentUser}
        onOpenAuth={(mode = 'login') => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onOpenProfile={() => {
          setProfileInitialTab('overview');
          setIsProfileOpen(true);
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6">
        {currentPage === 'about' ? (
          <AboutPage
            onBackToHome={() => handleNavigate('home')}
            onExploreProducts={() => {
              handleNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenPolicy={(tab) => handleNavigate('policy', tab)}
            onShowToast={addToast}
          />
        ) : currentPage === 'policy' ? (
          <PolicyPage
            initialTab={activePolicyTab}
            onBackToHome={() => handleNavigate('home')}
            onExploreProducts={() => {
              handleNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenFaq={() => handleNavigate('faq')}
            onShowToast={addToast}
          />
        ) : currentPage === 'faq' ? (
          <FaqPage
            onBackToHome={() => handleNavigate('home')}
            onExploreProducts={() => {
              handleNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenPolicy={(tab) => handleNavigate('policy', tab)}
            onOpenOrders={() => setIsOrdersOpen(true)}
            onShowToast={addToast}
          />
        ) : (
          <>
            {/* Hero Banner with Promo & Features */}
            <BannerHero 
              onExploreClick={() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onApplyVoucherClick={(code) => {
                const v = VOUCHERS.find((item) => item.code === code);
                if (v) {
                  setAppliedVoucher(v);
                  addToast('success', `Đã áp dụng mã ${code}!`, v.description);
                  setIsCartOpen(true);
                }
              }}
              onOpenPolicy={handleOpenPolicy}
            />

            {/* Authenticated User Profile Section displayed after login */}
            {currentUser && (
              <UserProfileBanner
                user={currentUser}
                orders={orders}
                wishlistCount={wishlistIds.length}
                cartCount={totalCartCount}
                onOpenProfileModal={(tab = 'overview') => {
                  setProfileInitialTab(tab);
                  setIsProfileOpen(true);
                }}
                onOpenOrders={() => setIsOrdersOpen(true)}
                onOpenWishlist={() => setIsWishlistOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
                onLogout={handleLogout}
              />
            )}

        {/* Section Header & Filters Bar */}
        <section id="products-grid-section" className="mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="w-1.5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-blue-600 via-indigo-500 to-amber-500 shrink-0" />
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                  {selectedCategory === 'all' 
                    ? 'Tất Cả Sản Phẩm Công Nghệ' 
                    : CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Sản phẩm'}
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/70 tabular-nums shrink-0">
                  {filteredProducts.length} sản phẩm
                </span>
              </div>
              {searchQuery && (
                <p className="text-xs text-slate-500 mt-1">
                  Kết quả tìm kiếm cho từ khóa: <strong className="text-blue-600">"{searchQuery}"</strong>
                </p>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              
              {/* Max price filter */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-500">Giá tối đa:</span>
                  <span className="font-bold text-blue-600 tabular-nums">{formatVND(priceFilter)}</span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="60000000"
                  step="500000"
                  value={priceFilter}
                  onChange={(e) => {
                    setPriceFilter(Number(e.target.value));
                    setPriceTier('all');
                  }}
                  className="w-24 sm:w-20 accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-500">Sắp xếp:</span>
                </div>
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-right sm:text-left"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="discount-desc">Khuyến mãi nhiều nhất</option>
                  <option value="newest">Sản phẩm mới nhất</option>
                </select>
              </div>

              {/* Reset filter button if active */}
              {(selectedCategory !== 'all' || searchQuery || priceFilter < 60000000 || priceTier !== 'all') && (
                <button
                  id="reset-filter-btn"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceFilter(60000000);
                    setPriceTier('all');
                  }}
                  className="px-3 py-2 sm:py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer shrink-0"
                >
                  Đặt lại lọc
                </button>
              )}
            </div>
          </div>

          {/* Quick Price Segment Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-slate-500 font-bold text-xs shrink-0 flex items-center gap-1">
              Phân khúc giá:
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'midrange', label: '🎯 Giá trung bình (2 - 13 triệu)' },
              { id: '3to10m', label: '3 - 10 triệu' },
              { id: '1to3m', label: '1 - 3 triệu' },
              { id: 'under1m', label: 'Dưới 1 triệu' },
              { id: 'above10m', label: 'Trên 10 triệu' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setPriceTier(tier.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  priceTier === tier.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : tier.id === 'midrange'
                    ? 'bg-amber-50/90 text-amber-800 hover:bg-amber-100 border border-amber-200/80 shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid - 2 columns on mobile, 3-4 on tablet/desktop */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={`product-skeleton-${index}`} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-12 text-center space-y-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa "{searchQuery}". Bạn hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh mức giá tối đa.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceFilter(60000000);
                  setPriceTier('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={(p) => setSelectedProductModal(p)}
                  onAddToCart={(p, e) => {
                    e.stopPropagation();
                    handleAddToCart(p, 1, undefined, { openCheckout: true });
                  }}
                  isAddedJustNow={addedJustNowId === product.id}
                  onShare={(p) => setShareProductModal(p)}
                  onOpenInstallment={(p) => handleOpenInstallment(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* NovaShop Member & Service Hub Banner */}
        <section className="mt-6 sm:mt-8 mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-[#131c31] to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-700/90 dark:border-cyan-500/40 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/15 dark:border-cyan-400/40 pointer-events-none z-20" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-cyan-500/15 text-cyan-300 font-bold px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs border border-cyan-400/25">
                <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
                <span>HỆ THỐNG MUA SẮM CÔNG NGHỆ CHÍNH HÃNG</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">NovaShop - Trải Nghiệm Mua Sắm & Thanh Toán Hiện Đại</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Cam kết 100% thiết bị công nghệ chính hãng nguyên seal, bảo hành điện tử chính ngạch 12 - 24 tháng. Tận hưởng giao hàng hỏa tốc trong 2 giờ, thanh toán bảo mật VietQR tự động và hỗ trợ kỹ thuật tận tâm 24/7.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
              <button
                id="footer-view-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="px-3 sm:px-5 py-2.5 sm:py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Giỏ Hàng ({totalCartCount})</span>
              </button>

              <button
                id="footer-open-orders-btn"
                onClick={() => setIsOrdersOpen(true)}
                className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span className="truncate">Tra Cứu Đơn</span>
              </button>

              <button
                onClick={() => handleNavigate('policy', 'warranty')}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="truncate">Chính Sách</span>
              </button>

              <button
                onClick={() => handleNavigate('about')}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="truncate">Về Chúng Tôi</span>
              </button>
            </div>
          </div>
        </section>
      </>
    )}
  </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 sm:pt-12 pb-24 sm:pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <Logo size="md" variant="dark" />
              <p className="text-slate-400 text-xs leading-relaxed">
                Nền tảng thương mại điện tử công nghệ & thanh toán trực tuyến thế hệ mới. Trải nghiệm mua sắm bảo mật, tiện lợi và hỏa tốc.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>📍 Trụ sở: 219/20 đường số 12, phường Bình Hưng Hòa, thành phố Hồ Chí Minh</p>
                <p>📞 Hotline 24/7: 0908061843</p>
                <p>✉️ Email: support@novashop.vn</p>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">Danh Mục Nổi Bật</h4>
              <ul className="space-y-2 text-slate-400">
                {CATEGORIES.slice(1).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (currentPage !== 'home') handleNavigate('home');
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Policy & Support */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">Chính Sách & Hỗ Trợ</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="text-amber-400 hover:text-amber-300 font-bold transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Giới thiệu về NovaShop</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('faq')}
                    className={`transition-colors text-left cursor-pointer flex items-center gap-1.5 ${
                      currentPage === 'faq' ? 'text-amber-300 font-bold' : 'text-indigo-400 hover:text-indigo-300 font-bold'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Hỏi đáp & Câu hỏi thường gặp (FAQ)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('policy', 'warranty')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Chính sách bảo hành chính hãng 12-24 tháng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('policy', 'return')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Quy trình đổi trả miễn phí 30 ngày 1-1
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('policy', 'security')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Chính sách bảo mật thanh toán & SSL
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('policy', 'shipping')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Biểu phí giao hàng hỏa tốc 2 giờ & Đồng kiểm
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('policy', 'payment')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Hướng dẫn quét mã VietQR & Trả góp 0%
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Payment Gateways */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">Cổng Thanh Toán Trực Tuyến</h4>
              <p className="text-slate-400 text-xs">Hỗ trợ các phương thức giao dịch hiện đại nhất Việt Nam:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-mono font-bold text-[11px]">
                  VietQR Napas
                </span>
                <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-bold text-[11px]">
                  VISA / MasterCard
                </span>
                <span className="bg-[#A50064] text-white px-2.5 py-1 rounded-md font-bold text-[11px]">
                  MoMo
                </span>
                <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md font-bold text-[11px]">
                  VNPay-QR
                </span>
                <span className="bg-amber-600 text-white px-2.5 py-1 rounded-md font-bold text-[11px]">
                  COD Tiền Mặt
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-2 text-[11px] text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Bảo mật chuẩn quốc tế PCI-DSS Level 1</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 NovaShop. Hệ thống phân phối thiết bị công nghệ và thanh toán trực tuyến chính hãng.</p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => handleNavigate('about')}
                className="hover:text-amber-300 text-amber-400 font-semibold transition-colors cursor-pointer"
              >
                Giới thiệu về chúng tôi
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNavigate('policy', 'terms')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Điều khoản sử dụng
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNavigate('policy', 'security')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Chính sách quyền riêng tư
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNavigate('policy', 'payment')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Hướng dẫn thanh toán
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      
      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProductModal}
        isOpen={!!selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={(p, qty, col) => handleAddToCart(p, qty, col)}
        onBuyNow={(p, qty, col) => handleBuyNow(p, qty, col)}
        isWishlisted={selectedProductModal ? wishlistIds.includes(selectedProductModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onShare={(p) => setShareProductModal(p)}
        onOpenInstallment={(p) => handleOpenInstallment(p)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={setAppliedVoucher}
        onProceedToCheckout={handleProceedToCheckout}
        onOpenInstallment={() => handleOpenInstallment()}
      />

      {/* Installment Calculator & Application Modal (Trả Góp 0%) */}
      <InstallmentModal
        isOpen={isInstallmentOpen}
        onClose={() => setIsInstallmentOpen(false)}
        product={installmentProduct}
        cartItems={cartItems}
        onOrderSuccess={(order) => {
          handleOrderSuccess(order, { fromInstallmentModal: true });
        }}
        onToast={addToast}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsInstallmentOpen(false);
          setPendingPurchaseState({
            type: 'open_installment',
            product: installmentProduct || cartItems[0]?.product || PRODUCTS[0],
          });
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
      />

      {/* Online Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedVoucher={appliedVoucher}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsCheckoutOpen(false);
          setPendingPurchaseState({
            type: 'proceed_to_checkout',
            cartCount: totalCartCount,
          });
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Order Success & Invoice Modal */}
      <OrderSuccessModal
        order={successOrder}
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        onViewOrders={() => setIsOrdersOpen(true)}
      />

      {/* Order Tracking & History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onSelectOrderToView={(ord) => {
          setIsOrdersOpen(false);
          setSuccessOrder(ord);
        }}
      />

      {/* Wishlist Favorites Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p, e) => handleAddToCart(p, 1)}
        onSelectProduct={(p) => setSelectedProductModal(p)}
        onShare={(p) => setShareProductModal(p)}
      />

      {/* Policy & Services Details Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialTab={activePolicyTab}
        onTabChange={(tab) => setActivePolicyTab(tab)}
      />

      {/* About Us Company Profile Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onExploreProducts={() => {
          const el = document.getElementById('products-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Share Product Modal */}
      <ShareModal
        isOpen={!!shareProductModal}
        product={shareProductModal}
        onClose={() => setShareProductModal(null)}
        onToast={addToast}
      />

      {/* Promotional Discount Vouchers Pop-up Modal */}
      <PromoModal
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        onApplyVoucher={(voucher) => setAppliedVoucher(voucher)}
        appliedVoucher={appliedVoucher}
        onExploreProducts={() => {
          if (currentPage !== 'home') {
            handleNavigate('home');
          }
          setTimeout(() => {
            const el = document.getElementById('products-grid-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
        onToast={addToast}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onNotificationAction={handleNotificationAction}
        onSendTestNotification={handleSendTestNotification}
        soundEnabled={notificationSoundEnabled}
        onToggleSound={() => setNotificationSoundEnabled((prev) => !prev)}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingPurchaseState(null);
        }}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        pendingPurchase={pendingPurchase}
      />

      {/* User Profile, Points & Address Management Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenPromo={() => setIsPromoOpen(true)}
        orders={orders}
        wishlistProducts={wishlistProducts}
        cartItems={cartItems}
        appliedVoucher={appliedVoucher}
        onSelectOrderToView={(ord) => setSuccessOrder(ord)}
        onSelectProduct={(prod) => setSelectedProductModal(prod)}
        onOpenCart={() => setIsCartOpen(true)}
        initialTab={profileInitialTab}
      />

      {/* Floating Quick Promo Voucher Button - Draggable to arbitrary position */}
      {isFloatingPromoVisible && (
        <div
          ref={floatingBtnRef}
          id="floating-promo-btn"
          role="button"
          tabIndex={0}
          data-dragging={isFloatingBtnDragging ? 'true' : undefined}
          {...floatingBtnDragProps}
          onClick={handleFloatingBtnClick(() => setIsPromoOpen(true))}
          onDoubleClick={resetFloatingBtnPosition}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsPromoOpen(true);
            }
          }}
          className={`fixed ${
            isPartnerAdVisible ? 'bottom-[114px] sm:bottom-4' : 'bottom-[52px] sm:bottom-4'
          } left-2.5 sm:left-6 z-30 flex items-center gap-1 sm:gap-2 pl-2 sm:pl-3.5 pr-1 sm:pr-2 py-1 sm:py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-[11px] sm:text-xs select-none transition-shadow duration-300 ease-out ${
            isFloatingBtnDragging
              ? 'cursor-grabbing shadow-2xl ring-2 ring-white/70 shadow-blue-500/50 opacity-95'
              : 'cursor-grab shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35'
          }`}
          aria-label="Kho voucher ưu đãi"
        >
          <span className="p-1 rounded-full bg-white/20 pointer-events-none">
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          <span className="hidden sm:inline pointer-events-none">Ưu Đãi Hôm Nay</span>
          <span className="inline-block px-1.5 py-0.5 rounded-full bg-white text-blue-700 font-extrabold text-[10px] pointer-events-none">
            500K
          </span>
          <button
            id="close-floating-promo-btn"
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsFloatingPromoVisible(false);
            }}
            className="ml-0.5 p-1 rounded-full bg-white/15 hover:bg-white/30 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Tắt Ưu Đãi Hôm Nay"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Compact Floating Horizontal Partner Ad at Bottom-Right Corner */}
      <PartnerAdBanner onCloseChange={(closed) => setIsPartnerAdVisible(!closed)} />

      {/* Customer Support AI Chatbot Widget */}
      <CustomerSupportChatbot
        isOpen={isChatbotOpen}
        onToggleOpen={setIsChatbotOpen}
        isPromoVisible={isFloatingPromoVisible}
        isPartnerAdVisible={isPartnerAdVisible}
        products={PRODUCTS}
        cartItems={cartItems}
        orders={orders}
        appliedVoucher={appliedVoucher}
        currentUser={currentUser}
        onSelectProduct={(prod) => setSelectedProductModal(prod)}
        onOpenPromo={() => setIsPromoOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenPolicy={(tab: PolicyTabId = 'warranty') => handleOpenPolicy(tab)}
        onOpenInstallment={(prod) => handleOpenInstallment(prod)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
