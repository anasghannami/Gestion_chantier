import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, ArrowLeft } from 'lucide-react-native';

export function Header({ title, showLogout = true, showBack = false }) {
  const { themeColors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const canGoBack = showBack || (navigation && navigation.canGoBack && navigation.canGoBack());

  const paddingTop = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: themeColors.headerBackground,
          borderBottomColor: themeColors.border,
          paddingTop: paddingTop,
        },
      ]}
    >
      <View style={styles.headerContent}>
        {canGoBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: themeColors.primaryBackground }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={themeColors.primary} />
          </TouchableOpacity>
        )}

        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: themeColors.primaryBackground }]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun size={20} color={themeColors.primary} />
            ) : (
              <Moon size={20} color={themeColors.primary} />
            )}
          </TouchableOpacity>

          {showLogout && (
            <TouchableOpacity
              onPress={logout}
              style={[styles.iconButton, { backgroundColor: themeColors.dangerBg, marginLeft: 8 }]}
              activeOpacity={0.7}
            >
              <LogOut size={18} color={themeColors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
