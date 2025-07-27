
export const config = {
  baseUrl: process.env.EXPO_PUBLIC_BASEURL || 'http://10.0.2.2:4000/api/',
  
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Alura Mobile',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  
  nodeEnv: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  isDevelopment: process.env.EXPO_PUBLIC_NODE_ENV === 'development',
  isProduction: process.env.EXPO_PUBLIC_NODE_ENV === 'production',

  endpoints: {
    auth: {
      login: 'auth/login',
      register: 'auth/register',
      logout: 'auth/logout',
      profile: 'auth/profile',
      forgotPassword: 'auth/forgot-password',
      verifyResetCode: 'auth/verify-reset-code',
      resetPassword: 'auth/reset-password',
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

export const getApiUrl = (endpoint) => {
  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  
  console.log('Config baseUrl:', config.baseUrl); 
  console.log('Generated API URL:', fullUrl); 
  
  return fullUrl;
};

export default config; 