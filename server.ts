import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ProductSummary {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  stock: number;
  badge?: string;
  highlights?: string[];
}

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  itemNames: string[];
}

interface SupportContextPayload {
  customerName?: string;
  cartSummary?: string;
  appliedVoucherCode?: string;
  matchedProducts?: ProductSummary[];
  recentOrders?: OrderSummary[];
}

const NOVASHOP_SYSTEM_INSTRUCTION = `Bạn là **CSKH NovaCare** — Chuyên viên Chăm sóc Khách hàng & Tư vấn Công nghệ trực tuyến của **NovaShop** (Hệ thống phân phối thiết bị công nghệ chính hãng & thanh toán trực tuyến tại Việt Nam).

### NGUYÊN TẮC PHẢN HỒI
1. **Thân thiện, lịch sự, chuyên nghiệp và súc tích**: Xưng "NovaShop" hoặc "Mình" và gọi khách hàng là "Bạn" hoặc "Anh/Chị" (nếu biết tên khách hàng thì chào tên thân thiện). Trả lời trong khoảng 80–180 từ, đi thẳng vào trọng tâm câu hỏi.
2. **Trình bày rõ ràng, dễ đọc**: Sử dụng gạch đầu dòng (•) và in đậm (**...**) các thông tin quan trọng như giá bán, mã giảm giá, thời gian bảo hành, chính sách đổi trả.
3. **Giải đáp chính xác theo dữ liệu thực tế của NovaShop**:
   - **Cam kết nguồn gốc & Bảo hành**:
     • 100% sản phẩm chính hãng phân phối chính ngạch tại Việt Nam, nguyên seal, đầy đủ hóa đơn VAT điện tử.
     • Bảo hành điện tử chính hãng **12 – 24 tháng** theo IMEI/Serial và Số điện thoại đặt hàng.
     • Hỗ trợ **vận chuyển bảo hành 2 chiều miễn phí** toàn quốc hoặc bảo hành tại tất cả Trung tâm bảo hành ủy quyền của Apple, Samsung, Sony, Asus, Dell, Xiaomi, Garmin, Marshall...
   - **Chính sách Đổi trả**:
     • **1 đổi 1 trong 30 ngày đầu** miễn phí tận nơi nếu phát sinh lỗi phần cứng từ nhà sản xuất (màn hình, nguồn, pin, camera, loa, kết nối...).
     • Điều kiện đổi trả: Sản phẩm giữ nguyên hộp trùng IMEI/Serial, đầy đủ phụ kiện, không rơi vỡ/ngấm nước, đã thoát tài khoản cá nhân (iCloud, Google, Samsung Account).
   - **Chính sách Vận chuyển & Giao hàng**:
     • **Miễn phí vận chuyển toàn quốc (Freeship)** cho mọi đơn hàng từ **300.000₫** (hoặc áp mã **FREESHIP** giảm 30.000₫). Đơn dưới 300.000₫ phí tiêu chuẩn 25.000₫ – 30.000₫.
     • **Giao Hỏa Tốc 2 Giờ (NovaSpeed)**: Phí 65.000₫, nhận hàng trong 2 – 4 giờ tại nội thành TP. Hồ Chí Minh và Hà Nội (khung giờ 8:00 – 18:00).
     • **Giao Tiêu Chuẩn Toàn Quốc**: 1 – 3 ngày làm việc, đóng gói chống sốc, bảo hiểm 100% giá trị hàng hóa.
     • **Đồng kiểm 100%**: Khách hàng được mở thùng kiểm tra ngoại quan, tem seal, đúng mẫu mã và số lượng trước khi thanh toán.
   - **Phương thức Thanh toán & Trả góp 0%**:
     • **Thanh toán trước qua Mã QR (VietQR Napas 24/7 - BIDV)**: Quét mã QR ngân hàng **BIDV - PGD Tân Sơn Nhì**, Số tài khoản **3180530681**, Chủ tài khoản **TRUONG MINH QUOC TRI**. Đơn hàng thanh toán trước chỉ được xác nhận đặt hàng thành công khi khách hàng đã hoàn tất chuyển khoản qua mã QR đúng với số tiền của sản phẩm/đơn hàng đó.
     • **Trả góp 0% lãi suất**: Qua Thẻ tín dụng của hơn 25 ngân hàng hoặc duyệt hồ sơ CCCD gắn chip qua công ty tài chính (Home Credit, FE Credit, HD Saison) trong 3 phút, kỳ hạn linh hoạt 3, 6, 9, 12 tháng.
     • **Thẻ Quốc tế (Visa / Mastercard / JCB)** bảo mật 3D-Secure, **Ví MoMo**, **VNPay-QR**, và **Thanh toán khi nhận hàng (COD)**.
   - **Kho Mã Giảm Giá (Voucher) đang hoạt động**:
     • **NOVATECH**: Giảm ngay **100.000₫** cho đơn hàng từ 500.000₫.
     • **GIAM10**: Giảm **10%** (tối đa **500.000₫**) cho đơn hàng từ 2.000.000₫.
     • **FREESHIP**: Miễn phí vận chuyển (giảm **30.000₫**) cho đơn hàng từ 300.000₫.
     • **VIP500**: Giảm ngay **500.000₫** cho đơn hàng công nghệ từ 15.000.000₫.
   - **Thông tin liên hệ NovaShop**:
     • Địa chỉ trụ sở: 219/20 đường số 12, phường Bình Hưng Hòa, TP. Hồ Chí Minh.
     • Hotline CSKH 24/7: **0908 061 843**
     • Email: **support@novashop.vn**
   - **Đối tác ưu đãi trên NovaShop**:
     • Thiết bị nhà bếp hiện đại **KitchenMini** (giảm 15% đơn đầu tiên cho máy xay sinh tố, máy ép trái cây, máy trộn bột tại https://tt03990322.wixsite.com/kitchenmini - SĐT: 0399032262).

4. **Tư vấn sản phẩm & Đơn hàng**:
   - Khi khách hỏi về sản phẩm, hãy dựa vào danh sách sản phẩm khớp ngữ cảnh được cung cấp bên dưới để báo giá chính xác (bằng VNĐ), ưu điểm nổi bật, tình trạng còn hàng và gợi ý mã voucher phù hợp nhất.
   - Khi khách hỏi về cách mua hàng: nhắc khách có thể bấm vào sản phẩm để xem chi tiết, chọn màu sắc, bấm "Thêm vào giỏ" hoặc "Mua ngay" (nếu chưa đăng nhập hệ thống sẽ mở khung đăng nhập nhanh rồi tự động chuyển tiếp tới bước thanh toán).`;

function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

