import { getApiUrl } from '../config/environment';

class ProductService {
  // Fetch all products with optional pagination and filters
  async getAllProducts(params = {}) {
    try {
      const {
        pageIndex = 1,
        pageSize = 20,
        searchByName = '',
        searchByTag = '',
        sortBy = '',
        sex = '',
        type = '',
        brand = '',
        skinType = '',
        skinColor = '',
        volume = '',
        inStock = null
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (pageIndex) queryParams.append('pageIndex', pageIndex);
      if (pageSize) queryParams.append('pageSize', pageSize);
      if (searchByName) queryParams.append('searchByName', searchByName);
      if (searchByTag) queryParams.append('searchByTag', searchByTag);
      if (sex) queryParams.append('sex', sex);
      if (type) queryParams.append('type', type);
      if (brand) queryParams.append('brand', brand);
      if (skinType) queryParams.append('skinType', skinType);
      if (skinColor) queryParams.append('skinColor', skinColor);
      if (volume) queryParams.append('volume', volume);
      if (inStock !== null) queryParams.append('inStock', inStock);

      const url = `${getApiUrl('products')}?${queryParams.toString()}`;
      console.log('Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Products API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Products API response:', data);

      return {
        success: true,
        products: data.products || [],
        total: data.total || 0,
        message: data.message
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        products: [],
        total: 0,
        error: error.message
      };
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const url = getApiUrl(`products/${productId}`);
      console.log('Fetching product detail from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product detail API response:', data);

      return {
        success: true,
        product: data.product || data,
        message: data.message
      };
    } catch (error) {
      console.error('Error fetching product detail:', error);
      return {
        success: false,
        product: null,
        error: error.message
      };
    }
  }

  // Search products by name or description
  async searchProducts(searchTerm, params = {}) {
    return this.getAllProducts({
      ...params,
      searchByName: searchTerm
    });
  }

  // Get products by category
  async getProductsByCategory(categoryName, params = {}) {
    return this.getAllProducts({
      ...params,
      searchByTag: categoryName
    });
  }

  // Transform API product data to match app's expected format
  transformProduct(apiProduct) {
    // Get the primary image URL
    let imageUrl = null;
    if (apiProduct.imgUrls && apiProduct.imgUrls.length > 0) {
      imageUrl = apiProduct.imgUrls[0];
      // If the URL doesn't start with http, it might be a relative path
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Add base URL if needed - adjust this based on your API setup
        const baseUrl = getApiUrl('').replace('/api/', '');
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    } else if (apiProduct.imgUrl) {
      // Fallback to single imgUrl field if exists
      imageUrl = apiProduct.imgUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrl = getApiUrl('').replace('/api/', '');
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    }

    console.log('Transforming product:', apiProduct.name, 'Image URL:', imageUrl);

    return {
      id: apiProduct._id,
      name: apiProduct.name,
      brand: apiProduct.brand?.brandName || 'Unknown',
      price: apiProduct.price,
      rating: apiProduct.rating || 4.5, // Default rating if not provided
      image: imageUrl,
      imgUrls: apiProduct.imgUrls || [],
      description: apiProduct.description,
      category: apiProduct.categoryId?.name?.toLowerCase() || 'other',
      productType: apiProduct.productTypeId?.name || '',
      sex: apiProduct.sex || 'Unisex',
      skinType: apiProduct.skinType || '',
      skinColor: apiProduct.skinColor || '',
      volume: apiProduct.volume || '',
      stock: apiProduct.stock || 0,
      isInStock: apiProduct.stock > 0,
      tags: apiProduct.tags || [],
      keyIngredients: apiProduct.keyIngredients || '',
      instructions: apiProduct.instructions || '',
      isNew: this.isNewProduct(apiProduct.createdAt),
      isBestseller: apiProduct.rating >= 4.5, // Consider high-rated products as bestsellers
      // Keep original API data for reference
      _original: apiProduct
    };
  }

  // Helper function to determine if product is new (within last 30 days)
  isNewProduct(createdAt) {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }

  // Get unique filter values for dropdowns
  async getFilterOptions() {
    try {
      // You can implement separate endpoints for these or derive from products
      return {
        categories: ['makeup', 'skincare', 'fragrance', 'haircare'],
        brands: ['Dior', 'Essence', 'Cetaphil', 'L\'Oreal'],
        sexOptions: ['Men', 'Women', 'Unisex'],
        skinTypes: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
        skinColors: ['Light', 'Medium', 'Tan', 'Dark'],
        volumes: ['10g', '30ml', '50ml', '100ml', '200ml']
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      return {
        categories: [],
        brands: [],
        sexOptions: [],
        skinTypes: [],
        skinColors: [],
        volumes: []
      };
    }
  }

  // Find products by image (Visual Search)
  async findProductsByImage(formData, params = {}) {
    try {
      const {
        pageIndex = 1,
        pageSize = 10
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      });

      const apiUrl = getApiUrl(`products/find-by-image?${queryParams}`);
      console.log('Visual Search API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Visual Search Response Status:', response.status);

      if (response.status !== 200) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Visual Search Response:', data);

      // Transform products to app format
      const transformedProducts = data.products ? data.products.map(product => this.transformProduct(product)) : [];

      return {
        success: true,
        data: {
          ...data,
          products: transformedProducts
        },
        message: 'Visual search completed successfully.'
      };
    } catch (error) {
      console.error('Visual search error:', error);
      return {
        success: false,
        message: error.message || 'Visual search failed. Please try again.'
      };
    }
  }
}

export default new ProductService(); 