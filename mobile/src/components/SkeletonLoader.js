import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { isDarkMode } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const bg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bg,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.kpiRow}>
        <SkeletonLoader width="31%" height={80} borderRadius={12} />
        <SkeletonLoader width="31%" height={80} borderRadius={12} />
        <SkeletonLoader width="31%" height={80} borderRadius={12} />
      </View>
      <SkeletonLoader width="60%" height={22} style={{ marginVertical: 16 }} />
      <SkeletonLoader width="100%" height={110} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={110} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
