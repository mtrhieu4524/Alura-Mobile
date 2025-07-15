# Tích hợp VNPAY cho React Native - Alura Mobile

## Tổng quan
Dự án đã tích hợp thành công thanh toán VNPAY thông qua WebView, phù hợp với flow của ứng dụng web.

## Kiến trúc tích hợp

### 1. Components đã tạo
- **VNPayWebView**: Component xử lý giao diện thanh toán
- **vnpayService**: Service xử lý logic thanh toán (chỉ để reference, thực tế dùng API backend)
- **orderService**: Service gọi API backend cho order và payment

### 2. Flow thanh toán

#### COD (Cash on Delivery)
```
CheckoutScreen → orderService.createOrder() → API: /order/place → Success
```

#### VNPAY
```
CheckoutScreen → orderService.prepareVNPayOrder() → API: /order/prepare-vnpay
                ↓
              orderService.createVNPayPaymentUrl() → API: /payment/vnpay/createPaymentUrl
                ↓
              VNPayWebView → VNPAY Gateway → Callback → Success/Error
```

## Cấu hình

### 1. File cấu hình: `src/config/vnpay.js`
```javascript
export const VNPAY_CONFIG = {
  TMN_CODE: 'YOUR_TMN_CODE',     // Cập nhật từ VNPAY
  HASH_SECRET: 'YOUR_HASH_SECRET', // Cập nhật từ VNPAY
  URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  RETURN_URL: 'alura://vnpay-return',
};
```

### 2. Environment Configuration
- API Base URL được cấu hình trong `src/config/environment.js`
- Cần cập nhật `config.baseUrl` để trỏ đến server backend

## API Endpoints

### Backend API endpoints cần thiết:
1. **POST** `/order/place` - Tạo đơn hàng COD
2. **POST** `/order/prepare-vnpay` - Chuẩn bị đơn hàng cho VNPAY
3. **POST** `/payment/vnpay/createPaymentUrl` - Tạo URL thanh toán VNPAY
4. **GET** `/payment/vnpay/return` - Xử lý callback từ VNPAY (cho web)

### Request format:
```javascript
// COD Order
{
  "shippingAddress": "địa chỉ",
  "shippingMethod": "STANDARD|EXPRESS", 
  "promotionId": null,
  "note": "ghi chú",
  "phoneNumber": "số điện thoại",
  "paymentMethod": "COD",
  "selectedCartItemIds": ["cartItemId1", "cartItemId2"]
}

// VNPAY Prepare
{
  "shippingAddress": "địa chỉ",
  "shippingMethod": "STANDARD|EXPRESS",
  "promotionId": null, 
  "note": "ghi chú",
  "phoneNumber": "số điện thoại",
  "selectedCartItemIds": ["cartItemId1", "cartItemId2"]
}
```

## Files đã sửa đổi

### 1. `src/services/orderService.js`
- Thêm `prepareVNPayOrder()` method
- Thêm `createVNPayPaymentUrl()` method  
- Cập nhật `createOrder()` để sử dụng đúng endpoint và format

### 2. `src/screens/CheckoutScreen.js`
- Tách logic COD và VNPAY
- Thêm VNPayWebView Modal
- Cập nhật flow xử lý thanh toán
- Sử dụng cart item IDs thay vì product IDs

### 3. `src/components/payment/VNPayWebView.js` (mới)
- Component WebView để hiển thị VNPAY
- Xử lý callback và navigation states
- UI/UX phù hợp với mobile

### 4. `src/services/vnpayService.js` (mới)
- Service helper (không sử dụng trực tiếp)
- Chỉ để reference cho logic hash và validation

### 5. `src/config/vnpay.js` (mới)
- Cấu hình VNPAY constants
- Response codes mapping

## Dependencies

### Packages đã cài đặt:
```json
{
  "react-native-webview": "^13.x.x",
  "crypto-js": "^4.x.x"
}
```

### Cài đặt:
```bash
npm install react-native-webview
# crypto-js đã có sẵn trong project
```

## Testing

### 1. Test COD
1. Thêm sản phẩm vào cart
2. Đi tới checkout
3. Chọn "COD (Tiền mặt)"
4. Điền thông tin và confirm
5. Kiểm tra đơn hàng được tạo thành công

### 2. Test VNPAY
1. Thêm sản phẩm vào cart  
2. Đi tới checkout
3. Chọn "Ví VNPAY"
4. Điền thông tin và confirm
5. WebView hiển thị trang VNPAY
6. Test thanh toán (sandbox)
7. Kiểm tra callback xử lý đúng

## Troubleshooting

### Lỗi thường gặp:

#### 1. "Failed to create order"
- **Nguyên nhân**: API endpoint không đúng hoặc format data sai
- **Giải pháp**: Kiểm tra `config.baseUrl` trong environment.js

#### 2. "Authentication required"  
- **Nguyên nhân**: Token không có hoặc hết hạn
- **Giải pháp**: Kiểm tra login state và token storage

#### 3. WebView không load
- **Nguyên nhân**: Payment URL không hợp lệ
- **Giải pháp**: Kiểm tra response từ createPaymentUrl API

#### 4. Callback không hoạt động
- **Nguyên nhân**: Return URL scheme không đúng
- **Giải pháp**: Đảm bảo return URL phù hợp với deep link config

## Production Checklist

### Trước khi deploy:
- [ ] Cập nhật VNPAY_CONFIG với thông tin production
- [ ] Thay đổi VNPAY_URL từ sandbox sang production
- [ ] Cấu hình return URL đúng với domain production
- [ ] Test thanh toán với tài khoản thật
- [ ] Kiểm tra xử lý lỗi và timeout
- [ ] Đảm bảo HTTPS cho tất cả API calls

### Security:
- [ ] Hash secret không được expose ở client side (đã xử lý ở backend)
- [ ] Validate callback từ VNPAY ở backend
- [ ] Log và monitor giao dịch
- [ ] Implement retry mechanism cho failed payments

## Liên hệ support
- VNPAY Documentation: https://sandbox.vnpayment.vn/apis/
- Project maintainer: [Your contact info] 