/**
 * NecSignalScreen — PM Mobile
 * Shows NEC RSL tower signal data with tower selector and monthly summary cards
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal, FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";
import { necSignalService, NecTower, NecYearlyPivotData } from "../services/necSignalService";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export default function NecSignalScreen({ navigation }: any) {
  const [towers, setTowers] = useState<NecTower[]>([]);
  const [selectedTower, setSelectedTower] = useState<string | undefined>(undefined);
  const [pivotData, setPivotData] = useState<NecYearlyPivotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showTowerPicker, setShowTowerPicker] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [towerRes, pivotRes] = await Promise.all([
        necSignalService.getTowers(),
        necSignalService.getYearlyPivot(year, selectedTower),
      ]);
      setTowers(towerRes);
      setPivotData(pivotRes);
    } catch {
      // show empty
    } finally {
      setLoading(false);
    }
  }, [year, selectedTower]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Compute average RSL for dashboard
  const totalLinks = pivotData.length;
  const avgRsl = totalLinks > 0
    ? pivotData.reduce((sum, d) => sum + (d.yearlyAverage ?? 0), 0) / totalLinks
    : 0;

  const getRslColor = (val: number | null | undefined): string => {
    if (val == null) return Colors.textMuted;
    if (val >= -35) return Colors.success;
    if (val >= -40) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={["#00C48C", "#10B981"]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.header}>
        <TouchableOpacity style={S.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.white} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>NEC Signal (RSL)</Text>
          <Text style={S.headerSub}>{totalLinks} link · Tahun {year}</Text>
        </View>
        <TouchableOpacity style={S.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Row */}
      <View style={S.filterRow}>
        {/* Year selector */}
        <View style={S.yearRow}>
          <TouchableOpacity onPress={() => setYear(y => y - 1)} style={S.arrowBtn}>
            <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={S.yearText}>{year}</Text>
          <TouchableOpacity onPress={() => setYear(y => Math.min(y + 1, new Date().getFullYear()))} style={S.arrowBtn}>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tower selector */}
        <TouchableOpacity style={S.towerBtn} onPress={() => setShowTowerPicker(true)}>
          <Ionicons name="cellular-outline" size={14} color={Colors.success} />
          <Text style={S.towerBtnText} numberOfLines={1}>
            {selectedTower ?? "Semua Tower"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={S.summaryRow}>
        <LinearGradient colors={["#00C48C","#4DD9C0"]} style={S.sumCard}>
          <Ionicons name="wifi" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{totalLinks}</Text>
          <Text style={S.sumLabel}>Total Link</Text>
        </LinearGradient>
        <LinearGradient colors={["#7B6FE8","#9B8FF0"]} style={S.sumCard}>
          <Ionicons name="analytics" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{avgRsl ? avgRsl.toFixed(1) : "—"}</Text>
          <Text style={S.sumLabel}>Avg RSL (dBm)</Text>
        </LinearGradient>
        <LinearGradient colors={["#FFB800","#FFD45C"]} style={S.sumCard}>
          <Ionicons name="business" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{towers.length}</Text>
          <Text style={S.sumLabel}>Tower</Text>
        </LinearGradient>
      </View>

      {/* Data List */}
      {loading ? (
        <View style={S.loadingBox}><ActivityIndicator size="large" color={Colors.success} /></View>
      ) : (
        <FlatList
          data={pivotData}
          keyExtractor={item => item.linkId.toString()}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.success} />}
          renderItem={({ item }) => {
            const rslColor = getRslColor(item.yearlyAverage);
            return (
              <View style={S.card}>
                <View style={[S.strip, { backgroundColor: rslColor }]} />
                <View style={S.cardBody}>
                  <View style={S.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.linkName} numberOfLines={1}>{item.linkName}</Text>
                      <View style={S.metaRow}>
                        <Ionicons name="business-outline" size={11} color={Colors.textMuted} />
                        <Text style={S.metaText}>{item.towerName}</Text>
                      </View>
                    </View>
                    <View style={[S.rslBadge, { backgroundColor: rslColor + "18" }]}>
                      <Text style={[S.rslValue, { color: rslColor }]}>
                        {item.yearlyAverage != null ? item.yearlyAverage.toFixed(1) : "—"} dBm
                      </Text>
                    </View>
                  </View>
                  {/* Monthly mini bars */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.monthRow}>
                    {MONTHS.map((m, i) => {
                      const key = String(i + 1).padStart(2, "0");
                      const val = item.monthlyAverages?.[key] ?? item.monthlyAverages?.[String(i + 1)];
                      const barColor = getRslColor(val);
                      return (
                        <View key={m} style={S.monthItem}>
                          <View style={S.miniBarTrack}>
                            <View style={[S.miniBar, { 
                              height: val != null ? Math.max(Math.min(Math.abs(val) * 1.2, 28), 3) : 3,
                              backgroundColor: barColor,
                              opacity: val != null ? 0.8 : 0.2,
                            }]} />
                          </View>
                          <Text style={S.monthLabel}>{m}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={S.emptyBox}>
              <Ionicons name="wifi-outline" size={48} color={Colors.textMuted} />
              <Text style={S.emptyText}>Tidak ada data NEC Signal</Text>
            </View>
          }
        />
      )}

      {/* Tower Picker Modal */}
      <Modal visible={showTowerPicker} transparent animationType="slide" onRequestClose={() => setShowTowerPicker(false)}>
        <View style={S.modalOverlay}>
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>Pilih Tower</Text>
            <TouchableOpacity style={[S.modalItem, !selectedTower && S.modalItemActive]}
              onPress={() => { setSelectedTower(undefined); setShowTowerPicker(false); }}>
              <Text style={[S.modalItemText, !selectedTower && S.modalItemTextActive]}>Semua Tower</Text>
            </TouchableOpacity>
            <FlatList
              data={towers}
              keyExtractor={t => t.id.toString()}
              renderItem={({ item: t }) => (
                <TouchableOpacity style={[S.modalItem, selectedTower === t.name && S.modalItemActive]}
                  onPress={() => { setSelectedTower(t.name); setShowTowerPicker(false); }}>
                  <Text style={[S.modalItemText, selectedTower === t.name && S.modalItemTextActive]}>{t.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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

  filterRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.md,
  },
  yearRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg, paddingHorizontal: Spacing.sm,
    height: 40, gap: Spacing.xs, ...Shadow.xs,
  },
  arrowBtn: { padding: Spacing.xs },
  yearText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, minWidth: 44, textAlign: "center" },
  towerBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
    height: 40, gap: Spacing.xs, ...Shadow.xs,
  },
  towerBtnText: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },

  summaryRow: {
    flexDirection: "row", paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md,
  },
  sumCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.sm, alignItems: "center", gap: 2, ...Shadow.sm,
  },
  sumValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  sumLabel: { fontSize: 8, color: "rgba(255,255,255,0.85)", fontWeight: Typography.medium },

  card: {
    flexDirection: "row", backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.sm, overflow: "hidden", ...Shadow.xs,
  },
  strip: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.md },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, marginBottom: Spacing.sm },
  linkName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  rslBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  rslValue: { fontSize: 11, fontWeight: Typography.bold },

  monthRow: { marginTop: Spacing.xs },
  monthItem: { alignItems: "center", marginRight: 6, width: 24 },
  miniBarTrack: { height: 30, justifyContent: "flex-end", alignItems: "center", width: "100%" },
  miniBar: { width: 14, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 3 },
  monthLabel: { fontSize: 7, color: Colors.textMuted, marginTop: 2 },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  emptyText: { fontSize: Typography.md, color: Colors.textSecondary },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl, paddingBottom: 40, maxHeight: "60%",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginBottom: Spacing.lg },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  modalItem: {
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: Radius.lg, marginBottom: 4,
  },
  modalItemActive: { backgroundColor: Colors.successLight },
  modalItemText: { fontSize: Typography.md, color: Colors.textPrimary },
  modalItemTextActive: { color: Colors.success, fontWeight: Typography.bold },
});
