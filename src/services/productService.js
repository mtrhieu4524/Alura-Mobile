import { getApiUrl } from '../config/environment';

class ProductService {
  getApiUrl(endpoint = '') {
    const baseUrl = getApiUrl('');
    return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  }

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

      console.log('Product detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Product detail error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('Product not found or hidden');
        } else if (response.status === 403) {
          throw new Error('Product not available');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Product detail API response:', data);

      return {
        success: true,
        product: data.product || data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        product: null,
        error: error.message
      };
    }
  }

  async searchProducts(searchTerm, params = {}) {
    return this.getAllProducts({
      ...params,
      searchByName: searchTerm
    });
  }

  async getProductsByCategory(categoryName, params = {}) {
    return this.getAllProducts({
      ...params,
      searchByTag: categoryName
    });
  }

  transformProduct(apiProduct) {
    let imageUrl = null;
    if (apiProduct.imgUrls && apiProduct.imgUrls.length > 0) {
      imageUrl = apiProduct.imgUrls[0];
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrl = getApiUrl('').replace('/api/', '');
        if (imageUrl.startsWith('/')) {
          imageUrl = `${baseUrl}${imageUrl}`;
        } else {
          imageUrl = `${baseUrl}/${imageUrl}`;
        }
      }
    } else if (apiProduct.imgUrl) {
      imageUrl = apiProduct.imgUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrl = getApiUrl('').replace('/api/', '');
        if (imageUrl.startsWith('/')) {
          imageUrl = `${baseUrl}${imageUrl}`;
        } else {
          imageUrl = `${baseUrl}/${imageUrl}`;
        }
      }
    }

    if (!imageUrl && apiProduct.name) {
      console.log('⚠️ No image found for product:', apiProduct.name);
    }

    return {
      id: apiProduct._id,
      name: apiProduct.name,
      brand: apiProduct.brand?.brandName || 'Unknown',
      price: apiProduct.price,
      rating: apiProduct.rating || 4.5, 
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
      isBestseller: apiProduct.rating >= 4.5, 
      _original: apiProduct
    };
  }

  isNewProduct(createdAt) {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  debugImageUrls(products) {
    console.log('Image URL Debug Report:');
    console.log('=============================');
    
    let totalProducts = 0;
    let withImages = 0;
    let withoutImages = 0;
    let invalidUrls = 0;

    products.forEach(product => {
      totalProducts++;
      
      if (product.image) {
        withImages++;
        if (typeof product.image === 'string') {
          if (product.image.startsWith('http')) {
            console.log(`${product.name}: ${product.image}`);
          } else {
            invalidUrls++;
            console.log(`${product.name}: Invalid URL - ${product.image}`);
          }
        } else {
          console.log(`${product.name}: Local asset`);
        }
      } else {
        withoutImages++;
        console.log(`${product.name}: No image`);
      }
    });

    console.log('=============================');
    console.log(`Summary:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   With images: ${withImages}`);
    console.log(`   Without images: ${withoutImages}`);
    console.log(`   Invalid URLs: ${invalidUrls}`);
    console.log('=============================');
  }

  async getFilterOptions() {
    try {
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

  async findProductsByImage(formData, params = {}) {
    try {
      const {
        pageIndex = 1,
        pageSize = 10
      } = params;

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