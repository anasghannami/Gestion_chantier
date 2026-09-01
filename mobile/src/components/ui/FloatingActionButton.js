import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

export function FloatingActionButton({
  onPress,
  icon: IconComponent = Plus,
  hasTabBar = false,
  style,
  size = 52,
  iconSize = 24,
}) {
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onPress?.();
  };

  const dynamicBottom = (hasTabBar ? 75 : 20) + insets.bottom;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.fab,
        {
          bottom: dynamicBottom,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: themeColors.primary,
        },
        style,
      ]}
    >
      <IconComponent size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 99,
  },
});
