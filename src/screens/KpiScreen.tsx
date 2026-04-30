/**
 * KpiScreen — PM Mobile
 * Lists KPI documents from backend with filtering and status badges
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";
import { kpiService, KpiDocument } from "../services/kpiService";

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  Completed:  { color: Colors.success,  icon: "checkmark-circle", label: "Selesai" },
  Signed:     { color: "#8B5CF6",       icon: "create",           label: "Ditandatangani" },
  Pending:    { color: Colors.warning,  icon: "time",             label: "Menunggu" },
  Draft:      { color: Colors.textMuted,icon: "document",         label: "Draft" },
};

const getStatus = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.Draft;

export default function KpiScreen({ navigation }: any) {
  const [docs, setDocs] = useState<KpiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const res = await kpiService.getAll({ periodMonth, pageSize: 50 });
      setDocs(res.data);
      setTotalCount(res.meta?.pagination?.totalCount ?? res.data.length);
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filtered = docs.filter(d =>
    !search || d.documentName?.toLowerCase().includes(search.toLowerCase())
  );

  // Count statuses
  const completed = docs.filter(d => d.status === "Completed").length;
  const pending = docs.filter(d => d.status === "Pending" || d.status === "Draft").length;
  const signed = docs.filter(d => d.status === "Signed").length;

  const renderItem = ({ item }: { item: KpiDocument }) => {
    const st = getStatus(item.status);
    return (
      <View style={S.card}>
        <View style={[S.strip, { backgroundColor: st.color }]} />
        <View style={S.cardBody}>
          <View style={S.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={S.docName} numberOfLines={2}>{item.documentName}</Text>
              {item.towerName && (
                <View style={S.metaRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>{item.towerName}</Text>
                </View>
              )}
              {item.areaGroup && (
                <View style={S.metaRow}>
                  <Ionicons name="business-outline" size={12} color={Colors.textMuted} />
                  <Text style={S.metaText}>{item.areaGroup}</Text>
                </View>
              )}
            </View>
            <View style={[S.statusBadge, { backgroundColor: st.color + "18" }]}>
              <Ionicons name={st.icon as any} size={12} color={st.color} />
              <Text style={[S.statusText, { color: st.color }]}>{st.label}</Text>
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
      <LinearGradient colors={["#7B6FE8", "#5A4FD1"]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.header}>
        <TouchableOpacity style={S.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.white} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>KPI Monitoring</Text>
          <Text style={S.headerSub}>{totalCount} dokumen</Text>
        </View>
        <TouchableOpacity style={S.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={S.summaryRow}>
        <SummaryCard gradColors={["#7B6FE8","#9B8FF0"]} icon="documents" label="Total" value={totalCount} />
        <SummaryCard gradColors={["#00C48C","#4DD9C0"]} icon="checkmark-circle" label="Selesai" value={completed} />
        <SummaryCard gradColors={["#FFB800","#FFD45C"]} icon="time" label="Pending" value={pending} />
        <SummaryCard gradColors={["#8B5CF6","#A78BFA"]} icon="create" label="Signed" value={signed} />
      </View>

      {/* Search */}
      <View style={S.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.primary} />
        <TextInput
          style={S.searchInput}
          placeholder="Cari dokumen KPI..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={S.loadingBox}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.kpiDocumentId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={S.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
              <Text style={S.emptyText}>Tidak ada dokumen KPI</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function SummaryCard({ gradColors, icon, label, value }: {
  gradColors: [string,string]; icon: string; label: string; value: number;
}) {
  return (
    <LinearGradient colors={gradColors} start={{x:0,y:0}} end={{x:1,y:1}} style={S.sumCard}>
      <Ionicons name={icon as any} size={18} color={Colors.white} />
      <Text style={S.sumValue}>{value}</Text>
      <Text style={S.sumLabel}>{label}</Text>
    </LinearGradient>
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

  summaryRow: {
    flexDirection: "row", paddingHorizontal: Spacing.lg, gap: Spacing.sm,
    marginTop: -Spacing.md, marginBottom: Spacing.md,
  },
  sumCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.sm, alignItems: "center", gap: 2,
    ...Shadow.sm,
  },
  sumValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white },
  sumLabel: { fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: Typography.medium },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 44, gap: Spacing.sm, marginBottom: Spacing.md,
    ...Shadow.xs,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.md },

  card: {
    flexDirection: "row", backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.sm, overflow: "hidden", ...Shadow.xs,
  },
  strip: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.lg },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  docName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full,
  },
  statusText: { fontSize: 10, fontWeight: Typography.bold },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  emptyText: { fontSize: Typography.md, color: Colors.textSecondary },
});
