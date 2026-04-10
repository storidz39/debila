/** 
 * Official Algerian Government Design System (Clean)
 * - Minimalist, High Readability, Solid Colors, Professional RTL.
 */

export const colors = {
  background: "#F8FAFC", // Ultra-light official gray
  surface: "#FFFFFF",
  surfaceSubtle: "#F1F5F9",
  border: "#E2E8F0",
  textPrimary: "#1E293B", // Strong dark for readability
  textSecondary: "#64748B", 
  primary: "#006233", // Official Algerian Green
  accent: "#D21034",  // Official Algerian Red (ONLY for alerts/danger)
  accentSoft: "#F0FDF4", // Very faint green for success states
  success: "#047857",
  warning: "#D97706",
  danger: "#DC2626",
  muted: "#94A3B8",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const shadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  }
};
