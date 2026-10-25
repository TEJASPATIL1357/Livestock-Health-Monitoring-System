export const colors = {
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981', // Emerald Primary CTA
    600: '#059669',
    700: '#15803D',
    800: '#1E3A2B', // Forest Green Accent
    900: '#14271D',
  },
  accent: {
    gold: '#D97706',
    amber: '#F59E0B',
    sky: '#0284C7',
    pink: '#EC4899',
    purple: '#8B5CF6',
    teal: '#14B8A6',
  },
  gridBadges: {
    animalsBg: '#DCFCE7', // Soft Green
    animalsIcon: '#059669',
    healthBg: '#FCE7F3', // Soft Pink
    healthIcon: '#EC4899',
    milkBg: '#E0F2FE', // Soft Sky Blue
    milkIcon: '#0284C7',
    devicesBg: '#F3E8FF', // Soft Purple
    devicesIcon: '#8B5CF6',
    reportsBg: '#FEF3C7', // Soft Orange / Amber
    reportsIcon: '#D97706',
    moreBg: '#F1F5F9', // Soft Slate
    moreIcon: '#64748B',
  },
  neutral: {
    50: '#F4F7F4', // Soft Earthy Light Background
    100: '#EAEFEA', // Secondary surface
    200: '#E2E8F0', // Border subtle
    300: '#CBD5E1', // Border focus
    400: '#94A3B8', // Text muted
    500: '#64748B', // Icon neutral
    600: '#475569', // Text secondary
    700: '#334155', // Text primary medium
    800: '#1E293B', // Dark card
    900: '#0F172A', // Primary Text Dark
  },
  status: {
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
  },
  surface: {
    card: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    glassSubtle: 'rgba(240, 253, 244, 0.75)',
    overlay: 'rgba(15, 23, 42, 0.4)',
    disabled: '#E2E8F0',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    display: 42,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#1E3A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E3A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1E3A2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const touchTarget = {
  minHeight: 48,
  minWidth: 48,
};
