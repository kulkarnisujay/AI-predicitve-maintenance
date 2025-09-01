import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { supabase } from "../utils/supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_URL as BACKEND_ENV_URL } from '@env';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      console.log("✅ Authenticated user:", data.user.email);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        Alert.alert(
          "Access Denied",
          "Your email is not verified. Please complete verification first."
        );
        return;
      }

      navigation.navigate("Dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={{ position: "relative" }}>
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    alignItems: "center",
  },
  linkText: {
    color: "#007aff",
    fontSize: 14,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});
