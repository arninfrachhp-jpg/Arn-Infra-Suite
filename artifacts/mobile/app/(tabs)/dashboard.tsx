import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardStatsQueryKey,
  getGetWorkEntriesQueryKey,
  useDeleteWorkEntry,
  useGetDashboardStats,
  useGetWorkEntries,
} from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats, isRefetching } = useGetDashboardStats({
    query: { enabled: user?.role === "admin", queryKey: getGetDashboardStatsQueryKey() },
  });

  const { data: allEntries, isLoading: entriesLoading, refetch: refetchEntries } = useGetWorkEntries(undefined, {
    query: { enabled: user?.role === "admin", queryKey: getGetWorkEntriesQueryKey() },
  });

  const deleteEntry = useDeleteWorkEntry();

  if (user?.role !== "admin") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={40} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 16 }}>Admin access required</Text>
      </View>
    );
  }

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const token = await AsyncStorage.getItem("auth_token");
      const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/reports/export-excel`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      if (Platform.OS === "web") {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "work-entries.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        Alert.alert("Success", "Excel/CSV file downloaded.");
      } else {
        const text = await response.text();
        Alert.alert("Export Data", `CSV data ready:\n\n${text.slice(0, 300)}...`);
      }
    } catch (error: any) {
      Alert.alert("Export Failed", error.message || "Could not export to Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const token = await AsyncStorage.getItem("auth_token");
      const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/reports/export-pdf`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      if (Platform.OS === "web") {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "work-report.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        Alert.alert("Success", "Report downloaded.");
      } else {
        Alert.alert("Success", "PDF report generated. Open in browser to view.");
      }
    } catch (error: any) {
      Alert.alert("Export Failed", error.message || "Could not export PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDelete = (id: number, date: string) => {
    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete the entry for ${date}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id);
              await deleteEntry.mutateAsync({ id });
              queryClient.invalidateQueries({ queryKey: getGetWorkEntriesQueryKey() });
              queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
              refetchStats();
              refetchEntries();
            } catch {
              Alert.alert("Error", "Failed to delete entry. Please try again.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const isLoading = statsLoading || entriesLoading;

  if (isLoading && !stats) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (statsError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.destructive} />
        <Text style={{ color: colors.destructive, marginTop: 12 }}>Failed to load dashboard.</Text>
        <Button title="Retry" onPress={() => refetchStats()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const entries = allEntries ?? [];
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => { refetchStats(); refetchEntries(); }}
          tintColor={colors.primary}
        />
      }
    >
      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Today Labour</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.todayLabour ?? 0}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Today Sqm</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.todaySquareMeter ?? 0}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Month Labour</Text>
          <Text style={[styles.statValue, { color: "#1E3A5F" }]}>{stats?.monthLabour ?? 0}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Month Sqm</Text>
          <Text style={[styles.statValue, { color: "#1E3A5F" }]}>{stats?.monthSquareMeter ?? 0}</Text>
        </Card>
      </View>

      {/* Export Buttons */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Export Reports</Text>
      <View style={styles.exportButtons}>
        <Button
          title="Export Excel"
          icon={<Feather name="download" size={16} color="#fff" />}
          onPress={handleExportExcel}
          isLoading={isExportingExcel}
          style={[styles.exportBtn, { backgroundColor: "#16a34a" }]}
        />
        <Button
          title="Export PDF"
          icon={<Feather name="file-text" size={16} color="#fff" />}
          onPress={handleExportPdf}
          isLoading={isExportingPdf}
          style={[styles.exportBtn, { backgroundColor: "#dc2626" }]}
        />
      </View>

      {/* All Entries with Delete */}
      <View style={styles.entriesHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
          All Entries ({sortedEntries.length})
        </Text>
      </View>

      {sortedEntries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Feather name="inbox" size={32} color={colors.mutedForeground} style={{ alignSelf: "center", marginBottom: 8 }} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No work entries found.</Text>
        </Card>
      ) : (
        sortedEntries.map((entry) => (
          <Card key={entry.id} style={styles.entryCard}>
            <View style={styles.entryTopRow}>
              <View style={[styles.dateBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.dateText, { color: colors.primary }]}>{entry.date}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(entry.id, entry.date)}
                disabled={deletingId === entry.id}
                style={[styles.deleteBtn, { backgroundColor: colors.destructive + "15" }]}
              >
                {deletingId === entry.id ? (
                  <ActivityIndicator size="small" color={colors.destructive} />
                ) : (
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.entryStats}>
              <View style={styles.entryStat}>
                <Feather name="users" size={14} color={colors.mutedForeground} />
                <Text style={[styles.entryStatValue, { color: colors.foreground }]}>{entry.labourCount}</Text>
                <Text style={[styles.entryStatLabel, { color: colors.mutedForeground }]}>Labour</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.entryStat}>
                <Feather name="maximize-2" size={14} color={colors.mutedForeground} />
                <Text style={[styles.entryStatValue, { color: colors.foreground }]}>{entry.squareMeter}</Text>
                <Text style={[styles.entryStatLabel, { color: colors.mutedForeground }]}>Sqm</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={[styles.entryStat, { flex: 2 }]}>
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text style={[styles.entryStatValue, { color: colors.foreground }]} numberOfLines={1}>
                  {entry.workingChannel}
                </Text>
                <Text style={[styles.entryStatLabel, { color: colors.mutedForeground }]}>Channel</Text>
              </View>
            </View>

            {entry.createdByName ? (
              <Text style={[styles.createdBy, { color: colors.mutedForeground }]}>
                By: {entry.createdByName}
              </Text>
            ) : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { width: "47%", padding: 14 },
  statLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: "800" },
  exportButtons: { flexDirection: "row", gap: 10, marginBottom: 24 },
  exportBtn: { flex: 1 },
  entriesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  entryCard: { padding: 14, marginBottom: 10 },
  entryTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 13, fontWeight: "700" },
  deleteBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  entryStats: { flexDirection: "row", alignItems: "center", gap: 8 },
  entryStat: { flex: 1, alignItems: "center", gap: 2 },
  entryStatValue: { fontSize: 15, fontWeight: "700" },
  entryStatLabel: { fontSize: 10, fontWeight: "500" },
  statDivider: { width: 1, height: 32, borderRadius: 1 },
  createdBy: { fontSize: 11, marginTop: 10, fontStyle: "italic" },
  emptyCard: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 15, textAlign: "center" },
  secondary: { fontSize: 24, fontWeight: "800" },
});
