/**
 * SISTEMA DE DESIGN - PEGASUS
 * Paleta de cores e estilos modernos
 */

export const colors = {
  // Cores Principais da Empresa
  primary: '#a2122a',      // Vermelho Pegasus
  primaryDark: '#7d0e1f',  // Vermelho escuro
  primaryLight: '#c71a35', // Vermelho claro
  
  secondary: '#354a80',    // Azul Pegasus
  secondaryDark: '#263659', // Azul escuro
  secondaryLight: '#4a6399', // Azul claro
  
  // Tons de Cinza
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Cores de Feedback
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  
  // Cores de Fundo
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  
  // Cores de Texto
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Cores Especiais
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
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

// Gradientes da Empresa
export const gradients = {
  primary: ['#a2122a', '#7d0e1f'],
  secondary: ['#354a80', '#263659'],
  mixed: ['#a2122a', '#354a80'],
  light: ['#ffffff', '#f9fafb'],
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

