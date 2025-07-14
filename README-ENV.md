# Hướng dẫn Setup Environment Variables cho Alura Mobile (Expo)

## 1. Tạo file .env

Tạo file `.env` trong thư mục gốc của project:

```env
# Expo Environment Variables
# Với Expo, tất cả env vars phải có prefix EXPO_PUBLIC_ để truy cập từ client-side

# API Configuration  
EXPO_PUBLIC_BASEURL=http://localhost:4000/api/

# App Configuration
EXPO_PUBLIC_APP_NAME=Alura Mobile
EXPO_PUBLIC_APP_VERSION=1.0.0

# Environment
EXPO_PUBLIC_NODE_ENV=development
```

## 2. ⚠️ Quan trọng về localhost

**Localhost chỉ hoạt động trong một số trường hợp nhất định:**

### ✅ Hoạt động khi:
- Chạy app trên **Web browser** (`npm start` → nhấn `w`)
- Chạy trên **iOS Simulator** 
- Chạy trên **Android Emulator**

### ❌ KHÔNG hoạt động khi:
- Chạy trên **thiết bị thật** (iPhone/Android thật)
- Dùng **Expo Go app** trên điện thoại
- Kết nối qua WiFi với thiết bị thật

### 🔧 Giải pháp cho thiết bị thật:

Nếu muốn test trên điện thoại thật, thay localhost bằng IP thực của máy:

```env
# Lấy IP bằng lệnh: ipconfig (Windows) hoặc ifconfig (Mac/Linux)
EXPO_PUBLIC_BASEURL=http://192.168.1.100:4000/api/
```

## 3. Cách hoạt động với Expo

**Quan trọng**: Với Expo, tất cả environment variables phải có prefix `EXPO_PUBLIC_` để có thể truy cập từ client-side.

### Tại sao cần EXPO_PUBLIC_?
- Expo chỉ expose những biến có prefix này ra client
- Biến không có prefix sẽ bị ẩn vì lý do bảo mật
- Điều này khác với Vite (dùng `VITE_`) hoặc Next.js (dùng `NEXT_PUBLIC_`)

## 4. Cách sử dụng trong code

```javascript
import { config, getApiUrl } from '../config';

// Base URL
console.log(config.baseUrl); 
// → http://localhost:4000/api/

// Tạo API endpoint
const productsUrl = getApiUrl(config.endpoints.products.list);
console.log(productsUrl); 
// → http://localhost:4000/api/products

// Kiểm tra environment
if (config.isDevelopment) {
  console.log('Running in development mode');
}
```

## 5. Khởi động lại sau khi thay đổi .env

Sau khi thay đổi file `.env`, bạn cần:
1. Dừng app (Ctrl+C)
2. Khởi động lại: `npm start`

## 6. Testing API

### Kiểm tra backend đang chạy:
```bash
# Mở browser và truy cập:
http://localhost:4000/api
```

### Các cách chạy app:
```bash
npm start

# Sau đó chọn:
# w - Web browser (localhost hoạt động)
# i - iOS Simulator (localhost hoạt động) 
# a - Android Emulator (localhost hoạt động)
# Scan QR code - Thiết bị thật (cần IP thay vì localhost)
```

## 7. Thay đổi API URL theo môi trường

### Development (localhost):
```env
EXPO_PUBLIC_BASEURL=http://localhost:4000/api/
```

### Testing trên thiết bị thật:
```env
# Thay 192.168.1.100 bằng IP thực của máy bạn
EXPO_PUBLIC_BASEURL=http://192.168.1.100:4000/api/
```

### Production:
```env
EXPO_PUBLIC_BASEURL=https://your-production-api.com/api/
```

## Lưu ý quan trọng

- File `.env` không được commit lên git (đã add vào `.gitignore`)
- Tất cả biến phải có prefix `EXPO_PUBLIC_`
- Restart app sau khi thay đổi environment variables
- **Backend phải chạy trước** khi test mobile app
- Localhost chỉ hoạt động trên simulator/emulator, không hoạt động trên thiết bị thật 