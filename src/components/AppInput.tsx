import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.neutral[400]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconWrapper}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.neutral[500]} />
            ) : (
              <Eye size={20} color={theme.colors.neutral[500]} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <AppText variant="caption" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.neutral[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.touchTarget.minHeight,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    paddingHorizontal: theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.primary[800],
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[900],
    paddingVertical: theme.spacing.sm,
  },
  leftIconWrapper: {
    marginRight: theme.spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: theme.spacing.sm,
    padding: 4,
  },
  errorText: {
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
  },
});
