/**
 * LoginScreen — PM Mobile (Premium Super-App)
 * Design: Deep gradient + 3D Technician Illustration + white bottom sheet
 */
import React, { useState } from "react";
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Text, StatusBar,
  ScrollView, Dimensions, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";

const { width: W, height: H } = Dimensions.get("window");

// ─── 3D Illustration Asset ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const technicianImg = require("../../assets/illustrations/technician_hero.png");

const DashboardIllustration = () => {
  const size = W * 0.45;
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 6,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      overflow: 'hidden',
      backgroundColor: '#5A4FD1',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 12,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 6 },
    }}>
      <Image
        source={technicianImg}
        style={{ width: '135%', height: '135%' }}
        resizeMode="cover"
      />
    </View>
  );
};

// ─── Main Component ────────────────────────────────────────────────
export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message || "Periksa username dan password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full gradient background ── */}
      <LinearGradient
        colors={["#7B6FE8", "#5A4FD1", "#4B3FD8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={S.gradient}
      />

      {/* ── Floating Circles Decoration ── */}
      <View style={[S.blob, { top: -50, right: -50, width: 180, height: 180, opacity: 0.10 }]} />
      <View style={[S.blob, { top: 100, left: -70, width: 200, height: 200, opacity: 0.06 }]} />
      <View style={[S.blob, { top: 200, right: -30, width: 120, height: 120, opacity: 0.08 }]} />

      {/* ── Illustration Section ── */}
      <View style={S.topSection}>
        <DashboardIllustration />
      </View>

      {/* ── Bottom Card (White Form) ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={S.cardWrapper}
      >
        <ScrollView
          contentContainerStyle={S.card}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + Title */}
          <View style={S.logoRow}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={S.logoBox}
            >
              <Ionicons name="bar-chart" size={28} color={Colors.white} />
            </LinearGradient>
            <View style={S.titleGroup}>
              <Text style={S.title}>PM Dashboard</Text>
              <Text style={S.subtitle}>Masuk untuk melanjutkan</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={S.divider} />

          {/* Username */}
          <Text style={S.label}>Username</Text>
          <View style={[S.inputWrap, focusedField === "username" && S.inputFocused]}>
            <Ionicons
              name="person-outline" size={18}
              color={focusedField === "username" ? Colors.primary : Colors.textMuted}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="Masukkan username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <Text style={[S.label, { marginTop: Spacing.md }]}>Password</Text>
          <View style={[S.inputWrap, focusedField === "password" && S.inputFocused]}>
            <Ionicons
              name="lock-closed-outline" size={18}
              color={focusedField === "password" ? Colors.primary : Colors.textMuted}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="Masukkan password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={S.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={[S.btnWrapper, loading && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.btn}
            >
              {loading ? (
                <View style={S.btnContent}>
                  <Ionicons name="reload-outline" size={20} color={Colors.white} />
                  <Text style={S.btnText}>Masuk...</Text>
                </View>
              ) : (
                <View style={S.btnContent}>
                  <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                  <Text style={S.btnText}>Sign In</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={S.footer}>© 2025 PM MKN · Sistem Monitoring Terpadu</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.white,
  },

  // Top illustration section (~38% layar)
  topSection: {
    height: H * 0.38,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: Spacing.md,
  },

  // Bottom white card
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: 40,
    minHeight: H * 0.62,
  },

  // Logo row
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.md,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xl,
  },

  // Labels
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // Input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },

  // Button
  btnWrapper: {
    marginTop: Spacing.xl,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.md,
  },
  btn: {
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  btnText: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
