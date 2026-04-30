/**
 * RadioScreen — PM Mobile
 * Tabs: Trunking | Conventional — lists radio data from backend
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";
import { radioService, RadioTrunking, RadioConventional } from "../services/radioService";

type RadioTab = "trunking" | "conventional";

const CONDITION_COLORS: Record<string, string> = {
  Baik: Colors.success,
  Rusak: Colors.error,
  Maintenance: Colors.warning,
};

export default function RadioScreen({ navigation }: any) {
  const [tab, setTab] = useState<RadioTab>("trunking");
  const [trunkingData, setTrunkingData] = useState<RadioTrunking[]>([]);
  const [conventionalData, setConventionalData] = useState<RadioConventional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [trunkingTotal, setTrunkingTotal] = useState(0);
  const [conventionalTotal, setConventionalTotal] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        radioService.getTrunking({ pageSize: 50, search: search || undefined }),
        radioService.getConventional({ pageSize: 50, search: search || undefined }),
      ]);
      setTrunkingData(tRes.data);
      setTrunkingTotal(tRes.meta?.pagination?.totalCount ?? tRes.data.length);
      setConventionalData(cRes.data);
      setConventionalTotal(cRes.meta?.pagination?.totalCount ?? cRes.data.length);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const data = tab === "trunking" ? trunkingData : conventionalData;

  const renderTrunkingItem = ({ item }: { item: RadioTrunking }) => {
    const condColor = CONDITION_COLORS[item.condition ?? ""] || Colors.textMuted;
    return (
      <View style={S.card}>
        <View style={[S.strip, { backgroundColor: condColor }]} />
        <View style={S.cardBody}>
          <View style={S.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.cardTitle} numberOfLines={1}>{item.brand ?? "N/A"} {item.model ?? ""}</Text>
              <View style={S.metaRow}>
                <Ionicons name="barcode-outline" size={12} color={Colors.textMuted} />
                <Text style={S.metaText}>{item.serialNumber ?? "-"}</Text>
              </View>
              {item.issiNumber && (
                <View style={S.metaRow}>
                  <Ionicons name="call-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>ISSI: {item.issiNumber}</Text>
                </View>
              )}
              {item.location && (
                <View style={S.metaRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>{item.location}</Text>
                </View>
              )}
            </View>
            <View style={[S.condBadge, { backgroundColor: condColor + "18" }]}>
              <Text style={[S.condText, { color: condColor }]}>{item.condition ?? "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderConvItem = ({ item }: { item: RadioConventional }) => {
    const condColor = CONDITION_COLORS[item.condition ?? ""] || Colors.textMuted;
    return (
      <View style={S.card}>
        <View style={[S.strip, { backgroundColor: condColor }]} />
        <View style={S.cardBody}>
          <View style={S.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.cardTitle} numberOfLines={1}>{item.brand ?? "N/A"} {item.model ?? ""}</Text>
              <View style={S.metaRow}>
                <Ionicons name="barcode-outline" size={12} color={Colors.textMuted} />
                <Text style={S.metaText}>{item.serialNumber ?? "-"}</Text>
              </View>
              {item.frequency && (
                <View style={S.metaRow}>
                  <Ionicons name="radio-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>Freq: {item.frequency}</Text>
                </View>
              )}
              {item.location && (
                <View style={S.metaRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>{item.location}</Text>
                </View>
              )}
            </View>
            <View style={[S.condBadge, { backgroundColor: condColor + "18" }]}>
              <Text style={[S.condText, { color: condColor }]}>{item.condition ?? "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={["#4DD9C0", "#06B6D4"]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.header}>
        <TouchableOpacity style={S.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.white} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>Radio Management</Text>
          <Text style={S.headerSub}>{trunkingTotal + conventionalTotal} unit total</Text>
        </View>
        <TouchableOpacity style={S.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={S.tabBar}>
        {(["trunking", "conventional"] as RadioTab[]).map(t => (
          <TouchableOpacity key={t} style={[S.tabItem, tab === t && S.tabActive]} onPress={() => setTab(t)}>
            <Ionicons name={t === "trunking" ? "radio" : "hardware-chip-outline"} size={15}
              color={tab === t ? Colors.secondary : Colors.textMuted} />
            <Text style={[S.tabLabel, tab === t && S.tabLabelActive]}>
              {t === "trunking" ? `Trunking (${trunkingTotal})` : `Conventional (${conventionalTotal})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={S.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.secondary} />
        <TextInput
          style={S.searchInput} placeholder="Cari radio..."
          placeholderTextColor={Colors.textMuted} value={search}
          onChangeText={setSearch} onSubmitEditing={fetchData} returnKeyType="search"
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={S.loadingBox}><ActivityIndicator size="large" color={Colors.secondary} /></View>
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(item, i) => (item.radioTrunkingId || item.radioConventionalId || i).toString()}
          renderItem={tab === "trunking" ? renderTrunkingItem as any : renderConvItem as any}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
          ListEmptyComponent={
            <View style={S.emptyBox}>
              <Ionicons name="radio-outline" size={48} color={Colors.textMuted} />
              <Text style={S.emptyText}>Tidak ada data radio</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.xl, gap: Spacing.sm,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  headerSub: { fontSize: Typography.xs, color: "rgba(255,255,255,0.75)", marginTop: 1 },

  tabBar: {
    flexDirection: "row", backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.sm, gap: Spacing.xs,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: Colors.secondary },
  tabLabel: { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  tabLabelActive: { color: Colors.secondary, fontWeight: Typography.semibold },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 44, gap: Spacing.sm,
    marginTop: Spacing.md, marginBottom: Spacing.md, ...Shadow.xs,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.md },

  card: {
    flexDirection: "row", backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.sm, overflow: "hidden", ...Shadow.xs,
  },
  strip: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.lg },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  cardTitle: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  condBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  condText: { fontSize: 10, fontWeight: Typography.bold },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  emptyText: { fontSize: Typography.md, color: Colors.textSecondary },
});
