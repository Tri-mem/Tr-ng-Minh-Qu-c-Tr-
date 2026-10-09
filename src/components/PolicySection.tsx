import React from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Lock, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { PolicyTabId } from './PolicyModal';

interface PolicySectionProps {
  activeTab: PolicyTabId;
  onTabChange: (tab: PolicyTabId) => void;
  onOpenModal?: (tab: PolicyTabId) => void;
  onOpenFullPolicyPage?: (tab: PolicyTabId) => void;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  activeTab,
  onTabChange,
  onOpenModal,
  onOpenFullPolicyPage,
}) => {
  const tabs: { 
    id: PolicyTabId; 
    shortTitle: string; 
    fullTitle: string; 
    subtitle: string; 
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: 'warranty',
      shortTitle: 'Bảo Hành Chính Hãng',
      fullTitle: 'Chính Sách Bảo Hành Chính Hãng 12 - 24 Tháng',
      subtitle: 'Kích hoạt điện tử theo IMEI/Serial, bảo hành tại trung tâm ủy quyền',
      icon: ShieldCheck,
      badge: '12-24 Tháng',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
      id: 'return',
      shortTitle: 'Đổi Trả 1-1 Trong 30 Ngày',
      fullTitle: 'Quy Trình Đổi Mới 100% Trong 30 Ngày',
      subtitle: 'Lỗi là đổi ngay máy mới nguyên seal cùng model miễn phí',
      icon: RotateCcw,
      badge: '30 Ngày Miễn Phí',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'shipping',
      shortTitle: 'Vận Chuyển & Giao Hàng',
      fullTitle: 'Chính Sách Vận Chuyển Toàn Quốc & Hỏa Tốc Now 2H',
      subtitle: 'Miễn phí từ 300K, hỏa tốc 2 giờ nội thành, đồng kiểm trước khi nhận',
      icon: Truck,
      badge: 'Freeship từ 300K',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'security',
      shortTitle: 'Bảo Mật & 3D-Secure',
      fullTitle: 'Chính Sách Bảo Mật Thanh Toán & Chuẩn Mã Hóa SSL',
      subtitle: 'Chuẩn quốc tế PCI-DSS Level 1, mã hóa SSL 256-bit, an toàn tuyệt đối',
      icon: Lock,
      badge: 'PCI-DSS & SSL',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'payment',
      shortTitle: 'Hướng Dẫn Thanh Toán VietQR',
      fullTitle: 'Hướng Dẫn Thanh Toán Trực Tuyến Qua VietQR Napas 24/7',
      subtitle: 'Quét mã QR tự động xác nhận 2 giây, hỗ trợ thẻ quốc tế và ví điện tử',
      icon: CreditCard,
      badge: 'Xác nhận 2s',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'terms',
      shortTitle: 'Điều Khoản Dịch Vụ',
      fullTitle: 'Điều Khoản & Quy Định Giao Dịch Thương Mại Điện Tử',
      subtitle: 'Quy chuẩn thương mại minh bạch, bảo vệ quyền lợi người tiêu dùng',
      icon: FileText,
      badge: 'Minh Bạch',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <section id="chinh-sach-dich-vu" className="mt-14 mb-10 scroll-mt-24">
      <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200/90 shadow-sm space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>TRUNG TÂM CHÍNH SÁCH & DỊCH VỤ KHÁCH HÀNG</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              NovaShop Care • Cam Kết Chất Lượng & Dịch Vụ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Nhấp chọn từng mục chính sách bên dưới để xem chi tiết điều kiện bảo hành, quy trình đổi trả, biểu phí vận chuyển và hướng dẫn thanh toán trực tuyến.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFullPolicyPage && (
              <button
                type="button"
                id="btn-open-full-policy-page"
                onClick={() => onOpenFullPolicyPage(activeTab)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Mở toàn bộ trang web chính sách chi tiết"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Xem Trang Chính Sách Đầy Đủ →</span>
              </button>
            )}
            {onOpenModal && (
              <button
                type="button"
                id="btn-open-policy-modal"
                onClick={() => onOpenModal(activeTab)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Mở toàn màn hình dạng hộp thoại"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Cửa sổ popup</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Interactive Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`policy-nav-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative p-3 sm:p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/30 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 border border-slate-200/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                    isActive ? 'bg-white/20 text-white border-white/20' : tab.badgeColor
                  }`}>
                    {tab.badge}
                  </span>
                </div>

                <div>
                  <h3 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {tab.shortTitle}
                  </h3>
                </div>

                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600 rotate-45 rounded-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panel for Selected Policy */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 sm:p-8 space-y-6">
          
          {/* TAB 1: BẢO HÀNH CHÍNH HÃNG */}
          {activeTab === 'warranty' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Hậu Mãi Chính Hãng</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Chính Sách Bảo Hành Chính Hãng 12 - 24 Tháng
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kích hoạt điện tử theo IMEI/Serial</span>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-emerald-950">Cam kết 100% phân phối hàng chính hãng có tem niêm phong</p>
                  <p className="text-emerald-800 text-xs">
                    Tất cả các sản phẩm thiết bị điện tử, điện thoại, máy tính xách tay và phụ kiện âm thanh tại NovaShop đều được bảo hành chính hãng từ 12 đến 24 tháng theo đúng tiêu chuẩn của hãng (Apple, Samsung, Sony, Dell, Logitech,...).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Điều kiện được tiếp nhận bảo hành:</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs">
                    <li>Sản phẩm còn trong thời hạn bảo hành tính từ ngày mua hoặc kích hoạt bảo hành điện tử.</li>
                    <li>Tem niêm phong, mã vạch IMEI và số Serial nguyên vẹn, không có dấu hiệu cạo sửa hay tẩy xóa.</li>
                    <li>Lỗi hư hỏng được xác định do lỗi kỹ thuật hoặc lỗi linh kiện từ nhà sản xuất.</li>
                    <li>Khách hàng cung cấp số điện thoại đặt hàng hoặc mã đơn hàng trên website NovaShop.</li>
                  </ul>
                </div>

                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Các trường hợp từ chối bảo hành:</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs">
                    <li>Sản phẩm bị vào nước hoặc chất lỏng vượt quá tiêu chuẩn kháng nước công bố.</li>
                    <li>Sản phẩm bị rơi vỡ, nứt mẻ, biến dạng khung vỏ, màn hình bị chảy mực do va chạm ngoại lực.</li>
                    <li>Sản phẩm có dấu hiệu tháo gỡ hoặc can thiệp phần cứng bởi các đơn vị không được ủy quyền.</li>
                    <li>Hư hỏng do sử dụng nguồn điện không ổn định, chập cháy, sét đánh hoặc thiên tai.</li>
                  </ul>
                </div>
              </div>

              {/* Direct Address & Hotline */}
              <div className="p-4 sm:p-5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Trung tâm tiếp nhận & bảo hành:</span>
                    <strong className="text-indigo-950">219/20 đường số 12, phường Bình Hưng Hòa, TP. Hồ Chí Minh</strong>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Hotline hỗ trợ kỹ thuật & tiếp nhận bảo hành:</span>
                    <strong className="text-indigo-700 font-bold text-sm">0908061843</strong>
                    <span className="text-slate-400 text-[11px]">(8h00 - 21h00 các ngày trong tuần)</span>
                  </div>
                </div>

                <div className="bg-white px-3.5 py-2 rounded-xl border border-indigo-100 font-semibold text-slate-700 shrink-0 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Thời gian xử lý: 3 - 7 ngày làm việc</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ĐỔI TRẢ 30 NGÀY */}
          {activeTab === 'return' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Chính Sách Hậu Mãi Vượt Trội</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Quy Trình Đổi Trả Hàng 1-1 Miễn Phí Trong 30 Ngày
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl self-start">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Đổi mới 100% nguyên seal nếu có lỗi</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-amber-950">Đặc quyền an tâm mua sắm tại NovaShop</p>
                  <p className="text-amber-800 text-xs">
                    Trong 30 ngày đầu tiên tính từ thời điểm nhận hàng, nếu sản phẩm gặp lỗi phần cứng do nhà sản xuất, khách hàng được đổi ngay 1 sản phẩm mới 100% nguyên seal cùng mã, cùng màu sắc hoàn toàn miễn phí.
                  </p>
                </div>
              </div>

              {/* 3 Steps Process */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">3 Bước Đổi Trả Đơn Giản & Nhanh Chóng:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Liên Hệ Yêu Cầu Đổi Máy</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Gọi Hotline <strong>0908061843</strong> hoặc liên hệ qua Zalo/Email, gửi hình ảnh/video mô tả tình trạng sản phẩm.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">2</div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Thu Hồi Tận Nơi Miễn Phí</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Shipper của NovaShop đến lấy máy tận nhà tại địa chỉ của bạn hoặc bạn mang trực tiếp tới <strong>219/20 đường số 12, P. Bình Hưng Hòa</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Giao Máy Mới Trong 24H</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kỹ thuật viên xác nhận lỗi kỹ thuật và tiến hành đóng gói, giao ngay sản phẩm mới nguyên seal đến tận tay bạn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 rounded-xl text-slate-600 text-xs space-y-1">
                <p>📌 <strong>Lưu ý:</strong> Vỏ hộp, số Serial/IMEI, phụ kiện sạc cáp, sách hướng dẫn và quà khuyến mãi đi kèm phải còn nguyên vẹn. Tài khoản cá nhân (iCloud, Google) cần được đăng xuất hoàn toàn trước khi bàn giao.</p>
              </div>
            </div>
          )}

          {/* TAB 3: VẬN CHUYỂN & GIAO HÀNG */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Hậu Cần & Giao Nhận</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Chính Sách Vận Chuyển Toàn Quốc & Biểu Phí Giao Nhận
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Miễn phí giao hàng từ 300.000₫</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-sm">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span>Giao Hàng Tiêu Chuẩn Toàn Quốc</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Áp dụng cho 63 tỉnh thành trên toàn lãnh thổ Việt Nam thông qua các đối tác vận chuyển hàng đầu (Viettel Post, GHTK, GHN).
                  </p>
                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <p>⏱️ Thời gian nhận hàng: <strong>2 - 4 ngày làm việc</strong></p>
                    <p>💰 Phí giao hàng: <strong>30.000₫</strong> (Đơn hàng &lt; 300.000₫)</p>
                    <p className="text-emerald-700 font-bold">🎉 Miễn phí 100% cho mọi đơn hàng từ 300.000₫ trở lên!</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <span>Giao Hỏa Tốc Now 2H (Nội Thành)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dịch vụ giao hỏa tốc bằng xe máy chuyên dụng, bàn giao trực tiếp tận tay khách hàng trong vòng 2 - 4 giờ sau khi xác nhận đơn.
                  </p>
                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <p>⏱️ Thời gian nhận hàng: <strong>2 - 4 giờ</strong> (Trong khung giờ 8h30 - 19h30)</p>
                    <p>📍 Khu vực áp dụng: <strong>TP. Hồ Chí Minh & Hà Nội</strong></p>
                    <p className="text-amber-800 font-bold">🚀 Cước phí cố định: 65.000₫ / đơn hàng</p>
                  </div>
                </div>
              </div>

              {/* Inspection Policy */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quyền lợi đồng kiểm ngoại quan khi nhận hàng:</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Khách hàng được quyền kiểm tra ngoại quan gói hàng trước mặt shipper (kiểm tra hộp đóng gói nguyên vẹn, niêm phong tem vỡ, đúng tên model và màu sắc đã đặt). Quý khách vui lòng quay video quá trình mở hộp để phục vụ giải quyết đổi trả nhanh nhất nếu xảy ra sự cố va đập trong khâu vận chuyển.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BẢO MẬT THANH TOÁN */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">An Toàn Thông Tin</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Chính Sách Bảo Mật Thanh Toán & Chuẩn Mã Hóa SSL
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl self-start">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>PCI-DSS Level 1 & SSL 256-bit</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Cam kết tuyệt đối không lưu trữ thông tin thẻ và tài khoản ngân hàng</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NovaShop tích hợp trực tiếp với cổng thanh toán điện tử của các ngân hàng và tổ chức tài chính hàng đầu. Toàn bộ thông tin số thẻ, số tài khoản, mã xác thực OTP hay mã bí mật CVV/CVC đều được mã hóa bằng chuẩn mã hóa cao cấp SSL 256-bit và truyền trực tiếp qua cổng ngân hàng mà không qua bất kỳ máy chủ trung gian nào.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Xác thực 3D-Secure 2.0 cho Thẻ Quốc Tế:</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Mọi giao dịch qua thẻ Visa, MasterCard, JCB đều bắt buộc xác thực qua hệ thống OTP gửi qua tin nhắn điện thoại từ ngân hàng phát hành (Verified by Visa, Mastercard Identity Check), ngăn chặn 100% nguy cơ giao dịch gian lận.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Bảo mật thông tin cá nhân khách hàng:</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Họ tên, số điện thoại và địa chỉ giao hàng chỉ được sử dụng cho mục đích lập hóa đơn điện tử VAT và điều phối nhân viên vận chuyển. Tuyệt đối không chia sẻ hoặc mua bán thông tin khách hàng cho bên thứ ba.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HƯỚNG DẪN THANH TOÁN VIETQR */}
          {activeTab === 'payment' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Thanh Toán Thông Minh</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Hướng Dẫn Thanh Toán Trực Tuyến Qua VietQR Napas 24/7
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl self-start">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>Xác nhận tự động trong 2 giây</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-purple-950">Công nghệ VietQR Napas chuẩn quốc gia 24/7</p>
                  <p className="text-purple-800 text-xs">
                    Không cần nhập số tài khoản thủ công, không lo chuyển nhầm số tiền hay sai nội dung. Mã QR động được sinh riêng theo từng đơn hàng với số tiền và nội dung chuyển khoản được cấu hình tự động.
                  </p>
                </div>
              </div>

              {/* 4 Steps VietQR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">1</span>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Chọn VietQR</h5>
                  <p className="text-slate-500">Tại bước thanh toán đơn hàng, tick chọn phương thức "Chuyển khoản VietQR 24/7".</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">2</span>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Mở App Ngân Hàng</h5>
                  <p className="text-slate-500">Mở app Vietcombank, MB Bank, Techcombank, BIDV, ACB hoặc MoMo/ZaloPay và chọn Quét QR.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">3</span>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Quét Mã & Xác Nhận</h5>
                  <p className="text-slate-500">Quét mã QR trên màn hình; thông tin người nhận và số tiền sẽ được điền chuẩn xác 100%.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">4</span>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Nhận Hóa Đơn Điện Tử</h5>
                  <p className="text-slate-500">Hệ thống kích hoạt đơn hàng sang trạng thái "Đã thanh toán" và xuất hóa đơn ngay lập tức.</p>
                </div>
              </div>

              {/* Supported Gateways list */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-800">Các phương thức thanh toán trực tuyến được hỗ trợ:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-700">VietQR Napas</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-700">Visa / Mastercard / JCB</span>
                  <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-lg font-bold border border-pink-200">Ví MoMo</span>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold border border-blue-200">VNPay-QR</span>
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200">COD Tiền Mặt</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ĐIỀU KHOẢN SỬ DỤNG */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Quy Định & Pháp Lý</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Điều Khoản Sử Dụng Dịch Vụ & Quy Chế Thương Mại Điện Tử
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl self-start">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Quy định cập nhật năm 2026</span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Chào mừng quý khách đến với nền tảng thương mại điện tử NovaShop. Bằng việc truy cập, đặt hàng hoặc trải nghiệm dịch vụ trên website, quý khách đồng ý chịu sự ràng buộc của các điều khoản và điều kiện sau đây:
                </p>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">1. Giá niêm yết và khuyến mại:</h4>
                  <p className="text-xs text-slate-600">
                    Toàn bộ giá bán hiển thị trên website là giá thanh toán cuối cùng đã bao gồm thuế Giá Trị Gia Tăng (VAT). Giá sản phẩm và các mã voucher giảm giá có thể thay đổi linh hoạt theo từng chiến dịch bán hàng mà không cần thông báo trước.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">2. Hủy đơn hàng và từ chối giao dịch:</h4>
                  <p className="text-xs text-slate-600">
                    NovaShop có quyền từ chối hoặc hủy đơn hàng khi phát hiện các hành vi gian lận mã giảm giá, sử dụng công cụ đặt hàng ảo tự động (bot), cung cấp số điện thoại/địa chỉ giả mạo hoặc đơn vị giao nhận không thể liên hệ được sau 3 lần gọi.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">3. Giải quyết khiếu nại và tranh chấp:</h4>
                  <p className="text-xs text-slate-600">
                    Mọi thắc mắc, khiếu nại liên quan đến chất lượng sản phẩm hay dịch vụ thanh toán sẽ được ban quản trị tiếp nhận và phản hồi giải quyết trong vòng 24 - 48 giờ làm việc qua Hotline <strong>0908061843</strong> hoặc email <strong>support@novashop.vn</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