function buildDynamicContextText(context?: SupportContextPayload): string {
  if (!context) return '';
  const sections: string[] = [];

  if (context.customerName) {
    sections.push(`- Khách hàng đang trò chuyện: ${context.customerName}`);
  } else {
    sections.push(`- Trạng thái tài khoản: Khách chưa đăng nhập`);
  }

  if (context.cartSummary) {
    sections.push(`- Giỏ hàng hiện tại của khách: ${context.cartSummary}`);
  }

  if (context.appliedVoucherCode) {
    sections.push(`- Mã giảm giá đang chọn: ${context.appliedVoucherCode}`);
  }

  if (context.recentOrders && context.recentOrders.length > 0) {
    const orderLines = context.recentOrders
      .slice(0, 5)
      .map(
        (o) =>
          `  • Mã đơn #${o.id} | Trạng thái: ${o.status} | Tổng tiền: ${formatCurrencyVND(o.total)} | Thanh toán: ${o.paymentMethod} | Sản phẩm: ${o.itemNames.join(', ')}`
      )
      .join('\n');
    sections.push(`- Đơn hàng gần đây của khách:\n${orderLines}`);
  }

  if (context.matchedProducts && context.matchedProducts.length > 0) {
    const prodLines = context.matchedProducts
      .slice(0, 8)
      .map((p) => {
        const discountStr =
          p.originalPrice && p.originalPrice > p.price
            ? ` (Giá gốc: ${formatCurrencyVND(p.originalPrice)}, tiết kiệm ${formatCurrencyVND(p.originalPrice - p.price)})`
            : '';
        const highlightsStr =
          p.highlights && p.highlights.length > 0
            ? ` | Nổi bật: ${p.highlights.slice(0, 2).join('; ')}`
            : '';
        return `  • [${p.id}] ${p.name} (${p.categoryName}) — Giá bán: ${formatCurrencyVND(p.price)}${discountStr} | Đánh giá: ${p.rating}★ | Tồn kho: ${p.stock} máy${highlightsStr}`;
      })
      .join('\n');
    sections.push(`- Các sản phẩm tại NovaShop liên quan đến câu hỏi:\n${prodLines}`);
  }

  if (sections.length === 0) return '';
  return `\n\n### NGỮ CẢNH PHIÊN MUA SẮM HIỆN TẠI CỦA KHÁCH HÀNG\n${sections.join('\n')}`;
}

function suggestBestVoucherForPrice(price: number): string {
  if (price >= 15000000) {
    return 'Mã **VIP500** (giảm ngay **500.000₫** cho đơn từ 15 triệu) hoặc **GIAM10** (giảm 10% tối đa **500.000₫**)';
  }
  if (price >= 2000000) {
    const discount10 = Math.min(Math.round(price * 0.1), 500000);
    return `Mã **GIAM10** (giảm 10% tương đương **${formatCurrencyVND(discount10)}**)`;
  }
  if (price >= 500000) {
    return 'Mã **NOVATECH** (giảm ngay **100.000₫** cho đơn từ 500.000₫)';
  }
  if (price >= 300000) {
    return 'Mã **FREESHIP** (giảm **30.000₫** phí vận chuyển)';
  }
  return 'Mua thêm từ **300.000₫** để được **Freeship** toàn quốc';
}

