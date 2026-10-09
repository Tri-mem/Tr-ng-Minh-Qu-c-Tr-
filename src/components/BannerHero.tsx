import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Zap,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { PolicyTabId } from './PolicyModal';

interface BannerHeroProps {
  onExploreClick: () => void;
  onApplyVoucherClick: (code: string) => void;
  onOpenPolicy?: (tab: PolicyTabId) => void;
}

interface HeroSlide {
  id: string;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  voucherCode: string;
  voucherLabel: string;
  externalUrl?: string;
  externalLabel?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'novashop-tech',
    badge: 'Hệ Thống Bán Lẻ Công Nghệ Chính Hãng • NovaShop',
    titleLine1: 'Đẳng Cấp Công Nghệ',
    titleHighlight: 'Thanh Toán Siêu Tốc',
    description:
      'Trải nghiệm mua sắm trực tuyến đa nền tảng với tích hợp cổng thanh toán VietQR Napas 24/7, thẻ tín dụng bảo mật 3D-Secure và giao hàng nhanh 2 giờ.',
    voucherCode: 'NOVATECH',
    voucherLabel: '-100K',
  },
  {
    id: 'novashop-vip',
    badge: 'Đặc Quyền Lên Đời Flagship • Trả Góp 0% Lãi Suất',
    titleLine1: 'Siêu Phẩm Công Nghệ',
    titleHighlight: 'Ưu Đãi Đến 500.000 ₫',
    description:
      'Sở hữu ngay Laptop, Smartphone, Tai nghe chống ồn và Phụ kiện cao cấp với chương trình trả góp 0% duyệt hồ sơ tự động trong 3 phút, bảo hành chính hãng 24 tháng.',
    voucherCode: 'VIP500',
    voucherLabel: '-500K',
  },
];

interface TechNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

interface SignalPulse {
  x: number;
  y: number;
  speed: number;
  length: number;
  color: string;
  alpha: number;
}

