import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { Colors, Radius, Spacing, Shadow } from "../../theme/tokens";

type Variant = "default" | "elevated" | "outlined" | "filled";

interface AppCardProps {
  children: React.ReactNode;
  variant?: Variant;
  padding?: number;
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({
  children, variant = "default", padding = Spacing.lg, style,
}) => {
  const base: ViewStyle = {
    borderRadius: Radius.xl,
    padding,
    backgroundColor: Colors.surface,
  };

  const variantStyle: ViewStyle =
    variant === "elevated" ? Shadow.md :
    variant === "outlined" ? { borderWidth: 1, borderColor: Colors.border } :
    variant === "filled"   ? { backgroundColor: Colors.background } :
    Shadow.sm;

  return <View style={[base, variantStyle, style]}>{children}</View>;
};
