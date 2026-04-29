/**
 * CallRecordsScreen — PM Mobile
 * Contract-Driven Design: semua style menggunakan tokens dari theme/tokens.ts
 * Features: Date picker modal, filter reason+hour, bar chart, pagination
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StatusBar,
  FlatList, Modal, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors, Spacing, Radius, Typography, Shadow, getReasonColor,
} from "../theme/tokens";
import { BarChart } from "../components/ui/BarChart";
import { CalendarPicker } from "../components/ui/CalendarPicker";
import { callRecordService, DailySummary, CallRecord } from "../services/callRecordService";

// ─── Types ─────────────────────────────────────────────────────────
type Tab = "summary" | "records";

const REASON_LABELS: Record<number, string> = {
  0: "Normal",
  1: "TE Busy",
  2: "Sys Busy",
  3: "No Answer",
  4: "Not Found",
  5: "Complete",
  6: "Preempted",
  7: "Timeout",
  8: "Inactive",
  9: "Callback",
  10: "Invalid",
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

// ─── Helpers ───────────────────────────────────────────────────────
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const formatDisplay = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const formatShort = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

// ─── Main Component ────────────────────────────────────────────────
export default function CallRecordsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  // Date state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Data state
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState<number | undefined>(undefined);
  const [filterHour, setFilterHour] = useState<number | undefined>(undefined);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const dateStr = formatDate(selectedDate);

  // ─── Fetch ───────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setSummary(null);
      const data = await callRecordService.getDailySummary(dateStr);
      setSummary(data);
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Tidak dapat memuat summary");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const fetchRecords = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      const res = await callRecordService.getCallRecords({
        startDate: dateStr,
        endDate: dateStr,
        page: pageNum,
        pageSize: 20,
        search: search || undefined,
      });
      const filtered = res.data.filter(r => {
        if (filterReason !== undefined && r.callCloseReason !== filterReason) return false;
        if (filterHour !== undefined && r.hourGroup !== filterHour) return false;
        return true;
      });
      if (append) setRecords(prev => [...prev, ...filtered]);
      else setRecords(filtered);
      setTotalPages(res.meta.pagination.totalPages);
      setTotalCount(res.meta.pagination.totalCount);
      setPage(pageNum);
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Tidak dapat memuat records");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dateStr, search, filterReason, filterHour]);

  useEffect(() => {
    if (activeTab === "summary") fetchSummary();
    else fetchRecords(1);
  }, [activeTab, dateStr]);

  useEffect(() => {
    if (activeTab === "records") fetchRecords(1);
  }, [filterReason, filterHour]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "summary") await fetchSummary();
    else await fetchRecords(1);
    setRefreshing(false);
  };

  // ─── Date Navigation ─────────────────────────────────────────────
  const goToPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setSelectedDate(d);
  };

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  // ─── Chart Data ──────────────────────────────────────────────────
  const chartData = summary?.hourlyData?.map(h => ({
    label: `${h.hourGroup}`,
    value: h.qty,
  })) ?? [];

  const activeFiltersCount = [filterReason, filterHour].filter(f => f !== undefined).length;

  // ─── Render: Date Bar ─────────────────────────────────────────────
  const renderDateBar = () => (
    <>
      <View style={S.dateBar}>
        <TouchableOpacity onPress={goToPrev} style={S.dateArrow}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={S.dateTouchable} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
          <Text style={S.dateText}>{formatDisplay(selectedDate)}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNext} style={S.dateArrow} disabled={isToday}>
          <Ionicons
            name="chevron-forward" size={18}
            color={isToday ? Colors.textMuted : Colors.primary}
          />
        </TouchableOpacity>

        {!isToday && (
          <TouchableOpacity style={S.todayChip} onPress={() => setSelectedDate(new Date())}>
            <Text style={S.todayChipText}>Hari ini</Text>
          </TouchableOpacity>
        )}
      </View>

      <CalendarPicker
        visible={showDatePicker}
        value={selectedDate}
        maxDate={new Date()}
        onConfirm={(date) => setSelectedDate(date)}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );

  // ─── Render: Summary Tab ─────────────────────────────────────────
  const renderSummary = () => (
    <ScrollView
      style={S.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {renderDateBar()}

      {loading ? (
        <View style={S.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={S.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <>
          {/* Stat Cards 2x2 */}
          <View style={S.statsGrid}>
            <StatCard
              icon="call-outline"
              label="Total Calls"
              value={summary?.totalQty ?? 0}
              color={Colors.primary}
            />
            <StatCard
              icon="close-circle-outline"
              label="TE Busy"
              value={summary?.totalTEBusy ?? 0}
              color={Colors.error}
              pct={summary?.avgTEBusyPercent}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Sys Busy"
              value={summary?.totalSysBusy ?? 0}
              color={Colors.warning}
              pct={summary?.avgSysBusyPercent}
            />
            <StatCard
              icon="ellipsis-horizontal-circle-outline"
              label="Others"
              value={summary?.totalOthers ?? 0}
              color={Colors.success}
              pct={summary?.avgOthersPercent}
            />
          </View>

          {/* Bar Chart */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <Text style={S.cardTitle}>Distribusi Per Jam</Text>
              <View style={S.chip}>
                <Text style={S.chipText}>24 Jam</Text>
              </View>
            </View>
            <BarChart data={chartData} height={150} />
          </View>

          {/* Percent Bars */}
          <View style={S.card}>
            <Text style={S.cardTitle}>Rata-rata Persentase</Text>
            <PercentBar label="TE Busy"  value={Number(summary?.avgTEBusyPercent  ?? 0)} color={Colors.error}   />
            <PercentBar label="Sys Busy" value={Number(summary?.avgSysBusyPercent ?? 0)} color={Colors.warning} />
            <PercentBar label="Others"   value={Number(summary?.avgOthersPercent  ?? 0)} color={Colors.success} />
          </View>

          {/* Hourly Table */}
          {summary?.hourlyData && summary.hourlyData.length > 0 && (
            <View style={[S.card, { marginBottom: Spacing.xxxl }]}>
              <Text style={S.cardTitle}>Detail Per Jam</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={[S.tableRow, S.tableHead]}>
                    {["Jam", "Qty", "TE", "TE%", "Sys", "Sys%", "Lain", "Lain%"].map(h => (
                      <Text key={h} style={[S.tableCell, S.tableHeadText]}>{h}</Text>
                    ))}
                  </View>
                  {summary.hourlyData.map((row, i) => (
                    <View key={i} style={[S.tableRow, i % 2 === 1 && S.tableRowAlt]}>
                      <Text style={S.tableCell}>{row.timeRange}</Text>
                      <Text style={[S.tableCell, { color: Colors.primary, fontWeight: Typography.bold }]}>{row.qty}</Text>
                      <Text style={[S.tableCell, { color: Colors.error }]}>{row.teBusy}</Text>
                      <Text style={S.tableCell}>{row.teBusyPercent.toFixed(1)}%</Text>
                      <Text style={[S.tableCell, { color: Colors.warning }]}>{row.sysBusy}</Text>
                      <Text style={S.tableCell}>{row.sysBusyPercent.toFixed(1)}%</Text>
                      <Text style={[S.tableCell, { color: Colors.secondary }]}>{row.others}</Text>
                      <Text style={S.tableCell}>{row.othersPercent.toFixed(1)}%</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  // ─── Render: Records Tab ─────────────────────────────────────────
  const renderRecords = () => (
    <View style={S.tabContent}>
      {renderDateBar()}

      {/* Search + Filter Row */}
      <View style={S.searchRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={S.searchInput}
            placeholder="Cari records..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchRecords(1)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); fetchRecords(1); }}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[S.filterBtn, activeFiltersCount > 0 && S.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={18} color={activeFiltersCount > 0 ? Colors.white : Colors.primary} />
          {activeFiltersCount > 0 && (
            <View style={S.filterBadge}>
              <Text style={S.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipRow}>
          {filterReason !== undefined && (
            <TouchableOpacity
              style={S.activeChip}
              onPress={() => setFilterReason(undefined)}
            >
              <Text style={S.activeChipText}>{REASON_LABELS[filterReason] ?? `Reason ${filterReason}`}</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {filterHour !== undefined && (
            <TouchableOpacity
              style={S.activeChip}
              onPress={() => setFilterHour(undefined)}
            >
              <Text style={S.activeChipText}>Jam {filterHour}:00</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Total count */}
      {!loading && (
        <View style={S.countRow}>
          <Text style={S.countText}>{totalCount} records</Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={S.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.callRecordId.toString()}
          renderItem={({ item }) => <RecordItem item={item} />}
          onEndReached={() => !loadingMore && page < totalPages && fetchRecords(page + 1, true)}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState label="Tidak ada records untuk tanggal ini" />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        filterReason={filterReason}
        filterHour={filterHour}
        onSelectReason={setFilterReason}
        onSelectHour={setFilterHour}
        onClose={() => setShowFilterModal(false)}
        onReset={() => { setFilterReason(undefined); setFilterHour(undefined); }}
      />
    </View>
  );

  // ─── Main Render ─────────────────────────────────────────────────
  return (
    <View style={S.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={S.header}>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>Call Records</Text>
          <Text style={S.headerSub}>{formatShort(selectedDate)}</Text>
        </View>
        <TouchableOpacity style={S.backBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={S.tabBar}>
        <TouchableOpacity
          style={[S.tabItem, activeTab === "summary" && S.tabItemActive]}
          onPress={() => setActiveTab("summary")}
        >
          <Ionicons
            name="bar-chart-outline"
            size={16}
            color={activeTab === "summary" ? Colors.primary : Colors.textMuted}
          />
          <Text style={[S.tabLabel, activeTab === "summary" && S.tabLabelActive]}>
            Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.tabItem, activeTab === "records" && S.tabItemActive]}
          onPress={() => setActiveTab("records")}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={activeTab === "records" ? Colors.primary : Colors.textMuted}
          />
          <Text style={[S.tabLabel, activeTab === "records" && S.tabLabelActive]}>
            Records
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "summary" ? renderSummary() : renderRecords()}
    </View>
  );
}

// ─── Sub Components ────────────────────────────────────────────────

function StatCard({ icon, label, value, color, pct }: {
  icon: string; label: string; value: number; color: string; pct?: number;
}) {
  return (
    <View style={[SC.card, { borderTopColor: color }]}>
      <View style={SC.top}>
        <View style={[SC.iconBox, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        {pct !== undefined && (
          <Text style={[SC.pct, { color }]}>{Number(pct).toFixed(1)}%</Text>
        )}
      </View>
      <Text style={SC.label}>{label}</Text>
      <Text style={[SC.value, { color }]}>{value.toLocaleString()}</Text>
    </View>
  );
}

function PercentBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(Number(value) || 0, 100);
  return (
    <View style={PB.row}>
      <Text style={PB.label}>{label}</Text>
      <View style={PB.track}>
        <View style={[PB.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[PB.pct, { color }]}>{pct.toFixed(1)}%</Text>
    </View>
  );
}

function RecordItem({ item }: { item: CallRecord }) {
  const color = getReasonColor(item.callCloseReason);
  const label = REASON_LABELS[item.callCloseReason] ?? `Reason ${item.callCloseReason}`;
  return (
    <View style={RI.card}>
      <View style={[RI.dot, { backgroundColor: color }]} />
      <View style={RI.info}>
        <Text style={RI.time}>{item.callTime}</Text>
        <Text style={RI.reason}>{item.closeReasonDescription || label}</Text>
      </View>
      <View style={[RI.badge, { backgroundColor: color + "18" }]}>
        <Text style={[RI.badgeText, { color }]}>Jam {item.hourGroup}</Text>
      </View>
    </View>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={ES.box}>
      <Ionicons name="call-outline" size={48} color={Colors.border} />
      <Text style={ES.text}>{label}</Text>
    </View>
  );
}

function FilterModal({ visible, filterReason, filterHour, onSelectReason, onSelectHour, onClose, onReset }: {
  visible: boolean;
  filterReason?: number;
  filterHour?: number;
  onSelectReason: (v?: number) => void;
  onSelectHour: (v?: number) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={FM.overlay}>
        <View style={FM.sheet}>
          {/* Handle */}
          <View style={FM.handle} />

          <View style={FM.headerRow}>
            <Text style={FM.title}>Filter Records</Text>
            <TouchableOpacity onPress={onReset}>
              <Text style={FM.reset}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Reason Filter */}
          <Text style={FM.sectionLabel}>Close Reason</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={FM.chipScroll}>
            <TouchableOpacity
              style={[FM.chip, filterReason === undefined && FM.chipActive]}
              onPress={() => onSelectReason(undefined)}
            >
              <Text style={[FM.chipText, filterReason === undefined && FM.chipTextActive]}>Semua</Text>
            </TouchableOpacity>
            {Object.entries(REASON_LABELS).map(([key, val]) => {
              const k = Number(key);
              const active = filterReason === k;
              return (
                <TouchableOpacity
                  key={k}
                  style={[FM.chip, active && FM.chipActive]}
                  onPress={() => onSelectReason(active ? undefined : k)}
                >
                  <Text style={[FM.chipText, active && FM.chipTextActive]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Hour Filter */}
          <Text style={FM.sectionLabel}>Jam</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={FM.chipScroll}>
            <TouchableOpacity
              style={[FM.chip, filterHour === undefined && FM.chipActive]}
              onPress={() => onSelectHour(undefined)}
            >
              <Text style={[FM.chipText, filterHour === undefined && FM.chipTextActive]}>Semua</Text>
            </TouchableOpacity>
            {HOUR_OPTIONS.map(h => {
              const active = filterHour === h;
              return (
                <TouchableOpacity
                  key={h}
                  style={[FM.chip, active && FM.chipActive]}
                  onPress={() => onSelectHour(active ? undefined : h)}
                >
                  <Text style={[FM.chipText, active && FM.chipTextActive]}>{h}:00</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={FM.applyBtn} onPress={onClose}>
            <Text style={FM.applyText}>Terapkan Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────

const S = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.white, ...Shadow.xs,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.background,
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle:  { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  headerSub:    { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },

  // Tab Bar
  tabBar: {
    flexDirection: "row", backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.sm, gap: Spacing.xs,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: Colors.primary },
  tabLabel:      { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  tabLabelActive:{ color: Colors.primary, fontWeight: Typography.semibold },

  // Content
  tabContent: { flex: 1, paddingHorizontal: Spacing.lg },

  // Date Bar
  dateBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginTop: Spacing.lg, marginBottom: Spacing.md,
    gap: Spacing.xs, ...Shadow.xs,
  },
  dateArrow:    { padding: Spacing.xs },
  dateTouchable:{
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: Spacing.xs,
  },
  dateText:     { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary },
  todayChip:    {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  todayChipText:{ fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold },

  // Cards
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.xs,
  },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  cardTitle:    { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  chip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  chipText:     { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },

  // Table
  tableRow:     { flexDirection: "row", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableRowAlt:  { backgroundColor: Colors.background },
  tableHead:    { backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, marginBottom: 2 },
  tableHeadText:{ color: Colors.primary, fontWeight: Typography.bold },
  tableCell:    { width: 68, fontSize: 11, color: Colors.textPrimary, textAlign: "center" },

  // Search
  searchRow:    { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, gap: Spacing.sm, ...Shadow.xs,
  },
  searchInput:  { flex: 1, color: Colors.textPrimary, paddingVertical: 11, fontSize: Typography.md },
  filterBtn: {
    width: 44, height: 44, borderRadius: Radius.lg,
    backgroundColor: Colors.white, justifyContent: "center", alignItems: "center",
    ...Shadow.xs,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterBadge: {
    position: "absolute", top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.error, justifyContent: "center", alignItems: "center",
  },
  filterBadgeText: { fontSize: 9, color: Colors.white, fontWeight: Typography.bold },

  // Active chips
  chipRow:      { marginBottom: Spacing.sm },
  activeChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderRadius: Radius.full, marginRight: Spacing.sm,
  },
  activeChipText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },

  countRow:     { marginBottom: Spacing.sm },
  countText:    { fontSize: Typography.xs, color: Colors.textSecondary },

  // Loading / Empty
  loadingBox:   { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  loadingText:  { color: Colors.textSecondary, fontSize: Typography.sm },
});

// StatCard styles
const SC = StyleSheet.create({
  card: {
    width: "47%", backgroundColor: Colors.white,
    borderRadius: Radius.xl, padding: Spacing.lg,
    borderTopWidth: 3, ...Shadow.xs,
  },
  top:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  iconBox:{ width: 32, height: 32, borderRadius: Radius.md, justifyContent: "center", alignItems: "center" },
  pct:    { fontSize: Typography.xs, fontWeight: Typography.semibold },
  label:  { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4 },
  value:  { fontSize: 24, fontWeight: Typography.bold },
});

// PercentBar styles
const PB = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md, gap: Spacing.sm },
  label: { width: 56, fontSize: Typography.xs, color: Colors.textSecondary },
  track: { flex: 1, height: 7, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: "hidden" },
  fill:  { height: 7, borderRadius: Radius.full },
  pct:   { width: 40, fontSize: Typography.xs, fontWeight: Typography.semibold, textAlign: "right" },
});

// RecordItem styles
const RI = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadow.xs,
  },
  dot:       { width: 10, height: 10, borderRadius: 5 },
  info:      { flex: 1 },
  time:      { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary },
  reason:    { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  badge:     { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
});

// EmptyState styles
const ES = StyleSheet.create({
  box:  { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  text: { fontSize: Typography.sm, color: Colors.textMuted },
});

// FilterModal styles
const FM = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl, padding: Spacing.xl, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: "center", marginBottom: Spacing.lg,
  },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  title:        { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  reset:        { fontSize: Typography.sm, color: Colors.error, fontWeight: Typography.semibold },
  sectionLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  chipScroll:   { marginBottom: Spacing.lg },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.background,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:       { fontSize: Typography.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.semibold },
  applyBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: Spacing.md, alignItems: "center", marginTop: Spacing.sm,
  },
  applyText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.md },
});
