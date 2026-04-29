import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  route: { name: string };
}

export default function PlaceholderScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={48} color="#7c3aed" />
      <Text style={styles.title}>{route.name}</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0e1a",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6366f1",
    fontSize: 14,
  },
});
