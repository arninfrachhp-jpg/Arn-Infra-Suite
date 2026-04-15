import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardStatsQueryKey,
  getGetReportSummaryQueryKey,
  getGetWorkEntriesQueryKey,
  useCreateWorkEntry,
} from "@workspace/api-client-react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { useColors } from "@/hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

export default function EntryScreen() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [labourCount, setLabourCount] = useState("");
  const [squareMeter, setSquareMeter] = useState("");
  const [workingChannel, setWorkingChannel] = useState("");
  
  const colors = useColors();
  const createEntry = useCreateWorkEntry();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!date || !labourCount || !squareMeter || !workingChannel) {
      Alert.alert("Missing Fields", "Please fill out all fields before saving.");
      return;
    }

    const count = parseInt(labourCount, 10);
    const sqM = parseFloat(squareMeter);

    if (isNaN(count) || count < 0) {
      Alert.alert("Invalid Input", "Labour count must be a valid positive number.");
      return;
    }

    if (isNaN(sqM) || sqM < 0) {
      Alert.alert("Invalid Input", "Square meters must be a valid positive number.");
      return;
    }

    try {
      await createEntry.mutateAsync({
        data: {
          date,
          labourCount: count,
          squareMeter: sqM,
          workingChannel,
        },
      });

      Alert.alert("Success", "Work entry saved successfully!");
      
      // Reset form (keep date)
      setLabourCount("");
      setSquareMeter("");
      setWorkingChannel("");

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: getGetWorkEntriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error || "Failed to save entry.");
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>New Work Entry</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Record today's field progress
        </Text>
      </View>

      <Card>
        <Input
          label="Date (YYYY-MM-DD)"
          placeholder="2023-10-25"
          value={date}
          onChangeText={setDate}
        />
        <Input
          label="Labour Count"
          placeholder="e.g. 12"
          value={labourCount}
          onChangeText={setLabourCount}
          keyboardType="numeric"
        />
        <Input
          label="Square Meters Completed"
          placeholder="e.g. 150.5"
          value={squareMeter}
          onChangeText={setSquareMeter}
          keyboardType="decimal-pad"
        />
        <Input
          label="Working Channel / Area"
          placeholder="e.g. Sector B, Trench 4"
          value={workingChannel}
          onChangeText={setWorkingChannel}
        />

        <Button
          title="Save Entry"
          onPress={handleSave}
          isLoading={createEntry.isPending}
          style={styles.saveButton}
        />
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // For tab bar
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});
