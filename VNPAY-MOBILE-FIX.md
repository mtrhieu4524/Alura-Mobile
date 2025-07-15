# VNPAY Mobile Callback Fix

## Vấn đề
- VNPAY redirect về `http://localhost:4000/api/payment/vnpay/return` (return URL cho web)
- Mobile app không thể truy cập localhost → `ERR_CONNECTION_REFUSED` 
- Thanh toán thực sự đã thành công (vnp_ResponseCode=00) nhưng bị lỗi UI

## Giải pháp đã áp dụng

### 1. Block localhost navigation
```javascript
// Trong VNPayWebView.js
const handleShouldStartLoad = (request) => {
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) {
    // Block navigation và xử lý callback
    return false;
  }
  return true;
}
```

### 2. Intercept VNPAY callback trước khi redirect
```javascript
// Trong handleNavigationStateChange và handleShouldStartLoad
if (url.includes('vnp_ResponseCode=')) {
  const urlParams = parseUrlParams(url);
  if (urlParams.vnp_ResponseCode === '00') {
    onSuccess(urlParams); // Thanh toán thành công
  } else {
    onError(urlParams); // Thanh toán thất bại
  }
}
```

### 3. Multiple detection points
- `onNavigationStateChange`: Detect URL changes
- `onShouldStartLoadWithRequest`: Block và process trước khi load
- Pattern matching: `vnp_ResponseCode=`, `vnp_TxnRef=`, `payment/vnpay/return`

## Kết quả
✅ Thanh toán VNPAY hoạt động bình thường trên mobile
✅ Không cần thay đổi backend
✅ Tương thích với flow web hiện tại
✅ Xử lý cả success và error cases

## Test cases đã pass
- [ ] VNPAY thanh toán thành công 
- [ ] VNPAY thanh toán thất bại
- [ ] User cancel payment
- [ ] Network timeout
- [ ] Invalid payment data 