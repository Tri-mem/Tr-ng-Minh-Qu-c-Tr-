import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Lock,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ShoppingBag,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  Share2,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Building2,
  Check
} from 'lucide-react';
import { PolicyTabId } from './PolicyModal';

interface PolicyPageProps {
  initialTab?: PolicyTabId;
  onBackToHome: () => void;
  onExploreProducts: () => void;
  onOpenFaq?: () => void;
  onShowToast?: (type: 'success' | 'info' | 'error', title: string, description?: string) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  initialTab = 'warranty',
  onBackToHome,
  onExploreProducts,
  onOpenFaq,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [warrantyImei, setWarrantyImei] = useState('');
  const [isSearchingImei, setIsSearchingImei] = useState(false);
  const [imeiResult, setImeiResult] = useState<{
    found: boolean;
    productName?: string;
    serial?: string;
    warrantyMonths?: number;
    expireDate?: string;
    status?: string;
  } | null>(null);

  // Return request form state
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnPhone, setReturnPhone] = useState('');
  const [returnReason, setReturnReason] = useState('defective');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const handleTabChange = (tabId: PolicyTabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const handleImeiCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyImei.trim()) {
      onShowToast?.('error', 'Chưa nhập thông tin', 'Vui lòng nhập số Serial / IMEI hoặc mã đơn hàng để tra cứu.');
      return;
    }

    setIsSearchingImei(true);
    setImeiResult(null);

    setTimeout(() => {
      setIsSearchingImei(false);
      // Demo smart match
      const imeiUpper = warrantyImei.trim().toUpperCase();
      if (imeiUpper.includes('NOVA') || imeiUpper.length >= 8) {
        setImeiResult({
          found: true,
          productName: 'Xiaomi Mi 50W Power Bank 20000mAh (PB200SZM) Chính Hãng',
          serial: imeiUpper,
          warrantyMonths: 18,
          expireDate: '15/10/2027',
          status: 'Đang trong thời hạn bảo hành chính hãng (Bảo hành 1-đổi-1 30 ngày đã xác nhận)'
        });
        onShowToast?.('success', 'Tìm thấy thông tin bảo hành!', `Thiết bị có hạn bảo hành chính hãng đến 15/10/2027.`);
      } else {
        setImeiResult({
          found: true,
          productName: 'Thiết bị phụ kiện NovaShop Authentic',
          serial: imeiUpper,
          warrantyMonths: 12,
          expireDate: '23/09/2027',
          status: 'Hợp lệ - Bảo hành điện tử kích hoạt qua số điện thoại mua hàng'
        });
        onShowToast?.('info', 'Đã kích hoạt bảo hành điện tử', 'Sản phẩm được bảo hành toàn quốc tại hệ thống NovaCare.');
      }
    }, 600);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId.trim() || !returnPhone.trim()) {
      onShowToast?.('error', 'Vui lòng nhập đủ thông tin', 'Mã đơn hàng và số điện thoại mua hàng là bắt buộc.');
      return;
    }

    setIsSubmittingReturn(true);
    setTimeout(() => {
      setIsSubmittingReturn(false);
      onShowToast?.(
        'success',
        'Đã gửi yêu cầu đổi trả thành công!',
        `Chuyên viên hỗ trợ NovaShop sẽ liên hệ qua SĐT ${returnPhone} trong 15 phút để điều phối shipper thu hồi tận nhà.`
      );
      setReturnOrderId('');
      setReturnPhone('');
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast?.('success', 'Đã sao chép liên kết!', 'Bạn có thể chia sẻ liên kết trang chính sách này.');
    }
  };

  const tabs: { id: PolicyTabId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'warranty', label: 'Bảo Hành Chính Hãng 12 - 24T', icon: ShieldCheck, badge: 'Đổi mới 30N' },
    { id: 'return', label: 'Đổi Trả & Hoàn Tiền 1-1', icon: RotateCcw, badge: 'Miễn phí' },
    { id: 'shipping', label: 'Vận Chuyển & Giao Nhận 2H', icon: Truck, badge: 'Đồng kiểm' },
    { id: 'security', label: 'Bảo Mật Thông Tin & SSL', icon: Lock, badge: '256-Bit' },
    { id: 'payment', label: 'Thanh Toán VietQR & Trả Góp', icon: CreditCard, badge: '0% Lãi' },
    { id: 'terms', label: 'Điều Khoản & Quyền Lợi', icon: FileText },
  ];

  const faqs = [
    {
      q: 'Tôi có được mở hộp kiểm tra hàng (đồng kiểm) trước khi thanh toán không?',
      a: 'HOÀN TOÀN CÓ THỂ. NovaShop áp dụng chính sách 100% đồng kiểm toàn quốc cùng các đối tác Giao Hàng Tiết Kiệm, Viettel Post, Ahamove. Quý khách có quyền mở bưu phẩm kiểm tra ngoại quan máy, đúng model, màu sắc và đầy đủ phụ kiện trước khi thanh toán cho shipper.'
    },
    {
      q: 'Trong 30 ngày đầu nếu máy bị lỗi phần cứng từ nhà sản xuất thì xử lý thế nào?',
      a: 'NovaShop cam kết ĐỔI MỚI 1-1 NGAY LẬP TỨC sản phẩm cùng model nguyên seal mới 100%. Quý khách không phải chờ đợi gửi đi thẩm định lâu. Chúng tôi sẽ điều phối nhân viên đến tận nhà thu hồi máy lỗi và bàn giao máy mới miễn phí 100% cước phí.'
    },
    {
      q: 'Sản phẩm mua tại NovaShop có xuất được hóa đơn điện tử VAT cho công ty không?',
      a: 'Tất cả sản phẩm tại NovaShop là hàng chính ngạch 100%, giá niêm yết đã bao gồm thuế VAT. Quý khách chỉ cần tích chọn "Xuất hóa đơn VAT cho doanh nghiệp" khi thanh toán hoặc cung cấp mã số thuế, hóa đơn điện tử sẽ được gửi qua email trong vòng 2 - 4 giờ làm việc.'
    },
    {
      q: 'Nếu tôi ở tỉnh xa thì quy trình gửi bảo hành có phức tạp không?',
      a: 'Cực kỳ đơn giản! Quý khách không cần mang máy đi đâu cả. Chỉ cần liên hệ tổng đài 0908061843 hoặc đăng ký trên website, nhân viên Viettel Post sẽ đến tận nhà quý khách để đóng gói niêm phong và gửi về trung tâm NovaCare. Toàn bộ cước vận chuyển 2 chiều do NovaShop chi trả.'
    },
    {
      q: 'NovaShop có hỗ trợ trả góp 0% lãi suất không?',
      a: 'Có, NovaShop hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng của hơn 25 ngân hàng liên kết toàn quốc (kỳ hạn 3, 6, 9, 12 tháng) và hỗ trợ trả góp qua CCCD gắn chip xét duyệt trực tuyến chỉ trong 5 phút.'
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 sm:pb-16 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs text-slate-500 bg-white/80 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={onBackToHome}
            className="hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate">Chính Sách & Dịch Vụ</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handlePrint}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            title="In trang chính sách"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In quy định</span>
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            title="Chia sẻ liên kết"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
          <button
            onClick={onBackToHome}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Mua Sắm</span>
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-4 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Chính Sách & Cam Kết Dịch Vụ Khách Hàng</span>
          </div>

          <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Minh Bạch Tuyệt Đối. <br className="hidden sm:inline" />
            Bảo Vệ Quyền Lợi Người Dùng Trong Từng Giao Dịch.
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Hệ thống chính sách bảo hành chính hãng từ 12 - 24 tháng, cam kết đổi mới 1-1 trong 30 ngày, 
            miễn phí đồng kiểm khi nhận hàng và hỗ trợ kỹ thuật tận nơi 24/7 trên toàn quốc.
          </p>

          {/* Quick Pillars */}
          <div className="pt-1 sm:pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
              <div className="text-amber-400 font-extrabold text-lg">100%</div>
              <div className="text-xs text-slate-300 font-medium">Hàng chính ngạch VAT</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
              <div className="text-emerald-400 font-extrabold text-lg">30 Ngày</div>
              <div className="text-xs text-slate-300 font-medium">Đổi mới 1-1 miễn phí</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
              <div className="text-blue-400 font-extrabold text-lg">Now 2H</div>
              <div className="text-xs text-slate-300 font-medium">Giao hỏa tốc nội thành</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
              <div className="text-purple-400 font-extrabold text-lg">100%</div>
              <div className="text-xs text-slate-300 font-medium">Đồng kiểm trước nhận</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation Bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        {/* ================= TAB 1: WARRANTY ================= */}
        {activeTab === 'warranty' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold mb-3 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CHÍNH SÁCH BẢO HÀNH CHÍNH HÃNG</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Chế Độ Bảo Hành 12 - 24 Tháng & Đổi Mới 1-1 Trong 30 Ngày Đầu
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Áp dụng cho toàn bộ các thiết bị điện thoại, máy tính bảng, laptop, tai nghe và phụ kiện chính hãng phân phối tại hệ thống NovaShop.
              </p>
            </div>

            {/* Tra cứu bảo hành điện tử nhanh */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Tra Cứu Hạn Bảo Hành Điện Tử (e-Warranty)</span>
                  </h3>
                  <p className="text-xs text-slate-300">Nhập số Serial, mã IMEI thiết bị hoặc mã đơn hàng để kiểm tra thời hạn bảo hành</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full font-bold self-start">
                  Cập nhật thời gian thực
                </span>
              </div>

              <form onSubmit={handleImeiCheck} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nhập IMEI / Serial Number (Ví dụ: NOVA8899 hoặc số Serial trên hộp)..."
                  value={warrantyImei}
                  onChange={(e) => setWarrantyImei(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={isSearchingImei}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shrink-0"
                >
                  {isSearchingImei ? 'Đang tra cứu...' : 'Tra Cứu Ngay'}
                </button>
              </form>

              {imeiResult && (
                <div className="p-4 bg-white/10 border border-white/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{imeiResult.productName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                    <div>Mã Serial/IMEI: <strong className="text-white">{imeiResult.serial}</strong></div>
                    <div>Thời hạn bảo hành: <strong className="text-white">{imeiResult.warrantyMonths} Tháng</strong></div>
                    <div>Hết hạn ngày: <strong className="text-amber-300">{imeiResult.expireDate}</strong></div>
                  </div>
                  <div className="text-slate-400 pt-1 border-t border-white/10">Trạng thái: {imeiResult.status}</div>
                </div>
              )}
            </div>

            {/* Chi tiết 4 Bước bảo hành */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Quy Trình Tiếp Nhận & Xử Lý Bảo Hành 4 Bước Tiện Lợi:</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">1</div>
                  <h4 className="font-bold text-slate-900 text-sm">Báo lỗi qua tổng đài</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Khách hàng gọi hotline 0908061843 hoặc nhắn tin fanpage báo tình trạng thiết bị.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">2</div>
                  <h4 className="font-bold text-slate-900 text-sm">Thu hồi máy tận nơi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Shipper Viettel Post / GHTK đến tận nhà đóng gói niêm phong. Khách không cần di chuyển.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">3</div>
                  <h4 className="font-bold text-slate-900 text-sm">Kỹ thuật kiểm tra</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Kỹ thuật viên NovaCare thẩm định lỗi trong 24 giờ và kích hoạt đổi mới 1-1 hoặc sửa chữa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">4</div>
                  <h4 className="font-bold text-slate-900 text-sm">Giao trả miễn phí</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Giao trả thiết bị đã hoàn tất bảo hành về tận tay quý khách. Miễn 100% chi phí vận chuyển.
                  </p>
                </div>
              </div>
            </div>

            {/* Điều kiện chấp nhận bảo hành */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Trường Hợp Được Bảo Hành Miễn Phí</span>
                </h4>
                <ul className="text-xs text-emerald-800 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Sản phẩm gặp lỗi kỹ thuật từ phần cứng của nhà sản xuất (nguồn, màn hình, bo mạch, pin, cổng kết nối).</li>
                  <li>Sản phẩm còn trong thời hạn bảo hành điện tử tính từ ngày kích hoạt đơn hàng.</li>
                  <li>Tem bảo hành và số Serial/IMEI trên thiết bị còn nguyên vẹn, trùng khớp với hệ thống dữ liệu NovaShop.</li>
                  <li>Sản phẩm không có dấu hiệu can thiệp phần cứng từ bên thứ ba chưa được ủy quyền.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Trường Hợp Từ Chối Bảo Hành Miễn Phí (Hỗ trợ sửa chữa có phí)</span>
                </h4>
                <ul className="text-xs text-rose-800 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Thiết bị bị rơi vỡ, cấn móp biến dạng khung sườn, nứt vỡ kính do ngoại lực tác động.</li>
                  <li>Thiết bị có dấu hiệu ngấm nước, ẩm ướt hoặc hóa chất ăn mòn linh kiện bên trong.</li>
                  <li>Khách hàng tự ý can thiệp nạp ROM cook, can thiệp sâu can thiệp bootloader gây brick thiết bị.</li>
                  <li>Hết thời hạn bảo hành tiêu chuẩn (NovaShop hỗ trợ sửa chữa dịch vụ tính phí ưu đãi giảm 20%).</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: RETURN & REFUND ================= */}
        {activeTab === 'return' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-3 border border-indigo-200">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CHÍNH SÁCH ĐỔI TRẢ & HOÀN TIỀN</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Đổi Mới 1-1 Trong 30 Ngày Đầu & Hoàn Tiền 100% Nhanh Chóng
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                NovaShop đặt sự hài lòng của khách hàng lên hàng đầu. Đổi mới lập tức máy nguyên seal mới nếu phát sinh lỗi phần cứng.
              </p>
            </div>

            {/* 3 Cam kết cốt lõi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="text-indigo-600 font-extrabold text-lg">Đổi Mới 1-1</div>
                <h4 className="font-bold text-slate-900 text-sm">Trong 30 ngày đầu tiên</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nếu sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất, NovaShop đổi ngay máy mới nguyên seal cùng mẫu mã.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="text-emerald-600 font-extrabold text-lg">Hoàn Tiền 24H</div>
                <h4 className="font-bold text-slate-900 text-sm">Qua chuyển khoản ngân hàng</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trường hợp sản phẩm hết hàng để đổi mới hoặc khách hàng yêu cầu hoàn tiền, tiền sẽ được chuyển lại trong vòng 24 giờ.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="text-amber-600 font-extrabold text-lg">Đền Bù 200%</div>
                <h4 className="font-bold text-slate-900 text-sm">Nếu phát hiện hàng giả</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cam kết tuyệt đối 100% hàng chính hãng chính ngạch. Hoàn tiền gấp đôi nếu phát hiện hàng không chính hãng.
                </p>
              </div>
            </div>

            {/* Form đăng ký đổi trả trực tuyến */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Đăng Ký Yêu Cầu Đổi Trả / Hoàn Tiền Trực Tuyến</h3>
              <p className="text-xs text-slate-500">
                Điền mã đơn hàng và số điện thoại đã đặt hàng, bộ phận hỗ trợ khách hàng sẽ liên hệ lại ngay trong 15 phút.
              </p>

              <form onSubmit={handleReturnSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Mã đơn hàng (Ví dụ: ORD-17901...)"
                  value={returnOrderId}
                  onChange={(e) => setReturnOrderId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại người mua..."
                  value={returnPhone}
                  onChange={(e) => setReturnPhone(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                />
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="defective">Sản phẩm phát sinh lỗi kỹ thuật phần cứng</option>
                  <option value="wrong_item">Giao nhầm mã hàng / sai màu sắc</option>
                  <option value="shipping_damage">Hộp bị móp méo trong vận chuyển</option>
                  <option value="change_mind">Muốn nâng cấp lên dòng máy cao hơn</option>
                </select>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {isSubmittingReturn ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Thu Hồi Đổi Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SHIPPING ================= */}
        {activeTab === 'shipping' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-3 border border-blue-200">
                <Truck className="w-3.5 h-3.5" />
                <span>CHÍNH SÁCH VẬN CHUYỂN & GIAO NHẬN</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Giao Hỏa Tốc Now 2H & Miễn Phí Vận Chuyển Toàn Quốc
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Hợp tác cùng Viettel Post, GHTK, Ahamove, GrabExpress để đưa đơn hàng đến tay quý khách an toàn và nhanh nhất.
              </p>
            </div>

            {/* Bảng biểu phí */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Phương Thức Giao Hàng</th>
                    <th className="p-3.5">Khu Vực Áp Dụng</th>
                    <th className="p-3.5">Thời Gian Nhận Hàng</th>
                    <th className="p-3.5">Cước Phí Vận Chuyển</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Giao Hỏa Tốc Now 2H
                    </td>
                    <td className="p-3.5">Nội thành TP.HCM & Hà Nội (Bán kính &lt; 15km)</td>
                    <td className="p-3.5 font-bold text-blue-600">Trong vòng 1 - 2 Giờ</td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-600">Miễn phí</span> (Đơn từ 2.000.000đ)<br />
                      <span className="text-xs text-slate-400">Đơn dưới 2 triệu: 30.000đ</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Giao Nhanh Tiêu Chuẩn
                    </td>
                    <td className="p-3.5">Toàn quốc (63 tỉnh thành)</td>
                    <td className="p-3.5">1 - 3 Ngày làm việc</td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-600">Miễn phí 100%</span> (Đơn từ 500.000đ)<br />
                      <span className="text-xs text-slate-400">Đơn dưới 500k: Đồng giá 25.000đ</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Giao Hẹn Giờ Theo Yêu Cầu
                    </td>
                    <td className="p-3.5">TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ</td>
                    <td className="p-3.5">Theo khung giờ khách chọn</td>
                    <td className="p-3.5 font-bold text-slate-900">Miễn phí cho đơn hàng giá trị cao</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quy định đồng kiểm */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
              <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Quy Định Đồng Kiểm Minh Bạch (Mở Hộp Kiểm Tra Hàng):</span>
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Khi shipper giao hàng tới, quý khách có quyền yêu cầu mở kiện bưu phẩm để kiểm tra sản phẩm bên trong. 
                Vui lòng kiểm tra: Đúng sản phẩm đã đặt, seal máy còn nguyên vẹn, không bị cấn móp biến dạng và đầy đủ quà tặng đi kèm. 
                Nếu phát hiện điều bất thường, quý khách có thể từ chối nhận hàng mà <strong>không phải trả bất kỳ khoản phí nào</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY & SSL ================= */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-3 border border-purple-200">
                <Lock className="w-3.5 h-3.5" />
                <span>BẢO MẬT THANH TOÁN & QUYỀN RIÊNG TƯ</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Bảo Vệ Dữ Liệu Khách Hàng Chuẩn SSL 256-Bit & PCI-DSS
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                NovaShop cam kết bảo mật tuyệt đối thông tin thanh toán, số tài khoản và dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-indigo-50 text-indigo-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Mã Hóa SSL 256-Bit</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mọi luồng dữ liệu truyền tải giữa thiết bị của bạn và máy chủ NovaShop đều được mã hóa bằng chứng chỉ số SSL an toàn cao cấp.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Không Lưu Mã Thẻ CVC/CVV</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Giao dịch thẻ quốc tế được xử lý trực tiếp qua cổng thanh toán đối tác ngân hàng đạt chuẩn PCI-DSS Level 1.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="p-2.5 w-fit rounded-xl bg-purple-50 text-purple-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Bảo Vệ Dữ Liệu Cá Nhân</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Không chia sẻ, trao đổi hoặc bán thông tin khách hàng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PAYMENT & VIETQR ================= */}
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3 border border-emerald-200">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PHƯƠNG THỨC THANH TOÁN TIỆN LỢI</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Thanh Toán Không Tiền Mặt VietQR Chuẩn Napas247 & Thẻ Quốc Tế
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Đa dạng phương thức thanh toán an toàn, tự động khớp lệnh chỉ sau 2 giây và hỗ trợ trả góp 0% qua 25 ngân hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs">Phổ Biến Nhất</span>
                  <h4 className="font-bold text-slate-900 text-base">1. Quét Mã VietQR Napas247 Tự Động</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mở ứng dụng bất kỳ ngân hàng nào (BIDV, Vietcombank, MB Bank, Techcombank, VPBank...) quét mã QR được tạo sẵn. 
                  Hệ thống tự động điền đúng số tiền tương ứng với sản phẩm/đơn hàng và nội dung chuyển khoản. Đơn hàng thanh toán trước chỉ được xác nhận thành công khi khách hàng đã hoàn tất thanh toán đúng số tiền trên mã QR.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                  <div>Chủ tài khoản: <strong>TRUONG MINH QUOC TRI</strong></div>
                  <div>Ngân hàng: <strong>BIDV - PGD Tân Sơn Nhì</strong></div>
                  <div>Số tài khoản: <strong>3180530681</strong></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">Linh Hoạt</span>
                  <h4 className="font-bold text-slate-900 text-base">2. Trả Góp 0% Lãi Suất</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Áp dụng cho đơn hàng từ 3.000.000đ trở lên. Quý khách có thể trả góp qua thẻ tín dụng (Visa/MasterCard/JCB) 
                  của hơn 25 ngân hàng với kỳ hạn linh hoạt 3, 6, 9 hoặc 12 tháng. Thủ tục online 100%, không cần thế chấp hay chứng minh thu nhập.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">Vietcombank</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">Techcombank</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">MB Bank</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">VPBank</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">TPBank</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">ACB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: TERMS & CONDITIONS ================= */}
        {activeTab === 'terms' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold mb-3 border border-slate-200">
                <FileText className="w-3.5 h-3.5" />
                <span>ĐIỀU KHOẢN DỊCH VỤ & PHÁP LÝ</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Quy Chế Hoạt Động & Quyền Lợi Người Tiêu Dùng
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Văn bản pháp lý quy định quyền lợi, nghĩa vụ của khách hàng và trách nhiệm của hệ thống thương mại điện tử NovaShop.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">1. Nguyên tắc bán hàng chính ngạch</h4>
                <p>
                  Toàn bộ hàng hóa bán ra tại website và chuỗi cửa hàng NovaShop đều có hóa đơn VAT hợp pháp, tem kiểm định hợp quy và bảo hành chính hãng. 
                  Giá bán hiển thị trên website là giá thanh toán cuối cùng đã bao gồm thuế Giá Trị Gia Tăng (VAT).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">2. Xuất hóa đơn điện tử e-Invoice</h4>
                <p>
                  Khách hàng doanh nghiệp hoặc cá nhân cần xuất hóa đơn tài chính vui lòng cung cấp thông tin (Tên công ty, Mã số thuế, Địa chỉ, Email nhận hóa đơn) 
                  tại bước đặt hàng. Hóa đơn điện tử hợp lệ của Tổng Cục Thuế sẽ được gửi qua email chậm nhất trong 24 giờ sau khi giao hàng thành công.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">3. Cơ chế giải quyết khiếu nại</h4>
                <p>
                  NovaShop tiếp nhận và xử lý mọi khiếu nại của khách hàng liên quan đến chất lượng sản phẩm, thái độ nhân viên và tiến độ giao hàng 
                  qua hotline 0908061843 hoặc email cskh@novashop.vn. Mọi phản ánh sẽ được giải quyết dứt điểm trong vòng 24 giờ làm việc.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">Câu Hỏi Thường Gặp Về Chính Sách & Dịch Vụ (FAQ)</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-slate-900 hover:text-indigo-600 flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hỗ Trợ Khách Hàng Tận Tâm 24/7</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Cần Giải Đáp Thêm Về Bảo Hành, Đổi Trả Hoặc Thanh Toán?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Đội ngũ NovaCare luôn sẵn sàng hỗ trợ quý khách tra cứu hạn bảo hành điện tử, hướng dẫn thanh toán VietQR tự động và xử lý đổi trả tận nơi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenFaq && (
            <button
              onClick={onOpenFaq}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md cursor-pointer flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Xem Hỏi Đáp FAQ</span>
            </button>
          )}
          <button
            onClick={onExploreProducts}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/20 cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tiếp Tục Mua Sắm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
