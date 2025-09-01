import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";
import {
  checkSupabaseStatus,
  getPredictionStats,
  getLastPredictionTime,
  getDailyPredictions,
} from "../utils/anomalyService";
import { format } from "date-fns";
import { ProgressCircle } from "react-native-svg-charts";
import { LinearGradient } from "expo-linear-gradient";

export default function PredictionsScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    status: "Unknown",
    healthy: false,
  });
  const [predictionStats, setPredictionStats] = useState({
    anomaly_count: 0,
    total_predictions: 0,
    anomaly_percentage: 0,
    failure_probability_avg: 0,
    health_index_avg: 0,
    rul_avg: 0,
    status: "normal",
    latest_predictions: [],
  });
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [dailyPredictions, setDailyPredictions] = useState([]);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [timeRange, setTimeRange] = useState("present"); // default: present

  // Function to check database status
  const checkDatabaseStatus = useCallback(async () => {
    try {
      const status = await checkSupabaseStatus();
      setDbStatus(status);
      return status.healthy;
    } catch (error) {
      console.error("Error checking database status:", error);
      setDbStatus({
        status: "Error: " + (error.message || "Connection failed"),
        healthy: false,
      });
      return false;
    }
  }, []);
  
  // Function to get the last update time
  const fetchLastUpdateTime = useCallback(async () => {
    try {
      const result = await getLastPredictionTime();
      if (result.success && result.lastPredictionTime) {
        setLastUpdateTime(result.lastPredictionTime);
      }
    } catch (error) {
      console.error("Error fetching last update time:", error);
    }
  }, []);

  // Function to load prediction data
  const loadPredictionData = useCallback(
    async (range = timeRange) => {
      try {
        setIsLoading(true);

        // First check if the database is healthy
        const isHealthy = await checkDatabaseStatus();
        if (!isHealthy) {
          setIsLoading(false);
          return;
        }

        // Fetch prediction statistics
        const stats = await getPredictionStats(range);
        setPredictionStats(stats);

        // Get last update time
        await fetchLastUpdateTime();
        
        // Get daily predictions for the last 5 days
        const dailyResult = await getDailyPredictions(5);
        if (dailyResult.success) {
          setDailyPredictions(dailyResult.dailyData);
        }
      } catch (error) {
        console.error("Error loading prediction data:", error);
        Alert.alert(
          "Error",
          "Failed to load prediction data: " + (error.message || "Unknown error"),
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [checkDatabaseStatus, fetchLastUpdateTime, timeRange]
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPredictionData();
  }, [loadPredictionData]);

  // Function to handle time range selection
  const handleTimeRangeChange = useCallback(
    (range) => {
      setTimeRange(range);
      loadPredictionData(range);
    },
    [loadPredictionData]
  );

  // Initial data load
  useEffect(() => {
    loadPredictionData();
    
    // Set up auto-refresh timer (every 60 seconds)
    const timer = setInterval(() => {
      if (!refreshing && !isLoading) {
        loadPredictionData(timeRange);
      }
    }, 60000); // 60 seconds
    
    setRefreshTimer(timer);
    
    // Clean up timer on unmount
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [loadPredictionData]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "critical":
        return colors.error || "#FF3B30";
      case "warning":
        return colors.warning || "#FFCC00";
      case "normal":
        return colors.success || "#34C759";
      default:
        return colors.textSecondary;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "alert-circle";
      case "warning":
        return "warning";
      case "normal":
        return "checkmark-circle";
      default:
        return "help-circle";
    }
  };
  
  // Get health index color
  const getHealthIndexColor = (value) => {
    if (value >= 70) return colors.success || "#34C759";
    if (value >= 40) return colors.warning || "#FFCC00";
    return colors.error || "#FF3B30";
  };
  
  // Get failure probability color
  const getFailureProbColor = (value) => {
    if (value <= 0.3) return colors.success || "#34C759";
    if (value <= 0.6) return colors.warning || "#FFCC00";
    return colors.error || "#FF3B30";
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: Platform.OS === "ios" ? 60 : 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    lastUpdate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    content: {
      padding: 16,
    },
    serverStatusCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    serverStatusText: {
      fontSize: 16,
      color: colors.text,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    timeRangeSelector: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeButton: {
      flex: 1,
      padding: 10,
      alignItems: "center",
      borderRadius: 8,
    },
    timeButtonActive: {
      backgroundColor: colors.primary,
    },
    timeButtonText: {
      color: colors.text,
      fontWeight: "600",
    },
    timeButtonTextActive: {
      color: "#FFFFFF",
    },
    runButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    runButtonText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
    modelsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    modelCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "48%",
      minHeight: 160,
      justifyContent: "space-between",
    },
    modelTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    modelValue: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 8,
    },
    modelDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    circleContainer: {
      height: 80,
      justifyContent: "center",
      alignItems: "center",
    },
    circleValue: {
      position: "absolute",
      fontSize: 18,
      fontWeight: "bold",
    },
    statsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    statsLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    statsValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    statusBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    statusIcon: {
      marginRight: 8,
    },
    statusText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    anomalyCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    anomalyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    anomalyTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    anomalyTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    anomalyDetail: {
      fontSize: 14,
      color: colors.text,
      marginTop: 4,
    },
    errorText: {
      color: colors.error || "#FF3B30",
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      marginTop: 20,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Predictions</Text>
          <Text style={styles.subtitle}>ML-powered predictive maintenance</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.text }}>
            Loading predictions...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Predictions</Text>
        <Text style={styles.subtitle}>ML-powered predictive maintenance</Text>
        {lastUpdateTime && (
          <Text style={styles.lastUpdate}>
            Last update: {formatTimestamp(lastUpdateTime)}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Database Status Card */}
        <View style={styles.serverStatusCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: dbStatus.healthy
                    ? getStatusColor("normal")
                    : getStatusColor("critical"),
                },
              ]}
            />
            <Text style={styles.serverStatusText}>Database Status</Text>
          </View>
          <Text
            style={{
              color: dbStatus.healthy
                ? getStatusColor("normal")
                : getStatusColor("critical"),
            }}
          >
            {dbStatus.status}
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {[
            { key: "present", label: "Present" },
            { key: "last7days", label: "Last 7 Days" },
            { key: "alltime", label: "All-time" }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeButton,
                timeRange === option.key && styles.timeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(option.key)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === option.key && styles.timeButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* ML Models Cards */}
        <View style={styles.modelsContainer}>
          {/* Anomaly Detection */}
          <View style={styles.modelCard}>
            <Text style={styles.modelTitle}>ANOMALY DETECTION</Text>
            <View style={styles.circleContainer}>
              {predictionStats.total_predictions > 0 ? (
                <>
                  <ProgressCircle
                    style={{ height: 80 }}
                    progress={predictionStats.anomaly_percentage / 100}
                    progressColor={getStatusColor(predictionStats.status)}
                    backgroundColor={colors.border}
                    strokeWidth={10}
                  />
                  <Text style={styles.circleValue}>{predictionStats.anomaly_percentage}%</Text>
                </>
              ) : (
                <Text style={{ color: colors.textSecondary }}>No data</Text>
              )}
            </View>
            <Text style={styles.modelDescription}>
              {predictionStats.anomaly_count} anomalies detected out of {predictionStats.total_predictions} readings
            </Text>
          </View>
          
          {/* Failure Prediction */}
          <View style={styles.modelCard}>
            <Text style={styles.modelTitle}>FAILURE PROBABILITY</Text>
            <Text 
              style={[styles.modelValue, { color: getFailureProbColor(predictionStats.failure_probability_avg) }]}
            >
              {(predictionStats.failure_probability_avg * 100).toFixed(1)}%
            </Text>
            <Text style={styles.modelDescription}>
              Probability of imminent failure based on current conditions
            </Text>
          </View>
          
          {/* Health Index */}
          <View style={styles.modelCard}>
            <Text style={styles.modelTitle}>HEALTH INDEX</Text>
            <Text 
              style={[styles.modelValue, { color: getHealthIndexColor(predictionStats.health_index_avg) }]}
            >
              {predictionStats.health_index_avg.toFixed(1)}/100
            </Text>
            <Text style={styles.modelDescription}>
              Equipment health score (higher is better)
            </Text>
          </View>
          
          {/* Part at Risk Prediction */}
          <View style={styles.modelCard}>
            <Text style={styles.modelTitle}>PART AT RISK</Text>
            <Text 
              style={[styles.modelValue, { 
                color: predictionStats.part_at_risk && 
                       predictionStats.part_at_risk !== 'none' && 
                       predictionStats.part_at_risk !== 'unknown' ? 
                       getStatusColor('warning') : getStatusColor('normal'),
                fontSize: 20 
              }]}
            >
              {predictionStats.part_at_risk ? 
                (predictionStats.part_at_risk === 'none' || predictionStats.part_at_risk === 'unknown' ? 
                  'None' : 
                  predictionStats.part_at_risk.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')
                ) : 'Unknown'}
            </Text>
            <Text style={styles.modelDescription}>
              Component predicted to be at risk of failure
            </Text>
          </View>
        </View>
        
        {/* Overall Status Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Overall Status</Text>
            <Text style={[styles.statsValue, { color: getStatusColor(predictionStats.status) }]}>
              {predictionStats.status.charAt(0).toUpperCase() + predictionStats.status.slice(1)}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Predictions</Text>
            <Text style={styles.statsValue}>{predictionStats.total_predictions}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons
              name={getStatusIcon(predictionStats.status)}
              size={24}
              color={getStatusColor(predictionStats.status)}
              style={styles.statusIcon}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(predictionStats.status) },
              ]}
            >
              {predictionStats.status === "normal" 
                ? "All systems normal" 
                : predictionStats.status === "warning"
                ? "Maintenance recommended"
                : "Urgent attention required"}
            </Text>
          </View>
        </View>

        {/* Daily Conditions (last 5 days) */}
        <Text style={styles.sectionTitle}>Condition of Last Five Days</Text>

        {!dbStatus.healthy && (
          <Text style={styles.errorText}>
            Cannot display data: Unable to connect to the database
          </Text>
        )}

        {dbStatus.healthy && dailyPredictions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="analytics-outline"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No daily data available</Text>
            <Text style={[styles.emptyText, { fontSize: 14 }]}>
              Check back later for daily conditions
            </Text>
          </View>
        )}

        {dbStatus.healthy &&
          dailyPredictions.map((day) => (
            <View key={day.date} style={styles.anomalyCard}>
              <View style={styles.anomalyHeader}>
                <Text style={styles.anomalyTitle}>
                  {format(new Date(day.displayDate), "MMM d, yyyy")}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(day.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.anomalyDetail}>
                Readings: <Text style={{fontWeight: 'bold'}}>{day.total_predictions}</Text>
              </Text>
              <Text style={styles.anomalyDetail}>
                Anomalies: <Text style={{fontWeight: 'bold', color: day.anomaly_count > 0 ? getStatusColor("critical") : getStatusColor("normal")}}>
                  {day.anomaly_count} ({day.anomaly_percentage}%)
                </Text>
              </Text>
              <Text style={styles.anomalyDetail}>
                Failure Probability: <Text style={{fontWeight: 'bold', color: getFailureProbColor(day.failure_probability_avg)}}>
                  {(day.failure_probability_avg * 100).toFixed(1)}%
                </Text>
              </Text>
              <Text style={styles.anomalyDetail}>
                Health Index: <Text style={{fontWeight: 'bold', color: getHealthIndexColor(day.health_index_avg)}}>
                  {day.health_index_avg.toFixed(1)}/100
                </Text>
              </Text>
              <Text style={styles.anomalyDetail}>
                Avg. Remaining Useful Life: <Text style={{fontWeight: 'bold'}}>
                  {day.rul_avg.toFixed(0)} hours
                </Text>
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}