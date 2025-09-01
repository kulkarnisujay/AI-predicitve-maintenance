import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card, Title, Paragraph } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function VibrationDetails() {
  const [vibrationData, setVibrationData] = useState([]);
  const [stats, setStats] = useState({
    compressor_vibration: { min: 0, max: 0, avg: 0 },
    compressor_vibration_x: { min: 0, max: 0, avg: 0 },
    compressor_vibration_y: { min: 0, max: 0, avg: 0 },
    compressor_vibration_z: { min: 0, max: 0, avg: 0 },
  });

  useEffect(() => {
    const fetchVibrationData = async () => {
      const { data, error } = await supabase
        .from("sensor_data")
        .select(
          "timestamp, compressor_vibration, compressor_vibration_x, compressor_vibration_y, compressor_vibration_z"
        )
        .order("timestamp", { ascending: true })
        .limit(100); // Limit to last 100 records for better performance

      if (error) {
        console.error("Error fetching vibration data:", error);
      } else if (data && data.length > 0) {
        setVibrationData(data);

        // Calculate statistics for each vibration component
        const vibStats = {
          compressor_vibration: calculateStats(data, "compressor_vibration"),
          compressor_vibration_x: calculateStats(
            data,
            "compressor_vibration_x"
          ),
          compressor_vibration_y: calculateStats(
            data,
            "compressor_vibration_y"
          ),
          compressor_vibration_z: calculateStats(
            data,
            "compressor_vibration_z"
          ),
        };

        setStats(vibStats);
      }
    };

    fetchVibrationData();
  }, []);

  // Calculate statistics for a specific field
  const calculateStats = (data, field) => {
    const values = data
      .map((record) => parseFloat(record[field] || 0))
      .filter((val) => !isNaN(val));

    if (values.length === 0) return { min: 0, max: 0, avg: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;

    return { min, max, avg };
  };

  // Create chart data for each vibration component
  const createChartData = (field) => {
    return {
      labels: vibrationData.slice(-20).map(
        (
          item // Show only last 20 points for readability
        ) =>
          new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
      ),
      datasets: [
        { data: vibrationData.slice(-20).map((item) => item[field] || 0) },
      ],
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: () => "#333",
    style: { borderRadius: 16 },
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Compressor Vibration Details</Title>

      {/* Overall Vibration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Overall Vibration</Title>
          {vibrationData.length > 0 ? (
            <LineChart
              data={createChartData("compressor_vibration")}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No data available</Text>
          )}
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              Average: {stats.compressor_vibration.avg.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Highest: {stats.compressor_vibration.max.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Lowest: {stats.compressor_vibration.min.toFixed(2)} mm/s
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* X-Axis Vibration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>X-Axis Vibration</Title>
          {vibrationData.length > 0 ? (
            <LineChart
              data={createChartData("compressor_vibration_x")}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No data available</Text>
          )}
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              Average: {stats.compressor_vibration_x.avg.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Highest: {stats.compressor_vibration_x.max.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Lowest: {stats.compressor_vibration_x.min.toFixed(2)} mm/s
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Y-Axis Vibration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Y-Axis Vibration</Title>
          {vibrationData.length > 0 ? (
            <LineChart
              data={createChartData("compressor_vibration_y")}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No data available</Text>
          )}
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              Average: {stats.compressor_vibration_y.avg.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Highest: {stats.compressor_vibration_y.max.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Lowest: {stats.compressor_vibration_y.min.toFixed(2)} mm/s
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Z-Axis Vibration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Z-Axis Vibration</Title>
          {vibrationData.length > 0 ? (
            <LineChart
              data={createChartData("compressor_vibration_z")}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text>No data available</Text>
          )}
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              Average: {stats.compressor_vibration_z.avg.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Highest: {stats.compressor_vibration_z.max.toFixed(2)} mm/s
            </Text>
            <Text style={styles.statText}>
              Lowest: {stats.compressor_vibration_z.min.toFixed(2)} mm/s
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  card: {
    marginVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
});
