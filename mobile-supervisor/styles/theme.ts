/**
 * SISTEMA DE DESIGN - PEGASUS V2.0
 * Design System Moderno e Profissional
 * Inspirado em: Apple, Google Material You, iOS 17
 */

export const colors = {
  // Cores Principais - Azul Moderno
  primary: '#1e40af',        // Azul principal
  primaryDark: '#1e3a8a',    // Azul escuro
  primaryLight: '#3b82f6',   // Azul claro
  
  secondary: '#0ea5e9',      // Azul sky (accent)
  secondaryDark: '#0284c7',  // Sky escuro
  secondaryLight: '#38bdf8', // Sky claro
  
  // Tons de Cinza Modernos
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Cores de Feedback Modernas
  success: '#22c55e',        // Verde vibrante
  successLight: '#dcfce7',
  successDark: '#16a34a',
  
  warning: '#f59e0b',        // Laranja suave
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  
  error: '#ef4444',          // Vermelho moderno
  errorLight: '#fee2e2',
  errorDark: '#dc2626',
  
  info: '#3b82f6',           // Azul informativo
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
  
  // Cores de Fundo Modernas
  background: '#ffffff',
  backgroundSecondary: '#fafafa',
  backgroundTertiary: '#f5f5f5',
  
  // Cores de Texto Modernas
  textPrimary: '#171717',
  textSecondary: '#525252',
  textTertiary: '#a3a3a3',
  
  // Cores Especiais
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Glassmorphism
  glassDark: 'rgba(0, 0, 0, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.9)',
  glassBlur: 'rgba(255, 255, 255, 0.7)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
}

// Sombras Modernas e Suaves
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
}

export const typography = {
  // Tamanhos de Fonte
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  
  // Pesos de Fonte
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

// Gradientes Modernos
export const gradients = {
  primary: ['#1e40af', '#0f172a', '#1e3a8a'],      // Azul metálico
  secondary: ['#0ea5e9', '#0284c7'],                // Sky
  success: ['#22c55e', '#16a34a'],                  // Verde
  warning: ['#f59e0b', '#d97706'],                  // Laranja
  error: ['#ef4444', '#dc2626'],                    // Vermelho
  light: ['#ffffff', '#fafafa'],                    // Claro
  dark: ['#171717', '#0a0a0a'],                     // Escuro
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'], // Glassmorphism
}

// Status de Pedidos
export const statusColors = {
  'Pendente': colors.warning,
  'Aprovado': colors.success,
  'Em Separação': colors.info,
  'Enviado': colors.secondary,
  'Entregue': colors.success,
  'Cancelado': colors.error,
  'Aguardando Autorização': colors.warning,
}

// Urgência de Pedidos
export const urgencyColors = {
  'Urgente': colors.error,
  'Alta': colors.warning,
  'Média': colors.info,
  'Baixa': colors.gray500,
}

