import React, { createContext, useContext, useState } from 'react';
import { getApiUrl } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);


  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };


  const fetchCartFromAPI = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      console.log('Cart fetch - Token found:', !!token); 
      
      if (!token) {
        console.log('No token found, skipping cart fetch');
        return { success: false, message: 'No authentication token' };
      }

      const apiUrl = getApiUrl('cart');
      console.log('Cart API URL:', apiUrl); 
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Cart response status:', response.status); 
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('Cart error data:', errorData); 
        throw new Error(errorData?.message || 'Failed to fetch cart');
      }

      const data = await response.json();
      console.log('=== CART API DEBUG ===');
      console.log('Raw cart data from API:', JSON.stringify(data, null, 2));
      
      if (data.items && data.items.length > 0) {
        console.log('First cart item structure:');
        console.log('- item._id:', data.items[0]._id);
        console.log('- item.quantity:', data.items[0].quantity);
        console.log('- item.unitPrice:', data.items[0].unitPrice);
        console.log('- item.productId:', JSON.stringify(data.items[0].productId, null, 2));
        console.log('- productId.name:', data.items[0].productId?.name);
        console.log('- productId.price:', data.items[0].productId?.price);
        console.log('- productId.volume:', data.items[0].productId?.volume);
        console.log('- productId.imgUrls:', data.items[0].productId?.imgUrls);
        console.log('- productId.brand:', data.items[0].productId?.brand);
      }
      

      const transformedCart = (data.items || []).map(item => {
        console.log('Raw cart item from API:', JSON.stringify(item, null, 2));
        

        let imageUrl = null;
        const imageUrls = item.imgUrls || item.productId?.imgUrls || [];
        
        if (imageUrls && imageUrls.length > 0) {
          const rawImageUrl = imageUrls[0];
          if (rawImageUrl) {

            if (rawImageUrl.startsWith('http')) {
              imageUrl = rawImageUrl;
            } else {

              const cleanPath = rawImageUrl.startsWith('/') ? rawImageUrl.slice(1) : rawImageUrl;
              imageUrl = `${getApiUrl('')}/${cleanPath}`.replace('//', '/');
            }
          }
        }
        

        const cartItem = {
          id: item.productId?._id || item._id,
          _id: item._id, 
          name: item.productName || item.productId?.name || 'Sản phẩm không tên',
          price: item.unitPrice || item.productId?.price || 0,
          quantity: item.quantity || 1,
          image: imageUrl,
          volume: item.productId?.volume || null,
          stock: item.productId?.stock || 0,
          brand: item.productId?.brand || 'Unknown Brand',
          productType: item.productType || item.productId?.type || 'Unknown Type',

          productId: item.productId,
          originalItem: item,
        };
        
        console.log('Transformed cart item:', cartItem);
        console.log('- Name source:', item.productName ? 'item.productName' : 'item.productId.name');
        console.log('- Price source:', item.unitPrice ? 'item.unitPrice' : 'item.productId.price');
        console.log('- Image source:', item.imgUrls ? 'item.imgUrls' : 'item.productId.imgUrls');
        console.log('- Final image URL:', cartItem.image);
        return cartItem;
      });

      console.log('Final transformed cart:', transformedCart);
      console.log('=== END CART API DEBUG ===');
      setCart(transformedCart);
      return { success: true, data: transformedCart };
      
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const addToCartAPI = async (productId, quantity = 1) => {
    try {
      const token = await getToken();
      
      if (!token) {
        return addToCartLocal(productId, quantity);
      }

      const apiUrl = getApiUrl('cart/add');
      console.log('Add to cart API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: productId, 
          quantity: quantity 
        }),
      });

      console.log('Add to cart response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add to cart');
      }

      const data = await response.json();
      console.log('Add to cart response:', data);
      
      await fetchCartFromAPI();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product added to cart!',
      });

      return { success: true, data };
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Cannot add to cart',
      });
      return { success: false, message: error.message };
    }
  };

  const updateQuantityAPI = async (cartItemId, newQuantity) => {
    try {
      const token = await getToken();
      
      if (!token) {
        return updateQuantityLocal(cartItemId, newQuantity);
      }

      const apiUrl = getApiUrl(`cart/item/${cartItemId}`);
      console.log('Update quantity API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      console.log('Update quantity response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update quantity');
      }

      await fetchCartFromAPI();
      
      return { success: true };
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Cannot update quantity',
      });
      return { success: false, message: error.message };
    }
  };

  const removeFromCartAPI = async (cartItemId) => {
    try {
      const token = await getToken();
      
      if (!token) {
        return removeFromCartLocal(cartItemId);
      }

      const apiUrl = getApiUrl(`cart/item/${cartItemId}`);
      console.log('Remove from cart API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Remove from cart response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to remove item');
      }

      await fetchCartFromAPI();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product removed from cart!',
      });

      return { success: true };
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Cannot remove product from cart',
      });
      return { success: false, message: error.message };
    }
  };

  const addToCartLocal = (product, quantity = 1) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    return { success: true };
  };

  const removeFromCartLocal = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    return { success: true };
  };

  const updateQuantityLocal = (id, quantity) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
    return { success: true };
  };


  const addToCart = async (product, quantity = 1) => {
    const token = await getToken();
    if (token) {
      return await addToCartAPI(product.id || product._id, quantity);
    } else {
      return addToCartLocal(product, quantity);
    }
  };

  const removeFromCart = async (itemId) => {
    const token = await getToken();
    if (token) {

      const cartItem = cart.find(item => item.id === itemId || item._id === itemId);
      const cartItemId = cartItem?._id || itemId;
      return await removeFromCartAPI(cartItemId);
    } else {
      return removeFromCartLocal(itemId);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const token = await getToken();
    
    if (token) {

      const cartItem = cart.find(item => item.id === itemId || item._id === itemId);
      const cartItemId = cartItem?._id || itemId;
      return await updateQuantityAPI(cartItemId, quantity);
    } else {
      return updateQuantityLocal(itemId, quantity);
    }
  };




  const clearAllCart = async () => {
    try {
      console.log('Clearing cart after successful order...');
      

      setCart([]);
      console.log('Local cart cleared for immediate UI update');
      
      const token = await getToken();
      
      if (token) {
        try {

          const clearApiUrl = getApiUrl('cart/clear');
          console.log('Attempting to clear cart via API:', clearApiUrl);
          
          const response = await fetch(clearApiUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Cart cleared via API successfully');
          } else {
            console.log('Clear cart API not available or failed, backend may have already cleared cart');
          }
        } catch (apiError) {
          console.log('Clear cart API error (expected if backend already cleared):', apiError.message);
        }
        

        console.log('Syncing cart with backend...');
        await fetchCartFromAPI();
        console.log('Cart synced with backend');
      }
      
      console.log('Cart cleared successfully');
      return { success: true };
      
    } catch (error) {

      setCart([]);
      return { success: true, message: 'Cart cleared locally, backend sync may have failed' };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      fetchCartFromAPI,
      clearAllCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 