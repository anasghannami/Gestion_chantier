import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function Badge({ label, type = 'info', style }) {
  const { themeColors } = useTheme();

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { bg: themeColors.successBg, text: themeColors.success };
      case 'warning':
        return { bg: themeColors.warningBg, text: themeColors.warning };
      case 'danger':
        return { bg: themeColors.dangerBg, text: themeColors.danger };
      case 'primary':
        return { bg: themeColors.primaryBackground, text: themeColors.primary };
      default:
        return { bg: themeColors.infoBg, text: themeColors.info };
    }
  };

  const colorsConfig = getTypeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: colorsConfig.bg }, style]}>
      <Text style={[styles.text, { color: colorsConfig.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
