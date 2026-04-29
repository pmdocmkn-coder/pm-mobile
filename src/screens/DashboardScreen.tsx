/**
 * DashboardScreen — PM Mobile (Redesigned)
 * Layout: Hero Header + Stat Strip + Menu Grid (4 col) + Bottom Nav floating
 */
import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Rect, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { BottomNav } from "../components/ui/BottomNav";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme/tokens";

const { width: W } = Dimensions.get("window");
const MENU_COL = 4;
const MENU_GAP = Spacing.md;
const MENU_W = (W - Spacing.xl * 2 - MENU_GAP * (MENU_COL - 1)) / MENU_COL;

// ─── SVG Illustration ─────────────────────────────────────────────
const HeroIllustration = () => (
  <Svg width={110} height={110} viewBox="0 0 110 110">
    {/* Monitor */}
    <Rect x="15" y="30" width="80" height="50" rx="8" fill="white" opacity="0.2" />
    <Rect x="19" y="34" width="72" height="42" rx="5" fill="white" opacity="0.12" />
    {/* Chart bars */}
    <Rect x="26" y="58" width="7" height="14" rx="2" fill="#FBBF24" />
    <Rect x="37" y="50" width="7" height="22" rx="2" fill="#4DD9C0" />
    <Rect x="48" y="44" width="7" height="28" rx="2" fill="white" opacity="0.9" />
    <Rect x="59" y="52" width="7" height="20" rx="2" fill="#EC4899" />
    <Rect x="70" y="46" width="7" height="26" rx="2" fill="#FBBF24" />
    {/* Screen text lines */}
    <Rect x="26" y="38" width="32" height="3" rx="1.5" fill="white" opacity="0.5" />
    <Rect x="26" y="44" width="20" height="2" rx="1" fill="white" opacity="0.35" />
    {/* Stand */}
    <Rect x="48" y="80" width="14" height="7" rx="2" fill="white" opacity="0.18" />
    <Rect x="40" y="85" width="30" height="4" rx="2" fill="white" opacity="0.18" />
    {/* Head */}
    <Circle cx="55" cy="18" r="11" fill="#FBBF24" />
    <Path d="M44 14 Q48 6 55 5 Q62 6 66 14" fill="#1E1B4B" />
    <Circle cx="51" cy="17" r="1.8" fill="#1E1B4B" />
    <Circle cx="59" cy="17" r="1.8" fill="#1E1B4B" />
    <Circle cx="51.6" cy="16.4" r="0.6" fill="white" />
    <Circle cx="59.6" cy="16.4" r="0.6" fill="white" />
    <Path d="M50 21 Q55 25 60 21" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Sparkles */}
    <Circle cx="8"   cy="38" r="3.5" fill="#FBBF24" opacity="0.85" />
    <Circle cx="102" cy="28" r="2.5" fill="#4DD9C0" opacity="0.85" />
    <Circle cx="104" cy="68" r="4"   fill="#EC4899" opacity="0.6" />
    <Circle cx="6"   cy="72" r="2.5" fill="white"   opacity="0.5" />
  </Svg>
);

// ─── Data ──────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { icon: "call",          label: "Call Records",  color: Colors.primary,   screen: "CallRecords" },
  { icon: "radio",         label: "Radio",         color: Colors.secondary, screen: "Radio" },
  { icon: "wifi",          label: "NEC Signal",    color: Colors.success,   screen: "NecSignal" },
  { icon: "pulse",         label: "SWR",           color: Colors.warning,   screen: "Swr" },
  { icon: "document-text", label: "Surat",         color: Colors.error,     screen: "Surat" },
  { icon: "clipboard",     label: "Inspeksi KPC",  color: "#8B5CF6",        screen: "Inspeksi" },
  { icon: "link",          label: "Int. Link",     color: "#06B6D4",        screen: "InternalLink" },
  { icon: "trending-up",   label: "KPI",           color: Colors.success,   screen: "Kpi" },
];

const STAT_ITEMS = [
  { icon: "call",  label: "Total Call",  colors: ["#EC4899","#F43F5E"] as [string,string] },
  { icon: "radio", label: "Radio Aktif", colors: ["#4DD9C0","#06B6D4"] as [string,string] },
  { icon: "pulse", label: "SWR Check",  colors: ["#FFB800","#F97316"] as [string,string] },
];

const NAV_TABS = [
  { key: "home",      icon: "home",                       label: "Home" },
  { key: "analytics", icon: "bar-chart",                  label: "Analitik" },
  { key: "transfer",  icon: "swap-vertical",              label: "Transfer" },
  { key: "more",      icon: "ellipsis-horizontal-circle", label: "Lainnya" },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 17) return "Selamat Siang";
  return "Selamat Malam";
};

// ─── Component ────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero ── */}
      <LinearGradient
        colors={["#7B6FE8", "#5A4FD1"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={S.hero}
      >
        {/* Blob dekorasi */}
        <View style={[S.blob, { top: -50, right: 50,  width: 140, height: 140 }]} />
        <View style={[S.blob, { top: 10,  right: -40, width: 110, height: 110, opacity: 0.07 }]} />
        <View style={[S.blob, { bottom: -30, left: -30, width: 100, height: 100, opacity: 0.06 }]} />

        {/* Kiri */}
        <View style={S.heroLeft}>
          <Text style={S.heroGreeting}>{greeting().toUpperCase()}</Text>
          <Text style={S.heroName} numberOfLines={1}>
            {user?.fullName?.split(" ")[0] ?? "User"}
          </Text>
          {user?.roleName && (
            <View style={S.roleBadge}>
              <Ionicons name="shield-checkmark" size={11} color={Colors.white} />
              <Text style={S.roleText}>{user.roleName}</Text>
            </View>
          )}
        </View>

        {/* Kanan: ilustrasi */}
        <HeroIllustration />
      </LinearGradient>

      {/* ── Scrollable ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
      >
        {/* Stat Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.statStrip}
        >
          {STAT_ITEMS.map((item, i) => (
            <LinearGradient
              key={i}
              colors={item.colors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={S.statCard}
            >
              <View style={S.statIconBox}>
                <Ionicons name={item.icon as any} size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={S.statValue}>—</Text>
                <Text style={S.statLabel}>{item.label}</Text>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Section label */}
        <Text style={S.sectionLabel}>MENU UTAMA</Text>

        {/* Menu Grid — 4 kolom, 2 baris */}
        <View style={S.menuGrid}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={S.menuCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[S.menuIconBox, { backgroundColor: item.color + "18" }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={S.menuLabel} numberOfLines={2}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
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

// ─── Styles ───────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Hero
  hero: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    minHeight: 155,
  },
  blob: {
    position: "absolute",
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    opacity: 0.10,
  },
  heroLeft: { flex: 1, paddingRight: Spacing.sm },
  heroGreeting: {
    fontSize: Typography.xs,
    color: "rgba(255,255,255,0.7)",
    fontWeight: Typography.semibold,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  heroName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  roleText: {
    fontSize: Typography.xs,
    color: Colors.white,
    fontWeight: Typography.semibold,
  },

  // Scroll
  scroll: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },

  // Stat Strip
  statStrip: {
    gap: Spacing.md,
    paddingRight: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: 130,
    height: 80,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    ...Shadow.sm,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.white,
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    fontWeight: Typography.medium,
  },

  // Section
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MENU_GAP,
  },
  menuCard: {
    width: MENU_W,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  menuIconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 15,
  },
});
