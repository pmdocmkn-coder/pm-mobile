/**
 * BottomNav — Floating bottom nav dengan FAB cutout di tengah
 * Design: dua pill terpisah kiri-kanan, FAB menonjol di tengah
 */
import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Shadow, Typography, Spacing } from "../../theme/tokens";

export interface NavTab {
  key: string;
  icon: string;
  label: string;
}

interface BottomNavProps {
  tabs: NavTab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  onFabPress?: () => void;
  showFab?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  tabs, activeKey, onTabPress, onFabPress, showFab = true,
}) => {
  const half       = Math.floor(tabs.length / 2);
  const leftTabs   = tabs.slice(0, half);
  const rightTabs  = tabs.slice(half);

  return (
    <View style={S.wrapper}>
      {/* Kiri */}
      <View style={S.sideBar}>
        {leftTabs.map(tab => (
          <TabItem
            key={tab.key} tab={tab}
            active={activeKey === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </View>

      {/* FAB di tengah */}
      <View style={S.fabArea}>
        {showFab && (
          <TouchableOpacity style={S.fab} onPress={onFabPress} activeOpacity={0.85}>
            <Ionicons name="add" size={30} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Kanan */}
      <View style={S.sideBar}>
        {rightTabs.map(tab => (
          <TabItem
            key={tab.key} tab={tab}
            active={activeKey === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

function TabItem({ tab, active, onPress }: { tab: NavTab; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={S.tab} onPress={onPress} activeOpacity={0.7}>
      {active && <View style={S.dot} />}
      <Ionicons
        name={(active ? tab.icon : `${tab.icon}-outline`) as any}
        size={22}
        color={active ? Colors.primary : Colors.textMuted}
      />
      <Text style={[S.label, active && S.labelActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

const FAB_SIZE = 54;

const S = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: "transparent",
  },

  // Dua pill kiri dan kanan
  sideBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    height: 60,
    paddingHorizontal: Spacing.sm,
    ...Shadow.md,
  },

  // Area FAB di tengah — tidak ada background
  fabArea: {
    width: FAB_SIZE + Spacing.xl,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },

  // FAB button
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
    // Sedikit naik dari bar
    marginBottom: 8,
  },

  // Tab item
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: Spacing.xs,
    minWidth: 44,
  },
  dot: {
    position: "absolute",
    top: 2,
    width: 5,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
});
