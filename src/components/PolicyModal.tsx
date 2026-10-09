import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  CalendarClock
} from 'lucide-react';

export type PolicyTabId = 'warranty' | 'return' | 'shipping' | 'security' | 'payment' | 'terms' | 'installment';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTabId;
  onTabChange?: (tab: PolicyTabId) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'warranty',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTabId>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const tabs: { id: PolicyTabId; label: string; icon: React.ElementType }[] = [
    { id: 'warranty', label: 'Bảo hành chính hãng', icon: ShieldCheck },
    { id: 'installment', label: 'Chính sách trả góp 0%', icon: CalendarClock },
    { id: 'return', label: 'Đổi trả 1-1 trong 30 ngày', icon: RotateCcw },
    { id: 'shipping', label: 'Vận chuyển & Giao nhận', icon: Truck },
    { id: 'security', label: 'Bảo mật thanh toán & SSL', icon: Lock },
    { id: 'payment', label: 'Hướng dẫn thanh toán VietQR', icon: CreditCard },
    { id: 'terms', label: 'Điều khoản sử dụng', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        id="policy-services-modal"
        className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Trung Tâm Chính Sách & Dịch Vụ</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Cam kết chất lượng, bảo hành minh bạch và hỗ trợ 24/7</p>
            </div>
          </div>
          <button
            id="close-policy-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Left Tabs Sidebar, Right Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Tabs Menu */}
          <div className="w-full md:w-64 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200/80 p-2 sm:p-3 space-y-0 md:space-y-1 overflow-x-auto md:overflow-y-auto scrollbar-none shrink-0 flex md:flex-col gap-1.5 md:gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`policy-tab-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    onTabChange?.(tab.id);
                  }}
                  className={`md:w-full text-left px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap md:whitespace-normal shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Quick Contact Box in Sidebar */}
            <div className="hidden md:block mt-6 p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs space-y-2">
              <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">Hỗ trợ trực tiếp</span>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <strong className="text-slate-900">0908061843</strong>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>219/20 đường số 12, P. Bình Hưng Hòa, TP. Hồ Chí Minh</span>
              </p>
            </div>
          </div>

          {/* Right Content Details */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
            
            {/* TAB 1: BẢO HÀNH CHÍNH HÃNG */}
            {activeTab === 'warranty' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Tiêu chuẩn bảo hành</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Chính Sách Bảo Hành Chính Hãng 12 - 24 Tháng</h3>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-emerald-900">Cam kết 100% linh kiện chính hãng</p>
                    <p className="text-emerald-800">
                      Tất cả các sản phẩm thiết bị điện tử, điện thoại, máy tính xách tay và phụ kiện phân phối bởi NovaShop đều đi kèm bảo hành điện tử chính hãng từ 12 đến 24 tháng theo số Serial/IMEI.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">1. Điều kiện được tiếp nhận bảo hành:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Sản phẩm còn trong thời hạn bảo hành tính từ ngày xuất hóa đơn điện tử hoặc kích hoạt mã bảo hành online.</li>
                    <li>Tem niêm phong, số IMEI/Serial number còn nguyên vẹn, không bị cạo sửa, tẩy xóa hoặc rách nát.</li>
                    <li>Lỗi hư hỏng được xác định do lỗi kỹ thuật hoặc linh kiện từ nhà sản xuất (Apple, Samsung, Sony, Dell, Logitech,...).</li>
                    <li>Sản phẩm không thuộc các trường hợp từ chối bảo hành do ngoại lực tác động.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">2. Các trường hợp từ chối bảo hành:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Sản phẩm bị ngấm nước hoặc chất lỏng vượt quá chuẩn kháng nước công bố của nhà sản xuất.</li>
                    <li>Sản phẩm bị móp méo, nứt vỡ màn hình, biến dạng do rơi rớt, va đập hoặc tự ý tháo mở, sửa chữa tại các đơn vị không được ủy quyền.</li>
                    <li>Hư hỏng do sử dụng sai nguồn điện, chập cháy nổ hoặc thiên tai, sét đánh.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">3. Địa điểm và thời gian xử lý:</h4>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <p>📍 <strong>Trung tâm tiếp nhận:</strong> 219/20 đường số 12, phường Bình Hưng Hòa, thành phố Hồ Chí Minh</p>
                    <p>📞 <strong>Hotline bảo hành kỹ thuật:</strong> 0908061843 (Hỗ trợ 8h00 - 21h00 các ngày trong tuần)</p>
                    <p>⏱️ <strong>Thời gian xử lý:</strong> Từ 3 - 7 ngày làm việc. Quý khách được mượn máy tương đương dùng tạm trong quá trình chờ bảo hành đối với các sản phẩm điện thoại và laptop.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CHÍNH SÁCH TRẢ GÓP 0% */}
            {activeTab === 'installment' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tài chính tiện lợi</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Chính Sách Mua Hàng Trả Góp 0% Lãi Suất</h3>
                  <p className="text-xs text-slate-500">NovaShop liên kết trực tiếp với 25+ ngân hàng và 4 công ty tài chính hàng đầu</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                      <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px]">0%</span>
                      <span>Trả góp qua Thẻ tín dụng</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      <li>Áp dụng cho thẻ tín dụng (Visa, MasterCard, JCB) của 25+ ngân hàng đối tác.</li>
                      <li><strong>Lãi suất 0%</strong> trong suốt kỳ hạn (3, 6, 9, 12, 18, 24 tháng).</li>
                      <li><strong>Miễn phí chuyển đổi hồ sơ</strong> (NovaShop tài trợ 100%).</li>
                      <li>Không cần trả trước, không cần giấy tờ, duyệt hạn mức online ngay lập tức.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-xs">
                      <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-black text-[10px]">CCCD</span>
                      <span>Trả góp qua Công ty tài chính</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      <li>Đối tác: Home Credit, FE Credit, HD SAISON, Mirae Asset.</li>
                      <li><strong>Chỉ cần CCCD gắn chip</strong> (độ tuổi từ 18 - 60 tuổi).</li>
                      <li>Không cần chứng minh thu nhập hay sao kê lương.</li>
                      <li>Trả trước chỉ từ 0% đến 20% giá trị sản phẩm, xét duyệt online 5 phút.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Quy trình 3 bước mua trả góp 0% tại NovaShop:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">1</span>
                      <strong className="block text-slate-900">Chọn sản phẩm & Kỳ hạn</strong>
                      <span className="text-slate-500 text-[11px]">Bấm nút "TRẢ GÓP 0%" trên bất kỳ sản phẩm nào để mở bảng tính tài chính tự động.</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">2</span>
                      <strong className="block text-slate-900">Điền hồ sơ online 5 phút</strong>
                      <span className="text-slate-500 text-[11px]">Nhập họ tên, số điện thoại, CCCD hoặc thông tin thẻ để hệ thống gửi phê duyệt tự động.</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">3</span>
                      <strong className="block text-slate-900">Nhận máy tận nơi</strong>
                      <span className="text-slate-500 text-[11px]">Chuyên viên xác nhận và giao máy tận nhà hoặc nhận tại Showroom 123 Lê Lợi.</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">Quyền lợi bảo hành khi mua trả góp:</h4>
                  <p className="text-slate-600">
                    Sản phẩm mua trả góp tại NovaShop được hưởng <strong>100% quyền lợi bảo hành chính hãng và chính sách đổi trả 1-1 trong 30 ngày</strong> hoàn toàn tương tự như hình thức thanh toán một lần.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ĐỔI TRẢ 30 NGÀY */}
            {activeTab === 'return' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Hậu mãi vượt trội</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Quy Trình Đổi Trả Miễn Phí 1-1 Trong 30 Ngày</h3>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-900">An tâm trải nghiệm sản phẩm</p>
                    <p className="text-amber-800">
                      Trong vòng 30 ngày kể từ ngày nhận hàng, nếu sản phẩm gặp lỗi phần cứng do nhà sản xuất, khách hàng được đổi ngay sản phẩm mới 100% nguyên seal cùng model hoàn toàn miễn phí.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">1. Quy định đổi hàng mới:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li><strong>01 - 30 ngày đầu:</strong> Đổi ngay 1 sản phẩm mới cùng loại, cùng màu sắc nếu sản phẩm có lỗi phần cứng từ NSX. Nếu hết hàng đổi, khách hàng được quyền đổi sang mẫu khác tương đương hoặc hoàn tiền 100%.</li>
                    <li><strong>Từ ngày 31 trở đi:</strong> Áp dụng chính sách bảo hành chính hãng theo quy định của nhà sản xuất.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">2. Yêu cầu sản phẩm khi đổi trả:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Thân máy và vỏ ngoài không có dấu hiệu trầy xước sâu, nứt vỡ, móp méo do người dùng.</li>
                    <li>Đầy đủ hộp trùng Serial/IMEI, phụ kiện đi kèm (củ sạc, cáp sạc, sách hướng dẫn, khay sim, adapter).</li>
                    <li>Các quà tặng kèm khuyến mãi trong đơn hàng còn đầy đủ nguyên vẹn.</li>
                    <li>Tài khoản cá nhân (iCloud, Google Account, Samsung Account, mật khẩu màn hình) phải được đăng xuất hoàn toàn trước khi bàn giao kỹ thuật viên.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">3. Các bước yêu cầu đổi trả:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">1</span>
                      <strong className="block text-slate-900">Liên hệ Hotline</strong>
                      <span className="text-slate-500 text-[11px]">Gọi 0908061843 hoặc nhắn tin mô tả lỗi sản phẩm kèm video/ảnh.</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">2</span>
                      <strong className="block text-slate-900">Gửi hàng kiểm tra</strong>
                      <span className="text-slate-500 text-[11px]">Shipper đến tận nhà lấy hàng miễn phí hoặc gửi tại 219/20 đường số 12.</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">3</span>
                      <strong className="block text-slate-900">Nhận máy mới</strong>
                      <span className="text-slate-500 text-[11px]">Kỹ thuật kiểm tra xác nhận lỗi và gửi máy mới tận nơi trong 24h.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VẬN CHUYỂN & GIAO NHẬN */}
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Hậu cần & Giao nhận</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Chính Sách Vận Chuyển & Biểu Phí Giao Hàng</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold">
                      <Truck className="w-4 h-4" />
                      <span>Giao Hàng Tiêu Chuẩn Toàn Quốc</span>
                    </div>
                    <p className="text-slate-600">
                      Thời gian giao hàng: <strong>2 - 4 ngày làm việc</strong>. Phí vận chuyển cố định: <strong>30.000₫</strong>.
                    </p>
                    <div className="p-2 bg-white rounded-lg border border-indigo-100 font-semibold text-emerald-700">
                      🎉 Miễn phí 100% phí giao hàng cho tất cả đơn hàng từ 300.000₫!
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>Giao Hàng Hỏa Tốc Now 2H</span>
                    </div>
                    <p className="text-slate-600">
                      Áp dụng nội thành TP. Hồ Chí Minh & Hà Nội. Giao trực tiếp tận tay trong <strong>2 - 4 giờ</strong> sau khi đơn hàng được xác nhận.
                    </p>
                    <p className="text-slate-700 font-semibold">
                      Phí dịch vụ hỏa tốc: <strong>65.000₫/đơn hàng</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">Chính sách đồng kiểm khi nhận hàng:</h4>
                  <p className="text-slate-600">
                    Khách hàng hoàn toàn được quyền <strong>kiểm tra ngoại quan gói hàng</strong> trước khi ký nhận và thanh toán (kiểm tra hộp, tem niêm phong, đúng model và màu sắc đã đặt).
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <p>⚠️ Lưu ý: Vì lý do an toàn bảo hành điện tử chính hãng, sản phẩm nguyên seal sẽ không mở nguồn thử máy trước khi thanh toán. Sau khi thanh toán, quý khách vui lòng quay video khui hộp để đảm bảo quyền lợi đổi trả tốt nhất.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BẢO MẬT & THANH TOÁN */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">An toàn thông tin</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Chính Sách Bảo Mật Thanh Toán & Chuẩn Mã Hóa SSL</h3>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-3 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Chứng chỉ bảo mật quốc tế PCI-DSS Level 1 & 256-Bit SSL</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    NovaShop cam kết tuyệt đối không lưu trữ thông tin thẻ ngân hàng, mã CVV/CVC hoặc mật khẩu tài khoản ngân hàng của khách hàng trên bất kỳ máy chủ nào. Toàn bộ quá trình thanh toán được thực hiện trực tiếp qua cổng thanh toán bảo mật của ngân hàng và tổ chức tài chính.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">1. Bảo mật giao dịch thẻ quốc tế (3D-Secure):</h4>
                  <p className="text-slate-600">
                    Giao dịch qua thẻ Visa, MasterCard, JCB được xác thực hai lớp qua giao thức <strong>3D-Secure 2.0 (Verified by Visa, MasterCard Identity Check)</strong> với mã OTP gửi qua SMS của ngân hàng phát hành, loại bỏ hoàn toàn rủi ro gian lận hoặc lộ số thẻ.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">2. Bảo vệ thông tin cá nhân:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Họ tên, số điện thoại, địa chỉ và email nhận hóa đơn điện tử chỉ được sử dụng duy nhất cho mục đích xử lý đơn hàng và giao vận.</li>
                    <li>Không chia sẻ, mua bán hoặc tiết lộ thông tin người mua cho bên thứ ba ngoại trừ đối tác vận chuyển giao hàng.</li>
                    <li>Hóa đơn điện tử VAT được gửi an toàn về email chính chủ của khách hàng ngay khi hoàn tất đơn hàng.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 5: HƯỚNG DẪN VIETQR */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Thanh toán thông minh</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Hướng Dẫn Thanh Toán Trực Tuyến Qua VietQR Napas 24/7</h3>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-indigo-900 text-xs sm:text-sm">Thông tin tài khoản nhận thanh toán trước qua Mã QR (VietQR Napas 247):</h4>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>• Chủ tài khoản: <strong>TRUONG MINH QUOC TRI</strong></div>
                    <div>• Số tài khoản: <strong>3180530681</strong></div>
                    <div>• Ngân hàng: <strong>BIDV - PGD Tân Sơn Nhì</strong></div>
                  </div>
                  <p className="text-xs text-slate-600 pt-1">
                    Lưu ý: Đối với khách hàng chọn thanh toán trước, đơn hàng <strong>chỉ được xác nhận đặt hàng thành công</strong> khi quý khách đã thanh toán qua mã QR đúng với số tiền của sản phẩm/đơn hàng đó.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Các bước thanh toán bằng VietQR:</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                      <div>
                        <strong className="text-slate-900">Chọn phương thức VietQR tại bước thanh toán</strong>
                        <p className="text-slate-500 text-[11px]">Màn hình sẽ hiển thị mã QR động có gắn sẵn số tiền chính xác và mã đơn hàng tham chiếu.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                      <div>
                        <strong className="text-slate-900">Mở ứng dụng Ngân hàng hoặc Ví điện tử</strong>
                        <p className="text-slate-500 text-[11px]">Sử dụng bất kỳ app ngân hàng (Vietcombank, MB Bank, Techcombank, BIDV, Agribank, ACB, VPBank, TPBank...) hoặc ví MoMo/ZaloPay và chọn tính năng <strong>Quét QR</strong>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                      <div>
                        <strong className="text-slate-900">Quét mã và xác nhận chuyển khoản</strong>
                        <p className="text-slate-500 text-[11px]">Thông tin số tiền và nội dung chuyển khoản được điền tự động. Khách hàng kiểm tra và xác nhận giao dịch.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                      <div>
                        <strong className="text-slate-900">Nhận hóa đơn điện tử thành công</strong>
                        <p className="text-slate-500 text-[11px]">Hệ thống lập tức kích hoạt đơn hàng sang trạng thái "Đã thanh toán" và gửi hóa đơn điện tử về email.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ĐIỀU KHOẢN SỬ DỤNG */}
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Quy định pháp lý</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Điều Khoản Sử Dụng Dịch Vụ NovaShop</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Chào mừng quý khách đến với website thương mại điện tử NovaShop. Bằng việc truy cập, đặt hàng hoặc sử dụng bất kỳ dịch vụ nào trên website, quý khách đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">1. Quy định về giá cả và thông tin sản phẩm:</h4>
                  <p>
                    Tất cả các mức giá niêm yết trên NovaShop đều đã bao gồm thuế Giá Trị Gia Tăng (VAT). Giá sản phẩm có thể thay đổi tùy theo các chương trình khuyến mãi theo từng thời điểm. Trong trường hợp có sự sai sót hiếm hoi về hiển thị giá do lỗi hệ thống, chúng tôi sẽ liên hệ thông báo ngay cho khách hàng trước khi xuất hàng.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">2. Hủy đơn hàng và từ chối cung cấp dịch vụ:</h4>
                  <p>
                    NovaShop có quyền từ chối hoặc hủy các đơn hàng trong trường hợp phát hiện hành vi gian lận voucher, đầu cơ tích trữ, cung cấp sai lệch thông tin người nhận hoặc số điện thoại không thể liên lạc được sau 3 lần gọi.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">3. Quyền sở hữu trí tuệ:</h4>
                  <p>
                    Toàn bộ hình ảnh, nội dung giới thiệu sản phẩm và thương hiệu được đăng ký bản quyền hoặc sử dụng hợp pháp theo quy định của pháp luật thương mại điện tử Việt Nam.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Cần tư vấn thêm về chính sách? Gọi ngay Hotline: <strong className="text-slate-900">0908061843</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
