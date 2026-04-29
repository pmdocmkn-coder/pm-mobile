/**
 * CalendarPicker — Custom calendar modal
 * Bekerja di web dan mobile (tidak bergantung pada native DateTimePicker)
 */
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../theme/tokens";

interface CalendarPickerProps {
  visible: boolean;
  value: Date;
  maxDate?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible, value, maxDate, onConfirm, onClose,
}) => {
  const [viewDate, setViewDate] = useState(new Date(value));
  const [selected, setSelected] = useState(new Date(value));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => {
    const next = new Date(year, month + 1, 1);
    if (!maxDate || next <= maxDate) setViewDate(next);
  };

  const isSelected = (d: number) =>
    selected.getDate() === d &&
    selected.getMonth() === month &&
    selected.getFullYear() === year;

  const isToday = (d: number) => {
    const t = new Date();
    return t.getDate() === d && t.getMonth() === month && t.getFullYear() === year;
  };

  const isDisabled = (d: number) => {
    if (!maxDate) return false;
    const date = new Date(year, month, d);
    return date > maxDate;
  };

  const selectDay = (d: number) => {
    if (isDisabled(d)) return;
    setSelected(new Date(year, month, d));
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.sheet}>
          {/* Month Navigation */}
          <View style={S.monthRow}>
            <TouchableOpacity style={S.navBtn} onPress={prevMonth}>
              <Ionicons name="chevron-back" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={S.monthLabel}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity style={S.navBtn} onPress={nextMonth}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={maxDate && new Date(year, month + 1, 1) > maxDate ? Colors.textMuted : Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={S.dayRow}>
            {DAYS.map(d => (
              <Text key={d} style={S.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          {weeks.map((week, wi) => (
            <View key={wi} style={S.weekRow}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={S.dayCell} />;
                const sel = isSelected(day);
                const tod = isToday(day);
                const dis = isDisabled(day);
                return (
                  <TouchableOpacity
                    key={di}
                    style={[
                      S.dayCell,
                      sel && S.dayCellSelected,
                      tod && !sel && S.dayCellToday,
                    ]}
                    onPress={() => selectDay(day)}
                    disabled={dis}
                  >
                    <Text style={[
                      S.dayText,
                      sel && S.dayTextSelected,
                      tod && !sel && S.dayTextToday,
                      dis && S.dayTextDisabled,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Actions */}
          <View style={S.actions}>
            <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
              <Text style={S.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.confirmBtn} onPress={() => { onConfirm(selected); onClose(); }}>
              <Text style={S.confirmText}>Pilih Tanggal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CELL = 40;

const S = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center",
    padding: Spacing.xl,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 360,
    ...Shadow.lg,
  },
  monthRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: Spacing.lg,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center", alignItems: "center",
  },
  monthLabel: {
    fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary,
  },
  dayRow: {
    flexDirection: "row", marginBottom: Spacing.sm,
  },
  dayLabel: {
    flex: 1, textAlign: "center",
    fontSize: Typography.xs, color: Colors.textMuted,
    fontWeight: Typography.semibold,
  },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  dayCell: {
    flex: 1, height: CELL,
    justifyContent: "center", alignItems: "center",
    borderRadius: Radius.md,
  },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayCellToday: { backgroundColor: Colors.primaryLight },
  dayText: {
    fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium,
  },
  dayTextSelected: { color: Colors.white, fontWeight: Typography.bold },
  dayTextToday: { color: Colors.primary, fontWeight: Typography.bold },
  dayTextDisabled: { color: Colors.textMuted },
  actions: {
    flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.md,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center",
  },
  cancelText: { fontSize: Typography.md, color: Colors.textSecondary, fontWeight: Typography.semibold },
  confirmBtn: {
    flex: 2, paddingVertical: Spacing.md,
    borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: "center",
  },
  confirmText: { fontSize: Typography.md, color: Colors.white, fontWeight: Typography.bold },
});
