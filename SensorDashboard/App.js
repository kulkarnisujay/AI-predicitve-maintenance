import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Keyboard,
  View,
  Text,
  Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { supabase } from "./src/utils/supabase";

// Screens
import Dashboard from "./src/screens/Dashboard";
import Graph from "./src/screens/Graph";
import Chatbot from "./src/screens/Chatbot";
import Settings from "./src/screens/Settings";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import PredictionsScreen from "./src/screens/PredictionsScreen";

// Theme
import { COLORS } from "./src/utils/theme";
import { ThemeProvider, useTheme } from "./src/utils/ThemeContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// 🔧 Dev Mode Toggle
const DEV_MODE = true; // Set to false to restore real login flow

function AuthNavigation() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Graph"
        component={Graph}
        options={({ route }) => ({
          headerShown: false,
          title: route.params?.param
            ? route.params.param
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : "Sensor Data",
        })}
      />
    </Stack.Navigator>
  );
}

// Custom Tab Bar Component inspired by Material UI
function CustomTabBar({ state, descriptors, navigation }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDarkMode ? colors.card : "#ffffff",
          borderTopColor: isDarkMode
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        if (route.name === "Home") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "Chatbot") {
          iconName = isFocused ? "chatbubble" : "chatbubble-outline";
        } else if (route.name === "Settings") {
          iconName = isFocused ? "settings" : "settings-outline";
        } else if (route.name === "Predictions") {
          iconName = isFocused ? "analytics" : "analytics-outline";
        }

        return (
          <TouchableRipple
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            rippleColor={colors.primary}
          >
            <View style={styles.tabItemContent}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    opacity: isFocused ? 1 : 0.8,
                  },
                ]}
              >
                {label}
              </Text>
              {isFocused && (
                <View
                  style={[
                    styles.activeBadge,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

// Touchable Ripple Effect Component
function TouchableRipple({ children, style, rippleColor, onPress }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View
      style={[style, { overflow: "hidden" }]}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
    >
      <View
        style={{ flex: 1 }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => setIsPressed(true)}
        onResponderRelease={() => {
          setIsPressed(false);
          onPress();
        }}
        onResponderTerminate={() => setIsPressed(false)}
      >
        {children}
        {isPressed && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: rippleColor || "#000",
                opacity: 0.12,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

function MainAppNavigation() {
  const { isDarkMode, colors } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Tab.Navigator
        tabBar={(props) =>
          isKeyboardVisible ? null : <CustomTabBar {...props} />
        }
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTintColor: colors.text,
        }}
      >
        <Tab.Screen
          name="Home"
          component={DashboardStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Predictions"
          component={PredictionsScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "analytics" : "analytics-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen name="Chatbot" component={Chatbot} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (DEV_MODE) {
      // Instantly set a mock user for development testing
      setUser({
        id: "test-user",
        email: "test@example.com",
        email_confirmed_at: new Date().toISOString(),
      });
      return;
    }

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user?.email_confirmed_at) {
        setUser(user);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;
        if (user?.email_confirmed_at) {
          setUser(user);
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();
          if (!existingUser && !error) {
            await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          {user ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={MainAppNavigation} />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: true }}
              />
            </Stack.Navigator>
          ) : (
            <AuthNavigation />
          )}
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  activeBadge: {
    position: "absolute",
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
