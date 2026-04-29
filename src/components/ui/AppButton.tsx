import React from "react";
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, View,
} from "react-native";
import { Colors, Radius, Spacing, Typography, Shadow } from "../../theme/tokens";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, { paddingV: number; paddingH: number; fontSize: number; height: number }> = {
  sm: { paddingV: 8,  paddingH: 16, fontSize: Typography.sm, height: 36 },
  md: { paddingV: 12, paddingH: 24, fontSize: Typography.md, height: 48 },
  lg: { paddingV: 16, paddingH: 32, fontSize: Typography.lg, height: 56 },
};

export const AppButton: React.FC<AppButtonProps> = ({
  label, onPress, variant = "primary", size = "md",
  loading, disabled, icon, style, fullWidth = false,
}) => {
  const s = sizeMap[size];

  const containerStyle: ViewStyle = {
    height: s.height,
    paddingHorizontal: s.paddingH,
    borderRadius: Radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...(fullWidth && { width: "100%" }),
    ...(variant === "primary" && { backgroundColor: Colors.primary, ...Shadow.md }),
    ...(variant === "secondary" && { backgroundColor: Colors.secondary }),
    ...(variant === "outline" && {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: Colors.primary,
    }),
    ...(variant === "ghost" && { backgroundColor: Colors.primaryLight }),
    ...(disabled && { opacity: 0.5 }),
  };

  const textColor =
    variant === "primary" ? Colors.white :
    variant === "secondary" ? Colors.white :
    variant === "outline" ? Colors.primary :
    Colors.primary;

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{ fontSize: s.fontSize, fontWeight: Typography.semibold, color: textColor }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
