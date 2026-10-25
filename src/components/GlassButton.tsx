import React from 'react';
import { StyleSheet, Pressable, ViewStyle, TextStyle, Animated, ActivityIndicator, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  style,
  textStyle,
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'glass':
        return styles.glassBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.neutral[400];
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.primary[800];
      case 'outline':
        return theme.colors.primary[700];
      case 'glass':
        return theme.colors.primary[800];
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: animatedScale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.25)' }}
        style={[
          styles.baseBtn,
          styles[size],
          getContainerStyle(),
          disabled && styles.disabledBtn,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && <View style={styles.leftIcon}>{icon}</View>}
            <AppText
              variant="label"
              weight="bold"
              style={[{ color: getTextColor() }, textStyle]}
            >
              {title}
            </AppText>
            {icon && iconPosition === 'right' && <View style={styles.rightIcon}>{icon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    height: 56,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary[500],
    ...theme.shadows.md,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.primary[100],
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary[500],
  },
  glassBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...theme.shadows.sm,
  },
  disabledBtn: {
    backgroundColor: theme.colors.surface.disabled,
    borderColor: theme.colors.neutral[300],
    elevation: 0,
    shadowOpacity: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
});
