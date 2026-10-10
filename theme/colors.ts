export const colors = {
  // Backgrounds (Apple dark hierarchy)
  background: {
    base: '#000000', // Pitch black
    primary: '#121214', // Elevated dark surface
    secondary: '#1C1C1E', // Apple System Gray 6 (Dark)
    tertiary: '#2C2C2E', // Apple System Gray 5 (Dark)
    elevated: '#3A3A3C', // Apple System Gray 4 (Dark)
  },

  // Brand / Action (Apple System Red)
  brand: {
    primary: '#FF3B30', // Apple System Red
    primaryPressed: '#D32F2F', // Deep red
    primarySubtle: 'rgba(255, 59, 48, 0.14)', // Subtle red tint for pills/chips
    primaryGlow: 'rgba(255, 59, 48, 0.28)',
  },

  // Semantic Status
  status: {
    success: '#30D158', // Apple System Green
    successSubtle: 'rgba(48, 209, 88, 0.14)',
    warning: '#FFD60A', // Apple System Yellow
    warningSubtle: 'rgba(255, 214, 10, 0.14)',
    error: '#FF3B30', // Apple System Red
    errorSubtle: 'rgba(255, 59, 48, 0.14)',
    info: '#0A84FF', // Apple System Blue
    infoSubtle: 'rgba(10, 132, 255, 0.14)',
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93', // Apple System Gray (Dark)
    tertiary: '#636366', // Apple System Gray 2 (Dark)
    muted: '#48484A', // Apple System Gray 3 (Dark)
  },

  // Separators & Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.16)',
    active: '#FF3B30',
    separator: 'rgba(84, 84, 88, 0.65)',
  },

  // Overlay
  overlay: {
    modal: 'rgba(0, 0, 0, 0.75)',
    noise: 'rgba(255, 255, 255, 0.035)',
  },
} as const;

export type Colors = typeof colors;
