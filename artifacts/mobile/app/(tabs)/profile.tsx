import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuth } from "@/hooks/useAuth";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Profile</Text>
      </View>

      <Card style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Feather name="user" size={40} color={colors.foreground} />
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email}</Text>
        
        <View style={[styles.badge, { backgroundColor: user?.role === "admin" ? colors.primary : colors.secondary }]}>
          <Text style={{ color: user?.role === "admin" ? colors.primaryForeground : colors.secondaryForeground, fontWeight: "bold", textTransform: "uppercase" }}>
            {user?.role} Access
          </Text>
        </View>
      </Card>

      <Button
        title="Log Out"
        variant="destructive"
        onPress={handleLogout}
        icon={<Feather name="log-out" size={18} color={colors.destructiveForeground} />}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold" },
  card: { alignItems: "center", padding: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 16, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  logoutBtn: { marginTop: 24 },
});
