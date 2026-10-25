export interface EnvironmentConfig {
  env: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  wsBaseUrl: string;
  enableAnalytics: boolean;
  enableOfflineCache: boolean;
  requestTimeoutMs: number;
}

const DEV_CONFIG: EnvironmentConfig = {
  env: 'development',
  apiBaseUrl: 'https://api-dev.smartlivestockhealth.com/v1',
  wsBaseUrl: 'wss://api-dev.smartlivestockhealth.com/ws',
  enableAnalytics: false,
  enableOfflineCache: true,
  requestTimeoutMs: 15000,
};

const STAGING_CONFIG: EnvironmentConfig = {
  env: 'staging',
  apiBaseUrl: 'https://api-staging.smartlivestockhealth.com/v1',
  wsBaseUrl: 'wss://api-staging.smartlivestockhealth.com/ws',
  enableAnalytics: true,
  enableOfflineCache: true,
  requestTimeoutMs: 15000,
};

const PROD_CONFIG: EnvironmentConfig = {
  env: 'production',
  apiBaseUrl: 'https://smart-livestock-backend-98l7.onrender.com/api/v1',
  wsBaseUrl: 'wss://smart-livestock-backend-98l7.onrender.com/ws',
  enableAnalytics: true,
  enableOfflineCache: true,
  requestTimeoutMs: 10000,
};

export const getDynamicHostIp = (): string | null => {
  try {
    const Constants = require('expo-constants');
    const constantsObj = Constants?.default || Constants;
    const hostUri = constantsObj?.expoConfig?.hostUri || constantsObj?.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {
    // Ignore constants resolution failure in Node test environments
  }
  return null;
};

export const formatApiUrl = (url?: string, defaultFallback = 'http://localhost:8085/api/v1'): string => {
  let targetUrl = url;
  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (isWeb) {
    const hostname = window.location.hostname || 'localhost';
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && url && /http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(url)) {
      targetUrl = `http://${hostname}:8085/api/v1`;
    }
  } else {
    // Mobile runtime: if targetUrl points to localhost or is missing, resolve dynamic dev host IP
    if (!targetUrl || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
      const dynamicIp = getDynamicHostIp();
      if (dynamicIp) {
        targetUrl = `http://${dynamicIp}:8085/api/v1`;
      }
    }
  }

  if (!targetUrl || !targetUrl.trim()) {
    return defaultFallback;
  }
  let trimmed = targetUrl.trim().replace(/\/+$/, '');
  if (!trimmed.endsWith('/api/v1')) {
    if (trimmed.endsWith('/v1')) {
      trimmed = trimmed.substring(0, trimmed.length - 3) + '/api/v1';
    } else {
      trimmed = `${trimmed}/api/v1`;
    }
  }
  return trimmed;
};
const getEnv = (): EnvironmentConfig => {
  const isDevMode = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || (isDevMode ? 'development' : 'production');
  const customApiUrl = process.env.EXPO_PUBLIC_API_URL;

  switch (appEnv) {
    case 'production':
      return {
        ...PROD_CONFIG,
        apiBaseUrl: formatApiUrl(customApiUrl, PROD_CONFIG.apiBaseUrl),
      };
    case 'staging':
      return {
        ...STAGING_CONFIG,
        apiBaseUrl: formatApiUrl(customApiUrl, STAGING_CONFIG.apiBaseUrl),
      };
    default:
      return {
        ...DEV_CONFIG,
        apiBaseUrl: formatApiUrl(customApiUrl, 'http://localhost:8085/api/v1'),
      };
  }
};

export const Env = getEnv();
