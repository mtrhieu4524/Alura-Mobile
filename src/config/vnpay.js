// VNPAY Configuration
export const VNPAY_CONFIG = {
  // Sandbox Environment (for testing)
  TMN_CODE: 'C69VYS6A', // Thay bằng TMN Code thực tế từ VNPAY
  HASH_SECRET: '2S67F6LJRUZS6XOHBDI6SRCGO2IDCMJ7', // Thay bằng Hash Secret thực tế từ VNPAY
  URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  RETURN_URL: 'alura://vnpay-return',
  
  // Production Environment (uncomment when going live)
  // URL: 'https://vnpayment.vn/paymentv2/vpcpay.html',
};

// Response Codes
export const VNPAY_RESPONSE_CODES = {
  SUCCESS: '00',
  PENDING: '01',
  ERROR: '02',
  REVERSED: '04',
  PROCESSING_REFUND: '05',
  REFUND_REQUESTED: '06',
  SUSPECTED_FRAUD: '07',
  NOT_REGISTERED_INTERNET_BANKING: '09',
  AUTHENTICATION_FAILED: '10',
  TIMEOUT: '11',
  ACCOUNT_LOCKED: '12',
  WRONG_OTP: '13',
  USER_CANCELLED: '24',
  INSUFFICIENT_FUNDS: '51',
  DAILY_LIMIT_EXCEEDED: '65',
  BANK_MAINTENANCE: '75',
  WRONG_PASSWORD_LIMIT: '79',
  UNKNOWN_ERROR: '99'
};

export default VNPAY_CONFIG; 