import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function GradientHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  // Adjust for web specifically if needed, but native insets usually handle it
  const paddingTop = Platform.OS === "web" ? Math.max(insets.top, 20) : insets.top;

  return (
    <LinearGradient
      colors={["#F97316", "#1E3A5F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.header, { paddingTop }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
  },
  content: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
