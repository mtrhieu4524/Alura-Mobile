import { getApiUrl } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OrderService {
  // Helper function to get token
  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = getApiUrl('orders');
      console.log('Create order API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Create order response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('Create order response:', data);

      return {
        success: true,
        data: data,
        message: 'Order created successfully'
      };
      
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  }

  // Get order history
  async getOrderHistory(params = {}) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get user ID from AsyncStorage (same as web uses from Redux/localStorage)
      const userId = await AsyncStorage.getItem('user');
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Use the same endpoint as web: /order/by-user/${userId}
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
        throw new Error('Failed to fetch order history');
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response");
      }

      const data = await response.json();
      console.log('Order history response:', data);

      // Transform API data to app format (same as web format)
      const transformedOrders = data.map(order => ({
        orderId: order._id,
        orderNumber: order._id, // Use same ID for orderNumber
        date: order.orderDate,
        totalPrice: order.totalAmount,
        status: this.mapOrderStatus(order.paymentStatus || order.orderStatus || "Unknown"),
        items: [], // Will be populated in detail view
        customerInfo: order.customerInfo || {},
        paymentMethod: order.paymentMethod || 'cod',
        shippingFee: order.shippingFee || 0,
        note: order.note || '',
        // Keep original data for reference
        _original: order
      }));

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

  // Fetch product detail (same as web implementation)
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

  // Get order detail by ID
  async getOrderDetail(orderId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use same endpoint as web: /order/by-order/${orderNumber}
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

      // Fetch product details for each item (same as web)
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
          // Product details fetched from API
          type: productDetails.type,
          skinType: productDetails.skinType,
          volume: productDetails.volume
        };
      }));

      // Transform API data to app format with structure matching web
      const transformedOrder = {
        orderId: data._id,
        orderNumber: data._id,
        date: data.orderDate,
        totalPrice: data.totalAmount,
        status: this.mapOrderStatus(data.paymentStatus || data.orderStatus || "Unknown"),
        items: itemsWithDetails,
        customerInfo: {
          name: data.userId?.name || data.customerName || 'Unknown',
          phone: data.phoneNumber || data.phone || 'N/A',
          address: data.shippingAddress || data.address || 'N/A',
          email: data.userId?.email || data.customerEmail || ''
        },
        paymentMethod: data.paymentMethod || 'cod',
        shippingFee: data.shippingFee || 0,
        shippingMethod: data.shippingMethod || 'STANDARD',
        note: data.note || '',
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        statusHistory: data.statusHistory || [],
        // Keep original data for reference
        _original: data
      };

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

  // Cancel order
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

  // Transform order data from API to app format
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
      // Keep original data for reference
      _original: apiOrder
    };
  }

  // Transform order detail data from API to app format
  transformOrderDetail(apiOrder) {
    const baseOrder = this.transformOrder(apiOrder);
    
    return {
      ...baseOrder,
      // Additional detail fields
      orderNumber: apiOrder.orderNumber || apiOrder._id,
      trackingNumber: apiOrder.trackingNumber,
      estimatedDelivery: apiOrder.estimatedDelivery,
      statusHistory: apiOrder.statusHistory || [],
      // Detailed customer info
      customerInfo: {
        ...baseOrder.customerInfo,
        email: apiOrder.customerInfo?.email || apiOrder.customerEmail
      }
    };
  }

  // Map API status to app status
  mapOrderStatus(apiStatus) {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped', 
      'delivered': 'Delivered',
      'success': 'Success',
      'completed': 'Success', // Map completed to Success like web
      'cancelled': 'Cancelled',
      'refunded': 'Cancelled'
    };

    return statusMap[apiStatus?.toLowerCase()] || apiStatus || 'Pending';
  }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService; 