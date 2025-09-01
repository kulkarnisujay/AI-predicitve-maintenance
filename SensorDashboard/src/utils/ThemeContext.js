import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, DARK_COLORS } from "./theme";

// Create the theme context
const ThemeContext = createContext({
  isDarkMode: false,
  colors: COLORS,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("isDarkMode");
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === "true");
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load theme preference:", error);
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference when it changes, but only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem("isDarkMode", isDarkMode.toString());
        console.log("Theme saved:", isDarkMode ? "dark" : "light");
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    };

    saveTheme();
  }, [isDarkMode, isInitialized]);

  // Toggle theme function
  const toggleTheme = () => {
    console.log("Toggle theme called, current value:", isDarkMode);
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Get current theme colors
  const colors = isDarkMode ? DARK_COLORS : COLORS;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
