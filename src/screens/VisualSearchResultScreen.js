import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../constants';
import { ProductCard } from '../components/product';

const VisualSearchResultScreen = ({ route, navigation }) => {
  const { products = [], image, tags = [], total = 0 } = route.params || {};

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  const renderTag = (tag) => (
    <View key={tag} style={styles.tag}>
      <Text style={styles.tagText}>#{tag}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search result</Text>
        <TouchableOpacity
          style={styles.searchAgainButton}
          onPress={() => navigation.navigate('VisualSearch')}
        >
          <Ionicons name="search-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Search Image Preview */}
        {image && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Search image</Text>
            <View style={styles.searchImageContainer}>
              <Image source={{ uri: image }} style={styles.searchImage} />
              <TouchableOpacity
                style={styles.searchAgainBtn}
                onPress={() => navigation.navigate('VisualSearch')}
              >
                <Ionicons name="camera-outline" size={16} color={colors.accent} />
                <Text style={styles.searchAgainText}>Search for another image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tags Section */}
        {tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>AI classification</Text>
            <View style={styles.tagsContainer}>
              {tags.map(renderTag)}
            </View>
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsCount}>
            {total > 0 ? `Found ${total} similar products` : 'No products found'}
          </Text>
        </View>

        {/* Products Grid */}
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
            contentContainerStyle={styles.productsGrid}
          />
        ) : (
          /* No Results */
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.noResultsTitle}>No products found</Text>
            <Text style={styles.noResultsText}>
              Try with a different image or adjust the angle to get better results
            </Text>
            
            {/* Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              <Text style={styles.suggestionItem}>• Take a clear photo, with enough light</Text>
              <Text style={styles.suggestionItem}>• Focus on the main product</Text>
              <Text style={styles.suggestionItem}>• Avoid covering the brand</Text>
              <Text style={styles.suggestionItem}>• Try different angles</Text>
            </View>

            <TouchableOpacity
              style={styles.browseAllButton}
              onPress={() => navigation.navigate('ShopScreen')}
            >
              <Ionicons name="grid-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.browseAllText}>View all products</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Browse All Products Section */}
        {products.length > 0 && (
          <View style={styles.browseSection}>
            <View style={styles.browseDivider} />
            <Text style={styles.browseTitle}>No products found</Text>
            <Text style={styles.browseSubtitle}>
              Explore all product categories
            </Text>
            <TouchableOpacity
              style={styles.browseAllButton}
              onPress={() => navigation.navigate('ShopScreen')}
            >
              <Ionicons name="grid-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.browseAllText}>View all products</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: dimensions.spacing.small,
  },
  headerTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  searchAgainButton: {
    padding: dimensions.spacing.small,
  },
  imageSection: {
    padding: dimensions.spacing.large,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.medium,
  },
  searchImageContainer: {
    alignItems: 'center',
  },
  searchImage: {
    width: 120,
    height: 120,
    borderRadius: dimensions.borderRadius.medium,
    resizeMode: 'cover',
    marginBottom: dimensions.spacing.small,
  },
  searchAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.medium,
  },
  searchAgainText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    marginLeft: 4,
    fontWeight: typography.weights.medium,
  },
  tagsSection: {
    paddingHorizontal: dimensions.spacing.large,
    marginBottom: dimensions.spacing.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.large,
    marginRight: dimensions.spacing.small,
    marginBottom: dimensions.spacing.small,
  },
  tagText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  resultsSection: {
    paddingHorizontal: dimensions.spacing.large,
    marginBottom: dimensions.spacing.medium,
  },
  resultsCount: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  productsGrid: {
    paddingHorizontal: dimensions.spacing.large,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    width: '48%',
    marginBottom: dimensions.spacing.medium,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: dimensions.spacing.xLarge,
  },
  noResultsTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  noResultsText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: dimensions.spacing.large,
  },
  suggestionsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
    padding: dimensions.spacing.large,
    width: '100%',
    marginBottom: dimensions.spacing.large,
  },
  suggestionsTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.medium,
  },
  suggestionItem: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  browseSection: {
    padding: dimensions.spacing.large,
    alignItems: 'center',
  },
  browseDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: dimensions.spacing.large,
  },
  browseTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.small,
  },
  browseSubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.large,
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  browseAllText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  bottomSpacing: {
    height: dimensions.spacing.xLarge,
  },
});

export default VisualSearchResultScreen; 