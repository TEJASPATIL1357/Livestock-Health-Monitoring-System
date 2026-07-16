// API Configuration
export const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  LATEST_DATA: '/latest-data',
  HISTORY: '/history',
  CHATBOT: '/chatbot',
};

// Health status thresholds
export const HEALTH_THRESHOLDS = {
  TEMPERATURE: {
    MIN_NORMAL: 37.5,
    MAX_NORMAL: 39.5,
    FEVER: 40.0,
    CRITICAL: 41.0,
  },
  ACTIVITY: {
    LOW: 20,
    MODERATE: 50,
    HIGH: 80,
  },
  MILK_YIELD: {
    LOW: 5,
    NORMAL: 15,
    HIGH: 25,
  },
};

// Health status enum
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  MR: 'mr',
};

export const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};

// Color mappings for health status
export const STATUS_COLORS = {
  healthy: { bg: '#22c55e', text: '#f0fdf4', glow: 'rgba(34, 197, 94, 0.4)' },
  warning: { bg: '#f59e0b', text: '#fffbeb', glow: 'rgba(245, 158, 11, 0.4)' },
  critical: { bg: '#ef4444', text: '#fef2f2', glow: 'rgba(239, 68, 68, 0.4)' },
};

// Refresh intervals
export const REFRESH_INTERVAL = 10000; // 10 seconds
export const CACHE_KEY = 'livestock_cache';
export const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
