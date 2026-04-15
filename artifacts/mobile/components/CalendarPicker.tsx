import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function CalendarPicker({ label = "Date", value, onChange }: Props) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);

  const parsed = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const selectedDate = value || "";

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function handleSelectDay(day: number) {
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(dateStr);
    setVisible(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  }

  function open() {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setVisible(true);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const displayValue = value
    ? (() => {
        const d = new Date(value + "T00:00:00");
        return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      })()
    : "Select date";

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      ) : null}
      <TouchableOpacity
        onPress={open}
        style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.card }]}
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={18} color={colors.primary} />
        <Text style={[styles.triggerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {displayValue}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modal, { backgroundColor: colors.background, shadowColor: "#000" }]}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={[styles.calHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="chevron-left" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: colors.foreground }]}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="chevron-right" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={styles.dayNames}>
              {DAYS.map(d => (
                <Text key={d} style={[styles.dayName, { color: colors.mutedForeground }]}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            {rows.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((day, ci) => {
                  if (!day) {
                    return <View key={ci} style={styles.cell} />;
                  }
                  const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === new Date().toISOString().split("T")[0];
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[
                        styles.cell,
                        isSelected && { backgroundColor: colors.primary, borderRadius: 20 },
                        !isSelected && isToday && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 20 },
                      ]}
                      onPress={() => handleSelectDay(day)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayNum,
                        { color: isSelected ? colors.primaryForeground : colors.foreground },
                        isToday && !isSelected && { color: colors.primary, fontWeight: "700" },
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Today Button */}
            <TouchableOpacity
              style={[styles.todayBtn, { borderTopColor: colors.border }]}
              onPress={() => {
                const today = new Date().toISOString().split("T")[0]!;
                onChange(today);
                setVisible(false);
              }}
            >
              <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerText: { flex: 1, fontSize: 15 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: 320,
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 16, fontWeight: "700" },
  dayNames: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dayName: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600" },
  row: { flexDirection: "row", paddingHorizontal: 8, marginBottom: 4 },
  cell: { flex: 1, height: 36, justifyContent: "center", alignItems: "center", margin: 1 },
  dayNum: { fontSize: 14 },
  todayBtn: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  todayText: { fontSize: 14, fontWeight: "600" },
});
