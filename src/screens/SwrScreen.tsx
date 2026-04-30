/**
 * SwrScreen — PM Mobile
 * Shows SWR Signal data with site picker and yearly pivot
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal, FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";
import { swrService, SwrSite, SwrYearlyPivotData } from "../services/swrService";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export default function SwrScreen({ navigation }: any) {
  const [sites, setSites] = useState<SwrSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | undefined>(undefined);
  const [pivotData, setPivotData] = useState<SwrYearlyPivotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showSitePicker, setShowSitePicker] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [siteRes, pivotRes] = await Promise.all([
        swrService.getSites(),
        swrService.getYearlyPivot(year, selectedSite),
      ]);
      setSites(siteRes);
      setPivotData(pivotRes);
    } catch {
      // show empty
    } finally {
      setLoading(false);
    }
  }, [year, selectedSite]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalChannels = pivotData.length;
  const avgSwr = totalChannels > 0
    ? pivotData.reduce((s, d) => s + (d.yearlyAverage ?? 0), 0) / totalChannels
    : 0;

  const getSwrColor = (val: number | null | undefined): string => {
    if (val == null) return Colors.textMuted;
    if (val <= 1.5) return Colors.success;
    if (val <= 2.0) return Colors.warning;
    return Colors.error;
  };

  const getSwrStatus = (val: number | null | undefined): string => {
    if (val == null) return "N/A";
    if (val <= 1.5) return "Good";
    if (val <= 2.0) return "Fair";
    return "Poor";
  };

  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={["#FFB800", "#F97316"]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.header}>
        <TouchableOpacity style={S.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.white} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>SWR Monitoring</Text>
          <Text style={S.headerSub}>{totalChannels} channel · Tahun {year}</Text>
        </View>
        <TouchableOpacity style={S.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Row */}
      <View style={S.filterRow}>
        <View style={S.yearRow}>
          <TouchableOpacity onPress={() => setYear(y => y - 1)} style={S.arrowBtn}>
            <Ionicons name="chevron-back" size={16} color={Colors.warning} />
          </TouchableOpacity>
          <Text style={S.yearText}>{year}</Text>
          <TouchableOpacity onPress={() => setYear(y => Math.min(y + 1, new Date().getFullYear()))} style={S.arrowBtn}>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={S.siteBtn} onPress={() => setShowSitePicker(true)}>
          <Ionicons name="location-outline" size={14} color={Colors.warning} />
          <Text style={S.siteBtnText} numberOfLines={1}>{selectedSite ?? "Semua Site"}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={S.summaryRow}>
        <LinearGradient colors={["#FFB800","#FFD45C"]} style={S.sumCard}>
          <Ionicons name="pulse" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{totalChannels}</Text>
          <Text style={S.sumLabel}>Channel</Text>
        </LinearGradient>
        <LinearGradient colors={["#7B6FE8","#9B8FF0"]} style={S.sumCard}>
          <Ionicons name="analytics" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{avgSwr ? avgSwr.toFixed(2) : "—"}</Text>
          <Text style={S.sumLabel}>Avg SWR</Text>
        </LinearGradient>
        <LinearGradient colors={["#00C48C","#4DD9C0"]} style={S.sumCard}>
          <Ionicons name="business" size={20} color={Colors.white} />
          <Text style={S.sumValue}>{sites.length}</Text>
          <Text style={S.sumLabel}>Site</Text>
        </LinearGradient>
      </View>

      {/* Data List */}
      {loading ? (
        <View style={S.loadingBox}><ActivityIndicator size="large" color={Colors.warning} /></View>
      ) : (
        <FlatList
          data={pivotData}
          keyExtractor={item => item.channelId.toString()}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.warning} />}
          renderItem={({ item }) => {
            const swrColor = getSwrColor(item.yearlyAverage);
            const status = getSwrStatus(item.yearlyAverage);
            return (
              <View style={S.card}>
                <View style={[S.strip, { backgroundColor: swrColor }]} />
                <View style={S.cardBody}>
                  <View style={S.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.chName} numberOfLines={1}>{item.channelName}</Text>
                      <View style={S.metaRow}>
                        <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                        <Text style={S.metaText}>{item.siteName}</Text>
                      </View>
                    </View>
                    <View style={S.swrBadgeCol}>
                      <View style={[S.swrBadge, { backgroundColor: swrColor + "18" }]}>
                        <Text style={[S.swrValue, { color: swrColor }]}>
                          {item.yearlyAverage != null ? item.yearlyAverage.toFixed(2) : "—"}
                        </Text>
                      </View>
                      <Text style={[S.swrStatus, { color: swrColor }]}>{status}</Text>
                    </View>
                  </View>
                  {/* Monthly mini bars */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.monthRow}>
                    {MONTHS.map((m, i) => {
                      const key = String(i + 1).padStart(2, "0");
                      const val = item.monthlyValues?.[key] ?? item.monthlyValues?.[String(i + 1)];
                      const barColor = getSwrColor(val);
                      return (
                        <View key={m} style={S.monthItem}>
                          <View style={S.miniBarTrack}>
                            <View style={[S.miniBar, {
                              height: val != null ? Math.max(Math.min(val * 14, 28), 3) : 3,
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
              <Ionicons name="pulse-outline" size={48} color={Colors.textMuted} />
              <Text style={S.emptyText}>Tidak ada data SWR</Text>
            </View>
          }
        />
      )}

      {/* Site Picker Modal */}
      <Modal visible={showSitePicker} transparent animationType="slide" onRequestClose={() => setShowSitePicker(false)}>
        <View style={S.modalOverlay}>
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>Pilih Site</Text>
            <TouchableOpacity style={[S.modalItem, !selectedSite && S.modalItemActive]}
              onPress={() => { setSelectedSite(undefined); setShowSitePicker(false); }}>
              <Text style={[S.modalItemText, !selectedSite && S.modalItemTextActive]}>Semua Site</Text>
            </TouchableOpacity>
            <FlatList
              data={sites}
              keyExtractor={s => s.id.toString()}
              renderItem={({ item: s }) => (
                <TouchableOpacity style={[S.modalItem, selectedSite === s.name && S.modalItemActive]}
                  onPress={() => { setSelectedSite(s.name); setShowSitePicker(false); }}>
                  <Text style={[S.modalItemText, selectedSite === s.name && S.modalItemTextActive]}>{s.name}</Text>
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
    backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  headerSub: { fontSize: Typography.xs, color: "rgba(255,255,255,0.8)", marginTop: 1 },

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
  siteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
    height: 40, gap: Spacing.xs, ...Shadow.xs,
  },
  siteBtnText: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },

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
  chName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  swrBadgeCol: { alignItems: "center", gap: 2 },
  swrBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  swrValue: { fontSize: 12, fontWeight: Typography.bold },
  swrStatus: { fontSize: 8, fontWeight: Typography.semibold },

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
  modalItemActive: { backgroundColor: Colors.warningLight },
  modalItemText: { fontSize: Typography.md, color: Colors.textPrimary },
  modalItemTextActive: { color: Colors.warning, fontWeight: Typography.bold },
});
