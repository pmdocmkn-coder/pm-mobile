import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing, Typography, Shadow } from "../../theme/tokens";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon, label, value, color, trend, trendUp = true,
}) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <View style={styles.top}>
      <View style={[styles.iconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      {trend && (
        <Text style={[styles.trend, { color: trendUp ? Colors.success : Colors.error }]}>
          {trend}
        </Text>
      )}
    </View>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    ...Shadow.sm,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  trend: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 26,
    fontWeight: Typography.bold,
  },
});
