import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";
import { CARD_STYLE } from "../utils/theme";
import { supabase } from "../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import {
  Portal,
  Dialog,
  Button,
  Provider as PaperProvider,
} from "react-native-paper";
import { BlurView } from "expo-blur";

export default function Settings() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    }
  };

  const themedStyles = StyleSheet.create({
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
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 10,
      paddingHorizontal: 5,
    },
    card: {
      ...CARD_STYLE,
      backgroundColor: colors.card,
      borderColor: colors.border,
      padding: 0,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    settingLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    settingIcon: {
      marginRight: 12,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    settingValue: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 5,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },
  });

  return (
    <PaperProvider>
      <ScrollView
        style={themedStyles.container}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={themedStyles.headerContainer}>
          <Text style={themedStyles.headerTitle}>Settings</Text>
          <Text style={themedStyles.headerSubtitle}>
            Configure your application preferences
          </Text>
        </View>

        {/* Appearance */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Appearance</Text>
          <View style={themedStyles.card}>
            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="moon-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Notifications</Text>
          <View style={themedStyles.card}>
            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>
                  Alert Notifications
                </Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
              />
            </View>
            <View style={themedStyles.divider} />

            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="push-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Account</Text>
          <View style={themedStyles.card}>
            <TouchableOpacity
              style={themedStyles.settingRow}
              onPress={() => navigation.navigate("Profile")}
            >
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>Profile</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={themedStyles.divider} />

            <TouchableOpacity
              style={themedStyles.settingRow}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.error}
                  style={themedStyles.settingIcon}
                />
                <Text
                  style={[themedStyles.settingLabel, { color: colors.error }]}
                >
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>About</Text>
          <View style={themedStyles.card}>
            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>Version</Text>
              </View>
              <Text style={themedStyles.settingValue}>1.0.0</Text>
            </View>
            <View style={themedStyles.divider} />

            <TouchableOpacity style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>Help & Support</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={themedStyles.divider} />

            <TouchableOpacity style={themedStyles.settingRow}>
              <View style={themedStyles.settingLabelContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                  style={themedStyles.settingIcon}
                />
                <Text style={themedStyles.settingLabel}>Privacy Policy</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      {showLogoutModal && (
        <BlurView
          intensity={80}
          tint={isDarkMode ? "dark" : "light"}
          style={themedStyles.blurView}
        >
          <Portal>
            <Dialog
              visible={showLogoutModal}
              onDismiss={() => setShowLogoutModal(false)}
            >
              <Dialog.Title>Confirm Logout</Dialog.Title>
              <Dialog.Content>
                <Text>Are you sure you want to logout?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowLogoutModal(false)}>
                  Cancel
                </Button>
                <Button onPress={handleLogout}>Logout</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </BlurView>
      )}
    </PaperProvider>
  );
}
