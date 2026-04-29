import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { Colors, Typography } from "../../theme/tokens";

type Variant = "display" | "h1" | "h2" | "h3" | "body" | "caption" | "label" | "muted";
type Weight = "regular" | "medium" | "semibold" | "bold" | "extrabold";

interface AppTextProps {
  children: React.ReactNode;
  variant?: Variant;
  weight?: Weight;
  color?: string;
  align?: "left" | "center" | "right";
  style?: TextStyle;
  numberOfLines?: number;
}

const variantStyles: Record<Variant, TextStyle> = {
  display: { fontSize: Typography.display, fontWeight: Typography.bold, color: Colors.textPrimary },
  h1:      { fontSize: Typography.xxxl,   fontWeight: Typography.bold, color: Colors.textPrimary },
  h2:      { fontSize: Typography.xxl,    fontWeight: Typography.bold, color: Colors.textPrimary },
  h3:      { fontSize: Typography.xl,     fontWeight: Typography.semibold, color: Colors.textPrimary },
  body:    { fontSize: Typography.md,     fontWeight: Typography.regular, color: Colors.textPrimary },
  caption: { fontSize: Typography.sm,     fontWeight: Typography.regular, color: Colors.textSecondary },
  label:   { fontSize: Typography.sm,     fontWeight: Typography.semibold, color: Colors.textPrimary },
  muted:   { fontSize: Typography.xs,     fontWeight: Typography.regular, color: Colors.textMuted },
};

export const AppText: React.FC<AppTextProps> = ({
  children, variant = "body", weight, color, align, style, numberOfLines,
}) => {
  const base = variantStyles[variant];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        base,
        weight && { fontWeight: Typography[weight] },
        color && { color },
        align && { textAlign: align },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