export function generateNovaCareFallbackReply(
  rawMessage: string,
  context?: SupportContextPayload
): string {
  const q = rawMessage.toLowerCase().trim();
  const customerGreeting = context?.customerName ? ` **${context.customerName}**` : ' bạn';
  const matched = context?.matchedProducts || [];

  // 1. Greeting / Who are you
  if (
    /^(xin chào|chào|hello|hi|hey|alo|shop ơi|ad ơi|có ai không|bạn là ai|tư vấn giúp)/i.test(q) &&
    q.split(/\s+/).length <= 6
  ) {
    return `Xin chào${customerGreeting}! Mình là **CSKH NovaCare** — Chuyên viên CSKH trực tuyến 24/7 của **NovaShop**.\n\nBạn đang quan tâm đến nội dung nào để mình hỗ trợ ngay ạ?\n• **Tư vấn & báo giá sản phẩm** (Điện thoại, Laptop, Tai nghe, Smartwatch, Gaming, Phụ kiện)\n• **Chính sách bảo hành 12–24 tháng** & **1 đổi 1 trong 30 ngày**\n• **Giao hàng hỏa tốc 2 giờ (NovaSpeed)** & **Freeship toàn quốc**\n• **Kho mã giảm giá (Voucher)**, **Trả góp 0%** & kiểm tra đơn hàng`;
  }

  // 2. Warranty & Return policy
  if (
    q.includes('bảo hành') ||
    q.includes('đổi trả') ||
    q.includes('1 đổi 1') ||
    q.includes('sửa chữa') ||
    q.includes('trung tâm bảo hành')
  ) {
    return `Dạ NovaShop cam kết quyền lợi **Bảo hành & Đổi trả chính hãng** tối đa cho${customerGreeting}:\n\n• **Cam kết chính hãng 100%**: Sản phẩm nguyên seal, phân phối chính ngạch, đầy đủ hóa đơn VAT điện tử.\n• **Chính sách 1 đổi 1 trong 30 ngày đầu**: Đổi máy mới 100% miễn phí tận nơi nếu phát sinh lỗi phần cứng từ nhà sản xuất (màn hình, nguồn, pin, camera, loa, kết nối...).\n• **Bảo hành điện tử 12 – 24 tháng**: Tra cứu tự động theo IMEI/Serial hoặc Số điện thoại mua hàng tại toàn bộ Trung tâm bảo hành ủy quyền chính hãng (Apple, Samsung, Sony, Asus, Dell, Xiaomi, Garmin...).\n• **Hỗ trợ vận chuyển bảo hành 2 chiều miễn phí** trên toàn quốc.\n• **Điều kiện đổi trả**: Máy giữ nguyên hộp trùng IMEI, đủ phụ kiện, không rơi vỡ/vào nước và đã thoát tài khoản cá nhân (iCloud/Google).\n\nBạn cần tra cứu bảo hành hay hỗ trợ kỹ thuật có thể liên hệ ngay Hotline **0908 061 843** nhé!`;
  }

  // 3. Shipping & Delivery
  if (
    q.includes('giao hàng') ||
    q.includes('vận chuyển') ||
    q.includes('freeship') ||
    q.includes('phí ship') ||
    q.includes('hỏa tốc') ||
    q.includes('bao lâu nhận được') ||
    q.includes('mấy ngày') ||
    q.includes('đồng kiểm')
  ) {
    return `Dạ thông tin **Vận chuyển & Giao hàng** tại NovaShop dành cho${customerGreeting}:\n\n• **Miễn phí vận chuyển toàn quốc (Freeship)**: Áp dụng tự động cho mọi đơn hàng từ **300.000₫** (hoặc nhập mã **FREESHIP** giảm ngay **30.000₫**). Đơn dưới 300.000₫ phí ship chỉ từ **25.000₫ – 30.000₫**.\n• **Giao Hỏa Tốc 2 Giờ (NovaSpeed)**: Nhận hàng siêu tốc trong **2 – 4 giờ** tại nội thành TP. Hồ Chí Minh & Hà Nội (khung giờ 8:00 – 18:00, phí **65.000₫**).\n• **Giao Tiêu Chuẩn Toàn Quốc**: Nhận hàng sau **1 – 3 ngày làm việc**, đóng gói chống sốc 3 lớp và bảo hiểm hàng hóa 100%.\n• **Đặc quyền Đồng kiểm 100%**: Bạn được mở kiện hàng kiểm tra ngoại quan, tem seal và đúng mẫu mã trước khi thanh toán cho shipper.`;
  }

  // 4. Installment & Payment methods
  if (
    q.includes('trả góp') ||
    q.includes('thanh toán') ||
    q.includes('vietqr') ||
    q.includes('chuyển khoản') ||
    q.includes('thẻ tín dụng') ||
    q.includes('momo') ||
    q.includes('vnpay') ||
    q.includes('cod') ||
    q.includes('lãi suất')
  ) {
    return `Dạ NovaShop hỗ trợ đa dạng **Phương thức Thanh toán & Trả góp 0% lãi suất** cực kỳ tiện lợi:\n\n• **Mua Trả Góp 0% Lãi Suất**:\n  - Qua **Thẻ tín dụng** của hơn 25 ngân hàng (Vietcombank, Techcombank, VPBank, ACB, Sacombank, HSBC...).\n  - Hoặc duyệt hồ sơ **CCCD gắn chip** online trong 3 phút qua công ty tài chính (Home Credit, FE Credit, HD Saison).\n  - Kỳ hạn linh hoạt **3, 6, 9, 12 tháng**, trả trước từ **0% – 30%**.\n• **Các cổng thanh toán trực tuyến & COD**:\n  - **VietQR Napas 24/7**: Quét mã QR ngân hàng xác nhận tự động trong 2 – 5 giây.\n  - **Thẻ Quốc tế (Visa / Mastercard / JCB)**: Bảo mật chuẩn 3D-Secure.\n  - **Ví điện tử MoMo & VNPay-QR**: Thanh toán một chạm trên ứng dụng.\n  - **Thanh toán khi nhận hàng (COD)**: Kiểm tra hàng trước rồi mới thanh toán tiền mặt.`;
  }

  // 5. Vouchers & Promotions
  if (
    q.includes('voucher') ||
    q.includes('mã giảm') ||
    q.includes('khuyến mãi') ||
    q.includes('ưu đãi') ||
    q.includes('giảm giá') ||
    q.includes('code')
  ) {
    const activeVoucherNote = context?.appliedVoucherCode
      ? `\n\nHiện tại trong giỏ hàng bạn đang chọn mã: **${context.appliedVoucherCode}**.`
      : '';
    return `Dạ hiện tại **NovaShop** đang tặng bạn **4 Mã Giảm Giá (Voucher)** cực hấp dẫn có thể áp dụng ngay khi thanh toán:\n\n• **VIP500**: Giảm ngay **500.000₫** cho đơn hàng công nghệ từ **15.000.000₫**.\n• **GIAM10**: Giảm **10%** (tối đa **500.000₫**) cho đơn hàng từ **2.000.000₫**.\n• **NOVATECH**: Giảm ngay **100.000₫** cho mọi đơn hàng từ **500.000₫**.\n• **FREESHIP**: Miễn phí vận chuyển (giảm **30.000₫**) cho đơn hàng từ **300.000₫**.${activeVoucherNote}\n\nBạn có thể bấm nút **Mở Kho Voucher Ưu Đãi** bên dưới để lưu và áp dụng tự động vào giỏ hàng nhé!`;
  }

  // 6. Cart & Order check
  if (
    q.includes('đơn hàng') ||
    q.includes('giỏ hàng') ||
    q.includes('kiểm tra đơn') ||
    q.includes('vận đơn') ||
    q.includes('đã đặt')
  ) {
    const cartText = context?.cartSummary || 'Giỏ hàng đang trống';
    const voucherText = context?.appliedVoucherCode || 'Chưa áp dụng mã giảm giá';
    const orders = context?.recentOrders || [];

    let orderSection = '• **Đơn hàng gần đây**: Bạn chưa có đơn hàng nào được ghi nhận trong phiên này.';
    if (orders.length > 0) {
      const lines = orders
        .slice(0, 3)
        .map(
          (o) =>
            `  - Mã đơn **#${o.id}**: Trạng thái **${o.status}** · Tổng thanh toán **${formatCurrencyVND(o.total)}** (${o.itemNames.join(', ')})`
        )
        .join('\n');
      orderSection = `• **Đơn hàng gần đây của bạn (${orders.length} đơn)**:\n${lines}`;
    }

    return `Dạ mình gửi${customerGreeting} thông tin **Giỏ hàng & Đơn hàng** hiện tại tại NovaShop:\n\n• **Giỏ hàng hiện tại**: ${cartText}\n• **Voucher đang chọn**: **${voucherText}**\n${orderSection}\n\nMẹo tiết kiệm: Nếu giỏ hàng từ **15.000.000₫** bạn nhớ áp mã **VIP500**, từ **2.000.000₫** áp mã **GIAM10** (giảm tới 500.000₫), hoặc từ **500.000₫** áp mã **NOVATECH** (giảm 100.000₫) nhé!`;
  }

  // 7. VAT invoice / Contact / Address
  if (
    q.includes('hóa đơn') ||
    q.includes('vat') ||
    q.includes('địa chỉ') ||
    q.includes('liên hệ') ||
    q.includes('hotline') ||
    q.includes('số điện thoại') ||
    q.includes('ở đâu')
  ) {
    return `Dạ thông tin **Liên hệ & Hỗ trợ Khách hàng** của **NovaShop**:\n\n• **Địa chỉ trụ sở**: 219/20 đường số 12, phường Bình Hưng Hòa, TP. Hồ Chí Minh.\n• **Hotline CSKH & Kỹ thuật 24/7**: **0908 061 843**\n• **Email hỗ trợ**: **support@novashop.vn**\n• **Hóa đơn điện tử**: Hỗ trợ xuất **hóa đơn GTGT (VAT) điện tử 100%** ngay trong ngày cho mọi đơn hàng chính hãng.`;
  }

  // 8. KitchenMini partner query
  if (
    q.includes('kitchenmini') ||
    q.includes('máy xay') ||
    q.includes('máy ép') ||
    q.includes('máy trộn') ||
    q.includes('nhà bếp')
  ) {
    return `Dạ đối tác thiết bị nhà bếp thông minh **KitchenMini** trên NovaShop đang có chương trình **Ưu đãi giảm 15% cho đơn hàng đầu tiên**:\n\n• **Máy Xay Sinh Tố & Máy Xay Cầm Tay**: Giá chỉ từ **269.000₫ – 599.000₫**\n• **Máy Ép Trái Cây & Ép Rau Quả**: Giá từ **599.000₫ – 1.999.000₫** (Phễu thép không gỉ giữ trọn dưỡng chất)\n• **Máy Trộn Bộ Nhôm & Đánh Trứng (1000W–1200W)**: Giá từ **899.000₫ – 1.500.000₫**\n• **Địa chỉ**: Đường Hoàng Diệu 2, Thủ Đức · **SĐT**: **0399032262**\n• **Website đặt hàng**: https://tt03990322.wixsite.com/kitchenmini`;
  }

  // 9. Product inquiry / Recommendation / Pricing
  if (matched.length > 0) {
    const topProducts = matched.slice(0, 3);
    const productBullets = topProducts
      .map((p) => {
        const discountInfo =
          p.originalPrice && p.originalPrice > p.price
            ? ` (Giá gốc ${formatCurrencyVND(p.originalPrice)}, **tiết kiệm ${formatCurrencyVND(p.originalPrice - p.price)}**)`
            : '';
        const feat =
          p.highlights && p.highlights.length > 0 ? ` — ${p.highlights.slice(0, 2).join(', ')}` : '';
        return `• **${p.name}**: Giá ưu đãi **${formatCurrencyVND(p.price)}**${discountInfo} · Đánh giá **${p.rating}★** · Sẵn hàng (${p.stock} máy)${feat}`;
      })
      .join('\n');

    const bestVoucher = suggestBestVoucherForPrice(topProducts[0].price);

    return `Dạ dựa trên yêu cầu của${customerGreeting}, **CSKH NovaCare** xin gợi ý các sản phẩm chính hãng đang có mức giá tốt nhất tại **NovaShop**:\n\n${productBullets}\n\n• **Ưu đãi kèm theo**: ${bestVoucher}, miễn phí vận chuyển toàn quốc và hỗ trợ **Trả góp 0% lãi suất**.\n• **Bảo hành**: Chính hãng **12 – 24 tháng**, **1 đổi 1 trong 30 ngày** nếu có lỗi phần cứng.\n\nBạn có thể nhấn trực tiếp vào thẻ sản phẩm bên dưới để xem thông số chi tiết hoặc thêm vào giỏ hàng nhé!`;
  }

  // 10. General helpful response
  return `Cảm ơn${customerGreeting} đã gửi câu hỏi cho **CSKH NovaCare**! Về nội dung *"${rawMessage}"*, NovaShop xin thông tin nhanh đến bạn:\n\n• **Sản phẩm & Giá bán**: Tất cả thiết bị tại NovaShop đều là hàng chính hãng mới 100%, nguyên seal, đầy đủ VAT và đang giảm giá trực tiếp kèm mã **NOVATECH** (giảm 100K), **GIAM10** (giảm 10% tối đa 500K), **VIP500** (giảm 500K).\n• **Bảo hành & Đổi trả**: Bảo hành chính hãng **12 – 24 tháng**, lỗi **1 đổi 1 trong 30 ngày đầu** tận nơi miễn phí.\n• **Giao hàng & Thanh toán**: **Freeship** đơn từ 300.000₫, giao hỏa tốc 2 giờ tại TP.HCM & Hà Nội, hỗ trợ **VietQR**, **COD** và **Trả góp 0%**.\n\nBạn muốn mình báo giá chi tiết dòng sản phẩm nào (iPhone, Samsung, MacBook, Laptop, Tai nghe, Đồng hồ...) hay kiểm tra đơn hàng, hãy nhắn tên sản phẩm ngay nhé!`;
}

