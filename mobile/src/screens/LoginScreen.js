import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sun, Moon, HardHat } from 'lucide-react-native';

export function LoginScreen() {
  const [email, setEmail] = useState('admin@chantier.fr');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { themeColors, isDark, toggleTheme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: themeColors.background },
        ]}
      >
        <View style={styles.topRightThemeToggle}>
          <Button
            title=""
            onPress={toggleTheme}
            variant="secondary"
            style={styles.themeBtn}
          />
        </View>

        <View style={styles.logoContainer}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryBackground }]}>
            <HardHat size={42} color={themeColors.primary} />
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Gestion Chantier
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Accédez à votre espace de gestion mobile
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.cardBorder }]}>
          {errorMsg ? (
            <View style={[styles.errorBox, { backgroundColor: themeColors.dangerBg }]}>
              <Text style={[styles.errorText, { color: themeColors.danger }]}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            label="Adresse Email"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  topRightThemeToggle: {
    position: 'absolute',
    top: 50,
    right: 24,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