export const BannerHero: React.FC<BannerHeroProps> = ({
  onExploreClick,
  onApplyVoucherClick,
  onOpenPolicy,
}) => {
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Automatically advance hero promotional content every 7 seconds without requiring user clicks
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlideIdx]);

  const currentSlide = HERO_SLIDES[activeSlideIdx] || HERO_SLIDES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 1100);
    let height = (canvas.height = canvas.offsetHeight || 380);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1100;
      height = canvas.height = canvas.offsetHeight || 380;
    };

    window.addEventListener('resize', handleResize);

    const palette = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'];
    const nodeCount = 34;

    const nodes: TechNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.45,
      radius: 1.4 + (i % 3) * 0.7,
      color: palette[i % palette.length],
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // High-speed horizontal digital signal pulses (representing "Thanh Toán Siêu Tốc")
    const pulses: SignalPulse[] = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * width,
      y: ((i + 1) / 8) * height + (Math.random() - 0.5) * 20,
      speed: 2.2 + Math.random() * 2.4,
      length: 55 + Math.random() * 65,
      color: i % 2 === 0 ? '#22d3ee' : '#38bdf8',
      alpha: 0.25 + Math.random() * 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw high-speed circuit data pulses
      for (const p of pulses) {
        p.x += p.speed;
        if (p.x - p.length > width) {
          p.x = -20;
          p.y = 30 + Math.random() * (height - 60);
        }

        const grad = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        grad.addColorStop(0.7, `rgba(56, 189, 248, ${p.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(34, 211, 238, ${p.alpha})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.moveTo(p.x - p.length, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Glowing leading tip
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 2. Update and draw constellation tech nodes & network links
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulsePhase += 0.03;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Subtle attraction/interaction with mouse pointer
        if (mouseRef.current.active) {
          const dxMouse = mouseRef.current.x - n.x;
          const dyMouse = mouseRef.current.y - n.y;
          const distMouse = Math.hypot(dxMouse, dyMouse);
          if (distMouse < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - distMouse / 160) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        }

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 125) {
            const opacity = (1 - dist / 125) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Draw node dot with subtle breathing glow
        const pulseAlpha = 0.45 + Math.sin(n.pulsePhase) * 0.25;
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.globalAlpha = pulseAlpha;
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="space-y-3.5 sm:space-y-5 mb-5 sm:mb-8">
      {/* Modern Tech Hero Showcase Card with Dynamic Circuit & Constellation Motion Background */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true,
          };
        }}
        onMouseLeave={() => {
          mouseRef.current.active = false;
        }}
        className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-[#131926] to-slate-900 text-white overflow-hidden shadow-lg border border-slate-700/90 dark:border-cyan-500/45"
      >
        {/* Continuous 360-degree sealed perimeter border ring */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/15 dark:border-cyan-400/45 pointer-events-none z-20" />

        {/* Subtle technical grid base */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Animated floating aurora orbs */}
        <div className="hero-animate animate-hero-orb-1 absolute -right-12 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hero-animate animate-hero-orb-2 absolute left-1/4 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Interactive 60fps Tech Constellation & High-Speed Signal Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        <div className="relative z-10 px-3.5 sm:px-10 lg:px-12 py-4 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-8 items-center">
          <div className="lg:col-span-7 space-y-2 sm:space-y-4">
            <div key={currentSlide.id} className="space-y-2 sm:space-y-4 animate-ad-slide">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full bg-cyan-500/10 border border-cyan-400/35 text-cyan-300 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300 shrink-0" />
                <span className="truncate">{currentSlide.badge}</span>
              </div>

              <h1 className="text-lg sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                {currentSlide.titleLine1}{' '}
                <span className="sm:block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200">
                  {currentSlide.titleHighlight}
                </span>
              </h1>

              <p className="text-[11px] sm:text-base text-slate-300 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentSlide.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-2">
                {currentSlide.externalUrl ? (
                  <a
                    href={currentSlide.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial justify-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[11px] sm:text-sm font-extrabold rounded-xl shadow-md shadow-amber-950/30 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>{currentSlide.externalLabel || 'Khám phá ngay'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  </a>
                ) : (
                  <button
                    id="hero-explore-btn"
                    onClick={onExploreClick}
                    className="flex-1 sm:flex-initial justify-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] sm:text-sm font-bold rounded-xl shadow-md shadow-blue-900/30 flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  </button>
                )}

                <button
                  onClick={() => onApplyVoucherClick(currentSlide.voucherCode)}
                  className="flex-1 sm:flex-initial justify-center px-2.5 sm:px-4 py-2 sm:py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-[11px] sm:text-sm font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title={`Áp dụng mã ${currentSlide.voucherCode}`}
                >
                  <span>
                    Mã: <strong className="text-amber-300">{currentSlide.voucherCode}</strong> ({currentSlide.voucherLabel})
                  </span>
                </button>
              </div>
            </div>

            {/* Slide Indicator Dots (also clickable, auto-plays continuously) */}
            <div className="flex items-center gap-2 pt-0.5">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlideIdx(idx)}
                  aria-label={`Chuyển đến slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlideIdx === idx
                      ? 'w-6 sm:w-7 bg-cyan-400'
                      : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Featured Highlights Showcase Right - Compact horizontal items on mobile */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-1.5 sm:gap-3">
            <div
              onClick={() => onOpenPolicy?.('payment')}
              className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/65 hover:bg-slate-900/85 border border-white/20 dark:border-slate-700/90 backdrop-blur-md flex sm:block items-center gap-2 sm:space-y-1 cursor-pointer transition-all hover:border-cyan-400/50"
              title="Xem hướng dẫn thanh toán VietQR"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 sm:mb-2">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">VietQR 24/7</div>
                <div className="text-[9px] sm:text-[11px] text-slate-400 truncate">Tự động 2 giây</div>
              </div>
            </div>

            <div
              onClick={() => onOpenPolicy?.('shipping')}
              className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/65 hover:bg-slate-900/85 border border-white/20 dark:border-slate-700/90 backdrop-blur-md flex sm:block items-center gap-2 sm:space-y-1 cursor-pointer transition-all hover:border-amber-400/50"
              title="Xem chính sách giao hỏa tốc 2H"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0 sm:mb-2">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Giao Nhanh 2H</div>
                <div className="text-[9px] sm:text-[11px] text-slate-400 truncate">Nội thành HN & HCM</div>
              </div>
            </div>

            <div
              onClick={() => onOpenPolicy?.('warranty')}
              className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/65 hover:bg-slate-900/85 border border-white/20 dark:border-slate-700/90 backdrop-blur-md flex sm:block items-center gap-2 sm:space-y-1 cursor-pointer transition-all hover:border-emerald-400/50"
              title="Xem chính sách bảo hành 12-24 tháng"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0 sm:mb-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">100% Chính Hãng</div>
                <div className="text-[9px] sm:text-[11px] text-slate-400 truncate">BH 12 - 24 tháng</div>
              </div>
            </div>

            <div
              onClick={() => onOpenPolicy?.('return')}
              className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/65 hover:bg-slate-900/85 border border-white/20 dark:border-slate-700/90 backdrop-blur-md flex sm:block items-center gap-2 sm:space-y-1 cursor-pointer transition-all hover:border-indigo-400/50"
              title="Xem quy định đổi trả 1-1"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/15 text-indigo-300 flex items-center justify-center shrink-0 sm:mb-2">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Đổi Trả 30 Ngày</div>
                <div className="text-[9px] sm:text-[11px] text-slate-400 truncate">Lỗi phần cứng 1-1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harmonious Multi-Color Accent Trust Strip on Clean Neutral Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div
          onClick={() => onOpenPolicy?.('shipping')}
          className="bg-white hover:bg-blue-50/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-2xs flex items-center gap-2 sm:gap-3 cursor-pointer transition-all group"
        >
          <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
              Miễn Phí Vận Chuyển
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Đơn hàng từ 300.000₫</p>
          </div>
        </div>

        <div
          onClick={() => onOpenPolicy?.('security')}
          className="bg-white hover:bg-emerald-50/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-2xs flex items-center gap-2 sm:gap-3 cursor-pointer transition-all group"
        >
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
              Bảo Mật Thanh Toán
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Chuẩn PCI-DSS quốc tế</p>
          </div>
        </div>

        <div
          onClick={() => onOpenPolicy?.('return')}
          className="bg-white hover:bg-amber-50/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-amber-300 shadow-2xs flex items-center gap-2 sm:gap-3 cursor-pointer transition-all group"
        >
          <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
              Đổi Mới 1-1
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">30 ngày đầu tiên nếu lỗi</p>
          </div>
        </div>

        <div
          onClick={() => onOpenPolicy?.('warranty')}
          className="bg-white hover:bg-indigo-50/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-2xs flex items-center gap-2 sm:gap-3 cursor-pointer transition-all group"
        >
          <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
              Hỗ Trợ 24/7
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Hotline: 0908061843</p>
          </div>
        </div>
      </div>
    </div>
  );
};
