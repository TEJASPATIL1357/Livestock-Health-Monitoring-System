import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Pressable, Animated } from 'react-native';
import { theme } from '../theme/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'solid' | 'glass' | 'tinted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  variant = 'glass',
  padding = 'md',
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(animatedScale, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };



  const paddingStyle = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  }[padding];

  const variantStyle = {
    solid: styles.solidCard,
    glass: styles.glassCard,
    tinted: styles.tintedCard,
  }[variant];

  const content = (
    <View style={[styles.baseCard, variantStyle, { padding: paddingStyle }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(16, 185, 129, 0.12)' }}
      >
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  solidCard: {
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.md,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.shadows.md,
  },
  tintedCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.7)',
    ...theme.shadows.sm,
  },
});
