import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { CacheService } from '../services/cacheService';

// Résolution dynamique de l'URL de base
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Intercepteur Token JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@btp_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Erreur lecture token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur Retry (3 tentatives) + Cache Fallback + Auth 401
api.interceptors.response.use(
  async (response) => {
    // Si la requête GET réussit, sauvegarder la réponse en cache
    if (response.config.method === 'get' && response.data) {
      const cacheKey = response.config.url.replace(/^\//, '').replace(/\//g, '_');
      await CacheService.setCache(cacheKey, response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Déconnexion propre sur 401
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem('@btp_token');
      } catch (e) {}
      return Promise.reject(error);
    }

    // Gestion du retry x3 en cas d'échec réseau ou 5xx
    if (config && (!config._retryCount || config._retryCount < 3)) {
      config._retryCount = (config._retryCount || 0) + 1;

      // Délai exponentiel (500ms, 1000ms, 2000ms)
      const delay = Math.pow(2, config._retryCount) * 250;
      await new Promise(resolve => setTimeout(resolve, delay));

      return api(config);
    }

    // Si la requête GET échoue définitivement, tenter le retour du cache local
    if (config && config.method === 'get') {
      const cacheKey = config.url.replace(/^\//, '').replace(/\//g, '_');
      const cachedData = await CacheService.getCache(cacheKey);
      if (cachedData) {
        console.log(`Données servies depuis le cache local pour ${config.url}`);
        return { data: cachedData, fromCache: true, status: 200, statusText: 'OK (Cache)' };
      }
    }

    return Promise.reject(error);
  }
);

export default api;
