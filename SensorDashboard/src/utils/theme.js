/**
 * Theme configuration for the SensorDashboard app
 * Modified to use white background with light gray cards
 */

export const COLORS = {
  // Primary theme colors
  background: "#FFFFFF", // White background
  card: "#FFFFFF", // White cards
  primary: "#0EA5E9", // Light blue for primary elements
  primaryDark: "#0284C7", // Darker blue for hover states
  accent: "#22D3EE", // Cyan accent color
  text: "#000000", // Dark text
  textSecondary: "#71717A", // Medium gray for secondary text
  border: "#E4E4E7", // Light gray border
  success: "#10B981", // Green for success states
  error: "#EF4444", // Red for error states
  warning: "#F59E0B", // Amber for warnings

  // Gradient colors
  gradientStart: "#0EA5E9", // Primary blue
  gradientMiddle: "#22D3EE", // Cyan accent
  gradientEnd: "#2DD4BF", // Teal accent

  // Chart colors
  chartLine: "#0EA5E9",
  chartGrid: "#E4E4E7",
  chartBackground: "transparent",
  chartDot: "#FFFFFF",

  // Status colors
  increasing: "#10B981", // Green for increasing values
  decreasing: "#EF4444", // Red for decreasing values
  stable: "#71717A", // Gray for stable values
};

// Dark theme colors
export const DARK_COLORS = {
  // Primary theme colors
  background: "#121212", // Dark background
  card: "#1E1E1E", // Dark cards
  primary: "#0EA5E9", // Keep same light blue for primary elements
  primaryDark: "#0284C7", // Same darker blue for hover states
  accent: "#22D3EE", // Keep same cyan accent color
  text: "#FFFFFF", // White text
  textSecondary: "#A1A1AA", // Light gray for secondary text
  border: "#27272A", // Dark gray border
  success: "#10B981", // Keep same green for success states
  error: "#EF4444", // Keep same red for error states
  warning: "#F59E0B", // Keep same amber for warnings

  // Gradient colors
  gradientStart: "#0EA5E9", // Keep same primary blue
  gradientMiddle: "#22D3EE", // Keep same cyan accent
  gradientEnd: "#2DD4BF", // Keep same teal accent

  // Chart colors
  chartLine: "#0EA5E9", // Keep same chart line color
  chartGrid: "#27272A", // Darker grid lines
  chartBackground: "transparent",
  chartDot: "#FFFFFF", // Keep white chart dots

  // Status colors
  increasing: "#10B981", // Keep same green for increasing values
  decreasing: "#EF4444", // Keep same red for decreasing values
  stable: "#A1A1AA", // Lighter gray for stable values
};

// Theme context to manage theme globally
export const ThemeContext = {
  isDarkMode: false, // Default to light theme
  toggleTheme: () => {}, // Will be implemented in context
};

// Get current theme colors based on isDarkMode
export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? DARK_COLORS : COLORS;
};

export const FONTS = {
  regular: {
    fontFamily: "System",
    fontWeight: "400",
  },
  medium: {
    fontFamily: "System",
    fontWeight: "500",
  },
  bold: {
    fontFamily: "System",
    fontWeight: "700",
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const CARD_STYLE = {
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  backgroundColor: COLORS.card,
  borderWidth: 1,
  borderColor: COLORS.border,
  ...SHADOWS.small,
};

export const SCREEN_STYLE = {
  flex: 1,
  backgroundColor: COLORS.background,
  padding: 12,
};

export const BUTTON_STYLE = {
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 16,
  backgroundColor: COLORS.primary,
  alignItems: "center",
  justifyContent: "center",
};

export const CHART_CONFIG = {
  backgroundColor: COLORS.chartBackground,
  backgroundGradientFrom: COLORS.background,
  backgroundGradientTo: COLORS.background,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: COLORS.primary,
  },
  propsForBackgroundLines: {
    stroke: COLORS.chartGrid,
    strokeWidth: 1,
    strokeDasharray: "6, 6",
  },
  propsForLabels: {
    fontSize: 10,
    fontWeight: "bold",
    fill: COLORS.textSecondary,
  },
};
