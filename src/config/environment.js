// Cấu hình environment cho ứng dụng Expo
export const config = {
  // API Configuration - fallback to localhost if env not available
  baseUrl: process.env.EXPO_PUBLIC_BASEURL || 'http://localhost:4000/api/',
  
  // App Info
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Alura Mobile',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  
  // Environment
  nodeEnv: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  isDevelopment: process.env.EXPO_PUBLIC_NODE_ENV === 'development',
  isProduction: process.env.EXPO_PUBLIC_NODE_ENV === 'production',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: 'auth/login',
      register: 'auth/register',
      logout: 'auth/logout',
      profile: 'auth/profile',
    },
    products: {
      list: 'products',
      detail: 'products',
      categories: 'categories',
      search: 'products/search',
    },
    cart: {
      get: 'cart',
      add: 'cart/add',
      updateItem: 'cart/item',
      removeItem: 'cart/item',
      clear: 'cart/clear',
    },
    orders: {
      create: 'orders',
      list: 'orders',
      detail: 'orders',
      history: 'orders/history',
      byUser: 'order/by-user',
      byOrder: 'order/by-order',
      cancel: 'order/cancel',
    }
  }
};

// Helper function để tạo full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  
  console.log('Config baseUrl:', config.baseUrl); // Debug log
  console.log('Generated API URL:', fullUrl); // Debug log
  
  return fullUrl;
};

// Export default config
export default config; 