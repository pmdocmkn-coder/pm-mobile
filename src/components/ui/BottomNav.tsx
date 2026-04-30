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
      {/* Background Bar */}
      <View style={S.barBackground}>
        {/* Kiri */}
        <View style={S.sideItems}>
          {leftTabs.map(tab => (
            <TabItem
              key={tab.key} tab={tab}
              active={activeKey === tab.key}
              onPress={() => onTabPress(tab.key)}
            />
          ))}
        </View>

        {/* Space for FAB */}
        <View style={S.fabSpacer} />

        {/* Kanan */}
        <View style={S.sideItems}>
          {rightTabs.map(tab => (
            <TabItem
              key={tab.key} tab={tab}
              active={activeKey === tab.key}
              onPress={() => onTabPress(tab.key)}
            />
          ))}
        </View>
      </View>

      {/* Floating FAB */}
      {showFab && (
        <View style={S.fabContainer}>
          <TouchableOpacity style={S.fab} onPress={onFabPress} activeOpacity={0.85}>
            <Text style={S.fabText}>FAB +</Text>
          </TouchableOpacity>
        </View>
      )}
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

const FAB_SIZE = 56;

const S = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    justifyContent: "flex-end",
  },
  barBackground: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    height: 65,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    ...Shadow.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sideItems: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  fabSpacer: {
    width: FAB_SIZE + 10,
  },
  fabContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 25,
    zIndex: 10,
  },
  fab: {
    paddingHorizontal: Spacing.lg,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: Colors.white,
    fontWeight: Typography.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: Spacing.xs,
    minWidth: 50,
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
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
});
