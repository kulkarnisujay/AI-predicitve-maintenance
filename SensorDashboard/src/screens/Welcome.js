// import React from "react";
// import { View, Text, Button, StyleSheet } from "react-native";

// const Welcome = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to SensorDashboard!</Text>
//       <Button
//         title="Go to Dashboard"
//         onPress={() => navigation.navigate("Dashboard")}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0", // Matches a minimal theme
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
// });

// export default Welcome;

import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Welcome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SensorDashboard!</Text>
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate("Dashboard")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Welcome;
