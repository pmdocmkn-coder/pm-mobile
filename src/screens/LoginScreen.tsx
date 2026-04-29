/**
 * LoginScreen — PM Mobile
 * Design: Gradient background + SVG illustration + white card bottom sheet
 * Logic: semua dipertahankan (useState, handleLogin, useAuth, Alert)
 */
import React, { useState } from "react";
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  Alert, TextInput, TouchableOpacity, Text, StatusBar,
  ScrollView, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle, Ellipse, Rect, Path, G, Defs, ClipPath,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing, Radius, Typography, Shadow } from "../theme/tokens";

const { width: W, height: H } = Dimensions.get("window");

// ─── Inline SVG Illustration ──────────────────────────────────────
// Flat design: orang duduk di depan laptop dengan data/chart
const DashboardIllustration = () => (
  <Svg width={W * 0.85} height={200} viewBox="0 0 340 200">
    <Defs>
      <ClipPath id="desk">
        <Rect x="60" y="120" width="220" height="60" rx="8" />
      </ClipPath>
    </Defs>

    {/* ── Desk ── */}
    <Rect x="55" y="138" width="230" height="14" rx="7" fill="#4B3FD8" opacity="0.6" />
    <Rect x="90" y="150" width="12" height="30" rx="4" fill="#4B3FD8" opacity="0.5" />
    <Rect x="238" y="150" width="12" height="30" rx="4" fill="#4B3FD8" opacity="0.5" />

    {/* ── Laptop body ── */}
    <Rect x="110" y="88" width="120" height="52" rx="6" fill="#1E1B4B" />
    <Rect x="114" y="92" width="112" height="44" rx="4" fill="#312E81" />

    {/* ── Screen content: mini chart bars ── */}
    <Rect x="122" y="118" width="8" height="14" rx="2" fill="#FBBF24" />
    <Rect x="134" y="112" width="8" height="20" rx="2" fill="#4DD9C0" />
    <Rect x="146" y="108" width="8" height="24" rx="2" fill="#7B6FE8" />
    <Rect x="158" y="114" width="8" height="18" rx="2" fill="#EC4899" />
    <Rect x="170" y="106" width="8" height="26" rx="2" fill="#FBBF24" />
    <Rect x="182" y="110" width="8" height="22" rx="2" fill="#4DD9C0" />
    <Rect x="194" y="116" width="8" height="16" rx="2" fill="#7B6FE8" />

    {/* ── Screen line decorations ── */}
    <Rect x="122" y="96" width="50" height="4" rx="2" fill="#6366F1" opacity="0.6" />
    <Rect x="122" y="103" width="30" height="3" rx="1.5" fill="#A5B4FC" opacity="0.5" />

    {/* ── Laptop base ── */}
    <Rect x="100" y="138" width="140" height="6" rx="3" fill="#1E1B4B" />

    {/* ── Person body ── */}
    {/* Chair */}
    <Rect x="148" y="155" width="44" height="6" rx="3" fill="#FBBF24" opacity="0.8" />
    <Rect x="162" y="161" width="16" height="20" rx="3" fill="#FBBF24" opacity="0.7" />

    {/* Torso */}
    <Rect x="152" y="108" width="36" height="32" rx="10" fill="#EC4899" />

    {/* Arms */}
    {/* Left arm */}
    <Path d="M152 118 Q130 122 122 132" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" fill="none" />
    {/* Right arm */}
    <Path d="M188 118 Q210 122 218 132" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" fill="none" />

    {/* Hands */}
    <Circle cx="120" cy="133" r="6" fill="#FBBF24" />
    <Circle cx="220" cy="133" r="6" fill="#FBBF24" />

    {/* Head */}
    <Circle cx="170" cy="96" r="20" fill="#FBBF24" />

    {/* Hair */}
    <Path d="M150 90 Q155 72 170 70 Q185 72 190 90" fill="#1E1B4B" />

    {/* Eyes */}
    <Circle cx="163" cy="94" r="3" fill="#1E1B4B" />
    <Circle cx="177" cy="94" r="3" fill="#1E1B4B" />
    <Circle cx="164" cy="93" r="1" fill="#fff" />
    <Circle cx="178" cy="93" r="1" fill="#fff" />

    {/* Smile */}
    <Path d="M163 101 Q170 107 177 101" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* ── Floating data cards ── */}
    {/* Card kiri */}
    <Rect x="18" y="60" width="72" height="44" rx="10" fill="white" opacity="0.15" />
    <Rect x="26" y="70" width="30" height="4" rx="2" fill="white" opacity="0.7" />
    <Rect x="26" y="78" width="20" height="3" rx="1.5" fill="#4DD9C0" opacity="0.9" />
    <Rect x="26" y="84" width="50" height="8" rx="4" fill="#FBBF24" opacity="0.8" />
    <Text style={{ fontSize: 8 }} />

    {/* Card kanan */}
    <Rect x="250" y="40" width="72" height="44" rx="10" fill="white" opacity="0.15" />
    <Circle cx="266" cy="56" r="8" fill="#EC4899" opacity="0.8" />
    <Rect x="278" y="52" width="36" height="4" rx="2" fill="white" opacity="0.7" />
    <Rect x="278" y="60" width="24" height="3" rx="1.5" fill="#4DD9C0" opacity="0.7" />

    {/* Notification dot */}
    <Circle cx="290" cy="30" r="10" fill="#EC4899" />
    <Rect x="286" y="26" width="8" height="2" rx="1" fill="white" />
    <Rect x="286" y="30" width="8" height="2" rx="1" fill="white" />
    <Rect x="286" y="34" width="5" height="2" rx="1" fill="white" />

    {/* Stars/sparkles */}
    <Circle cx="42" cy="30" r="4" fill="#FBBF24" opacity="0.9" />
    <Circle cx="300" cy="100" r="3" fill="#4DD9C0" opacity="0.8" />
    <Circle cx="30" cy="130" r="5" fill="#EC4899" opacity="0.6" />
  </Svg>
);

// ─── Main Component ────────────────────────────────────────────────
export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ── Logic dipertahankan ──
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

      {/* ── Gradient Background ── */}
      <LinearGradient
        colors={["#7B6FE8", "#4B3FD8", "#2D5BE3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={S.gradient}
      />

      {/* ── Floating Circles Decoration ── */}
      <View style={[S.blob, { top: -60, right: -60, width: 200, height: 200, opacity: 0.12 }]} />
      <View style={[S.blob, { top: 80, left: -80, width: 240, height: 240, opacity: 0.08 }]} />
      <View style={[S.blob, { top: 160, right: -40, width: 140, height: 140, opacity: 0.10 }]} />

      {/* ── Top Section: Illustration ── */}
      <View style={S.topSection}>
        <View style={S.illustrationWrap}>
          <DashboardIllustration />
        </View>
      </View>

      {/* ── Bottom Card ── */}
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
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

          {/* Username Input */}
          <Text style={S.label}>Username</Text>
          <View style={[S.inputWrap, focusedField === "username" && S.inputFocused]}>
            <Ionicons
              name="person-outline"
              size={18}
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

          {/* Password Input */}
          <Text style={[S.label, { marginTop: Spacing.md }]}>Password</Text>
          <View style={[S.inputWrap, focusedField === "password" && S.inputFocused]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
          <Text style={S.footer}>© 2024 PM MKN · Sistem Monitoring Terpadu</Text>
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

  // Floating blobs
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.white,
  },

  // Top illustration section (~40% layar)
  topSection: {
    height: H * 0.40,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
  illustrationWrap: {
    alignItems: "center",
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
