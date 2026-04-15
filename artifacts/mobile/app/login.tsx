import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLogin } from "@workspace/api-client-react";

import { Button } from "@/components/Button";
import { GradientHeader } from "@/components/GradientHeader";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login: setAuth, isLoading: isAuthLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const loginMutation = useLogin();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({
        data: { email, password },
      });
      await setAuth(res.user, res.token);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.error || "Invalid credentials."
      );
    }
  };

  if (isAuthLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: colors.foreground, paddingTop: insets.top + 40 },
          ]}
        >
          <View style={styles.logoContainer}>
            <Feather name="hard-drive" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.background }]}>
            ARN INFRA
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Field Management Tool
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Email"
            placeholder="operator@arninfra.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Log In"
            onPress={handleLogin}
            isLoading={loginMutation.isPending}
            style={styles.loginButton}
            size="lg"
            icon={<Feather name="log-in" size={20} color={colors.primaryForeground} />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ffffff10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  loginButton: {
    marginTop: 24,
  },
});
