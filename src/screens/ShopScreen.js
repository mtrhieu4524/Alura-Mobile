import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../components/common';
import { ProductCard } from '../components/product';
import { colors, typography, dimensions } from '../constants';
import { productService } from '../services';


const COSMETICS_CATEGORY_ID = '685f753db792e430e6925dad';
const TREATMENTS_CATEGORY_ID = '685f755db792e430e6925db0';


const tabOptions = [
  { id: 'cosmetics', name: 'Cosmetics', icon: 'color-palette-outline' },
  { id: 'treatments', name: 'Medicals & Treatments', icon: 'medical-outline' },
];

const sortOptions = [
  { id: '', name: 'None' },
  { id: 'Newest', name: 'Newest' },
  { id: 'Oldest', name: 'Oldest' },
  { id: 'Price (Low to High)', name: 'Price ↑' },
  { id: 'Price (High to Low)', name: 'Price ↓' },
];


const sexOptions = [
  { id: '', name: 'All' },
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
  { id: 'Unisex', name: 'Unisex' },
];

const skinTypeOptions = [
  { id: '', name: 'All' },
  { id: 'Normal', name: 'Normal' },
  { id: 'Dry', name: 'Dry' },
  { id: 'Oily', name: 'Oily' },
  { id: 'Combination', name: 'Combination' },
  { id: 'Sensitive', name: 'Sensitive' },
];

const skinColorOptions = [
  { id: '', name: 'All' },
  { id: 'Light', name: 'Light' },
  { id: 'Dark', name: 'Dark' },
  { id: 'Neutral', name: 'Neutral' },
  { id: 'Cool', name: 'Cool' },
  { id: 'Warm', name: 'Warm' },
];

const stockOptions = [
  { id: '', name: 'All' },
  { id: 'In Stock', name: 'In Stock' },
  { id: 'Out of Stock', name: 'Out of Stock' },
];

