import { supabase } from "./supabase";

/**
 * Check if the Supabase connection is working and return status
 * @returns {Promise<Object>} Connection status
 */
export const checkSupabaseStatus = async () => {
  try {
    // Try to fetch a single row from the predictions table to test connection
    const { data, error } = await supabase
      .from("predictions")
      .select("timestamp")
      .limit(1);

    if (error) {
      console.error("Supabase connection error:", error);
      return {
        status: "Error connecting to database",
        healthy: false,
        error: error.message,
      };
    }

    return {
      status: "Connected",
      healthy: true,
    };
  } catch (error) {
    console.error("Error checking Supabase status:", error);
    return {
      status: "Error",
      healthy: false,
      error: error.message || "Failed to connect to Supabase",
    };
  }
};

/**
 * Check when the last prediction was made - useful to display to the user
 * @returns {Promise<Object>} Last prediction time
 */
export const getLastPredictionTime = async () => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("timestamp")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    
    return {
      success: true,
      lastPredictionTime: data && data.length > 0 ? new Date(data[0].timestamp) : null,
    };
  } catch (error) {
    console.error("Error getting last prediction time:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
};

/**
 * Get prediction statistics for the dashboard display
 * @param {String} timeRange The time range to analyze ("present", "last7days", or "alltime")
 * @returns {Promise<Object>} Prediction statistics
 */
export const getPredictionStats = async (timeRange = "present") => {
  try {
    let query = supabase.from("predictions").select("*");
    
    // Calculate the date range based on the selected option
    if (timeRange === "present") {
      // Get only the latest records for each sensor/device
      query = query.order("timestamp", { ascending: false }).limit(1);
    } else if (timeRange === "last7days") {
      // Get data from the last 7 days
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      query = query
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())
        .order("timestamp", { ascending: false });
    } else {
      // Get all-time data
      query = query.order("timestamp", { ascending: false });
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      throw new Error("Error fetching prediction data: " + error.message);
    }

    if (!data || data.length === 0) {
      return {
        error: "No prediction data found for the specified time range",
        data: [],
        anomaly_count: 0,
        failure_probability_avg: 0,
        health_index_avg: 0,
        status: "unknown",
        latest_predictions: [],
        dataTimestamp: new Date(),
      };
    }

    // If present, just use the latest values directly (no averaging needed)
    if (timeRange === "present" && data.length > 0) {
      const latestData = data[0];
      
      // Extract part at risk information from RUL field if available
      let partAtRisk = "unknown";
      
      // Check if RUL contains part at risk information
      if (typeof latestData.rul === 'string' && latestData.rul.includes('Part at risk:')) {
        const match = latestData.rul.match(/\(Part at risk: ([^\)]+)\)/);
        if (match && match[1]) {
          partAtRisk = match[1].trim();
        }
      }
      
      return {
        total_predictions: data.length,
        anomaly_count: latestData.anomaly ? 1 : 0,
        anomaly_percentage: latestData.anomaly ? 100 : 0,
        failure_probability_avg: parseFloat(latestData.failure_prob.toFixed(2)),
        health_index_avg: parseFloat(latestData.health_index.toFixed(1)),

        part_at_risk: partAtRisk,
        status: determineStatus(latestData.anomaly, latestData.failure_prob, latestData.health_index),
        latest_predictions: [latestData],
        dataTimestamp: new Date(latestData.timestamp),
      };
    }

    // Count anomalies
    const anomalyCount = data.filter(item => item.anomaly === true).length;
    
    // Process data and extract part at risk information
    const processedData = data.map(item => {
      let partAtRisk = "unknown";
      
      // Check if RUL contains part at risk information
      if (typeof item.rul === 'string' && item.rul.includes('Part at risk:')) {
        const match = item.rul.match(/\(Part at risk: ([^\)]+)\)/);
        if (match && match[1]) {
          partAtRisk = match[1].trim();
        }
      }
      
      return {
        ...item,
        part_at_risk: partAtRisk
      };
    });
    
    // Calculate averages
    const failureProbAvg = processedData.reduce((sum, item) => sum + item.failure_prob, 0) / processedData.length;
    const healthIndexAvg = processedData.reduce((sum, item) => sum + item.health_index, 0) / processedData.length;


    // Find most common part at risk
    const partCounts = {};
    processedData.forEach(item => {
      if (item.part_at_risk && item.part_at_risk !== 'unknown') {
        partCounts[item.part_at_risk] = (partCounts[item.part_at_risk] || 0) + 1;
      }
    });
    
    let mostCommonPart = "unknown";
    let highestCount = 0;
    
    Object.entries(partCounts).forEach(([part, count]) => {
      if (count > highestCount && part !== 'none') {
        mostCommonPart = part;
        highestCount = count;
      }
    });

    // Determine status based on combined metrics
    const status = determineStatus(
      anomalyCount > processedData.length * 0.3, 
      failureProbAvg, 
      healthIndexAvg
    );

    return {
      total_predictions: processedData.length,
      anomaly_count: anomalyCount,
      anomaly_percentage: (anomalyCount / processedData.length * 100).toFixed(1),
      failure_probability_avg: parseFloat(failureProbAvg.toFixed(2)),
      health_index_avg: parseFloat(healthIndexAvg.toFixed(1)),
      part_at_risk: mostCommonPart,
      status,
      latest_predictions: processedData.slice(0, 5),
      dataTimestamp: new Date(),
    };
  } catch (error) {
    console.error("Error getting prediction stats:", error);
    return {
      error: error.message || "Unknown error",
      total_predictions: 0,
      anomaly_count: 0,
      anomaly_percentage: 0,
      failure_probability_avg: 0,
      health_index_avg: 0,
      rul_avg: 0,
      status: "unknown",
      latest_predictions: [],
      dataTimestamp: new Date(),
    };
  }
};

