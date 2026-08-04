import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@btp_token');
        if (storedToken) {
          setToken(storedToken);
          // Valider le jeton avec le backend
          const response = await api.get('/auth/me');
          setUser(response.data.user || response.data);
        }
      } catch (error) {
        console.error('Échec de la validation de session:', error);
        await AsyncStorage.removeItem('@btp_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, mot_de_passe: password });
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('@btp_token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Identifiants invalides ou connexion au serveur impossible.'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@btp_token');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Erreur déconnexion:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};