export default function ShopScreen({ route }) {
  const navigation = useNavigation();
  

  const { category, state } = route.params || {};
  const selectedType = state?.type;
  

  useEffect(() => {
    if (category) {
      const tabId = category.toLowerCase().includes('cosmetic') ? 'cosmetics' : 'treatments';
      setSelectedTab(tabId);
    }
  }, [category]);
  

  useEffect(() => {
    if (selectedType) {
      setType([selectedType]);
    }
  }, [selectedType]);


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(category === 'treatments' ? 'treatments' : 'cosmetics');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);
  

  const [sort, setSort] = useState('');
  const [sex, setSex] = useState([]);
  const [type, setType] = useState(selectedType ? [selectedType] : []); 
  const [brand, setBrand] = useState([]);
  const [skinType, setSkinType] = useState([]);
  const [skinColor, setSkinColor] = useState([]);
  const [stock, setStock] = useState([]);
  

  const [typeOptions, setTypeOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);


  const getTypeOptions = () => {
    if (selectedTab === 'cosmetics') {
      return [
        { value: 'Lipstick', label: 'Lipstick' },
        { value: 'Eye Shadow', label: 'Eye Shadow' },
        { value: 'Foundation', label: 'Foundation' },
        { value: 'Brightener', label: 'Brightener' },
        { value: 'Mascara', label: 'Mascara' },
        { value: 'Blush', label: 'Blush' },
        { value: 'Face Cream', label: 'Face Cream' },
        { value: 'Primer', label: 'Primer' }
      ];
    } else {
      return [
        { value: 'Toner', label: 'Toner' },
        { value: 'Cleanser', label: 'Cleanser' },
        { value: 'Serum', label: 'Serum' },
        { value: 'Moisturizer', label: 'Moisturizer' },
        { value: 'Sunscreen', label: 'Sunscreen' }
      ];
    }
  };


  useEffect(() => {
    if (category) {
      const newTab = category === 'treatments' ? 'treatments' : 'cosmetics';
      if (newTab !== selectedTab) {
        setSelectedTab(newTab);
        setPage(1);
        setProducts([]);
      }
    }
  }, [category]);

  useEffect(() => {
    if (selectedType) {
      const currentTypeOptions = getTypeOptions();
      
      const incomingType = Array.isArray(selectedType) ? selectedType : [selectedType];
      const validTypes = incomingType.filter(t =>
        currentTypeOptions.some(opt => opt.value === t)
      );
      
      setType(validTypes);
      setPage(1);
      setProducts([]);
    }
  }, [selectedType, selectedTab]);

  useEffect(() => {
    fetchOptions();
  }, [selectedTab]);

  const fetchProducts = async (page = 1, append = false) => {
    try {
      setLoading(true);
      
      const categoryId = selectedTab === 'cosmetics' ? COSMETICS_CATEGORY_ID : TREATMENTS_CATEGORY_ID;
      
      const params = {
        pageIndex: page,
        pageSize: 100, 
        categoryId: categoryId,
      };

      if (searchQuery.trim()) {
        params.searchByName = searchQuery.trim();
      }

      const response = await productService.getAllProducts(params);
      
      if (response.success && response.products) {
        let filteredProducts = response.products.map(apiProduct => {
          if (productService.transformProduct) {
            return productService.transformProduct(apiProduct);
          }
          return apiProduct;
        });

        filteredProducts = filteredProducts.filter(product => {
          const productCategoryId = 
            (product.productCategory && product.productCategory._id)
            || product.categoryId
            || (product.category && product.category._id)
            || product._original?.categoryId
            || (product.productTypeId && product.productTypeId.category && product.productTypeId.category._id)
            || (product.productTypeId && product.productTypeId.category && product.productTypeId.category.id);

          const matches = String(productCategoryId) === String(categoryId)
            || (selectedTab === 'cosmetics' && (product.category?.toLowerCase() === 'cosmetic' || product.category?.toLowerCase() === 'cosmetics'))
            || (selectedTab === 'treatments' && (product.category?.toLowerCase() === 'treatment' || product.category?.toLowerCase() === 'medicals & treatments' || product.category?.toLowerCase() === 'treatments'));

          return matches;
        });

        if (sex.length > 0) {
          filteredProducts = filteredProducts.filter((p) => {
            const productSex = p.sex?.charAt(0).toUpperCase() + p.sex?.slice(1).toLowerCase();
            return sex.includes(productSex);
          });
        }

        if (type.length > 0) {
          filteredProducts = filteredProducts.filter(p => {
            const productTypeName = p.productType || p.productTypeId?.name;
            return type.includes(productTypeName);
          });
        }

        if (brand.length > 0) {
          filteredProducts = filteredProducts.filter((p) => {
            const brandId = p.brand?._id || p.brand?.id;
            return brand.includes(brandId);
          });
        }

        if (skinType.length > 0) {
          filteredProducts = filteredProducts.filter((p) => {
            if (!Array.isArray(p.skinType)) return false;
            return p.skinType.some((s) => {
              const formatted = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
              return skinType.includes(formatted);
            });
          });
        }

        if (skinColor.length > 0) {
          filteredProducts = filteredProducts.filter((p) => {
            const productSkinColor = p.skinColor?.charAt(0).toUpperCase() + p.skinColor?.slice(1).toLowerCase();
            return skinColor.includes(productSkinColor);
          });
        }

        if (stock.length > 0) {
          if (stock.includes("In Stock")) {
            filteredProducts = filteredProducts.filter(p => (p.stock || 0) > 0);
          }
          if (stock.includes("Out of Stock")) {
            filteredProducts = filteredProducts.filter(p => (p.stock || 0) === 0);
          }
        }

        if (sort) {
          filteredProducts.sort((a, b) => {
            switch (sort) {
              case 'Newest':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
              case 'Oldest':
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
              case 'Price (Low to High)':
                return (a.price || 0) - (b.price || 0);
              case 'Price (High to Low)':
                return (b.price || 0) - (a.price || 0);
              default:
                return 0;
            }
          });
        }

        if (append && page > 1) {
          setProducts(prev => [...prev, ...filteredProducts]);
        } else {
          setProducts(filteredProducts);
        }
        
        setPage(page);
        
        if (filteredProducts.length === 0) {
          setHasMore(false);
        } else {
          const totalLoaded = append ? products.length + filteredProducts.length : filteredProducts.length;
          const totalAvailable = response.total || 0;
          const hasMoreData = totalLoaded < totalAvailable;
          setHasMore(hasMoreData);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore && products.length > 0) {
      fetchProducts(page + 1, true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  };

  const clearAllFilters = () => {
    setSort('');
    setSex([]);
    setType([]);
    setBrand([]);
    setSkinType([]);
    setSkinColor([]);
    setStock([]);
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return sort || sex.length > 0 || type.length > 0 || brand.length > 0 || 
           skinType.length > 0 || skinColor.length > 0 || stock.length > 0 || 
           searchQuery.trim();
  };

  const fetchOptions = async () => {
    try {
      const categoryId = selectedTab === 'cosmetics' ? COSMETICS_CATEGORY_ID : TREATMENTS_CATEGORY_ID;
      
      const typeUrl = productService.getApiUrl('product-types');
      
      let typeResponse = await fetch(typeUrl);
      
      if (!typeResponse.ok) {
        const altTypeUrl = productService.getApiUrl('productTypes');
        typeResponse = await fetch(altTypeUrl);
      }
      
      
      if (!typeResponse.ok) {
        return;
      }
      
      
      const contentType = typeResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const typeData = await typeResponse.json();
      
      if (Array.isArray(typeData)) {
        
        const filteredTypes = typeData
          .filter(pt => {
            return pt.category?._id === categoryId;
          })
          .map(pt => ({ value: pt.name, label: pt.name }));
        
        setTypeOptions(filteredTypes);
      } else {
        
        
        if (selectedTab === 'cosmetics') {
          const fallbackTypes = [
            { value: 'Lipstick', label: 'Lipstick' },
            { value: 'Eye Shadow', label: 'Eye Shadow' },
            { value: 'Foundation', label: 'Foundation' },
            { value: 'Brightener', label: 'Brightener' }
          ];
          setTypeOptions(fallbackTypes);
        } else {
          const fallbackTypes = [
            { value: 'Toner', label: 'Toner' },
            { value: 'Cleanser', label: 'Cleanser' },
            { value: 'Serum', label: 'Serum' }
          ];
          setTypeOptions(fallbackTypes);
        }
      }

      
      const brandUrl = productService.getApiUrl('brands');
      
      const brandResponse = await fetch(brandUrl);
      
      
      if (!brandResponse.ok) {
        return;
      }
      
      
      const brandContentType = brandResponse.headers.get('content-type');
      if (!brandContentType || !brandContentType.includes('application/json')) {
        return;
      }
      
      const brandData = await brandResponse.json();
      
      if (brandData.success && Array.isArray(brandData.data)) {
        const brandOpts = brandData.data.map(b => ({
          value: b.id,
          label: b.brandName
        }));
        setBrandOptions(brandOpts);
      }
    } catch (error) {
      
    }
  };

  
  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    
    clearAllFilters();
    setPage(1);
    setHasMore(true);
  };

  
  useEffect(() => {
    setMounted(true);
    fetchOptions();
    fetchProducts(1, false);
  }, [selectedTab]);

  
  useEffect(() => {
    
    if (mounted && selectedTab) {
      setPage(1);
      setHasMore(true);
      fetchProducts(1, false);
    }
  }, [sort, sex, type, brand, skinType, skinColor, stock, searchQuery]);

  
  useFocusEffect(
    React.useCallback(() => {
      if (mounted && selectedTab) {
        fetchProducts(1, false);
      }
    }, [selectedTab])
  );

  
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      product,
      productId: product.id 
    });
  };

  
  const renderProduct = ({ item, index }) => (
    <View style={[styles.productWrapper, { marginRight: index % 2 === 0 ? 8 : 0 }]}>
      <ProductCard 
        product={item}
        onPress={() => handleProductPress(item)}
        style={styles.productCard}
      />
    </View>
  );

  
  const renderTabButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === item.id && styles.activeTabButton
      ]}
      onPress={() => handleTabChange(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedTab === item.id ? colors.white : colors.textSecondary} 
      />
      <Text style={[
        styles.tabButtonText,
        selectedTab === item.id && styles.activeTabButtonText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  
  const renderFilterOption = (title, options, selectedValues, onSelect, multiple = true) => {
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {options.map(option => {
              const optionValue = option.id || option.value;
              const optionLabel = option.name || option.label;
              const isSelected = multiple 
                ? selectedValues.includes(optionValue)
                : selectedValues === optionValue;
              
              
              return (
                <TouchableOpacity
                  key={optionValue}
                  style={[
                    styles.filterOption,
                    isSelected && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    if (multiple) {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== optionValue)
                        : [...selectedValues, optionValue];
                      onSelect(newValues);
                    } else {
                      onSelect(optionValue);
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    isSelected && styles.activeFilterOptionText
                  ]}>
                    {optionLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  
  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  
  const getBannerImage = () => {
    return selectedTab === 'cosmetics' 
      ? require('../../assets/facialcosmetics.png')
      : require('../../assets/skincare.png');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? 'close' : 'filter'} 
            size={24} 
            color={colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm kiếm sản phẩm..."
        style={styles.searchBar}
      />

      
      <View style={styles.tabContainer}>
        <FlatList
          data={tabOptions}
          renderItem={renderTabButton}
          keyExtractor={item => item.id || `tab-${item.name}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
        />
      </View>

      
      {showFilters && (
        <ScrollView 
          style={styles.filtersContainer}
          showsVerticalScrollIndicator={false}
        >
          {hasActiveFilters() && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearFiltersText}>Xóa tất cả bộ lọc</Text>
            </TouchableOpacity>
          )}
          {renderFilterOption('Sort', sortOptions, sort, setSort, false)}
          {renderFilterOption('Type', getTypeOptions(), type, setType)}
          {brandOptions.length > 0 && renderFilterOption('Brand', brandOptions, brand, setBrand)}
          {renderFilterOption('Stock', stockOptions, stock, setStock)}
          {renderFilterOption('Sex', sexOptions, sex, setSex)}
          {renderFilterOption('Skin type', skinTypeOptions, skinType, setSkinType)}
          {renderFilterOption('Skin color', skinColorOptions, skinColor, setSkinColor)}
        </ScrollView>
      )}

      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item.id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? 'No matching products found'
                  : 'No products found'
                }
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.background,
    position: 'relative',
  },
  headerTitle: {
    fontSize: typography.sizes.header,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  filterButton: {
    padding: 8,
    position: 'absolute',
    right: dimensions.spacing.medium,
    top: 45,
    alignSelf: 'center',
  },
  searchBar: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
  },
  tabContainer: {
    paddingVertical: dimensions.spacing.small,
  },
  tabList: {
    paddingHorizontal: dimensions.spacing.medium,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    marginRight: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.large,
    backgroundColor: colors.lightGray,
  },
  activeTabButton: {
    backgroundColor: colors.accent,
  },
  tabButtonText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginLeft: dimensions.spacing.small,
    fontWeight: typography.weights.medium,
  },
  activeTabButtonText: {
    color: colors.white,
  },
  bannerContainer: {
    height: 150,
    marginTop: dimensions.spacing.small,
    marginBottom: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.large,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: dimensions.borderRadius.large,
  },
  bannerTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingBottom: dimensions.spacing.medium,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    paddingVertical: dimensions.spacing.small,
  },
  clearFiltersText: {
    fontSize: typography.sizes.medium,
    color: colors.accent,
    fontWeight: '500',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: dimensions.spacing.medium,
  },
  productList: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingBottom: 120,
  },
  productWrapper: {
    flex: 0.5,
    marginBottom: dimensions.spacing.medium,
  },
  productCard: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.xxLarge,
  },
  loadingText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginTop: dimensions.spacing.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.xxLarge,
  },
  errorTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  errorMessage: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.large,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.large,
  },
  footerText: {
    marginLeft: dimensions.spacing.small,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.xxLarge,
  },
  emptyText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginTop: dimensions.spacing.medium,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  clearAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeFilterOption: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeFilterOptionText: {
    color: colors.white,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  applyButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 