/**
 * Helper function to determine status based on metrics
 */
const determineStatus = (isAnomaly, failureProb, healthIndex) => {
  if (isAnomaly === true || failureProb > 0.7 || healthIndex < 30) {
    return "critical";
  } else if (failureProb > 0.3 || healthIndex < 60) {
    return "warning";
  }
  return "normal";
};

/**
 * Get all prediction data for a specific time range
 * @param {String} timeRange Time range option ("present", "last7days", "alltime")
 * @returns {Promise<Array>} Array of prediction data
 */
export const getAllPredictions = async (timeRange = "last7days") => {
  try {
    let query = supabase.from("predictions").select("*");
    
    // Apply time range filter
    if (timeRange === "present") {
      // Get only the latest data point
      query = query.order("timestamp", { ascending: false }).limit(1);
    } else if (timeRange === "last7days") {
      // Get last 7 days of data
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      query = query
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())
        .order("timestamp", { ascending: true });
    } else {
      // Get all-time data
      query = query.order("timestamp", { ascending: true });
    }
    
    // Execute the query
    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error fetching all prediction data:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
      data: [],
    };
  }
};

/**
 * Get aggregated prediction data grouped by day
 * @param {Number} days Number of days to fetch (default 5)
 * @returns {Promise<Object>} Daily aggregated prediction data
 */
export const getDailyPredictions = async (days = 5) => {
  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    // Fetch prediction data from Supabase
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())
      .order("timestamp", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No data found for the specified time range",
        dailyData: [],
      };
    }

    // Group data by days and calculate averages for each day
    const groupedByDay = {};
    data.forEach(item => {
      const date = new Date(item.timestamp);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groupedByDay[dateString]) {
        groupedByDay[dateString] = {
          date: dateString,
          displayDate: date,
          items: [],
          anomaly_count: 0,
          total: 0,
          failure_prob_sum: 0,
          health_index_sum: 0,
          rul_sum: 0,
        };
      }
      
      groupedByDay[dateString].items.push(item);
      groupedByDay[dateString].total++;
      if (item.anomaly) groupedByDay[dateString].anomaly_count++;
      groupedByDay[dateString].failure_prob_sum += item.failure_prob;
      groupedByDay[dateString].health_index_sum += item.health_index;
      groupedByDay[dateString].rul_sum += item.rul;
    });

    // Calculate averages and prepare final data
    const dailyData = Object.values(groupedByDay).map(day => {
      return {
        date: day.date,
        displayDate: day.displayDate,
        total_predictions: day.total,
        anomaly_count: day.anomaly_count,
        anomaly_percentage: day.total > 0 ? parseFloat(((day.anomaly_count / day.total) * 100).toFixed(1)) : 0,
        failure_probability_avg: day.total > 0 ? parseFloat((day.failure_prob_sum / day.total).toFixed(2)) : 0,
        health_index_avg: day.total > 0 ? parseFloat((day.health_index_sum / day.total).toFixed(1)) : 0,
        rul_avg: day.total > 0 ? parseFloat((day.rul_sum / day.total).toFixed(1)) : 0,
        status: day.total > 0 ? determineStatus(
          day.anomaly_count > day.total * 0.3,
          day.failure_prob_sum / day.total,
          day.health_index_sum / day.total
        ) : "unknown"
      };
    });

    // Sort by date (most recent first) and limit to the requested number of days
    const sortedData = dailyData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, days);

    return {
      success: true,
      dailyData: sortedData,
    };
  } catch (error) {
    console.error("Error getting daily prediction data:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
      dailyData: [],
    };
  }
};
