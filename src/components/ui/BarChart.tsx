/**
 * BarChart — Pure React Native bar chart
 * Semua bar warna primary, tidak ada highlight khusus
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Radius, Typography } from "../../theme/tokens";

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 150,
  barColor = Colors.primary,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[S.empty, { height }]}>
        <Text style={S.emptyText}>Tidak ada data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = height - 24; // reserve space for labels

  return (
    <View style={{ height, width: "100%" }}>
      <View style={S.barsRow}>
        {data.map((item, i) => {
          const barH = Math.max((item.value / maxVal) * chartH, 3);
          const fill = item.color ?? barColor;
          return (
            <View key={i} style={S.barWrapper}>
              <View style={S.barTrack}>
                <View
                  style={[
                    S.bar,
                    {
                      height: barH,
                      backgroundColor: fill,
                      opacity: 0.85,
                    },
                  ]}
                />
              </View>
              <Text style={S.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const S = StyleSheet.create({
  barsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 1,
  },
  bar: {
    width: "75%",
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    minHeight: 3,
  },
  barLabel: {
    position: "absolute",
    bottom: 0,
    fontSize: 8,
    color: Colors.textMuted,
    textAlign: "center",
  },
  empty: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
});
