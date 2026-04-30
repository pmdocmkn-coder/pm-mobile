/**
 * CallRecordsScreen — PM Mobile (Redesigned)
 * Logic: 100% dipertahankan — hanya JSX return dan StyleSheet yang berubah
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StatusBar,
  FlatList, Modal, TextInput, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors, Spacing, Radius, Typography, Shadow, getReasonColor,
} from "../theme/tokens";
import { BarChart } from "../components/ui/BarChart";
import { CalendarPicker } from "../components/ui/CalendarPicker";
import { callRecordService, DailySummary, CallRecord } from "../services/callRecordService";

const { width: W } = Dimensions.get("window");

// ─── Types (dipertahankan) ─────────────────────────────────────────
type Tab = "summary" | "records";

const REASON_LABELS: Record<number, string> = {
  0: "Normal", 1: "TE Busy", 2: "Sys Busy", 3: "No Answer",
  4: "Not Found", 5: "Complete", 6: "Preempted", 7: "Timeout",
  8: "Inactive", 9: "Callback", 10: "Invalid",
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

// ─── Helpers (dipertahankan) ───────────────────────────────────────
const formatDate    = (d: Date) => d.toISOString().split("T")[0];
const formatDisplay = (d: Date) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const formatShort   = (d: Date) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

// ─── Main Component ────────────────────────────────────────────────
export default function CallRecordsScreen({ navigation }: any) {
  // ── State (100% dipertahankan) ──
  const [activeTab, setActiveTab]           = useState<Tab>("summary");
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [summary, setSummary]               = useState<DailySummary | null>(null);
  const [records, setRecords]               = useState<CallRecord[]>([]);
  const [loading, setLoading]               = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalCount, setTotalCount]         = useState(0);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [search, setSearch]                 = useState("");
  const [filterReason, setFilterReason]     = useState<number | undefined>(undefined);
  const [filterHour, setFilterHour]         = useState<number | undefined>(undefined);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const dateStr = formatDate(selectedDate);

  // ── Fetch (100% dipertahankan) ──
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true); setSummary(null);
      const data = await callRecordService.getDailySummary(dateStr);
      setSummary(data);
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Tidak dapat memuat summary");
    } finally { setLoading(false); }
  }, [dateStr]);

  const fetchRecords = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      const res = await callRecordService.getCallRecords({
        startDate: dateStr, endDate: dateStr, page: pageNum, pageSize: 20,
        search: search || undefined,
      });
      const filtered = res.data.filter(r => {
        if (filterReason !== undefined && r.callCloseReason !== filterReason) return false;
        if (filterHour   !== undefined && r.hourGroup        !== filterHour)   return false;
        return true;
      });
      if (append) setRecords(prev => [...prev, ...filtered]); else setRecords(filtered);
      setTotalPages(res.meta.pagination.totalPages);
      setTotalCount(res.meta.pagination.totalCount);
      setPage(pageNum);
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Tidak dapat memuat records");
    } finally { setLoading(false); setLoadingMore(false); }
  }, [dateStr, search, filterReason, filterHour]);

  useEffect(() => {
    if (activeTab === "summary") fetchSummary(); else fetchRecords(1);
  }, [activeTab, dateStr]);

  useEffect(() => {
    if (activeTab === "records") fetchRecords(1);
  }, [filterReason, filterHour]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "summary") await fetchSummary(); else await fetchRecords(1);
    setRefreshing(false);
  };

  // ── Date Navigation (dipertahankan) ──
  const goToPrev = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const goToNext = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); if (d <= new Date()) setSelectedDate(d); };
  const isToday  = formatDate(selectedDate) === formatDate(new Date());

  // ── Chart Data (dipertahankan) ──
  const chartData = summary?.hourlyData?.map(h => ({ label: `${h.hourGroup}`, value: h.qty })) ?? [];
  const activeFiltersCount = [filterReason, filterHour].filter(f => f !== undefined).length;

  // ─── Date Bar ─────────────────────────────────────────────────────
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
          <Ionicons name="chevron-forward" size={18} color={isToday ? Colors.textMuted : Colors.primary} />
        </TouchableOpacity>
        {!isToday && (
          <TouchableOpacity style={S.todayChip} onPress={() => setSelectedDate(new Date())}>
            <Text style={S.todayChipText}>Hari ini</Text>
          </TouchableOpacity>
        )}
      </View>
      <CalendarPicker
        visible={showDatePicker} value={selectedDate} maxDate={new Date()}
        onConfirm={(date) => setSelectedDate(date)}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );

  // ─── Summary Tab ──────────────────────────────────────────────────
  const renderSummary = () => (
    <ScrollView style={S.tabContent} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      {renderDateBar()}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Big Total Calls Card */}
          <View style={[S.card, { alignItems: 'center', paddingVertical: Spacing.xl, ...Shadow.md }]}>
            <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Total Calls Today</Text>
            </View>
            <Text style={{ fontSize: 42, fontWeight: '900', color: '#0F172A', letterSpacing: -1 }}>
              {(summary?.totalQty ?? 0).toLocaleString()}
            </Text>
          </View>

          {/* Bar Chart */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <Text style={[S.cardTitle, { fontSize: 16 }]}>Overview</Text>
              <View style={S.chip}>
                <Text style={S.chipText}>Month</Text>
                <Ionicons name="chevron-down" size={12} color={Colors.textMuted} style={{ marginLeft: 4 }} />
              </View>
            </View>
            <BarChart data={chartData} height={150} />
          </View>

          {/* TE Busy & Sys Busy Dual Cards */}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
            <LinearGradient
              colors={["#312E81", "#1E1B4B"]}
              style={{ flex: 1, borderRadius: 16, padding: Spacing.md, ...Shadow.md }}
            >
              <Ionicons name="arrow-down" size={18} color="#A5B4FC" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#A5B4FC', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>TE Busy</Text>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{(summary?.totalTEBusy ?? 0).toLocaleString()}</Text>
              <Ionicons name="arrow-up-right" size={48} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
            </LinearGradient>
            <LinearGradient
              colors={["#8B5CF6", "#7C3AED"]}
              style={{ flex: 1, borderRadius: 16, padding: Spacing.md, ...Shadow.md }}
            >
              <Ionicons name="arrow-up" size={18} color="#EAE8FC" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#EAE8FC', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Sys Busy</Text>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{(summary?.totalSysBusy ?? 0).toLocaleString()}</Text>
              <Ionicons name="arrow-up-right" size={48} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
            </LinearGradient>
          </View>



          {/* Percent Bars */}
          <View style={S.card}>
            <Text style={S.cardTitle}>Rata-rata Persentase</Text>
            <PercentBar label="TE Busy"  value={Number(summary?.avgTEBusyPercent  ?? 0)} gradColors={["#FF6B6B","#FF9A9A"]} color={Colors.error}   />
            <PercentBar label="Sys Busy" value={Number(summary?.avgSysBusyPercent ?? 0)} gradColors={["#FFB800","#FFD45C"]} color={Colors.warning} />
            <PercentBar label="Others"   value={Number(summary?.avgOthersPercent  ?? 0)} gradColors={["#00C48C","#4DD9C0"]} color={Colors.success} />
          </View>

          {/* Hourly Table */}
          {summary?.hourlyData && summary.hourlyData.length > 0 && (
            <View style={[S.card, { marginBottom: Spacing.xxxl }]}>
              <View style={S.cardTitleRow}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={S.cardTitle}>Detail Per Jam</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={[S.tableRow, S.tableHead]}>
                    {["Jam","Qty","TE","TE%","Sys","Sys%","Lain","Lain%"].map(h => (
                      <Text key={h} style={[S.tableCell, S.tableHeadText]}>{h}</Text>
                    ))}
                  </View>
                  {summary.hourlyData.map((row, i) => (
                    <View key={i} style={[S.tableRow, i % 2 === 0 ? S.tableRowEven : S.tableRowOdd]}>
                      <Text style={S.tableCell}>{row.timeRange}</Text>
                      <Text style={[S.tableCell,{color:Colors.primary,fontWeight:Typography.bold}]}>{row.qty}</Text>
                      <Text style={[S.tableCell,{color:Colors.error}]}>{row.teBusy}</Text>
                      <Text style={S.tableCell}>{row.teBusyPercent.toFixed(1)}%</Text>
                      <Text style={[S.tableCell,{color:Colors.warning}]}>{row.sysBusy}</Text>
                      <Text style={S.tableCell}>{row.sysBusyPercent.toFixed(1)}%</Text>
                      <Text style={[S.tableCell,{color:Colors.secondary}]}>{row.others}</Text>
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

  // ─── Records Tab ──────────────────────────────────────────────────
  const renderRecords = () => (
    <View style={S.tabContent}>
      {renderDateBar()}

      {/* Search + Filter */}
      <View style={S.searchRow}>
        <View style={S.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.primary} />
          <TextInput
            style={S.searchInput} placeholder="Cari records..."
            placeholderTextColor={Colors.textMuted} value={search}
            onChangeText={setSearch} onSubmitEditing={() => fetchRecords(1)} returnKeyType="search"
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
            <View style={S.filterBadge}><Text style={S.filterBadgeText}>{activeFiltersCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipRow}>
          {filterReason !== undefined && (
            <TouchableOpacity style={S.activeChip} onPress={() => setFilterReason(undefined)}>
              <Text style={S.activeChipText}>{REASON_LABELS[filterReason] ?? `Reason ${filterReason}`}</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {filterHour !== undefined && (
            <TouchableOpacity style={S.activeChip} onPress={() => setFilterHour(undefined)}>
              <Text style={S.activeChipText}>Jam {filterHour}:00</Text>
              <Ionicons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {!loading && (
        <View style={S.countRow}>
          <Text style={S.countText}>{totalCount} records ditemukan</Text>
        </View>
      )}

      {loading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.callRecordId.toString()}
          renderItem={({ item }) => <RecordItem item={item} />}
          onEndReached={() => !loadingMore && page < totalPages && fetchRecords(page + 1, true)}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <FilterModal
        visible={showFilterModal} filterReason={filterReason} filterHour={filterHour}
        onSelectReason={setFilterReason} onSelectHour={setFilterHour}
        onClose={() => setShowFilterModal(false)}
        onReset={() => { setFilterReason(undefined); setFilterHour(undefined); }}
      />
    </View>
  );

  // ─── Main Return ──────────────────────────────────────────────────
  return (
    <View style={S.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Gradient */}
      <LinearGradient colors={["#7B6FE8", "#5A4FD1"]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.header}>
        <TouchableOpacity style={S.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={Colors.white} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>Call Records</Text>
          <Text style={S.headerSub}>{formatShort(selectedDate)}</Text>
        </View>
        <TouchableOpacity style={S.headerBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={S.tabBar}>
        {(["summary","records"] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[S.tabItem, activeTab === tab && S.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === "summary" ? "bar-chart-outline" : "list-outline"}
              size={15}
              color={activeTab === tab ? Colors.primary : Colors.textMuted}
            />
            <Text style={[S.tabLabel, activeTab === tab && S.tabLabelActive]}>
              {tab === "summary" ? "Summary" : "Records"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "summary" ? renderSummary() : renderRecords()}
    </View>
  );
}

// ─── Sub Components ────────────────────────────────────────────────

// StatCard dengan gradient icon box + vertical strip kiri
function StatCard({ gradientColors, icon, label, value, valueColor, pct }: {
  gradientColors: [string, string]; icon: string;
  label: string; value: number; valueColor: string; pct?: number;
}) {
  return (
    <View style={SC.card}>
      {/* Vertical strip kiri */}
      <LinearGradient colors={gradientColors} start={{x:0,y:0}} end={{x:0,y:1}} style={SC.strip} />
      <View style={SC.body}>
        <View style={SC.topRow}>
          <LinearGradient colors={gradientColors} start={{x:0,y:0}} end={{x:1,y:1}} style={SC.iconBox}>
            <Ionicons name={icon as any} size={20} color={Colors.white} />
          </LinearGradient>
          {pct !== undefined && (
            <View style={[SC.pctBadge, { backgroundColor: valueColor + "22" }]}>
              <Text style={[SC.pctText, { color: valueColor }]}>{Number(pct).toFixed(1)}%</Text>
            </View>
          )}
        </View>
        <Text style={SC.label}>{label}</Text>
        <Text style={[SC.value, { color: valueColor }]}>{value.toLocaleString()}</Text>
      </View>
    </View>
  );
}

// PercentBar dengan LinearGradient fill
function PercentBar({ label, value, gradColors, color }: {
  label: string; value: number; gradColors: [string, string]; color: string;
}) {
  const pct = Math.min(Number(value) || 0, 100);
  return (
    <View style={PB.row}>
      <Text style={PB.label}>{label}</Text>
      <View style={PB.track}>
        <LinearGradient
          colors={gradColors} start={{x:0,y:0}} end={{x:1,y:0}}
          style={[PB.fill, { width: `${pct}%` as any }]}
        />
      </View>
      <Text style={[PB.pct, { color }]}>{pct.toFixed(1)}%</Text>
    </View>
  );
}

// RecordItem dengan vertical strip
function RecordItem({ item }: { item: CallRecord }) {
  const color = getReasonColor(item.callCloseReason);
  const label = REASON_LABELS[item.callCloseReason] ?? `Reason ${item.callCloseReason}`;
  return (
    <View style={RI.card}>
      <View style={[RI.strip, { backgroundColor: color }]} />
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

// EmptyState dengan SVG inline
function EmptyState() {
  return (
    <View style={ES.box}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        {/* Phone outline */}
        <Rect x="30" y="15" width="60" height="90" rx="12" fill={Colors.primaryLight} />
        <Rect x="36" y="22" width="48" height="70" rx="8" fill={Colors.border} />
        {/* X mark */}
        <Path d="M48 42 L72 66" stroke={Colors.primary} strokeWidth="4" strokeLinecap="round" />
        <Path d="M72 42 L48 66" stroke={Colors.primary} strokeWidth="4" strokeLinecap="round" />
        {/* Bottom button */}
        <Circle cx="60" cy="100" r="5" fill={Colors.primaryLight} />
        {/* Decorative dots */}
        <Circle cx="20" cy="30" r="4" fill={Colors.primaryLight} />
        <Circle cx="100" cy="50" r="3" fill={Colors.primaryLight} />
        <Circle cx="15" cy="80" r="5" fill={Colors.border} />
      </Svg>
      <Text style={ES.text}>Tidak ada records</Text>
      <Text style={ES.sub}>Coba pilih tanggal lain</Text>
    </View>
  );
}

// Loading state
function LoadingState() {
  return (
    <View style={LS.box}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={LS.text}>Memuat data...</Text>
    </View>
  );
}

// Skeleton list untuk records tab
function SkeletonList() {
  return (
    <View style={{ gap: Spacing.sm, paddingTop: Spacing.sm }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={SK.card}>
          <View style={SK.strip} />
          <View style={SK.body}>
            <View style={SK.line1} />
            <View style={SK.line2} />
          </View>
          <View style={SK.badge} />
        </View>
      ))}
    </View>
  );
}

// FilterModal
function FilterModal({ visible, filterReason, filterHour, onSelectReason, onSelectHour, onClose, onReset }: {
  visible: boolean; filterReason?: number; filterHour?: number;
  onSelectReason: (v?: number) => void; onSelectHour: (v?: number) => void;
  onClose: () => void; onReset: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={FM.overlay}>
        <View style={FM.sheet}>
          <View style={FM.handle} />
          <View style={FM.headerRow}>
            <Text style={FM.title}>Filter Records</Text>
            <TouchableOpacity onPress={onReset}>
              <Text style={FM.reset}>Reset</Text>
            </TouchableOpacity>
          </View>
          <View style={FM.separator} />

          <Text style={FM.sectionLabel}>CLOSE REASON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={FM.chipScroll}>
            <TouchableOpacity style={[FM.chip, filterReason === undefined && FM.chipActive]} onPress={() => onSelectReason(undefined)}>
              <Text style={[FM.chipText, filterReason === undefined && FM.chipTextActive]}>Semua</Text>
            </TouchableOpacity>
            {Object.entries(REASON_LABELS).map(([key, val]) => {
              const k = Number(key); const active = filterReason === k;
              return (
                <TouchableOpacity key={k} style={[FM.chip, active && FM.chipActive]} onPress={() => onSelectReason(active ? undefined : k)}>
                  <Text style={[FM.chipText, active && FM.chipTextActive]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={FM.separator} />
          <Text style={FM.sectionLabel}>JAM</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={FM.chipScroll}>
            <TouchableOpacity style={[FM.chip, filterHour === undefined && FM.chipActive]} onPress={() => onSelectHour(undefined)}>
              <Text style={[FM.chipText, filterHour === undefined && FM.chipTextActive]}>Semua</Text>
            </TouchableOpacity>
            {HOUR_OPTIONS.map(h => {
              const active = filterHour === h;
              return (
                <TouchableOpacity key={h} style={[FM.chip, active && FM.chipActive]} onPress={() => onSelectHour(active ? undefined : h)}>
                  <Text style={[FM.chipText, active && FM.chipTextActive]}>{h}:00</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={FM.applyWrapper}>
            <LinearGradient colors={["#7B6FE8","#4DD9C0"]} start={{x:0,y:0}} end={{x:1,y:0}} style={FM.applyBtn}>
              <Text style={FM.applyText}>Terapkan Filter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle:  { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  headerSub:    { fontSize: Typography.xs, color: "rgba(255,255,255,0.75)", marginTop: 1 },

  // Tab Bar
  tabBar: {
    flexDirection: "row", backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.sm, gap: Spacing.xs,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  tabItemActive:  { borderBottomColor: Colors.primary },
  tabLabel:       { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  tabLabelActive: { color: Colors.primary, fontWeight: Typography.semibold },

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
  dateArrow:    { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, justifyContent: "center", alignItems: "center" },
  dateTouchable:{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  dateText:     { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  todayChip:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  todayChipText:{ fontSize: 11, color: Colors.white, fontWeight: Typography.bold },

  // Cards
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.md },
  card:         { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.xs },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.md },
  cardTitle:    { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  chip:         { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  chipText:     { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },

  // Table
  tableRow:     { flexDirection: "row", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableRowEven: { backgroundColor: Colors.white },
  tableRowOdd:  { backgroundColor: Colors.background },
  tableHead:    { backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, marginBottom: 2 },
  tableHeadText:{ color: Colors.primaryDark, fontWeight: Typography.bold },
  tableCell:    { width: 68, fontSize: 11, color: Colors.textPrimary, textAlign: "center" },

  // Search
  searchRow:    { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 48, gap: Spacing.sm, ...Shadow.xs,
  },
  searchInput:  { flex: 1, color: Colors.textPrimary, fontSize: Typography.md },
  filterBtn: {
    width: 48, height: 48, borderRadius: Radius.lg,
    backgroundColor: Colors.white, justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: {
    position: "absolute", top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.error, justifyContent: "center", alignItems: "center",
  },
  filterBadgeText: { fontSize: 9, color: Colors.white, fontWeight: Typography.bold },

  chipRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginBottom: Spacing.sm,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
    alignSelf: "flex-start",
  },
  activeChipText: { fontSize: 11, color: Colors.primary, fontWeight: Typography.bold },

  countRow:  { marginBottom: Spacing.sm },
  countText: { fontSize: Typography.xs, color: Colors.textSecondary },
});

// StatCard
const SC = StyleSheet.create({
  card: {
    width: "47%", backgroundColor: Colors.white,
    borderRadius: Radius.xl, overflow: "hidden",
    flexDirection: "row", ...Shadow.xs,
  },
  strip: { width: 4, borderRadius: 0 },
  body:  { flex: 1, padding: Spacing.lg },
  topRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing.md },
  iconBox:{ width: 40, height: 40, borderRadius: Radius.md, justifyContent: "center", alignItems: "center" },
  pctBadge:{ paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  pctText: { fontSize: 10, fontWeight: Typography.bold },
  label:   { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  value:   { fontSize: 28, fontWeight: Typography.bold },
});

// PercentBar
const PB = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md, gap: Spacing.sm },
  label: { width: 56, fontSize: Typography.xs, color: Colors.textSecondary },
  track: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: "hidden" },
  fill:  { height: 8, borderRadius: Radius.full },
  pct:   { width: 44, fontSize: Typography.sm, fontWeight: Typography.bold, textAlign: "right" },
});

// RecordItem
const RI = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    gap: Spacing.md, overflow: "hidden", ...Shadow.xs,
  },
  strip: { width: 4, height: 36, borderRadius: 4 },
  info:  { flex: 1 },
  time:  { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  reason:{ fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: Typography.bold },
});

// EmptyState
const ES = StyleSheet.create({
  box:  { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  text: { fontSize: Typography.md, color: Colors.textSecondary, fontWeight: Typography.semibold },
  sub:  { fontSize: Typography.sm, color: Colors.textMuted },
});

// LoadingState
const LS = StyleSheet.create({
  box:  { alignItems: "center", paddingTop: 60, gap: Spacing.md },
  text: { fontSize: Typography.sm, color: Colors.textSecondary },
});

// Skeleton
const SK = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
    opacity: 0.6,
  },
  strip: { width: 4, height: 36, borderRadius: 4, backgroundColor: Colors.border },
  body:  { flex: 1, gap: 6 },
  line1: { height: 14, borderRadius: 7, backgroundColor: Colors.border, width: "60%" },
  line2: { height: 10, borderRadius: 5, backgroundColor: Colors.divider, width: "40%" },
  badge: { width: 56, height: 24, borderRadius: Radius.full, backgroundColor: Colors.border },
});

// FilterModal
const FM = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl, padding: Spacing.xl, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: "center", marginBottom: Spacing.lg,
  },
  headerRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  title:        { fontSize: 18, fontWeight: Typography.bold, color: Colors.textPrimary },
  reset:        { fontSize: Typography.sm, color: Colors.error, fontWeight: Typography.semibold },
  separator:    { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: Typography.bold, color: Colors.textSecondary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: Spacing.sm },
  chipScroll:   { marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.background,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:       { fontSize: Typography.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.bold },
  applyWrapper:   { marginTop: Spacing.md, borderRadius: Radius.full, overflow: "hidden", ...Shadow.md },
  applyBtn:       { height: 52, justifyContent: "center", alignItems: "center" },
  applyText:      { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.md },
});
