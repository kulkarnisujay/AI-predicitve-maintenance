/**
 * Sensor Utilities
 *
 * This file provides utility functions for working with sensor data,
 * including data fetching, formatting, and calculations.
 */

import { supabase } from "./supabase";
import { SENSOR_UNITS, SENSOR_NAMES } from "./config";

/**
 * Fetches the latest sensor data from Supabase
 * @returns {Promise<Object>} The latest sensor data record
 */
export const getLatestSensorData = async () => {
  try {
    const { data, error } = await supabase
      .from("sensor_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    return null;
  }
};

/**
 * Fetches historical sensor data for a specific time range
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of sensor data records
 */
export const getHistoricalData = async (days = 7) => {
  try {
    const { data, error } = await supabase
      .from("sensor_history")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching historical sensor data:", error);
    return [];
  }
};

/**
 * Formats a sensor value with appropriate units based on the field type
 * @param {string} field - The sensor field name
 * @param {number} value - The value to format
 * @returns {string} Formatted value with units
 */
export const formatSensorValue = (field, value) => {
  if (value === null || value === undefined) return "N/A";

  // Handle boolean values (like compressor_status)
  if (typeof value === "boolean") {
    return value ? "On" : "Off";
  }

  // Get the appropriate unit for the field
  const unit = SENSOR_UNITS[field] || "";

  // Format the value based on the field type
  if (field.includes("temperature")) {
    return `${value.toFixed(1)}${unit}`;
  } else if (field.includes("humidity")) {
    return `${value.toFixed(1)}${unit}`;
  } else if (field.includes("pressure")) {
    return `${value.toFixed(2)}${unit}`;
  } else if (field === "compressor_cycle_time") {
    return `${value} seconds`;
  } else {
    // Default formatting for other numeric values
    return `${value.toFixed(2)}${unit}`;
  }
};

/**
 * Formats temperature values with appropriate units
 * @param {number} value - The temperature value
 * @returns {string} Formatted temperature string
 */
export const formatTemperature = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(1)}°C`;
};

/**
 * Formats humidity values with appropriate units
 * @param {number} value - The humidity value
 * @returns {string} Formatted humidity string
 */
export const formatHumidity = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(1)}%`;
};

/**
 * Formats pressure values with appropriate units
 * @param {number} value - The pressure value
 * @returns {string} Formatted pressure string
 */
export const formatPressure = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)} kPa`;
};

/**
 * Calculates average value from an array of objects
 * @param {Array} data - Array of objects containing sensor data
 * @param {string} field - The field to calculate average for
 * @returns {number} The average value
 */
export const calculateAverage = (data, field) => {
  if (!data || data.length === 0) return null;

  const validValues = data
    .map((item) => item[field])
    .filter((value) => value !== null && value !== undefined);

  if (validValues.length === 0) return null;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
};

/**
 * Calculates minimum value from an array of objects
 * @param {Array} data - Array of objects containing sensor data
 * @param {string} field - The field to find minimum for
 * @returns {number} The minimum value
 */
export const calculateMinimum = (data, field) => {
  if (!data || data.length === 0) return null;

  const validValues = data
    .map((item) => item[field])
    .filter((value) => value !== null && value !== undefined);

  if (validValues.length === 0) return null;

  return Math.min(...validValues);
};

/**
 * Calculates maximum value from an array of objects
 * @param {Array} data - Array of objects containing sensor data
 * @param {string} field - The field to find maximum for
 * @returns {number} The maximum value
 */
export const calculateMaximum = (data, field) => {
  if (!data || data.length === 0) return null;

  const validValues = data
    .map((item) => item[field])
    .filter((value) => value !== null && value !== undefined);

  if (validValues.length === 0) return null;

  return Math.max(...validValues);
};

/**
 * Gets the appropriate unit for a sensor field
 * @param {string} field - The sensor field name
 * @returns {string} The unit for the field
 */
export const getUnitForField = (field) => {
  return SENSOR_UNITS[field] || "";
};

/**
 * Gets a human-readable name for a sensor field
 * @param {string} field - The sensor field name from the database
 * @returns {string} Human-readable field name
 */
export const getReadableFieldName = (field) => {
  return (
    SENSOR_NAMES[field] ||
    field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};
