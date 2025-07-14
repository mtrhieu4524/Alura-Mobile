import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, dimensions } from '../constants';
import { productService } from '../services';
import Toast from 'react-native-toast-message';

const VisualSearchScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Request camera permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Access',
        'The app needs access to the image library to select an image.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setImageUrl('');
        setShowUrlInput(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chọn hình ảnh',
      });
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Access',
        'The app needs access to the camera to take a photo.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Cài đặt', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setImageUrl('');
        setShowUrlInput(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chụp ảnh',
      });
    }
  };

  // Handle image URL input
  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Please enter the image URL',
      });
      return;
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/).*\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
    if (!urlPattern.test(imageUrl)) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Invalid URL. Please enter the image URL (jpg, png, etc.)',
      });
      return;
    }

    setSelectedImage({ uri: imageUrl });
    setShowUrlInput(false);
  };

  // Search for products
  const searchProducts = async () => {
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Please select an image to search',
      });
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      if (selectedImage.uri.startsWith('http')) {
        // Handle URL image
        const response = await fetch(selectedImage.uri);
        if (!response.ok) throw new Error('Cannot load image from URL');
        
        const blob = await response.blob();
        formData.append('imgUrls', {
          uri: selectedImage.uri,
          type: blob.type || 'image/jpeg',
          name: 'image.jpg'
        });
      } else {
        // Handle local image
        formData.append('imgUrls', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'image.jpg'
        });
      }

      // Use productService for API call
      const response = await productService.findProductsByImage(formData, {
        pageIndex: 1,
        pageSize: 20
      });

      if (response.success) {
        navigation.navigate('VisualSearchResult', {
          products: response.data.products || [],
          image: selectedImage.uri,
          tags: response.data.tags || [],
          total: response.data.total || 0,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Search error',
          text2: response.message || 'Cannot search for products',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while searching. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImageUrl('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Visual Search</Text>
          <Text style={styles.subtitle}>
            Search for products by image - AI will analyze and suggest similar products
          </Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload product image</Text>
          
          {selectedImage ? (
            /* Image Preview */
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            </View>
          ) : (
            /* Upload Placeholder */
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>
                Select an image to start searching
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {!selectedImage && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color={colors.accent} />
                <Text style={styles.actionButtonText}>Take photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
                <Ionicons name="images-outline" size={24} color={colors.accent} />
                <Text style={styles.actionButtonText}>Library</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setShowUrlInput(!showUrlInput)}
              >
                <Ionicons name="link-outline" size={24} color={colors.accent} />
                <Text style={styles.actionButtonText}>URL</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* URL Input */}
          {showUrlInput && (
            <View style={styles.urlInputContainer}>
              <View style={styles.urlInputWrapper}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Enter image URL (jpg, png, ...)"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.urlSubmitButton} onPress={handleUrlSubmit}>
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Search Button */}
        {selectedImage && (
          <View style={styles.searchSection}>
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.disabledButton]}
              onPress={searchProducts}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.searchButtonText}>Search for products</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* How it works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Take a photo or upload a product image
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                AI will analyze the image and identify the product type
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                View the list of similar products and details
              </Text>
            </View>
          </View>
        </View>
        
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
    padding: dimensions.spacing.large,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxLarge,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadSection: {
    marginHorizontal: dimensions.spacing.large,
    marginBottom: dimensions.spacing.large,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.medium,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: dimensions.spacing.medium,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: dimensions.borderRadius.large,
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: dimensions.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginBottom: dimensions.spacing.medium,
  },
  placeholderText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginTop: dimensions.spacing.small,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: dimensions.spacing.medium,
  },
  actionButton: {
    alignItems: 'center',
    padding: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.large,
    backgroundColor: colors.backgroundSecondary,
    minWidth: 80,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    marginTop: 4,
    fontWeight: typography.weights.medium,
  },
  urlInputContainer: {
    marginTop: dimensions.spacing.medium,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius.medium,
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.medium,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginRight: dimensions.spacing.small,
  },
  urlSubmitButton: {
    backgroundColor: colors.accent,
    padding: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  searchSection: {
    marginHorizontal: dimensions.spacing.large,
    marginBottom: dimensions.spacing.large,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  howItWorksSection: {
    marginHorizontal: dimensions.spacing.large,
    marginBottom: dimensions.spacing.large,
    padding: dimensions.spacing.large,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
  },
  stepContainer: {
    marginTop: dimensions.spacing.medium,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: dimensions.spacing.medium,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dimensions.spacing.medium,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 120, // Space for floating tab bar
  },
});

export default VisualSearchScreen; 