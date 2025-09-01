import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, Dialog, Portal } from "react-native-paper";
import { supabase } from "../utils/supabase";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");

  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    setEmail(user.email);
    setMemberSince(new Date(user.created_at).toDateString());

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name);
      setUsername(data.username);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    await supabase
      .from("users")
      .update({
        full_name: fullName,
        username: username,
      })
      .eq("id", user.id);
  };

  const handleResetPassword = async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://your-custom-reset-page.com", // Update to your reset page if needed
    });
    if (!error) alert("Password reset link sent to your email.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.profileContainer}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            disabled
            style={styles.input}
          />
          <Text style={styles.memberText}>Member since: {memberSince}</Text>

          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save Changes
          </Button>

          <Button
            mode="outlined"
            onPress={handleResetPassword}
            style={styles.button}
          >
            Reset Password
          </Button>

          <Button
            mode="text"
            onPress={() => setLogoutVisible(true)}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      )}

      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
        >
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  input: {
    width: "100%",
    marginVertical: 8,
  },
  memberText: {
    marginTop: 10,
    color: "#888",
  },
  button: {
    marginTop: 10,
    width: "100%",
  },
  logoutButton: {
    marginTop: 20,
    color: "red",
  },
});