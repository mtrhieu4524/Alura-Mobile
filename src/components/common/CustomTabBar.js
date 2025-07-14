import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../constants';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate icon scales and colors
    animatedValues.forEach((animValue, index) => {
      Animated.spring(animValue, {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  const getTabIcon = (routeName, focused) => {
    let iconName;
    switch (routeName) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Shop':
        iconName = focused ? 'cube' : 'cube-outline';
        break;
      case 'VisualSearch':
        iconName = focused ? 'camera' : 'camera-outline';
        break;
      case 'Cart':
        iconName = focused ? 'cart' : 'cart-outline';
        break;
      case 'Profile':
        iconName = focused ? 'person' : 'person-outline';
        break;
      default:
        iconName = 'circle-outline';
    }
    return iconName;
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Home':
        return 'Home';
      case 'Shop':
        return 'Shop';
      case 'VisualSearch':
        return 'Search';
      case 'Cart':
        return 'Cart';
      case 'Profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
        style={styles.tabBarContainer}
      >
        {/* Tab Items */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconScale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.15],
          });

          const iconTranslateY = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2],
          });

          const labelOpacity = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [
                      { scale: iconScale },
                      { translateY: iconTranslateY },
                    ],
                  },
                ]}
              >
                {/* Special styling for VisualSearch tab */}
                {route.name === 'VisualSearch' ? (
                  <View style={styles.cameraTabContainer}>
                    <LinearGradient
                      colors={isFocused ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cameraTabGradient}
                    >
                      <Ionicons
                        name={getTabIcon(route.name, isFocused)}
                        size={24}
                        color={isFocused ? colors.white : colors.textSecondary}
                      />
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={[
                    styles.iconContainer,
                    isFocused && styles.activeIconContainer
                  ]}>
                    <Ionicons
                      name={getTabIcon(route.name, isFocused)}
                      size={24}
                      color={isFocused ? '#667eea' : colors.textSecondary}
                    />
                  </View>
                )}

                <Animated.Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? '#667eea' : colors.textSecondary,
                      opacity: labelOpacity,
                    },
                  ]}
                >
                  {getTabLabel(route.name)}
                </Animated.Text>
              </Animated.View>

              {/* Active indicator dot */}
              {isFocused && (
                <Animated.View
                  style={[
                    styles.activeDot,
                    {
                      opacity: animatedValues[index],
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  tabLabel: {
    fontSize: typography.sizes.xSmall,
    fontWeight: typography.weights.medium,
    marginTop: 4,
    textAlign: 'center',
  },
  cameraTabContainer: {
    position: 'relative',
  },
  cameraTabGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667eea',
  },
});

export default CustomTabBar; 