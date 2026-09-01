import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Header } from './Header';

export function ScreenContainer({
  children,
  headerTitle,
  showBack = false,
  showLogout = false,
  rightAction,
  scrollable = false,
  hasTabBar = false,
  keyboardAvoiding = true,
  contentContainerStyle,
  style,
  refreshControl,
  safeAreaTop = true,
}) {
  const { themeColors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic bottom padding so content doesn't pass behind TabBar or bottom gesture bar
  const bottomPadding = (hasTabBar ? 76 : 16) + insets.bottom;

  // Render header if headerTitle is present or if explicitly requested
  const renderHeader = () => {
    if (!headerTitle && !showBack) return null;
    return (
      <Header
        title={headerTitle}
        showBack={showBack}
        showLogout={showLogout}
        rightAction={rightAction}
        safeAreaTop={safeAreaTop}
      />
    );
  };

  const bodyContent = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPadding },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.fixedContent,
        { paddingBottom: hasTabBar ? bottomPadding : 0 },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  const containerView = (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
        // Apply top padding if there's no header but top safe area is required
        !headerTitle && safeAreaTop ? { paddingTop: insets.top } : null,
        style,
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      {bodyContent}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {containerView}
      </KeyboardAvoidingView>
    );
  }

  return containerView;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fixedContent: {
    flex: 1,
  },
});
