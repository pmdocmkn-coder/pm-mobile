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
  // Split tabs around FAB
  const half = Math.floor(tabs.length / 2);
  const leftTabs = tabs.slice(0, half);
  const rightTabs = tabs.slice(half);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left tabs */}
        <View style={styles.side}>
          {leftTabs.map(tab => (
            <NavTabItem key={tab.key} tab={tab} active={activeKey === tab.key} onPress={() => onTabPress(tab.key)} />
          ))}
        </View>

        {/* FAB center */}
        {showFab && (
          <View style={styles.fabWrapper}>
            <TouchableOpacity style={styles.fab} onPress={onFabPress} activeOpacity={0.85}>
              <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Right tabs */}
        <View style={styles.side}>
          {rightTabs.map(tab => (
            <NavTabItem key={tab.key} tab={tab} active={activeKey === tab.key} onPress={() => onTabPress(tab.key)} />
          ))}
        </View>
      </View>
    </View>
  );
};

function NavTabItem({ tab, active, onPress }: { tab: NavTab; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      {active && <View style={styles.activeDot} />}
      <Ionicons
        name={(active ? tab.icon : `${tab.icon}-outline`) as any}
        size={22}
        color={active ? Colors.primary : Colors.textMuted}
      />
      <Text style={[styles.tabLabel, active && { color: Colors.primary }]}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadow.md,
  },
  side: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 48,
  },
  tabLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  activeDot: {
    position: "absolute",
    top: -4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  fabWrapper: {
    width: 64,
    alignItems: "center",
    marginTop: -28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },
});
