import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../components/common';
import { ProductCard } from '../components/product';
import { colors, typography, dimensions } from '../constants';
import { productService } from '../services';

const categories = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
  { id: 'skincare', name: 'Skincare', icon: 'leaf-outline' },
  { id: 'makeup', name: 'Makeup', icon: 'color-palette-outline' },
  { id: 'fragrance', name: 'Nước hoa', icon: 'flower-outline' },
  { id: 'haircare', name: 'Tóc', icon: 'cut-outline' },
];

const sortOptions = [
  { id: 'popular', name: 'Phổ biến' },
  { id: 'newest', name: 'Mới nhất' },
  { id: 'price_low', name: 'Giá: Thấp đến Cao' },
  { id: 'price_high', name: 'Giá: Cao đến Thấp' },
  { id: 'rating', name: 'Đánh giá cao nhất' },
];

// Filter options
const sexOptions = [
  { id: '', name: 'Tất cả' },
  { id: 'Women', name: 'Nữ' },
  { id: 'Men', name: 'Nam' },
  { id: 'Unisex', name: 'Unisex' },
];

const typeOptions = [
  { id: '', name: 'Tất cả' },
  // Skincare
  { id: 'Cleanser', name: 'Sữa rửa mặt' },
  { id: 'Toner', name: 'Toner' },
  { id: 'Serum', name: 'Serum' },
  { id: 'Face Mask', name: 'Mặt nạ' },
  { id: 'Cream', name: 'Kem dưỡng' },
  // Body Care
  { id: 'Body Lotion', name: 'Sữa dưỡng thể' },
  { id: 'Body Wash', name: 'Sữa tắm' },
  { id: 'Deodorant', name: 'Lăn khử mùi' },
  { id: 'Sunscreen', name: 'Kem chống nắng' },
  // Lip & Nail
  { id: 'Lip Balm', name: 'Son dưỡng' },
  { id: 'Lip Stick', name: 'Son môi' },
];

const brandOptions = [
  { id: '', name: 'Tất cả' },
  { id: 'Naris Cosmetics', name: 'Naris Cosmetics' },
  { id: 'L\'Oreal', name: 'L\'Oreal' },
  { id: 'Eucerin', name: 'Eucerin' },
  { id: 'La Roche-Posay', name: 'La Roche-Posay' },
  { id: 'Cocoon', name: 'Cocoon' },
  { id: 'Bioderma', name: 'Bioderma' },
  { id: 'CeraVe', name: 'CeraVe' },
  { id: 'Cetaphil', name: 'Cetaphil' },
];

const skinTypeOptions = [
  { id: '', name: 'Tất cả' },
  { id: 'Normal', name: 'Da thường' },
  { id: 'Dry', name: 'Da khô' },
  { id: 'Oily', name: 'Da dầu' },
  { id: 'Combination', name: 'Da hỗn hợp' },
  { id: 'Sensitive', name: 'Da nhạy cảm' },
];

const skinColorOptions = [
  { id: '', name: 'Tất cả' },
  { id: 'Light', name: 'Sáng' },
  { id: 'Medium', name: 'Vừa' },
  { id: 'Tan', name: 'Rám nắng' },
  { id: 'Dark', name: 'Tối' },
];

const volumeOptions = [
  { id: '', name: 'Tất cả' },
  { id: '10g', name: '10g' },
  { id: '30ml', name: '30ml' },
  { id: '50ml', name: '50ml' },
  { id: '100ml', name: '100ml' },
  { id: '200ml', name: '200ml' },
];

const stockOptions = [
  { id: '', name: 'Tất cả' },
  { id: 'in_stock', name: 'Còn hàng' },
  { id: 'out_of_stock', name: 'Hết hàng' },
];

