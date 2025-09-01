/**
 * Application Configuration
 *
 * This file contains global configuration settings for the application.
 * Centralizing these values makes it easier to update them across the app.
 */

import { BACKEND_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

// Backend API URL
// For local development, use your computer's IP address instead of localhost
// In production, this should be set to your actual backend URL
export const API_URL = BACKEND_URL || "http://localhost:3000";

// Export a function to check server connectivity
export const checkServerConnectivity = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error("Server connectivity check failed:", error);
    return false;
  }
};

// Supabase configuration
// These values MUST be set in environment variables
if (!SUPABASE_URL) {
  console.error("Missing REACT_APP_SUPABASE_URL environment variable");
}

if (!SUPABASE_ANON_KEY) {
  console.error("Missing REACT_APP_SUPABASE_ANON_KEY environment variable");
}

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL || "",
  anonKey: SUPABASE_ANON_KEY || "",
};

// Chart configuration
export const CHART_CONFIG = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#007AFF",
  },
};

// Sensor units configuration
export const SENSOR_UNITS = {
  temperature_internal: "°C",
  temperature_evaporator: "°C",
  ambient_temperature: "°C",
  humidity_internal: "%",
  pressure_refrigerant: "kPa",
  current_compressor: "A",
  vibration_level: "mm/s",
  gas_leak_level: "ppm",
  energy_consumption: "kWh",
  temperature_gradient: "°C/h",
  pressure_trend: "kPa/h",
};

// Sensor display names
export const SENSOR_NAMES = {
  temperature_internal: "Internal Temperature",
  temperature_evaporator: "Evaporator Temperature",
  ambient_temperature: "Ambient Temperature",
  humidity_internal: "Internal Humidity",
  pressure_refrigerant: "Refrigerant Pressure",
  current_compressor: "Compressor Current",
  vibration_level: "Vibration Level",
  gas_leak_level: "Gas Leak Level",
  compressor_status: "Compressor Status",
  compressor_cycle_time: "Compressor Cycle Time",
  energy_consumption: "Energy Consumption",
  temperature_gradient: "Temperature Gradient",
  pressure_trend: "Pressure Trend",
};
