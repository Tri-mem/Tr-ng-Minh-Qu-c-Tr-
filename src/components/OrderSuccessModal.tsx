import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  QrCode, 
  Calendar, 
  ShieldCheck, 
  Download,
  X
} from 'lucide-react';
import { Order } from '../types';
import { formatVND } from '../data/mockData';
import { Logo } from './Logo';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewOrders,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback gracefully if canvas-confetti context isn't supported
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const paymentMethodLabel = {
    vietqr: 'VietQR Napas 24/7 — BIDV 3180530681 (TRUONG MINH QUOC TRI)',
    card: 'Thẻ Quốc tế 3D-Secure (Đã thanh toán)',
    momo: 'Ví Điện Tử MoMo (Đã thanh toán)',
    vnpay: 'VNPay-QR Napas 24/7 — BIDV 3180530681 (TRUONG MINH QUOC TRI)',
    cod: 'Thanh toán tiền mặt khi nhận hàng (COD)',
    installment: `Trả Góp 0% (${order.installmentDetails?.providerName || 'Đối tác tài chính'} - ${order.installmentDetails?.tenureMonths || 6} tháng)`,
  }[order.paymentMethod] || 'Trực tuyến';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        id="order-success-invoice-modal"
        className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-emerald-600 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold truncate">Giao dịch thành công!</h2>
              <p className="text-[11px] sm:text-xs text-emerald-100 truncate">Đơn hàng của bạn đã được thanh toán và xác nhận thành công</p>
            </div>
          </div>
          <button
            id="close-success-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Body */}
        <div className="overflow-y-auto p-3.5 sm:p-7 space-y-4 sm:space-y-6">
          
          {/* Printable Brand Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 sm:pb-4">
            <Logo size="sm" />
            <div className="text-left sm:text-right text-[10px] sm:text-[11px] text-slate-500">
              <span className="font-bold text-slate-800 block">HỆ THỐNG NOVASHOP VIỆT NAM</span>
              <span>Hotline: 0908061843 • support@novashop.vn</span>
            </div>
          </div>

          {/* Bank-Verified Payment Success Banner (For QR & Online Paid Orders) */}
          {order.paymentStatus === 'paid' && (
            <div
              id="bank-verified-receipt-card"
              className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 border border-slate-800 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/60 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-300">
                      Xác nhận dữ liệu giao dịch từ ngân hàng
                    </p>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      Giao dịch thanh toán thành công
                    </h3>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Số tiền đã nhận</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
                    {formatVND(order.qrTransactionDetails?.amount ?? order.total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">Mã giao dịch ngân hàng</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {order.qrTransactionDetails?.transactionId || order.transactionId || 'TXN-998811'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">Nội dung thanh toán</span>
                  <span className="font-mono font-bold text-amber-300">
                    {order.qrTransactionDetails?.transferContent || order.id}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">Ngân hàng thụ hưởng</span>
                  <span className="font-semibold text-slate-200">
                    {order.qrTransactionDetails?.bankName || 'BIDV - PGD Tân Sơn Nhì'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-400">Tài khoản nhận</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {order.qrTransactionDetails
                      ? `${order.qrTransactionDetails.accountNumber} · ${order.qrTransactionDetails.accountHolder}`
                      : '3180530681 · TRUONG MINH QUOC TRI'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10 sm:border-b-0">
                  <span className="text-slate-400">Thời gian xác nhận</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {new Date(
                      order.qrTransactionDetails?.confirmedAt || order.confirmedAt || order.createdAt
                    ).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Trạng thái đơn hàng</span>
                  <span className="font-bold text-emerald-400">Đã thanh toán</span>
                </div>
              </div>
            </div>
          )}

          {/* Top Order Highlights */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mã đơn hàng:</span>
              <span className="text-sm sm:text-lg font-mono font-black text-indigo-700">{order.id}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Thời gian đặt:</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái thanh toán:</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                order.paymentStatus === 'paid' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : order.paymentMethod === 'installment'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {order.paymentStatus === 'paid'
                  ? 'Đã Thanh Toán Trực Tuyến'
                  : order.paymentMethod === 'installment'
                  ? 'Hồ Sơ Trả Góp 0% Đã Duyệt'
                  : 'Chờ Thanh Toán COD'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mã giao dịch (Txn ID):</span>
              <span className="font-mono text-xs font-bold text-slate-700">{order.transactionId || 'TXN-998811'}</span>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-indigo-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Địa chỉ giao hàng
              </h4>
              <p className="font-extrabold text-slate-800 text-sm">{order.customer.fullName}</p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" /> {order.customer.phone}
              </p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" /> {order.customer.email}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {order.customer.address}, {order.customer.district}, {order.customer.city}
              </p>
              {order.customer.note && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Ghi chú: "{order.customer.note}"
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Vận chuyển & Thanh toán
              </h4>
              <div>
                <span className="text-slate-400 text-[10px] block">Hình thức vận chuyển:</span>
                <span className="font-bold text-slate-800">{order.shipping.name}</span>
                <span className="text-slate-500 text-[11px] block">{order.shipping.estimatedDays}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 text-[10px] block">Cổng thanh toán:</span>
                <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> {paymentMethodLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Installment Plan Banner if applicable */}
          {order.installmentDetails && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">0% LÃI SUẤT</span>
                  Hồ Sơ Mua Trả Góp {order.installmentDetails.providerName}
                </span>
                <span className="font-mono text-slate-600 font-bold">Mã hồ sơ: {order.installmentDetails.approvalCode || order.id}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white p-2 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block">Kỳ hạn:</span>
                  <span className="font-bold text-slate-800">{order.installmentDetails.tenureMonths} tháng</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block">Trả trước ({order.installmentDetails.downPaymentPercent}%):</span>
                  <span className="font-bold text-slate-800">{formatVND(order.installmentDetails.downPaymentAmount)}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block">Góp mỗi tháng:</span>
                  <span className="font-black text-indigo-700">{formatVND(order.installmentDetails.monthlyPayment)}/tháng</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] text-slate-400 block">Lãi suất & phí:</span>
                  <span className="font-bold text-emerald-600">0₫ (Miễn phí)</span>
                </div>
              </div>
            </div>
          )}

          {/* Purchased Items Table */}
          <div className="border border-slate-200/80 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="bg-slate-100/80 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-slate-700 grid grid-cols-12">
              <span className="col-span-6 sm:col-span-7">Sản phẩm</span>
              <span className="col-span-2 text-center">SL</span>
              <span className="col-span-4 sm:col-span-3 text-right">Thành tiền</span>
            </div>
            <div className="divide-y divide-slate-100 p-1.5 sm:p-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="px-1.5 sm:px-2 py-2 sm:py-2.5 text-[11px] sm:text-xs grid grid-cols-12 items-center gap-1">
                  <div className="col-span-6 sm:col-span-7 flex items-center gap-2 min-w-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{item.product.name}</div>
                      {item.selectedColor && <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Màu: {item.selectedColor}</span>}
                    </div>
                  </div>
                  <span className="col-span-2 text-center font-bold text-slate-700">{item.quantity}</span>
                  <span className="col-span-4 sm:col-span-3 text-right font-extrabold text-slate-900 tabular-nums">
                    {formatVND(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính hàng hóa:</span>
              <span className="font-semibold text-slate-800">{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí giao hàng:</span>
              <span>{order.shippingFee === 0 ? <strong className="text-emerald-600">Miễn phí</strong> : formatVND(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Giảm giá Voucher ({order.voucherCode || 'Đã áp dụng'}):</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
              <span>Tổng tiền đã thanh toán:</span>
              <span className="text-base text-indigo-700">{formatVND(order.total)}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            id="print-invoice-btn"
            onClick={handlePrint}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> In hóa đơn điện tử (PDF)
          </button>

          <div className="flex items-center gap-2">
            <button
              id="view-all-orders-btn"
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="flex-1 sm:flex-initial py-2.5 px-3 sm:px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors text-center"
            >
              Xem đơn hàng
            </button>

            <button
              id="continue-shopping-btn"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              Tiếp tục mua sắm <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
