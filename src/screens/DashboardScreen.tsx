/**
 * DashboardScreen — PM Mobile
 * Contract-Driven Design: semua style dari theme/tokens.ts
 * Layout: Header + Greeting + Menu Grid + Bottom Nav (floating FAB)
 */
import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { BottomNav } from "../components/ui/BottomNav";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme/tokens";

// ─── Menu Items (sesuai modul backend) ─────────────────────────────
const MENU_ITEMS = [
  { icon: "call",           label: "Call Records",   color: Colors.primary,   screen: "CallRecords" },
  { icon: "radio",          label: "Radio",          color: Colors.secondary, screen: "Radio" },
  { icon: "wifi",           label: "NEC Signal",     color: Colors.success,   screen: "NecSignal" },
  { icon: "pulse",          label: "SWR",            color: Colors.warning,   screen: "Swr" },
  { icon: "document-text",  label: "Surat",          color: Colors.error,     screen: "Surat" },
  { icon: "clipboard",      label: "Inspeksi KPC",   color: Colors.primary,   screen: "Inspeksi" },
  { icon: "link",           label: "Internal Link",  color: Colors.secondary, screen: "InternalLink" },
  { icon: "trending-up",    label: "KPI",            color: Colors.success,   screen: "Kpi" },
];

const NAV_TABS = [
  { key: "home",      icon: "home",          label: "Home" },
  { key: "analytics", icon: "bar-chart",     label: "Analitik" },
  { key: "transfer",  icon: "swap-vertical", label: "Transfer" },
  { key: "more",      icon: "ellipsis-horizontal-circle", label: "Lainnya" },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 17) return "Selamat Siang";
  return "Selamat Malam";
};

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={S.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header ── */}
      <View style={S.header}>
        {/* Grid icon kiri (dekoratif, sesuai design) */}
        <View style={S.gridIcon}>
          {[0, 1, 2, 3].map(i => <View key={i} style={S.gridDot} />)}
        </View>

        <Text style={S.headerTitle}>PM Dashboard</Text>

        <TouchableOpacity style={S.notifBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
      >
        {/* Greeting */}
        <View style={S.greetingSection}>
          <Text style={S.greetingLabel}>{greeting().toUpperCase()},</Text>
          <Text style={S.greetingName}>{user?.fullName ?? "User"}</Text>
          {user?.roleName && (
            <View style={S.roleBadge}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
              <Text style={S.roleText}>{user.roleName}</Text>
            </View>
          )}
        </View>

        {/* Section label */}
        <Text style={S.sectionLabel}>MENU UTAMA</Text>

        {/* Menu Grid — 4 kolom */}
        <View style={S.menuGrid}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={S.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.75}
            >
              <View style={[S.menuIconBox, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={`${item.icon}-outline` as any} size={24} color={item.color} />
              </View>
              <Text style={S.menuLabel} numberOfLines={2}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <BottomNav
        tabs={NAV_TABS}
        activeKey="home"
        onTabPress={() => {}}
        onFabPress={() => {}}
        showFab
      />
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  gridIcon: {
    width: 28, height: 28,
    flexDirection: "row", flexWrap: "wrap",
    gap: 4, alignContent: "center", justifyContent: "center",
  },
  gridDot: {
    width: 10, height: 10,
    borderRadius: 3,
    backgroundColor: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  notifBtn: {
    width: 38, height: 38,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    justifyContent: "center", alignItems: "center",
  },

  // Scroll
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },

  // Greeting
  greetingSection: { marginBottom: Spacing.xxl },
  greetingLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
    letterSpacing: 1,
  },
  greetingName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, marginTop: Spacing.sm,
  },
  roleText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },

  // Section
  sectionLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  menuItem: {
    width: "21%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuIconBox: {
    width: 58, height: 58,
    borderRadius: Radius.xl,
    justifyContent: "center", alignItems: "center",
  },
  menuLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
    textAlign: "center",
    lineHeight: 14,
  },
});
