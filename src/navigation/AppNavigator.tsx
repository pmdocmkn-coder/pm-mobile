import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CallRecordsScreen from "../screens/CallRecordsScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: "#1e1b4b" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0e1a" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CallRecords" component={CallRecordsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Radio" component={PlaceholderScreen} options={{ title: "Radio" }} />
            <Stack.Screen name="NecSignal" component={PlaceholderScreen} options={{ title: "NEC Signal" }} />
            <Stack.Screen name="Swr" component={PlaceholderScreen} options={{ title: "SWR" }} />
            <Stack.Screen name="Surat" component={PlaceholderScreen} options={{ title: "Surat" }} />
            <Stack.Screen name="Inspeksi" component={PlaceholderScreen} options={{ title: "Inspeksi KPC" }} />
            <Stack.Screen name="InternalLink" component={PlaceholderScreen} options={{ title: "Internal Link" }} />
            <Stack.Screen name="Kpi" component={PlaceholderScreen} options={{ title: "KPI" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
