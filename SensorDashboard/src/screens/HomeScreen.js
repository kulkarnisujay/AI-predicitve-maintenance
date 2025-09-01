import React from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../utils/supabase';

export default function HomeScreen({ navigation }) {
  const logout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to the Dashboard!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
