/**
 
 * @param {number} amount 
 * @returns {string} 
 */
export const formatCurrency = (amount) => {
  return `${amount.toLocaleString('vi-VN')} VND`;
};

/**

 * @param {string} email 
 * @returns {boolean} 
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**

 * @param {string} phone 
 * @returns {boolean} 
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
};

/**

 * @param {number} originalPrice 
 * @param {number} discountPercent 
 * @returns {number} 
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  return (originalPrice * discountPercent) / 100;
};

/**

 * @returns {string} 
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**

 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function} 
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 