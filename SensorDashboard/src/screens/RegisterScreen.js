import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { supabase } from "../utils/supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_URL as BACKEND_ENV_URL } from '@env';
const ANON_KEY = "Bearer " + SUPABASE_ANON_KEY;

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
  
    setIsRegistering(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        Alert.alert("Registration Failed", error.message);
        setIsRegistering(false);
        return;
      }
  
      console.log("✅ User signed up:", data);
  
      // Now generate OTP
      const response = await fetch(
        "https://fmatkstxwdcevvlilysa.supabase.co/functions/v1/generate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ANON_KEY,
          },
          body: JSON.stringify({ email }),
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        setGeneratedOtp(result.otp);
        setShowOtpModal(true);
      } else {
        Alert.alert("OTP Error", result.error || "Failed to generate OTP");
      }
    } catch (err) {
      console.error("❌ Registration/OTP error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  
    setIsRegistering(false);
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

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

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleRegister}
        disabled={isRegistering}
      >
        <Text style={styles.buttonText}>
          {isRegistering ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>

      <Modal visible={showOtpModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Copy this OTP</Text>
            <Text style={styles.otpText}>{generatedOtp}</Text>
            <Text style={styles.modalNote}>
              Enter this OTP after verifying your email on the confirmation
              page.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setShowOtpModal(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalNote: {
    fontSize: 14,
    marginTop: 8,
    color: "#555",
    textAlign: "center",
  },
  otpText: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 12,
    letterSpacing: 4,
    color: "#007aff",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});
