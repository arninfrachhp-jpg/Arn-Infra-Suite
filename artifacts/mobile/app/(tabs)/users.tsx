import { Feather } from "@expo/vector-icons";
import {
  getGetUsersQueryKey,
  useCreateUser,
  useDeleteUser,
  useGetUsers,
  useUpdateUser,
} from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { useColors } from "@/hooks/useColors";
import type { UserRole } from "@workspace/api-client-react";

export default function UsersScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operator");

  const { data: users, isLoading, refetch, isRefetching } = useGetUsers({
    query: { enabled: true, queryKey: getGetUsersQueryKey() },
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (user?.role !== "admin") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Access Denied</Text>
      </View>
    );
  }

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("operator");
    setModalVisible(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(""); // Keep blank
    setRole(u.role);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email are required.");
      return;
    }

    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: { name, email, role, ...(password ? { password } : {}) },
        });
      } else {
        if (!password) {
          Alert.alert("Error", "Password is required for new users.");
          return;
        }
        await createUser.mutateAsync({
          data: { name, email, role, password },
        });
      }
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Failed to save user.";
      Alert.alert("Error", msg);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser.mutateAsync({ id });
            refetch();
          } catch (err: any) {
            Alert.alert("Error", "Failed to delete user.");
          }
        },
      },
    ]);
  };

  if (isLoading && !users) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Team Members</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Manage access and roles
            </Text>
          </View>
          <Button title="Add User" size="sm" onPress={openCreateModal} icon={<Feather name="plus" size={16} color={colors.primaryForeground} />} />
        </View>

        {users?.map((u) => (
          <Card key={u.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={{ color: colors.secondaryForeground, fontWeight: "bold" }}>
                  {u.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: colors.foreground }]}>{u.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{u.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: u.role === "admin" ? colors.primary : colors.secondary }]}>
                  <Text style={{ color: u.role === "admin" ? colors.primaryForeground : colors.secondaryForeground, fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
                    {u.role}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(u)} style={styles.actionBtn}>
                <Feather name="edit" size={20} color={colors.foreground} />
              </TouchableOpacity>
              {user.id !== u.id && (
                <TouchableOpacity onPress={() => handleDelete(u.id)} style={styles.actionBtn}>
                  <Feather name="trash-2" size={20} color={colors.destructive} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingUser ? "Edit User" : "New User"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
            <Input label="Email" placeholder="john@arninfra.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input 
              label={editingUser ? "Password (leave blank to keep current)" : "Password"} 
              placeholder="••••••••" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />
            
            <Text style={[styles.label, { color: colors.foreground }]}>Role</Text>
            <View style={styles.roleSelector}>
              <Button 
                title="Operator" 
                variant={role === "operator" ? "default" : "outline"} 
                style={styles.roleBtn} 
                onPress={() => setRole("operator")} 
              />
              <Button 
                title="Admin" 
                variant={role === "admin" ? "default" : "outline"} 
                style={styles.roleBtn} 
                onPress={() => setRole("admin")} 
              />
            </View>

            <Button 
              title="Save User" 
              onPress={handleSave} 
              isLoading={createUser.isPending || updateUser.isPending}
              style={{ marginTop: 24 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16 },
  userCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  userName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  actions: { flexDirection: "row" },
  actionBtn: { padding: 8, marginLeft: 4 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalContent: { padding: 24 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, marginTop: 8 },
  roleSelector: { flexDirection: "row", gap: 12 },
  roleBtn: { flex: 1 },
});