export default function ShopScreen() {
  const navigation = useNavigation();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // Filter states
  const [selectedSex, setSelectedSex] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [selectedSkinColor, setSelectedSkinColor] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  
  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // API data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Fetch products from API
  const fetchProducts = async (page = 1, append = false) => {
    try {
      if (page === 1 && !append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Build API parameters
      const params = {
        pageIndex: page,
        pageSize: 20,
      };

      // Add search filter
      if (searchQuery.trim()) {
        params.searchByName = searchQuery.trim();
      }

      // Add category filter
      if (selectedCategory !== 'all') {
        params.searchByTag = selectedCategory;
      }

      // Add filter parameters
      if (selectedSex) params.sex = selectedSex;
      if (selectedType) params.type = selectedType;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedSkinType) params.skinType = selectedSkinType;
      if (selectedSkinColor) params.skinColor = selectedSkinColor;
      if (selectedVolume) params.volume = selectedVolume;
      if (selectedStock === 'in_stock') params.inStock = true;
      if (selectedStock === 'out_of_stock') params.inStock = false;

      console.log('Fetching products with params:', params);
      const response = await productService.getAllProducts(params);
      
      if (response.success) {
        // Transform API products to app format
        const transformedProducts = response.products.map(apiProduct => 
          productService.transformProduct(apiProduct)
        );

        if (append && page > 1) {
          // Append to existing products for pagination
          setProducts(prev => [...prev, ...transformedProducts]);
        } else {
          // Replace products for new search/filter
          setProducts(transformedProducts);
        }
        
        setTotal(response.total);
        setCurrentPage(page);
        
        // Check if there's more data to load
        const totalLoaded = append ? products.length + transformedProducts.length : transformedProducts.length;
        setHasMoreData(totalLoaded < response.total);
        
        console.log(`Loaded ${transformedProducts.length} products, total: ${response.total}`);
      } else {
        setError(response.error || 'Không thể tải danh sách sản phẩm');
        console.error('Error fetching products:', response.error);
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Error in fetchProducts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Load more products for pagination
  const loadMoreProducts = () => {
    if (!loadingMore && hasMoreData && products.length > 0) {
      fetchProducts(currentPage + 1, true);
    }
  };

  // Refresh products
  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchProducts(1, false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSex('');
    setSelectedType('');
    setSelectedBrand('');
    setSelectedSkinType('');
    setSelectedSkinColor('');
    setSelectedVolume('');
    setSelectedStock('');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedSex || selectedType || selectedBrand || selectedSkinType || 
           selectedSkinColor || selectedVolume || selectedStock || 
           selectedCategory !== 'all' || searchQuery.trim();
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1, false);
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchProducts(1, false);
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSex, selectedType, selectedBrand, 
      selectedSkinType, selectedSkinColor, selectedVolume, selectedStock]);

  // Sort products locally
  const sortProducts = (productList) => {
    const sorted = [...productList];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return new Date(b._original?.createdAt || 0) - new Date(a._original?.createdAt || 0);
        });
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'popular':
      default:
        return sorted.sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return b.rating - a.rating;
        });
    }
  };

  // Handle product press
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      product,
      productId: product.id 
    });
  };

  // Render product item
  const renderProduct = ({ item, index }) => (
    <View style={[styles.productWrapper, { marginRight: index % 2 === 0 ? 8 : 0 }]}>
      <ProductCard 
        product={item}
        onPress={() => handleProductPress(item)}
        style={styles.productCard}
      />
    </View>
  );

  // Render category button
  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.activeCategoryButton
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedCategory === item.id ? colors.white : colors.textSecondary} 
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.activeCategoryButtonText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render filter option
  const renderFilterOption = (title, options, selectedValue, onSelect) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                selectedValue === option.id && styles.activeFilterOption
              ]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={[
                styles.filterOptionText,
                selectedValue === option.id && styles.activeFilterOptionText
              ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render footer for FlatList
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Get sorted products
  const sortedProducts = sortProducts(products);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for products..."
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Filter and Sort Bar */}
      <View style={styles.toolbarContainer}>
        <View style={styles.toolbarLeft}>
          <Text style={styles.resultsText}>
            {total > 0 ? `${total} sản phẩm` : 'Không có sản phẩm'}
          </Text>
          {hasActiveFilters() && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="close-circle" size={16} color={colors.error} />
              <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.toolbarRight}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={18} color={colors.accent} />
            <Text style={styles.filterButtonText}>Lọc</Text>
            {hasActiveFilters() && <View style={styles.filterIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={styles.sortButtonText}>
              {sortOptions.find(option => option.id === sortBy)?.name}
            </Text>
            <Ionicons 
              name={showSortOptions ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Options Dropdown */}
      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.activeSortOption
              ]}
              onPress={() => {
                setSortBy(option.id);
                setShowSortOptions(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.activeSortOptionText
              ]}>
                {option.name}
              </Text>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={16} color={colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchProducts(1, false)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <FlatList
          data={sortedProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsContainer}
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
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptySubtitle}>
                Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderFilterOption('Giới tính', sexOptions, selectedSex, setSelectedSex)}
            {renderFilterOption('Loại sản phẩm', typeOptions, selectedType, setSelectedType)}
            {renderFilterOption('Thương hiệu', brandOptions, selectedBrand, setSelectedBrand)}
            {renderFilterOption('Loại da', skinTypeOptions, selectedSkinType, setSelectedSkinType)}
            {renderFilterOption('Màu da', skinColorOptions, selectedSkinColor, setSelectedSkinColor)}
            {renderFilterOption('Dung tích', volumeOptions, selectedVolume, setSelectedVolume)}
            {renderFilterOption('Tình trạng', stockOptions, selectedStock, setSelectedStock)}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.sizes.header,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
  },
  categoriesContainer: {
    paddingVertical: dimensions.spacing.small,
  },
  categoriesList: {
    paddingHorizontal: dimensions.spacing.medium,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    marginRight: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.large,
    backgroundColor: colors.lightGray,
  },
  activeCategoryButton: {
    backgroundColor: colors.accent,
  },
  categoryButtonText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginLeft: dimensions.spacing.small,
    fontWeight: typography.weights.medium,
  },
  activeCategoryButtonText: {
    color: colors.white,
  },
  toolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
  },
  toolbarLeft: {
    flex: 1,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clearFiltersText: {
    fontSize: typography.sizes.small,
    color: colors.error,
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.lightGray,
    marginRight: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    marginLeft: 4,
    fontWeight: typography.weights.medium,
  },
  filterIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: typography.sizes.small,
    color: colors.text,
    marginRight: dimensions.spacing.small,
  },
  sortOptionsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  activeSortOption: {
    backgroundColor: colors.accent + '10',
  },
  sortOptionText: {
    fontSize: typography.sizes.medium,
    color: colors.text,
  },
  activeSortOptionText: {
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  productsContainer: {
    padding: dimensions.spacing.medium,
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
  emptyTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  emptySubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 