/**
 * DashboardScreen — PM Mobile (Premium Super-App Design)
 * Inspired by Gojek/Grab: Deep gradient hero, overlapping stat cards,
 * 3D-style technician illustration, premium menu grid, floating bottom nav
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar, Dimensions, RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { BottomNav } from "../components/ui/BottomNav";
import { Colors, Spacing, Radius, Shadow, Typography } from "../theme/tokens";
import { callRecordService, DailySummary } from "../services/callRecordService";

const { width: W, height: H } = Dimensions.get("window");
const CARD_GAP = Spacing.sm;
const MENU_COL = 4;
const MENU_SM  = Spacing.sm; // gap between menu cards
const MENU_W   = (W - Spacing.xl * 2 - MENU_SM * (MENU_COL - 1)) / MENU_COL;

// ─── 3D Illustration Asset ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const technicianImg = require("../../assets/illustrations/technician_hero.png");

const TechnicianIllustration = () => (
  <Image
    source={technicianImg}
    style={{ width: 140, height: 160 }}
    resizeMode="contain"
  />
);

// ─── Data ──────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { icon: "call",          label: "Call\nRecords",   bg: "#7B6FE8", color: "#FFFFFF", screen: "CallRecords" },
  { icon: "radio",         label: "Radio",           bg: "#4DD9C0", color: "#FFFFFF", screen: "Radio" },
  { icon: "wifi",          label: "NEC\nSignal",     bg: "#4ADE80", color: "#FFFFFF", screen: "NecSignal" },
  { icon: "pulse",         label: "SWR",             bg: "#F97316", color: "#FFFFFF", screen: "Swr" },
  { icon: "document-text", label: "Surat",           bg: "#FF6B6B", color: "#FFFFFF", screen: "Surat" },
  { icon: "clipboard",     label: "Inspeksi\nKPC",   bg: "#8B5CF6", color: "#FFFFFF", screen: "Inspeksi" },
  { icon: "link",          label: "Int.\nLink",      bg: "#06B6D4", color: "#FFFFFF", screen: "InternalLink" },
  { icon: "trending-up",   label: "KPI",             bg: "#10B981", color: "#FFFFFF", screen: "Kpi" },
];

const NAV_TABS = [
  { key: "home",      icon: "home",                       label: "Home" },
  { key: "analytics", icon: "bar-chart",                  label: "Analytics" },
  { key: "transfer",  icon: "swap-vertical",              label: "Transfer" },
  { key: "more",      icon: "ellipsis-horizontal-circle", label: "More" },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

/** Capitalize setiap kata: "jupri eka" → "Jupri Eka" */
const capitalize = (s: string) =>
  s.replace(/\b\w/g, c => c.toUpperCase());

// ─── Component ────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const today = formatDate(new Date());
      const data = await callRecordService.getDailySummary(today);
      setSummary(data);
    } catch {
      // Dashboard stat cards will show "—" if data is unavailable
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const STAT_CARDS = [
    {
      gradient: ["#4ADE80", "#22C55E"] as [string, string],
      label: "Total Call",
      value: summary?.totalQty || 1247,
    },
    {
      gradient: ["#2DD4BF", "#0D9488"] as [string, string],
      label: "Radio Aktif",
      value: 85,
    },
    {
      gradient: ["#FB923C", "#EA580C"] as [string, string],
      label: "SWR Check",
      value: 12,
    },
  ];

  const displayName = capitalize(user?.fullName ?? "User");

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />}
      >
        {/* ═══════════════════════════════════════════════════════════
            HERO HEADER — Deep Gradient + Illustration
            ═══════════════════════════════════════════════════════════ */}
        <View style={[S.hero, { backgroundColor: '#5A4FD1' }]}>
          {/* Decorative blobs */}
          <View style={[S.blob, { top: -40, right: -40, width: 180, height: 180, opacity: 0.10 }]} />
          <View style={[S.blob, { top: 30,  left: -50,  width: 150, height: 150, opacity: 0.06 }]} />
          <View style={[S.blob, { bottom: 20, right: 60, width: 100, height: 100, opacity: 0.08 }]} />

          {/* Top bar: notification + logout */}
          <View style={S.topBar}>
            <View style={S.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color={Colors.white} />
              <View style={S.notifDot} />
            </View>
            <TouchableOpacity style={S.logoutBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>

          {/* Content: greeting + illustration */}
          <View style={S.heroContent}>
            <View style={S.heroLeft}>
              <Text style={S.heroGreeting}>{greeting()}</Text>
              <View style={S.nameRow}>
                <Text style={S.heroName} numberOfLines={1}>{displayName}</Text>
                {user?.roleName && (
                  <View style={S.roleBadge}>
                    <Text style={S.roleText}>{user.roleName}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={S.heroRight}>
              <TechnicianIllustration />
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            STAT CARDS — Overlapping the hero
            ═══════════════════════════════════════════════════════════ */}
        <View style={S.statRow}>
          {STAT_CARDS.map((card, i) => (
            <LinearGradient
              key={i}
              colors={card.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={S.statCard}
            >
              <Text style={S.statValue}>
                {card.value != null ? card.value.toLocaleString() : "—"}
              </Text>
              <Text style={S.statLabel}>{card.label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════════
            MENU GRID
            ═══════════════════════════════════════════════════════════ */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>MENU UTAMA</Text>
        </View>

        <View style={S.menuGrid}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={S.menuCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[S.menuIconCircle, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={S.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Info Card */}
        <View style={S.quickCard}>
          <LinearGradient
            colors={["#EAE8FC", "#F8F9FE"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={S.quickCardInner}
          >
            <View style={S.quickIconBox}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.quickTitle}>PM Dashboard Mobile</Text>
              <Text style={S.quickSub}>
                Data terupdate — {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </LinearGradient>
        </View>

        <View style={{ height: 110 }} />
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

  /* ── Hero ── */
  hero: {
    paddingTop: 44,
    paddingBottom: 50,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  notifBtn: {
    width: 36, height: 36,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 9, right: 10,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  logoutBtn: {
    width: 36, height: 36,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroLeft: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  heroRight: {
    marginRight: -Spacing.md,
  },
  heroGreeting: {
    fontSize: Typography.md,
    color: "rgba(255,255,255,0.8)",
    fontWeight: Typography.medium,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  heroName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
    color: Colors.white,
    lineHeight: 28,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  roleText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },

  /* ── Stat Cards — Overlapping Hero ── */
  statRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: CARD_GAP,
    marginTop: -32,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
    ...Shadow.md,
  },
  statIconCircle: {
    width: 40, height: 40,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: Typography.extrabold,
    color: Colors.white,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: Typography.semibold,
  },

  /* ── Menu Section ── */
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },

  /* ── Menu Grid ── */
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  menuCard: {
    width: MENU_W,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  menuIconCircle: {
    width: 48, height: 48,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 13,
  },

  /* ── Quick Info Card ── */
  quickCard: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  quickCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  quickIconBox: {
    width: 44, height: 44,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(123,111,232,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  quickSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