async function generateGeminiSupportReply(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const callModel = async (model: string, thinkingLevel?: ThinkingLevel): Promise<string> => {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
      },
    });
    const text = response?.text?.trim();
    if (!text) {
      throw new Error(`Empty response from ${model}`);
    }
    return text;
  };

  const overallTimeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini upstream timeout exceeded 3.2s')), 3200)
  );

  const attemptChain = (async () => {
    try {
      return await callModel('gemini-3.1-flash-lite', ThinkingLevel.MINIMAL);
    } catch {
      return await callModel('gemini-3.8-flash', ThinkingLevel.LOW);
    }
  })();

  return Promise.race([attemptChain, overallTimeout]);
}

interface QrPaymentSession {
  orderId: string;
  expectedAmount: number;
  accountNumber: string;
  accountHolder: string;
  bankCode: string;
  startedAt: number;
  pollCount: number;
  status: 'PENDING' | 'PAID';
  paidAmount?: number;
  transactionId?: string;
  paidAt?: string;
}

const qrPaymentSessions = new Map<string, QrPaymentSession>();
const qrSseClients = new Map<string, Set<Response>>();

function normalizeOrderRef(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function broadcastQrPaymentConfirmed(session: QrPaymentSession) {
  const clients = qrSseClients.get(session.orderId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify({
    verified: true,
    status: 'PAID',
    orderId: session.orderId,
    paidAmount: session.paidAmount,
    expectedAmount: session.expectedAmount,
    transactionId: session.transactionId,
    paidAt: session.paidAt,
    message: `Đã nhận chuyển khoản thành công ${formatCurrencyVND(session.expectedAmount)} vào TK ${session.accountNumber} (${session.accountHolder} - ${session.bankCode}). Hệ thống tự động xác nhận đơn hàng!`,
  });

  for (const res of clients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
}

async function checkExternalBankTransactions(
  orderId: string,
  expectedAmount: number
): Promise<{ matched: boolean; transactionId?: string }> {
  const cleanRef = normalizeOrderRef(orderId);
  const orderDigits = orderId.replace(/\D/g, '');

  // 1. Check SePay live API if configured
  if (process.env.SEPAY_API_KEY) {
    try {
      const resp = await fetch(
        'https://my.sepay.vn/userapi/transactions/list?account_number=3180530681&limit=20',
        {
          headers: {
            Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          transactions?: Array<{
            id?: string;
            reference_number?: string;
            amount_in?: string | number;
            transaction_content?: string;
          }>;
        };
        const list = data.transactions || [];
        for (const tx of list) {
          const amountIn = Math.round(Number(tx.amount_in) || 0);
          const contentNorm = normalizeOrderRef(String(tx.transaction_content || ''));
          const refMatched =
            contentNorm.includes(cleanRef) ||
            cleanRef.includes(contentNorm) ||
            (orderDigits.length >= 5 && contentNorm.includes(orderDigits));
          if (amountIn >= expectedAmount && refMatched) {
            return {
              matched: true,
              transactionId: String(tx.reference_number || tx.id || `BIDV-${Date.now().toString().slice(-8)}`),
            };
          }
        }
      }
    } catch (err) {
      console.warn('SePay API check error:', err);
    }
  }

  // 2. Check Casso live API if configured
  if (process.env.CASSO_API_KEY) {
    try {
      const resp = await fetch('https://oauth.casso.vn/v2/transactions?pageSize=20&sort=DESC', {
        headers: {
          Authorization: `Apikey ${process.env.CASSO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (resp.ok) {
        const data = (await resp.json()) as {
          data?: {
            records?: Array<{
              tid?: string;
              amount?: number;
              description?: string;
            }>;
          };
        };
        const records = data.data?.records || [];
        for (const rec of records) {
          const amountIn = Math.round(Number(rec.amount) || 0);
          const descNorm = normalizeOrderRef(String(rec.description || ''));
          const refMatched =
            descNorm.includes(cleanRef) ||
            cleanRef.includes(descNorm) ||
            (orderDigits.length >= 5 && descNorm.includes(orderDigits));
          if (amountIn >= expectedAmount && refMatched) {
            return {
              matched: true,
              transactionId: String(rec.tid || `BIDV-${Date.now().toString().slice(-8)}`),
            };
          }
        }
      }
    } catch (err) {
      console.warn('Casso API check error:', err);
    }
  }

  return { matched: false };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Start / Register an active QR Payment Session when customer opens VietQR on Step 2
  app.post('/api/payment/qr-session/start', (req: Request, res: Response) => {
    const { orderId, expectedAmount, accountNumber, accountHolder, bankCode } = req.body as {
      orderId?: string;
      expectedAmount?: number;
      accountNumber?: string;
      accountHolder?: string;
      bankCode?: string;
    };

    const cleanOrderId = String(orderId || '').trim();
    const targetAmount = Math.round(Number(expectedAmount) || 0);
    if (!cleanOrderId || targetAmount <= 0) {
      res.status(400).json({ error: 'Thiếu mã đơn hàng hoặc số tiền thanh toán.' });
      return;
    }

    const existing = qrPaymentSessions.get(cleanOrderId);
    if (!existing || existing.expectedAmount !== targetAmount || existing.status !== 'PAID') {
      qrPaymentSessions.set(cleanOrderId, {
        orderId: cleanOrderId,
        expectedAmount: targetAmount,
        accountNumber: accountNumber || '3180530681',
        accountHolder: accountHolder || 'TRUONG MINH QUOC TRI',
        bankCode: bankCode || 'BIDV',
        startedAt: Date.now(),
        pollCount: 0,
        status: 'PENDING',
      });
    }

    const session = qrPaymentSessions.get(cleanOrderId)!;
    res.json({
      ok: true,
      orderId: session.orderId,
      expectedAmount: session.expectedAmount,
      status: session.status,
    });
  });

  // Server-Sent Events (SSE) stream for instant 0ms automatic order confirmation on the client
  app.get('/api/payment/qr-stream', (req: Request, res: Response) => {
    const orderId = String(req.query.orderId || '').trim();
    if (!orderId) {
      res.status(400).end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let clients = qrSseClients.get(orderId);
    if (!clients) {
      clients = new Set<Response>();
      qrSseClients.set(orderId, clients);
    }
    clients.add(res);

    const existing = qrPaymentSessions.get(orderId);
    if (existing && existing.status === 'PAID') {
      broadcastQrPaymentConfirmed(existing);
    }

    req.on('close', () => {
      clients?.delete(res);
      if (clients && clients.size === 0) {
        qrSseClients.delete(orderId);
      }
    });
  });

  // VietQR.io Official Standard: OAuth/Basic Token Generation Endpoint (POST /api/token_generate)
  // VietQR.io calls this endpoint first with Basic Auth before pushing transaction webhooks
  app.post('/api/token_generate', (req: Request, res: Response) => {
    const authHeader = String(req.headers.authorization || '');
    const configuredUser = process.env.VIETQR_WEBHOOK_USERNAME;
    const configuredPass = process.env.VIETQR_WEBHOOK_PASSWORD;

    if (configuredUser && configuredPass && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.slice(6).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');
      if (username !== configuredUser || password !== configuredPass) {
        res.status(401).json({
          status: 'FAILED',
          message: 'Invalid Basic Authentication credentials',
        });
        return;
      }
    }

    const tokenPayload = Buffer.from(`novashop-vietqr:${Date.now()}`).toString('base64');
    res.json({
      status: 'SUCCESS',
      message: 'Successful',
      access_token: tokenPayload,
      token_type: 'Bearer',
      expires_in: 300,
    });
  });

  // Real-time Bank Transfer Webhook Handler (POST /webhook & POST /api/webhook)
  // Supports custom JSON payloads ({ amount, content, orderId, transactionId }), VietQR.io, SePay, and Casso
  const handleBankWebhook = (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const transactions: Array<{
        amount: number;
        content: string;
        orderId?: string;
        txId: string;
      }> = [];

      // Helper to extract order code (e.g. DH482910 or NOVA-849201) from transfer description
      const extractOrderIdFromText = (text: string): string | undefined => {
        const dhMatch = String(text || '').match(/DH[-_\s]?(\d{4,12})/i);
        if (dhMatch) return `DH${dhMatch[1]}`;
        const novaMatch = String(text || '').match(/NOVA[-_\s]?(\d{4,12})/i);
        return novaMatch ? `NOVA-${novaMatch[1]}` : undefined;
      };

      // 1. Direct JSON / VietQR.io / SePay single transaction format
      const rawAmount =
        body.amount ??
        body.transferAmount ??
        body.soTien ??
        body.so_tien ??
        body.totalAmount;

      const rawContent =
        body.content ??
        body.description ??
        body.addInfo ??
        body.noiDung ??
        body.noi_dung ??
        body.transferContent ??
        '';

      const rawOrderId =
        body.orderId ??
        body.order_id ??
        body.maDonHang ??
        body.ma_don_hang ??
        body.orderCode ??
        extractOrderIdFromText(String(rawContent));

      if (
        rawAmount !== undefined ||
        rawOrderId !== undefined ||
        body.transactionid !== undefined ||
        body.referencenumber !== undefined
      ) {
        transactions.push({
          amount: Math.round(Number(rawAmount) || 0),
          content: String(rawContent || rawOrderId || ''),
          orderId: rawOrderId ? String(rawOrderId).trim() : undefined,
          txId: String(
            body.transactionId ||
              body.transactionid ||
              body.referencenumber ||
              body.referenceCode ||
              body.maGiaoDich ||
              body.id ||
              `BIDV-${Date.now().toString().slice(-8)}`
          ),
        });
      }

      // 2. Casso / batch array format: { error: 0, data: [ { amount, description, tid, when } ] }
      if (Array.isArray(body.data)) {
        for (const item of body.data) {
          const itemContent = String(
            item.description || item.content || item.noiDung || item.orderId || ''
          );
          const itemOrderId =
            item.orderId ||
            item.order_id ||
            item.maDonHang ||
            extractOrderIdFromText(itemContent);

          transactions.push({
            amount: Math.round(Number(item.amount ?? item.transferAmount ?? item.soTien) || 0),
            content: itemContent,
            orderId: itemOrderId ? String(itemOrderId).trim() : undefined,
            txId: String(
              item.tid ||
                item.transactionId ||
                item.referencenumber ||
                item.referenceCode ||
                item.id ||
                `BIDV-${Date.now().toString().slice(-8)}`
            ),
          });
        }
      }

      const confirmedOrders: string[] = [];
      const updatedOrderRecords: Array<{
        orderId: string;
        status: string;
        orderStatus: string;
        paidAmount: number;
        transactionId: string;
        paidAt: string;
      }> = [];

      for (const tx of transactions) {
        const normContent = normalizeOrderRef(tx.content);
        const normExplicitOrder = tx.orderId ? normalizeOrderRef(tx.orderId) : '';

        let matchedAny = false;
        for (const session of qrPaymentSessions.values()) {
          const normOrder = normalizeOrderRef(session.orderId);
          const orderDigits = session.orderId.replace(/\D/g, '');
          const refMatched =
            (normExplicitOrder && normOrder === normExplicitOrder) ||
            normContent.includes(normOrder) ||
            (orderDigits.length >= 5 && normContent.includes(orderDigits));

          const amountValid = tx.amount > 0 ? tx.amount >= session.expectedAmount : true;

          if (refMatched && amountValid) {
            session.status = 'PAID';
            session.paidAmount = tx.amount > 0 ? tx.amount : session.expectedAmount;
            session.transactionId = tx.txId;
            session.paidAt = new Date().toISOString();
            if (!confirmedOrders.includes(session.orderId)) {
              confirmedOrders.push(session.orderId);
            }
            updatedOrderRecords.push({
              orderId: session.orderId,
              status: 'PAID',
              orderStatus: 'đã thanh toán',
              paidAmount: session.paidAmount,
              transactionId: session.transactionId,
              paidAt: session.paidAt,
            });
            broadcastQrPaymentConfirmed(session);
            matchedAny = true;
          }
        }

        // If webhook explicitly provides an orderId (or NOVA-xxx in content) not yet in memory, create & mark as PAID
        if (!matchedAny && tx.orderId) {
          const cleanOrderId = tx.orderId.toUpperCase();
          const paidAmount = tx.amount > 0 ? tx.amount : 0;
          const paidAt = new Date().toISOString();
          const newSession: QrPaymentSession = {
            orderId: cleanOrderId,
            expectedAmount: paidAmount,
            accountNumber: String(body.bankaccount || body.accountNumber || '3180530681'),
            accountHolder: 'TRUONG MINH QUOC TRI',
            bankCode: 'BIDV',
            startedAt: Date.now(),
            pollCount: 1,
            status: 'PAID',
            paidAmount,
            transactionId: tx.txId,
            paidAt,
          };
          qrPaymentSessions.set(cleanOrderId, newSession);
          confirmedOrders.push(cleanOrderId);
          updatedOrderRecords.push({
            orderId: cleanOrderId,
            status: 'PAID',
            orderStatus: 'đã thanh toán',
            paidAmount,
            transactionId: tx.txId,
            paidAt,
          });
          broadcastQrPaymentConfirmed(newSession);
          matchedAny = true;
        }

        // Fallback: if bank truncated transfer description, match active pending session from last 15m with exact amount
        if (!matchedAny && tx.amount > 0) {
          const recentPending = Array.from(qrPaymentSessions.values())
            .filter(
              (s) =>
                s.status === 'PENDING' &&
                s.expectedAmount === tx.amount &&
                Date.now() - s.startedAt < 15 * 60 * 1000
            )
            .sort((a, b) => b.startedAt - a.startedAt)[0];

          if (recentPending) {
            recentPending.status = 'PAID';
            recentPending.paidAmount = tx.amount;
            recentPending.transactionId = tx.txId;
            recentPending.paidAt = new Date().toISOString();
            confirmedOrders.push(recentPending.orderId);
            updatedOrderRecords.push({
              orderId: recentPending.orderId,
              status: 'PAID',
              orderStatus: 'đã thanh toán',
              paidAmount: recentPending.paidAmount,
              transactionId: recentPending.transactionId,
              paidAt: recentPending.paidAt,
            });
            broadcastQrPaymentConfirmed(recentPending);
          }
        }
      }

      // Return HTTP 200 status with updated order info + VietQR.io / SePay / Casso compatibility
      res.status(200).json({
        success: true,
        status: 200,
        orderStatus: confirmedOrders.length > 0 ? 'đã thanh toán' : 'đã ghi nhận giao dịch',
        paymentStatus: confirmedOrders.length > 0 ? 'PAID' : 'RECEIVED',
        confirmedOrders,
        orders: updatedOrderRecords,
        error: false,
        errorReason: null,
        toastMessage:
          confirmedOrders.length > 0
            ? `Đã cập nhật trạng thái đơn hàng ${confirmedOrders.join(', ')} thành 'đã thanh toán'`
            : 'Đã ghi nhận thông tin giao dịch từ webhook ngân hàng',
        object: {
          reftransactionid: confirmedOrders[0] || transactions[0]?.txId || `NOVA-${Date.now()}`,
        },
      });
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({
        error: true,
        errorReason: 'INTERNAL_SERVER_ERROR',
        toastMessage: 'Lỗi xử lý webhook',
        success: false,
      });
    }
  };

  // Primary Bank Payment Webhook Endpoints
  app.post('/webhook', handleBankWebhook);
  app.post('/api/webhook', handleBankWebhook);
  app.post('/api/payment/webhook', handleBankWebhook);
  app.post('/api/payment/vietqr-webhook', handleBankWebhook);
  app.post('/bank/api/transaction-sync', handleBankWebhook);
  app.post('/api/transaction-sync', handleBankWebhook);
  app.post('/api/payment/sepay-webhook', handleBankWebhook);
  app.post('/api/payment/casso-webhook', handleBankWebhook);

  // List all confirmed QR payment transactions with real-time timestamp and transaction ID
  app.get('/api/payment/qr-transactions', (_req: Request, res: Response) => {
    const confirmedList = Array.from(qrPaymentSessions.values())
      .filter((s) => s.status === 'PAID' && s.transactionId)
      .sort((a, b) => {
        const tA = a.paidAt ? new Date(a.paidAt).getTime() : a.startedAt;
        const tB = b.paidAt ? new Date(b.paidAt).getTime() : b.startedAt;
        return tB - tA;
      })
      .map((s) => ({
        orderId: s.orderId,
        transactionId: s.transactionId,
        amount: s.paidAmount ?? s.expectedAmount,
        confirmedAt: s.paidAt || new Date(s.startedAt).toISOString(),
        accountNumber: s.accountNumber,
        accountHolder: s.accountHolder,
        bankCode: s.bankCode,
        bankName: 'BIDV - PGD Tân Sơn Nhì',
        transferContent: s.orderId,
      }));

    res.json({
      transactions: confirmedList,
    });
  });

  // Automatic Real-Time Polling Endpoint for VietQR Bank Transaction Status (No timer auto-completion)
  app.get('/api/payment/qr-status', async (req: Request, res: Response) => {
    try {
      const orderId = String(req.query.orderId || '').trim();
      const expectedAmount = Math.round(Number(req.query.expectedAmount) || 0);

      if (!orderId || expectedAmount <= 0) {
        res.status(400).json({
          verified: false,
          status: 'INVALID',
          message: 'Thông tin phiên thanh toán QR không hợp lệ.',
        });
        return;
      }

      let session = qrPaymentSessions.get(orderId);
      if (!session || session.expectedAmount !== expectedAmount) {
        session = {
          orderId,
          expectedAmount,
          accountNumber: '3180530681',
          accountHolder: 'TRUONG MINH QUOC TRI',
          bankCode: 'BIDV',
          startedAt: Date.now(),
          pollCount: 0,
          status: 'PENDING',
        };
        qrPaymentSessions.set(orderId, session);
      }

      session.pollCount += 1;

      // 1. Check if session was marked PAID via Bank Webhook (VietQR.io / SePay / Casso) or verified bank transaction
      if (session.status === 'PAID' && session.paidAmount === expectedAmount) {
        res.json({
          verified: true,
          status: 'PAID',
          orderId: session.orderId,
          paidAmount: session.paidAmount,
          expectedAmount: session.expectedAmount,
          transactionId: session.transactionId,
          paidAt: session.paidAt,
          message: `Hệ thống đã xác nhận giao dịch chuyển khoản ${formatCurrencyVND(expectedAmount)} vào TK ${session.accountNumber} (${session.accountHolder} - ${session.bankCode}). Đang hoàn tất đơn hàng!`,
        });
        return;
      }

      // 2. Actively query external bank transaction APIs (SePay / Casso) if API keys are configured
      const hasExternalBankKey = Boolean(process.env.SEPAY_API_KEY || process.env.CASSO_API_KEY);
      if (hasExternalBankKey) {
        const extResult = await checkExternalBankTransactions(orderId, expectedAmount);
        if (extResult.matched) {
          session.status = 'PAID';
          session.paidAmount = expectedAmount;
          session.transactionId = extResult.transactionId || `FT${Date.now().toString().slice(-10)}`;
          session.paidAt = new Date().toISOString();
          broadcastQrPaymentConfirmed(session);

          res.json({
            verified: true,
            status: 'PAID',
            orderId: session.orderId,
            paidAmount: session.paidAmount,
            expectedAmount: session.expectedAmount,
            transactionId: session.transactionId,
            paidAt: session.paidAt,
            message: `Hệ thống đã xác nhận giao dịch chuyển khoản ${formatCurrencyVND(expectedAmount)} vào TK ${session.accountNumber} (${session.accountHolder} - ${session.bankCode}). Đang hoàn tất đơn hàng!`,
          });
          return;
        }
      }

      // 3. Otherwise remain in PENDING state indefinitely until a real bank transaction is detected (no timer auto-completion)
      res.json({
        verified: false,
        status: 'PENDING',
        orderId: session.orderId,
        expectedAmount: session.expectedAmount,
        hasLiveBankWebhook: hasExternalBankKey,
        message: `Đang kiểm tra giao dịch qua Ngân hàng BIDV (STK: ${session.accountNumber} - ${session.accountHolder}) • Số tiền: ${formatCurrencyVND(expectedAmount)} • Nội dung: ${orderId}. Giao diện chỉ tự động xác nhận và đóng khi ghi nhận giao dịch thành công.`,
      });
    } catch (err) {
      console.error('QR status check error:', err);
      res.status(500).json({
        verified: false,
        status: 'ERROR',
        message: 'Đang kết nối lại hệ thống đối soát tự động...',
      });
    }
  });

  // Confirm QR transfer after customer has actually completed the transfer in their banking app
  app.post('/api/payment/confirm-qr-transfer', (req: Request, res: Response) => {
    try {
      const { orderId, expectedAmount, transferredAmount, transactionReference } = req.body as {
        orderId?: string;
        expectedAmount?: number;
        transferredAmount?: number;
        transactionReference?: string;
      };

      const cleanOrderId = String(orderId || '').trim();
      const targetAmount = Math.round(Number(expectedAmount) || 0);
      const actualAmount = Math.round(Number(transferredAmount ?? expectedAmount) || 0);

      if (!cleanOrderId || targetAmount <= 0) {
        res.status(400).json({
          verified: false,
          message: 'Thiếu thông tin mã đơn hàng hoặc số tiền cần đối soát.',
        });
        return;
      }

      if (actualAmount !== targetAmount) {
        res.status(400).json({
          verified: false,
          message: `Số tiền xác nhận chuyển khoản (${formatCurrencyVND(actualAmount)}) không khớp với số tiền của đơn hàng (${formatCurrencyVND(targetAmount)}). Đơn hàng chỉ được xác nhận khi chuyển khoản đúng số tiền!`,
        });
        return;
      }

      const cleanTxRef = String(transactionReference || '').trim().toUpperCase();
      const numericOrderSuffix = cleanOrderId.replace(/\D/g, '') || Date.now().toString().slice(-6);
      const resolvedTxId = cleanTxRef || `FT${Date.now().toString().slice(-6)}${numericOrderSuffix}`;
      const paidAtIso = new Date().toISOString();

      let session = qrPaymentSessions.get(cleanOrderId);
      if (!session) {
        session = {
          orderId: cleanOrderId,
          expectedAmount: targetAmount,
          accountNumber: '3180530681',
          accountHolder: 'TRUONG MINH QUOC TRI',
          bankCode: 'BIDV',
          startedAt: Date.now(),
          pollCount: 1,
          status: 'PAID',
          paidAmount: targetAmount,
          transactionId: resolvedTxId,
          paidAt: paidAtIso,
        };
        qrPaymentSessions.set(cleanOrderId, session);
      } else {
        session.status = 'PAID';
        session.paidAmount = targetAmount;
        session.transactionId = resolvedTxId;
        session.paidAt = paidAtIso;
      }

      broadcastQrPaymentConfirmed(session);

      res.json({
        verified: true,
        status: 'PAID',
        orderId: session.orderId,
        paidAmount: session.paidAmount,
        expectedAmount: session.expectedAmount,
        transactionId: session.transactionId,
        paidAt: session.paidAt,
        message: `Đã xác nhận giao dịch chuyển khoản ${formatCurrencyVND(targetAmount)} (Mã GD: ${resolvedTxId}) vào TK ${session.accountNumber} (${session.accountHolder} - BIDV).`,
      });
    } catch (err) {
      console.error('Confirm QR Transfer Error:', err);
      res.status(500).json({
        verified: false,
        message: 'Không thể xác nhận giao dịch lúc này. Vui lòng thử lại.',
      });
    }
  });

  app.post('/api/payment/verify-qr-receipt', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, expectedAmount, orderId } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        expectedAmount?: number;
        orderId?: string;
      };

      const targetAmount = Number(expectedAmount) || 0;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({
          verified: false,
          message: 'Vui lòng tải lên hình ảnh biên lai chuyển khoản để hệ thống kiểm tra.',
        });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      if (process.env.GEMINI_API_KEY) {
        const prompt = `Bạn là hệ thống đối soát biên lai chuyển khoản ngân hàng tự động của NovaShop.
Hãy phân tích hình ảnh được tải lên và kiểm tra xem đây có phải là BIÊN LAI CHUYỂN KHOẢN THÀNH CÔNG (màn hình báo giao dịch thành công từ ứng dụng ngân hàng hoặc ví điện tử) hay không.

Thông tin tài khoản nhận tiền chuẩn của cửa hàng:
- Chủ tài khoản nhận: TRUONG MINH QUOC TRI (hoặc TRƯƠNG MINH QUỐC TRÍ)
- Số tài khoản nhận: 3180530681
- Ngân hàng nhận: BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam - PGD Tân Sơn Nhì)
- Số tiền cần thanh toán chính xác: ${targetAmount} VNĐ (${formatCurrencyVND(targetAmount)})
- Mã đơn hàng tham chiếu: ${orderId || 'NOVA'}

LƯU Ý QUAN TRỌNG:
1. Nếu ảnh tải lên chỉ là ảnh chụp Mã QR nhận tiền ("Mã QR của tôi", chưa phải màn hình biên lai đã chuyển tiền thành công) hoặc ảnh bất kỳ không phải biên lai giao dịch thành công -> đặt "isReceipt": false.
2. Trích xuất chính xác số tiền đã chuyển trên biên lai (chỉ lấy số nguyên VNĐ, ví dụ 32990000) vào trường "detectedAmount".
3. Kiểm tra xem người nhận / tài khoản nhận trên biên lai có khớp với "3180530681" hoặc "TRUONG MINH QUOC TRI" / "BIDV" hay không -> đặt "recipientMatched": true/false.
4. Trích xuất mã giao dịch trên biên lai (nếu có) vào "transactionId".

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc:
{
  "isReceipt": boolean,
  "recipientMatched": boolean,
  "detectedAmount": number,
  "transactionId": string,
  "reason": string
}`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: cleanBase64,
                      mimeType: mimeType || 'image/jpeg',
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
            config: {
              temperature: 0.1,
            },
          });

          const rawText = response?.text?.trim() || '';
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const isReceipt = Boolean(parsed.isReceipt);
            const recipientMatched = parsed.recipientMatched !== false;
            const detectedAmount = Number(parsed.detectedAmount) || 0;
            const txId =
              typeof parsed.transactionId === 'string' && parsed.transactionId.trim()
                ? parsed.transactionId.trim()
                : `VQR-${Date.now().toString().slice(-8)}`;

            if (!isReceipt) {
              res.json({
                verified: false,
                message:
                  parsed.reason ||
                  'Hình ảnh tải lên không phải là biên lai chuyển khoản thành công (hoặc là ảnh mã QR). Vui lòng tải lên ảnh chụp màn hình biên lai sau khi đã chuyển tiền thành công!',
              });
              return;
            }

            if (!recipientMatched) {
              res.json({
                verified: false,
                message:
                  'Biên lai không khớp với tài khoản thụ hưởng TRUONG MINH QUOC TRI (STK: 3180530681 - BIDV). Vui lòng kiểm tra lại đúng mã QR thanh toán!',
              });
              return;
            }

            if (detectedAmount !== targetAmount) {
              res.json({
                verified: false,
                detectedAmount,
                message:
                  detectedAmount > 0
                    ? `Số tiền trên biên lai (${formatCurrencyVND(detectedAmount)}) không khớp với giá tiền cần thanh toán của đơn hàng (${formatCurrencyVND(targetAmount)}). Đơn hàng chỉ được xác nhận khi thanh toán đúng số tiền tương ứng!`
                    : `Không nhận diện được số tiền khớp với giá trị đơn hàng (${formatCurrencyVND(targetAmount)}) trên biên lai. Vui lòng kiểm tra lại!`,
              });
              return;
            }

            const paidAtIso = new Date().toISOString();
            const cleanOrderId = String(orderId || '').trim();
            if (cleanOrderId) {
              const session = qrPaymentSessions.get(cleanOrderId) || {
                orderId: cleanOrderId,
                expectedAmount: targetAmount,
                accountNumber: '3180530681',
                accountHolder: 'TRUONG MINH QUOC TRI',
                bankCode: 'BIDV',
                startedAt: Date.now(),
                pollCount: 1,
                status: 'PAID' as const,
              };
              session.status = 'PAID';
              session.paidAmount = targetAmount;
              session.transactionId = txId;
              session.paidAt = paidAtIso;
              qrPaymentSessions.set(cleanOrderId, session);
              broadcastQrPaymentConfirmed(session);
            }

            res.json({
              verified: true,
              detectedAmount,
              transactionId: txId,
              paidAt: paidAtIso,
              message: `Đã đối soát biên lai hợp lệ: Chuyển khoản thành công ${formatCurrencyVND(targetAmount)} đến TRUONG MINH QUOC TRI (3180530681 - BIDV).`,
            });
            return;
          }
        } catch (visionErr) {
          console.warn('Gemini vision receipt check fallback:', visionErr);
        }
      }

      res.json({
        verified: false,
        requireManualConfirm: true,
        message:
          'Vui lòng nhập chính xác số tiền đã chuyển và mã giao dịch ngân hàng bên dưới để hoàn tất đối soát.',
      });
    } catch (err) {
      console.error('Verify QR Receipt Error:', err);
      res.status(500).json({
        verified: false,
        message: 'Có lỗi khi kiểm tra biên lai. Vui lòng thử lại hoặc xác nhận bằng mã giao dịch.',
      });
    }
  });

  app.post('/api/customer-support/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, context } = req.body as {
        message?: string;
        history?: ChatTurn[];
        context?: SupportContextPayload;
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
        return;
      }

      const trimmedMessage = message.trim();
      const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
      const contents = [
        ...safeHistory.map((turn) => ({
          role: turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(turn.text || '') }],
        })),
        {
          role: 'user',
          parts: [{ text: trimmedMessage }],
        },
      ];

      const systemInstruction = NOVASHOP_SYSTEM_INSTRUCTION + buildDynamicContextText(context);

      let replyText: string;
      try {
        replyText = await generateGeminiSupportReply(contents, systemInstruction);
      } catch (aiError) {
        console.warn(
          'Gemini upstream unavailable or rate-limited, using NovaCare smart knowledge responder:',
          aiError instanceof Error ? aiError.message : aiError
        );
        replyText = generateNovaCareFallbackReply(trimmedMessage, context);
      }

      res.json({
        reply: replyText,
      });
    } catch (error: any) {
      console.error('Customer Support Chat Endpoint Error:', error);
      const fallbackMessage =
        typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      res.json({
        reply: generateNovaCareFallbackReply(fallbackMessage, req.body?.context),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaShop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
