import CryptoJS from 'crypto-js';
import { Alert } from 'react-native';
import { VNPAY_CONFIG } from '../config/vnpay';

class VNPayService {
  constructor() {
    // Cấu hình VNPAY
    this.vnp_TmnCode = VNPAY_CONFIG.TMN_CODE;
    this.vnp_HashSecret = VNPAY_CONFIG.HASH_SECRET;
    this.vnp_Url = VNPAY_CONFIG.URL;
    this.vnp_ReturnUrl = VNPAY_CONFIG.RETURN_URL;
  }

  // Tạo URL thanh toán VNPAY
  createPaymentUrl(orderData) {
    const {
      orderId,
      amount,
      orderInfo,
      orderType = 'fashion',
      locale = 'vn',
      currCode = 'VND',
      clientIp = '127.0.0.1'
    } = orderData;

    // Tạo thời gian
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // Hết hạn sau 15 phút

    // Tham số VNPAY
    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100, // VNPAY yêu cầu nhân với 100
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sắp xếp tham số theo alphabet
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((result, key) => {
        result[key] = vnp_Params[key];
        return result;
      }, {});

    // Tạo query string
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    // Tạo secure hash
    const hmac = CryptoJS.HmacSHA512(queryString, this.vnp_HashSecret);
    const secureHash = hmac.toString(CryptoJS.enc.Hex);

    // URL cuối cùng
    const paymentUrl = `${this.vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`;

    return paymentUrl;
  }

  // Xác minh callback từ VNPAY
  verifyCallback(params) {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // Sắp xếp tham số
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    // Tạo query string
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    // Tạo secure hash để so sánh
    const hmac = CryptoJS.HmacSHA512(queryString, this.vnp_HashSecret);
    const calculatedHash = hmac.toString(CryptoJS.enc.Hex);

    return secureHash === calculatedHash;
  }

  // Xử lý kết quả thanh toán
  handlePaymentResult(params) {
    const isValid = this.verifyCallback(params);
    
    if (!isValid) {
      return {
        success: false,
        message: 'Chữ ký không hợp lệ',
        data: null
      };
    }

    const vnp_ResponseCode = params.vnp_ResponseCode;
    const vnp_TxnRef = params.vnp_TxnRef;
    const vnp_Amount = parseInt(params.vnp_Amount) / 100;
    const vnp_TransactionNo = params.vnp_TransactionNo;

    if (vnp_ResponseCode === '00') {
      return {
        success: true,
        message: 'Thanh toán thành công',
        data: {
          orderId: vnp_TxnRef,
          amount: vnp_Amount,
          transactionNo: vnp_TransactionNo,
          responseCode: vnp_ResponseCode
        }
      };
    } else {
      return {
        success: false,
        message: this.getErrorMessage(vnp_ResponseCode),
        data: {
          orderId: vnp_TxnRef,
          responseCode: vnp_ResponseCode
        }
      };
    }
  }

  // Format date cho VNPAY (yyyyMMddHHmmss)
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Lấy thông báo lỗi theo mã response
  getErrorMessage(responseCode) {
    const errorMessages = {
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi',
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Lỗi không xác định'
    };

    return errorMessages[responseCode] || 'Lỗi không xác định';
  }

  // Tạo deep link cho mobile app
  createMobileDeepLink(paymentUrl) {
    // Có thể sử dụng deep link của VNPAY mobile app nếu đã cài đặt
    const vnpayAppScheme = `vnpay://payment?url=${encodeURIComponent(paymentUrl)}`;
    return vnpayAppScheme;
  }
}

export default new VNPayService(); 