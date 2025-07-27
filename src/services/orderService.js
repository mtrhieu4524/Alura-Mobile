import { getApiUrl } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OrderService {

  async getToken() {
    return await AsyncStorage.getItem('token');
  }


  async placeCODOrder(orderData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('=== PLACE COD ORDER DEBUG ===');
      console.log('Order data (web format):', JSON.stringify(orderData, null, 2));

      const apiUrl = getApiUrl('order/place');
      console.log('Place COD order API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Place COD order response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Place COD order error:', errorData);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Place COD order response:', data);
      
      return {
        success: true,
        data: data,
        message: data.message || 'Order placed successfully'
      };

    } catch (error) {
      console.error('Error placing COD order:', error);
      return {
        success: false,
        message: error.message || 'Failed to place order'
      };
    }
  }


  async createOrder(orderData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('=== CREATE ORDER DEBUG ===');
      console.log('Input order data:', JSON.stringify(orderData, null, 2));


      const transformedData = {
        shippingAddress: orderData.customerInfo.address,
        shippingMethod: orderData.shippingMethod,
        promotionId: null,
        note: orderData.note || '',
        phoneNumber: orderData.customerInfo.phone,
        selectedCartItemIds: orderData.items.map(item => item.productId)
      };


      if (orderData.paymentMethod === 'COD') {
        transformedData.paymentMethod = orderData.paymentMethod;
        console.log('COD order - adding paymentMethod field');
      } else {
        console.log('VNPAY order - NOT sending paymentMethod field to avoid backend rejection');
      }


      if (orderData.vnpayData || orderData.vnpayTransactionData) {
        const vnpayData = orderData.vnpayData || orderData.vnpayTransactionData;
        transformedData.vnpayData = vnpayData;
        console.log('VNPAY transaction data included:', JSON.stringify(vnpayData, null, 2));
      }

      const apiUrl = getApiUrl('order/place');
      console.log('Create order API URL:', apiUrl);
      console.log('Transformed data being sent:', JSON.stringify(transformedData, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      console.log('Create order response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData?.message || `HTTP ${response.status}: Failed to create order`);
      }

      const data = await response.json();
      console.log('Create order success response:', JSON.stringify(data, null, 2));

      return {
        success: true,
        data: data,
        message: 'Order created successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  }

  async prepareVNPayOrder(orderData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const prepareOrderData = {
        shippingAddress: orderData.shippingAddress || orderData.customerInfo?.address,
        shippingMethod: orderData.shippingMethod,
        promotionId: orderData.promotionId || null,
        note: orderData.note || '',
        phoneNumber: orderData.phoneNumber || orderData.customerInfo?.phone,
        selectedCartItemIds: orderData.selectedCartItemIds || []
      };

      const apiUrl = getApiUrl('order/prepare-vnpay');
      console.log('Prepare VNPAY order API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prepareOrderData),
      });

      console.log('Prepare VNPAY order response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to prepare order for VNPAY');
      }

      const data = await response.json();
      console.log('Prepare VNPAY order response:', data);

      return {
        success: true,
        data: data,
        message: 'Order prepared for VNPAY successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to prepare order for VNPAY'
      };
    }
  }

  async createVNPayPaymentUrl(paymentData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = getApiUrl('payment/vnpay/createPaymentUrl');
      console.log('Create VNPAY payment URL API:', apiUrl);
      console.log('Payment data being sent:', JSON.stringify(paymentData, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          bankCode: '', 
          platform: 'mobile',
          mobileReturnUrl: 'alura://vnpay-return',
          clientType: 'react-native'
        }),
      });

      console.log('Create VNPAY payment URL response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData?.message || `HTTP ${response.status}: Failed to create payment URL`);
      }

      const data = await response.json();
      console.log('Create VNPAY payment URL response:', data);

      if (!data.paymentUrl) {
        throw new Error('Payment URL not found in response');
      }

      if (!data.paymentUrl.startsWith('http')) {
        throw new Error('Invalid payment URL format');
      }

      return {
        success: true,
        paymentUrl: data.paymentUrl,
        message: 'Payment URL created successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create payment URL'
      };
    }
  }

  async verifyVNPayCallback(callbackParams) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = getApiUrl('payment/vnpay/verify');
      console.log('Verify VNPAY callback API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackParams),
      });

      console.log('Verify VNPAY callback response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to verify callback');
      }

      const data = await response.json();
      console.log('Verify VNPAY callback response:', data);

      return {
        success: true,
        data: data,
        message: 'Callback verified successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify callback'
      };
    }
  }

  async processVNPayCallback(vnpayParams) {
    try {
      console.log('=== PROCESS VNPAY CALLBACK START ===');
      
      const token = await this.getToken();
      console.log('Token available:', !!token);
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const baseApiUrl = getApiUrl('payment/vnpay/return');
      console.log('Base API URL:', baseApiUrl);
      
      const queryString = Object.keys(vnpayParams)
        .map(key => `${key}=${encodeURIComponent(vnpayParams[key])}`)
        .join('&');
      
      const fullApiUrl = `${baseApiUrl}?${queryString}`;
      console.log('Processing VNPAY callback API URL:', fullApiUrl);
      console.log('URL length:', fullApiUrl.length);
      console.log('VNPAY params being sent:', JSON.stringify(vnpayParams, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout - aborting...');
        controller.abort();
      }, 15000); 
      
      console.log('Sending request to backend with authentication...');
      let response = await fetch(fullApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/html, */*',
        },
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        console.log('Authentication failed, trying without auth...');
        
        const controllerNoAuth = new AbortController();
        const timeoutIdNoAuth = setTimeout(() => controllerNoAuth.abort(), 15000);
        
        response = await fetch(fullApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/html, */*',
          },
          signal: controllerNoAuth.signal,
        });
        
        clearTimeout(timeoutIdNoAuth);
        console.log('Request without auth completed, status:', response.status);
      }

      clearTimeout(timeoutId);
      console.log('Response received!');
      console.log('Process VNPAY callback response status:', response.status);
      console.log('Response headers:', JSON.stringify([...response.headers.entries()]));

      let responseText = '';
      try {
        responseText = await response.text();
      } catch (err) {
        console.log('Could not read response body:', err.message);
      }

      console.log('Response body preview:', responseText.substring(0, 200));

      if (response.ok) {
        console.log('Backend processed VNPAY callback successfully');
        return {
          success: true,
          message: 'VNPAY callback processed successfully',
          data: responseText
        };
      } else {
        let errorMessage = '';
        
        switch (response.status) {
          case 400:
            errorMessage = 'VNPAY signature không hợp lệ hoặc authentication failed';
            console.error('VNPAY signature validation failed');
            break;
          case 404:
            errorMessage = 'Không tìm thấy đơn hàng (TempOrder có thể đã hết hạn)';
            console.error('Order not found - TempOrder may have expired');
            break;
          case 500:
            errorMessage = 'Lỗi server khi xử lý thanh toán';
            console.error('Server error during payment processing');
            break;
          default:
            errorMessage = `Lỗi HTTP ${response.status}`;
            console.error(`Unexpected HTTP ${response.status}`);
        }
        
        console.error('Backend response:', responseText);
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      let userMessage = error.message || 'Failed to process VNPAY callback';
      
      if (error.name === 'AbortError') {
        userMessage = 'Request timeout - server took too long to respond';
      } else if (error.message.includes('Network request failed')) {
        userMessage = 'Cannot connect to server - please check your internet connection';
      }
      
      return {
        success: false,
        message: userMessage
      };
    }
  }

  async getOrderHistory(params = {}) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const userId = await AsyncStorage.getItem('user');
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('=== ORDER HISTORY DEBUG ===');
      console.log('Mobile app user ID:', userId);
      console.log('User ID type:', typeof userId);
      console.log('User ID length:', userId.length);

      const apiUrl = `${getApiUrl('order/by-user')}/${userId}`;
      console.log('Order history API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Order history response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Order history error:', errorText);
        
        if (response.status === 404) {
          console.log('User ID not found in backend - check user ID format');
        } else if (response.status === 401) {
          console.log('Authentication failed - check token');
        } else {
          console.log('Server error:', response.status);
        }
        
        throw new Error('Failed to fetch order history');
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response");
      }

      const data = await response.json();
      console.log('=== ORDER HISTORY RESPONSE ===');
      console.log('Raw API response:', JSON.stringify(data, null, 2));
      console.log('Number of orders returned:', Array.isArray(data) ? data.length : 'Not array');

      if (Array.isArray(data) && data.length === 0) {
        console.log('No orders found for user:', userId);
        console.log('This could mean:');
        console.log('1. User has no orders yet');
        console.log('2. VNPAY orders are not being created by backend callback');
        console.log('3. User ID format mismatch between mobile/backend');
      }

      const transformedOrders = data.map(order => ({
        orderId: order._id,
        orderNumber: order._id, 
        date: order.orderDate,
        totalPrice: order.totalAmount,
        status: this.mapOrderStatus(order.paymentStatus || order.orderStatus || "Unknown"),
        items: [], 
        customerInfo: order.customerInfo || {},
        paymentMethod: order.paymentMethod || 'cod',
        shippingFee: order.shippingFee || 0,
        note: order.note || '',
        _original: order
      }));

      console.log('=== TRANSFORMED ORDERS ===');
      console.log('Transformed orders count:', transformedOrders.length);
      if (transformedOrders.length > 0) {
        console.log('First order sample:', JSON.stringify(transformedOrders[0], null, 2));
      }

      return {
        success: true,
        orders: transformedOrders,
        total: transformedOrders.length,
        message: 'Orders fetched successfully'
      };
      
    } catch (error) {
      console.error('Error fetching order history:', error);
      return {
        success: false,
        orders: [],
        total: 0,
        message: error.message || 'Failed to fetch order history'
      };
    }
  }

  async fetchProductDetail(productId) {
    try {
      const apiUrl = `${getApiUrl('products')}/${productId}`;
      console.log('Fetching product detail from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch product ${productId}`);
        return {
          type: 'None',
          skinType: 'None',
          volume: 'None',
        };
      }

      const data = await response.json();
      console.log('Product detail response:', data);
      
      return {
        type: data.productTypeId?.name || data.type || 'None',
        skinType: data.skinType || 'None',
        volume: data.volume || 'None',
      };
    } catch (error) {
      console.error('Error fetching product detail:', error);
      return {
        type: 'None',
        skinType: 'None',
        volume: 'None',
      };
    }
  }

  async getOrderDetail(orderId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = `${getApiUrl('order/by-order')}/${orderId}`;
      console.log('Order detail API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Order detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Order detail error:', errorText);
        throw new Error('Failed to fetch order detail');
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response");
      }

      const data = await response.json();
      console.log('Order detail response:', data);
      console.log('=== DEBUG ORDER PHONE NUMBER ===');
      console.log('data.phoneNumber:', data.phoneNumber);
      console.log('data.phone:', data.phone);
      console.log('data.customerPhone:', data.customerPhone);
      console.log('data.customerInfo?.phone:', data.customerInfo?.phone);
      console.log('data.shippingInfo?.phone:', data.shippingInfo?.phone);
      console.log('data.contactPhone:', data.contactPhone);
      console.log('data.userId?.phone:', data.userId?.phone);

      const itemsWithDetails = await Promise.all((data.items || []).map(async (item) => {
        const productDetails = await this.fetchProductDetail(item.productId);
        return {
          id: item.productId,
          name: item.productName || 'Unknown Product',
          brand: item.brand || '',
          quantity: item.quantity,
          price: item.unitPrice || item.price || 0,
          image: item.productImgUrl || null,
          lineTotal: (item.unitPrice || item.price || 0) * item.quantity,
          type: productDetails.type,
          skinType: productDetails.skinType,
          volume: productDetails.volume
        };
      }));

      const transformedOrder = {
        orderId: data._id,
        orderNumber: data._id,
        date: data.orderDate,
        totalPrice: data.totalAmount,
        status: this.mapOrderStatus(data.paymentStatus || data.orderStatus || "Unknown"),
        items: itemsWithDetails,
        customerInfo: {
          name: data.userId?.name || data.customerName || data.customerInfo?.name || 'Unknown',
          phone: data.phoneNumber || data.phone || data.customerPhone || data.customerInfo?.phone || data.shippingInfo?.phone || data.contactPhone || data.userId?.phone || 'N/A',
          address: data.shippingAddress || data.address || data.customerInfo?.address || data.shippingInfo?.address || 'N/A',
          email: data.userId?.email || data.customerEmail || data.customerInfo?.email || ''
        },
        paymentMethod: data.paymentMethod || 'cod',
        shippingFee: data.shippingFee || 0,
        shippingMethod: data.shippingMethod || 'STANDARD',
        note: data.note || '',
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        statusHistory: data.statusHistory || [],
        _original: data
      };

      console.log('=== FINAL CUSTOMER INFO ===');
      console.log('customerInfo:', transformedOrder.customerInfo);
      console.log('phone value:', transformedOrder.customerInfo.phone);

      return {
        success: true,
        order: transformedOrder,
        message: 'Order detail fetched successfully'
      };
      
    } catch (error) {
      console.error('Error fetching order detail:', error);
      return {
        success: false,
        order: null,
        message: error.message || 'Failed to fetch order detail'
      };
    }
  }

  async cancelOrder(orderId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = `${getApiUrl('order/cancel')}/${orderId}`;
      console.log('Cancel order API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Cancel order response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Cancel order error:', errorText);
        throw new Error('Can only cancel order is pending or processing.');
      }

      return {
        success: true,
        message: 'Order cancelled successfully'
      };
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order'
      };
    }
  }

  transformOrder(apiOrder) {
    return {
      orderId: apiOrder._id || apiOrder.orderId,
      orderNumber: apiOrder.orderNumber || apiOrder.orderId,
      date: apiOrder.createdAt || apiOrder.orderDate || apiOrder.date,
      totalPrice: apiOrder.totalAmount || apiOrder.totalPrice,
      status: this.mapOrderStatus(apiOrder.status || apiOrder.orderStatus),
      items: (apiOrder.items || []).map(item => ({
        id: item.productId?._id || item.productId,
        name: item.productId?.name || item.name,
        brand: item.productId?.brand || item.brand,
        quantity: item.quantity,
        price: item.unitPrice || item.price,
        image: item.productId?.imgUrls?.[0] || item.image,
        volume: item.productId?.volume || item.volume
      })),
      customerInfo: {
        name: apiOrder.customerInfo?.name || apiOrder.customerName,
        phone: apiOrder.customerInfo?.phone || apiOrder.phone,
        address: apiOrder.customerInfo?.address || apiOrder.address
      },
      paymentMethod: apiOrder.paymentMethod,
      shippingFee: apiOrder.shippingFee || 0,
      note: apiOrder.note || '',
      _original: apiOrder
    };
  }

  transformOrderDetail(apiOrder) {
    const baseOrder = this.transformOrder(apiOrder);
    
    return {
      ...baseOrder,
      orderNumber: apiOrder.orderNumber || apiOrder._id,
      trackingNumber: apiOrder.trackingNumber,
      estimatedDelivery: apiOrder.estimatedDelivery,
      statusHistory: apiOrder.statusHistory || [],
      customerInfo: {
        ...baseOrder.customerInfo,
        email: apiOrder.customerInfo?.email || apiOrder.customerEmail
      }
    };
  }

  mapOrderStatus(apiStatus) {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped', 
      'delivered': 'Delivered',
      'success': 'Success',
      'completed': 'Success', 
      'cancelled': 'Cancelled',
      'refunded': 'Cancelled'
    };

    return statusMap[apiStatus?.toLowerCase()] || apiStatus || 'Pending';
  }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService; 