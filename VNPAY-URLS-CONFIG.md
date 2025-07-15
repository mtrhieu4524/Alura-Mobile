# URLs Configuration cho VNPAY Mobile App

## 🔗 URLs cần cấu hình khi đăng ký VNPAY Merchant

### 1. **Return URL** (Backend)
```
http://localhost:4000/api/payment/vnpay/return
```

**Hoặc khi deploy production:**
```
https://your-domain.com/api/payment/vnpay/return
```

**Mục đích:** VNPAY redirect về URL này sau khi user hoàn tất thanh toán

### 2. **IPN URL** (Backend) 
```
http://localhost:4000/api/payment/vnpay/ipn
```

**Hoặc khi deploy production:**
```
https://your-domain.com/api/payment/vnpay/ipn
```

**Mục đích:** VNPAY gửi thông báo kết quả thanh toán về URL này

### 3. **Website URL** (Optional)
```
https://your-website.com
```

**Mục đích:** Website chính của business (có thể để trang landing)

## 📱 Deep Link cho Mobile App

### Mobile Return Scheme (đã cấu hình):
```
alura://vnpay-return
```

**Lưu ý:** Deep link này chỉ dùng nội bộ trong app, không cần đăng ký với VNPAY.

## 🏗️ Cấu hình hiện tại trong code

### Backend endpoints cần implement:
```javascript
// 1. Return URL handler (cho web redirect)
app.get('/api/payment/vnpay/return', (req, res) => {
  // Xử lý callback từ VNPAY cho web
  // Mobile app sẽ intercept trước khi đến đây
});

// 2. IPN URL handler (cho server-to-server)
app.post('/api/payment/vnpay/ipn', (req, res) => {
  // Xử lý IPN notification từ VNPAY
  // Cập nhật database, gửi email, etc.
});
```

### Mobile app deep link:
```javascript
// src/config/vnpay.js
RETURN_URL: 'alura://vnpay-return'
```

## 🚀 Khi deploy production

### 1. Cập nhật backend URLs:
- Return URL: `https://api.alura.com/payment/vnpay/return`
- IPN URL: `https://api.alura.com/payment/vnpay/ipn`

### 2. Cập nhật mobile config:
```javascript
// src/config/vnpay.js
export const VNPAY_CONFIG = {
  TMN_CODE: 'ACTUAL_TMN_CODE_FROM_VNPAY',
  HASH_SECRET: 'ACTUAL_HASH_SECRET_FROM_VNPAY', 
  URL: 'https://vnpayment.vn/paymentv2/vpcpay.html', // Production URL
  RETURN_URL: 'alura://vnpay-return', // Deep link giữ nguyên
};
```

## 📋 Checklist đăng ký VNPAY Merchant

- [ ] **Tên merchant:** Alura Mobile
- [ ] **Website URL:** https://your-website.com  
- [ ] **Return URL:** http://localhost:4000/api/payment/vnpay/return (dev) hoặc https://api.alura.com/payment/vnpay/return (prod)
- [ ] **IPN URL:** http://localhost:4000/api/payment/vnpay/ipn (dev) hoặc https://api.alura.com/payment/vnpay/ipn (prod)
- [ ] **Business documents:** Giấy phép kinh doanh, etc.

## ⚠️ Lưu ý quan trọng

1. **Development:** Sử dụng localhost URLs cho test
2. **Production:** Phải có domain thật và HTTPS
3. **Mobile app:** Sử dụng deep link scheme để handle trong app
4. **Backend:** Phải implement cả Return URL và IPN URL handlers

## 🔧 Test URLs

Để test trong development:
- Return URL: `http://localhost:4000/api/payment/vnpay/return`
- IPN URL: `http://localhost:4000/api/payment/vnpay/ipn`
- Mobile deep link: `alura://vnpay-return` 