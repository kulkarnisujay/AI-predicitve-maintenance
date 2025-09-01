import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CARD_STYLE } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

// Cache for sensor data to improve performance
let dataCache = {
  timestamp: null,
  current: null,
  previous: null,
  expiryTime: 10000, // Cache expiry in ms (10 seconds)
};

export default function Dashboard() {
  const { colors } = useTheme();
  const [sensorData, setSensorData] = useState({});
  const [previousData, setPreviousData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Create theme-aware styles
  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          padding: 12,
        },
        headerContainer: {
          marginBottom: 20,
          paddingHorizontal: 5,
          paddingTop: 10,
        },
        headerTitle: {
          fontSize: 24,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 5,
        },
        headerSubtitle: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        cardContainer: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        },
        card: {
          width: cardWidth,
          height: 140,
          marginBottom: 12,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
        },
        cardContent: {
          flex: 1,
          justifyContent: "space-between",
        },
        paramName: {
          fontSize: 14,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 8,
        },
        valueContainer: {
          flex: 1,
          justifyContent: "center",
        },
        valueText: {
          fontSize: 28,
          fontWeight: "bold",
          color: colors.text,
        },
        unitText: {
          fontSize: 16,
          fontWeight: "normal",
          color: colors.textSecondary,
        },
        trendContainer: {
          flexDirection: "row",
          alignItems: "center",
        },
        trendIconUp: {
          marginRight: 4,
        },
        trendIconDown: {
          marginRight: 4,
        },
        trendIconStable: {
          marginRight: 4,
        },
        diffText: {
          fontSize: 12,
        },
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.background,
          opacity: 0.7,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
        },
      }),
    [colors]
  );

  // Function to fetch the latest data with caching
  const fetchLatestData = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now();

      // Use cached data if available and not expired
      if (
        !forceRefresh &&
        dataCache.timestamp &&
        dataCache.current &&
        now - dataCache.timestamp < dataCache.expiryTime
      ) {
        setSensorData(dataCache.current);
        setPreviousData(dataCache.previous);
        setIsLoading(false);
        console.log("Using cached data");
        return;
      }

      setIsLoading(true);

      // Get only the latest 2 records for better performance
      const { data: latestData, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(2);

      if (error) {
        console.error("Error fetching data:", error.message);
        return;
      }

      if (latestData && latestData.length > 0) {
        // Set current data to the most recent record
        const current = latestData[0];
        setSensorData(current);

        // Use the second record as previous data
        const previous = latestData.length > 1 ? latestData[1] : null;
        setPreviousData(previous || {});

        // Update cache
        dataCache = {
          ...dataCache,
          timestamp: now,
          current,
          previous: previous || {},
        };
      }
    } catch (err) {
      console.error("Failed to fetch sensor data:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchLatestData();

    // Setup real-time subscription with optimizations
    const subscription = supabase
      .channel("sensor-data-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          // Debounce frequent updates (e.g., if multiple readings come in quickly)
          if (dataCache.timestamp && Date.now() - dataCache.timestamp < 500) {
            return;
          }

          console.log("New sensor data received via subscription");
          // When new data comes in, current data becomes previous data
          const newData = payload.new;
          setPreviousData(sensorData);
          setSensorData(newData);

          // Update cache
          dataCache = {
            ...dataCache,
            timestamp: Date.now(),
            current: newData,
            previous: sensorData,
          };
        }
      )
      .subscribe();

    // Refresh data periodically (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchLatestData(true);
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchLatestData, sensorData]);

  // Memoize parameters array to avoid recreating on every render
  const parameters = useMemo(
    () => [
      "evaporator_coil_temperature",
      "freezer_temperature",
      "fridge_temperature",
      "air_temperature",
      "humidity",
      "compressor_vibration",
      "compressor_current",
      "input_voltage",
      "gas_leakage_level",
      "power_consumption",
      "temperature_diff",
    ],
    []
  );

  // Format parameter name for display
  const formatParamName = useCallback((param) => {
    return param
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Get the appropriate unit for a parameter - memoize the units object
  const units = useMemo(
    () => ({
      evaporator_coil_temperature: "°C",
      freezer_temperature: "°C",
      fridge_temperature: "°C",
      air_temperature: "°C",
      humidity: "%",
      compressor_vibration: "mm/s",
      compressor_vibration_x: "mm/s",
      compressor_vibration_y: "mm/s",
      compressor_vibration_z: "mm/s",
      compressor_current: "A",
      input_voltage: "V",
      power_consumption: "W",
      gas_leakage_level: "ppm",
      temperature_diff: "°C",
    }),
    []
  );

  const getUnit = useCallback(
    (param) => {
      return units[param] || "";
    },
    [units]
  );

  // Calculate the difference between current and previous values
  const calculateDifference = useCallback(
    (param) => {
      if (
        !sensorData ||
        !previousData ||
        typeof sensorData[param] !== "number" ||
        typeof previousData[param] !== "number"
      ) {
        return 0;
      }

      // Calculate the actual difference
      const currentValue = parseFloat(sensorData[param]);
      const prevValue = parseFloat(previousData[param]);
      return currentValue - prevValue;
    },
    [sensorData, previousData]
  );

  // Memoize the decreasing is better array
  const decreasingIsBetter = useMemo(
    () => ["compressor_vibration", "gas_leakage_level", "power_consumption"],
    []
  );

  // Determine the trend icon and color based on the difference
  const getTrendInfo = useCallback(
    (param) => {
      const diff = calculateDifference(param);
      const isDecreasingBetter = decreasingIsBetter.includes(param);

      if (Math.abs(diff) < 0.001) {
        return {
          icon: "remove-outline",
          color: colors.stable,
          iconStyle: themedStyles.trendIconStable,
        };
      }

      if (
        (diff > 0 && !isDecreasingBetter) ||
        (diff < 0 && isDecreasingBetter)
      ) {
        return {
          icon: "arrow-up-outline",
          color: colors.increasing,
          iconStyle: themedStyles.trendIconUp,
        };
      }

      return {
        icon: "arrow-down-outline",
        color: colors.decreasing,
        iconStyle: themedStyles.trendIconDown,
      };
    },
    [calculateDifference, colors, decreasingIsBetter, themedStyles]
  );

  // Handle card press with proper memoization
  const handleCardPress = useCallback(
    (param) => {
      navigation.navigate("Graph", { param });
    },
    [navigation]
  );

  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: 90 }}
    >
      <View style={themedStyles.headerContainer}>
        <Text style={themedStyles.headerTitle}>Dashboard</Text>
        <Text style={themedStyles.headerSubtitle}>
          Last updated:{" "}
          {new Date(sensorData.timestamp || Date.now()).toLocaleString()}
        </Text>
      </View>

      <View style={themedStyles.cardContainer}>
        {parameters.map((param) => {
          const trendInfo = getTrendInfo(param);
          const diff = calculateDifference(param);
          const diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
          const value = sensorData[param];
          const formattedValue = value !== undefined ? value.toFixed(1) : "N/A";

          return (
            <TouchableOpacity
              key={param}
              style={themedStyles.card}
              onPress={() => handleCardPress(param)}
            >
              <View style={themedStyles.cardContent}>
                <Text style={themedStyles.paramName}>
                  {formatParamName(param)}
                </Text>
                <View style={themedStyles.valueContainer}>
                  <Text style={themedStyles.valueText}>
                    {formattedValue}
                    <Text style={themedStyles.unitText}>{getUnit(param)}</Text>
                  </Text>
                </View>
                <View style={themedStyles.trendContainer}>
                  <Ionicons
                    name={trendInfo.icon}
                    size={16}
                    color={trendInfo.color}
                    style={trendInfo.iconStyle}
                  />
                  <Text
                    style={[themedStyles.diffText, { color: trendInfo.color }]}
                  >
                    {diffText} {getUnit(param)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {refreshing && (
        <View style={themedStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}
