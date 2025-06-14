import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StackNavigator from './navigation/StackNavigator';
import { AuthProvider } from './AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StackNavigator />
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

