import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style, textStyle }) {
  const { themeColors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: themeColors.primaryBackground,
          text: themeColors.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: themeColors.danger,
          text: '#ffffff',
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: themeColors.text,
          border: themeColors.border,
        };
      default:
        return {
          bg: themeColors.primary,
          text: '#ffffff',
          border: 'transparent',
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.text} />
      ) : (
        <Text style={[styles.text, { color: currentVariant.text }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
