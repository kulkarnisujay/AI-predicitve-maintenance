// src/screens/WelcomeScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/fridge.png")} style={styles.logo} />
      <Text style={styles.title}>FridgeGuard</Text>
      <Text style={styles.subtitle}>
        Smart Refrigerator Monitoring & Alerts
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => BackHandler.exitApp()}
      >
        <Ionicons name="exit-outline" size={20} color="#ff3b30" />
        <Text style={[styles.secondaryText, { color: "#ff3b30" }]}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fefefe",
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 40 },
  button: {
    width: "80%",
    backgroundColor: "#007aff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  secondaryText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#555",
  },
});
