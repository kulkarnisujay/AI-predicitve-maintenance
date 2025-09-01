/**
 * Chatbot Screen Component
 *
 * This component provides a modern Material Design chat interface for users to query sensor data.
 * It communicates with the backend server to process natural language queries
 * and retrieve data from the Supabase database.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { API_URL, checkServerConnectivity } from "../utils/config";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Surface, Divider, Button } from "react-native-paper";

// AI model to use
const AI_MODEL = "gpt-4.1-2025-04-14";

// Message types
const MESSAGE_TYPE = {
  USER: "user",
  BOT: "bot",
  ERROR: "error",
  THINKING: "thinking",
};

// Sample questions
const SAMPLE_QUESTIONS = [
  "What is the current freezer temperature?",
  "What was the average humidity over the last week?",
  "How has the power consumption changed over the last 24 hours?",
  "When was the compressor vibration highest?",
];

const Chatbot = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // null = unknown, true = connected, false = disconnected

  // Create theme-aware styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top > 0 ? insets.top : 12,
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: 8,
    },
    messageContainer: {
      marginVertical: 4,
      maxWidth: "80%",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
    },
    userMessageContainer: {
      alignSelf: "flex-end",
      backgroundColor: "#0084FF", // Facebook Messenger blue for user messages
      borderBottomRightRadius: 4,
      marginLeft: 40, // Add space on the left to push user messages to the right
    },
    botMessageContainer: {
      alignSelf: "flex-start",
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      borderBottomLeftRadius: 4,
    },
    thinkingContainer: {
      alignSelf: "flex-start",
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.03)",
      borderBottomLeftRadius: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    errorMessageContainer: {
      alignSelf: "flex-start",
      backgroundColor: isDarkMode
        ? "rgba(255,59,48,0.1)"
        : "rgba(255,59,48,0.05)",
      borderColor: "rgba(255,59,48,0.3)",
      borderWidth: 1,
      borderBottomLeftRadius: 4,
    },
    userMessageText: {
      color: "#FFFFFF", // White text for better contrast on blue background
      fontSize: 16,
      fontWeight: "400",
    },
    botMessageText: {
      color: colors.text,
      fontSize: 16,
    },
    errorMessageText: {
      color: "#FF3B30",
      fontSize: 16,
    },
    thinkingDots: {
      marginLeft: 8,
    },
    botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    botAvatarText: {
      fontSize: 16,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Math.max(16, insets.bottom),
      backgroundColor: isDarkMode ? colors.card : "#fff",
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    textInput: {
      flex: 1,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.03)",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      maxHeight: 120,
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    sendButtonDisabled: {
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.05)",
    },
    sendIcon: {
      color: isDarkMode ? colors.text : "#fff",
    },
    messageRow: {
      flexDirection: "row",
      marginVertical: 6,
      alignItems: "flex-end",
    },
    welcomeContainer: {
      padding: 20,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 8,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.02)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    welcomeTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    welcomeText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    suggestionsList: {
      marginTop: 8,
    },
    suggestionItem: {
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.03)",
      padding: 12,
      borderRadius: 12,
      marginVertical: 6,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
    },
    retryButton: {
      marginTop: 12,
      borderRadius: 8,
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
      alignSelf: "center",
      marginVertical: 16,
    },
    networkErrorBanner: {
      backgroundColor: isDarkMode
        ? "rgba(255,59,48,0.1)"
        : "rgba(255,59,48,0.05)",
      padding: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,59,48,0.3)",
    },
    networkErrorText: {
      color: "#FF3B30",
      fontSize: 14,
      marginLeft: 8,
    },
  });

  // Add welcome message when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setMessages([
      {
        id: Date.now().toString(),
        text: formattedDate,
        type: "date",
      },
      {
        id: "1",
        text: "Hello! I can help you with sensor data. How can I assist you today?",
        type: MESSAGE_TYPE.BOT,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Check server connectivity when component mounts
  useEffect(() => {
    const checkConnectivity = async () => {
      const isConnected = await checkServerConnectivity();
      setServerStatus(isConnected);
      setNetworkError(!isConnected);
    };

    checkConnectivity();

    // Set up periodic checks
    const intervalId = setInterval(checkConnectivity, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  /**
   * Handle sending a message to the chatbot
   */
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: MESSAGE_TYPE.USER,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    Keyboard.dismiss();

    // Add thinking indicator
    const thinkingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        text: "Thinking...",
        type: MESSAGE_TYPE.THINKING,
      },
    ]);

    setIsLoading(true);
    setNetworkError(false);

    try {
      // Check server connectivity before making the request
      const isConnected = await checkServerConnectivity();

      if (!isConnected) {
        throw new Error("Server connectivity check failed");
      }

      const response = await axios.post(
        `${API_URL}/chat`,
        {
          prompt: userMessage.text,
          model: AI_MODEL,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Remove thinking indicator and add bot response
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== thinkingId)
          .concat({
            id: (Date.now() + 2).toString(),
            text: response.data.response,
            type: MESSAGE_TYPE.BOT,
            timestamp: new Date(),
          })
      );

      // Reset retry count on success
      setRetryCount(0);
      setServerStatus(true);
    } catch (error) {
      console.error("Failed to get response:", error);
      setServerStatus(false);

      // Format error message
      let errorMessage = "Sorry, something went wrong. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. The server might be busy.";
      } else if (error.response) {
        // Server responded with an error
        errorMessage = `Server error (${error.response.status}). Please try again.`;
      } else if (
        error.request ||
        error.message === "Server connectivity check failed"
      ) {
        // No response received - give more helpful message
        errorMessage =
          "Could not connect to the server. Please check your network connection and verify the backend server is running.";
        setNetworkError(true);
      }

      // Remove thinking indicator and add error message
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== thinkingId)
          .concat({
            id: (Date.now() + 2).toString(),
            text: errorMessage,
            type: MESSAGE_TYPE.ERROR,
            timestamp: new Date(),
          })
      );

      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  /**
   * Handle retry button press
   */
  const handleRetry = useCallback(async () => {
    // Check server connectivity before trying again
    const isConnected = await checkServerConnectivity();
    setServerStatus(isConnected);
    setNetworkError(!isConnected);

    if (isConnected) {
      // Try to reconnect
      handleSendMessage();
    }
  }, [handleSendMessage]);

  /**
   * Use a suggestion as input
   */
  const useSuggestion = useCallback((suggestion) => {
    setInputText(suggestion);
  }, []);

  /**
   * Render a message item
   */
  const renderMessageItem = ({ item }) => {
    if (item.type === "date") {
      return <Text style={styles.dateText}>{item.text}</Text>;
    }

    if (item.type === MESSAGE_TYPE.USER) {
      return (
        <View style={[styles.messageRow, { justifyContent: "flex-end" }]}>
          <View style={[styles.messageContainer, styles.userMessageContainer]}>
            <Text style={styles.userMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    if (item.type === MESSAGE_TYPE.THINKING) {
      return (
        <View style={styles.messageRow}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
          <View style={[styles.messageContainer, styles.thinkingContainer]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.botMessageText, styles.thinkingDots]}>
              Thinking...
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === MESSAGE_TYPE.ERROR) {
      return (
        <View style={styles.messageRow}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>⚠️</Text>
          </View>
          <View style={[styles.messageContainer, styles.errorMessageContainer]}>
            <Text style={styles.errorMessageText}>{item.text}</Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.retryButton}
              buttonColor={
                isDarkMode ? "rgba(255,59,48,0.3)" : "rgba(255,59,48,0.1)"
              }
              textColor="#FF3B30"
            >
              Retry
            </Button>
          </View>
        </View>
      );
    }

    // Bot message
    return (
      <View style={styles.messageRow}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
        <View style={[styles.messageContainer, styles.botMessageContainer]}>
          <Text style={styles.botMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  /**
   * Render welcome section with suggestions
   */
  const renderWelcomeSection = () => {
    if (messages.length > 2) return null;

    return (
      <Surface style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Try asking me:</Text>
        <View style={styles.suggestionsList}>
          {SAMPLE_QUESTIONS.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => useSuggestion(question)}
            >
              <Text style={styles.suggestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Network error banner */}
      {networkError && (
        <View style={styles.networkErrorBanner}>
          <Ionicons name="wifi" size={16} color="#FF3B30" />
          <Text style={styles.networkErrorText}>
            Connection problem. Check your network.
          </Text>
        </View>
      )}

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        style={styles.messagesList}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderWelcomeSection}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Surface style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about sensor data..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  !inputText.trim() || isLoading
                    ? colors.textSecondary
                    : isDarkMode
                    ? colors.text
                    : "#fff"
                }
              />
            </TouchableOpacity>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Chatbot;
