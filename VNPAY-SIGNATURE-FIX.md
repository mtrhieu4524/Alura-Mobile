# Fix: VNPAY "Chữ ký không hợp lệ" trên Mobile

## 🚨 Vấn đề
Mobile app báo lỗi **"Thanh toán thất bại - Chữ ký không hợp lệ"** khi thanh toán VNPAY thành công.

## 🔍 Nguyên nhân
1. **Mobile app đang tự validate signature** với `vnpayService.handlePaymentResult()`
2. **Hash secret có thể sai** hoặc **algorithm khác với backend**
3. **Security risk**: Hash secret không nên có ở client side

## ✅ Giải pháp đã áp dụng

### 1. **Loại bỏ client-side signature validation**
```javascript
// TRƯỚC (SAI):
const paymentResult = vnpayService.handlePaymentResult(params);
if (paymentResult.success) {
  // Validate signature ở client
}

// SAU (ĐÚNG):
if (params.vnp_ResponseCode === '00') {
  // Chỉ check response code
  handleOrderSuccess();
}
```

### 2. **Chỉ dựa vào vnp_ResponseCode**
- `'00'` = Thành công
- Các mã khác = Thất bại
- Backend sẽ verify signature qua IPN

### 3. **Cải thiện error handling**
```javascript
const errorMessages = {
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản không đủ số dư', 
  '65': 'Vượt quá hạn mức giao dịch',
  '75': 'Ngân hàng đang bảo trì',
  '99': 'Lỗi không xác định'
};
```

### 4. **Thêm debug logs**
- `=== VNPAY SUCCESS HANDLER ===`
- `=== VNPAY ERROR HANDLER ===`
- Chi tiết callback parameters

## 🔐 Security Architecture

### Mobile App (Client):
- ❌ **KHÔNG** validate signature
- ❌ **KHÔNG** có hash secret
- ✅ Chỉ check `vnp_ResponseCode`
- ✅ Handle UX success/error

### Backend (Server):
- ✅ Tạo signature khi tạo payment URL
- ✅ Verify signature từ VNPAY IPN
- ✅ Update database/order status
- ✅ Secure hash secret storage

## 🧪 Test với Debug Button

Thêm vào checkout screen để test:
```javascript
import VNPayDebugButton from '../components/debug/VNPayDebugButton';

// Trong render:
<VNPayDebugButton />
```

## 📋 Files đã sửa

1. **`src/screens/CheckoutScreen.js`**
   - Loại bỏ `vnpayService.handlePaymentResult()`
   - Chỉ check `vnp_ResponseCode === '00'`

2. **`src/services/orderService.js`**
   - Cải thiện error handling
   - Thêm validation cho payment URL
   - Thêm method `verifyVNPayCallback()` (optional)

3. **`src/components/debug/VNPayDebugButton.js`** (mới)
   - Debug tool để test API

## ✅ Kết quả mong đợi

- ✅ VNPAY thanh toán thành công → App hiển thị success
- ✅ VNPAY thanh toán thất bại → App hiển thị error với message rõ ràng  
- ✅ Không còn lỗi "Chữ ký không hợp lệ"
- ✅ Security: Hash secret chỉ ở backend

## 🔧 Troubleshooting

### Nếu vẫn lỗi:
1. **Check backend**: Đảm bảo API `/order/prepare-vnpay` và `/payment/vnpay/createPaymentUrl` hoạt động
2. **Check console logs**: Xem chi tiết response từ backend
3. **Test debug button**: Dùng VNPayDebugButton để test API
4. **Check network**: Đảm bảo `http://10.0.2.2:4000` accessible từ emulator

### Backend cần có:
- Endpoint tạo payment URL với signature đúng
- Endpoint nhận IPN từ VNPAY để verify chính thức
- Hash secret và TMN code từ VNPAY merchant account 