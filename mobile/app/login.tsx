import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../src/api/client";
import { useAuthStore } from "../src/stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("athlete@test.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string; refresh_token: string }>("/auth/login", {
        email,
        password,
      });
      await login(res.access_token, res.refresh_token);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Branding & headline */}
        <View className="items-center mb-10">
          <Text className="text-brand text-4xl font-bold uppercase tracking-tighter mb-2">FightIQ</Text>
          <Text className="text-white text-xl font-semibold">Train Smarter. Fight Harder.</Text>
        </View>

        {/* Glass card */}
        <View className="bg-surface/80 border border-white/10 rounded-xl p-5">
          <View className="mb-4">
            <Text className="text-white/60 text-xs uppercase tracking-widest mb-2 font-bold">Email</Text>
            <View className="flex-row items-center bg-background border border-white/10 rounded-lg px-4">
              <Ionicons name="mail-outline" size={18} color="#8a8a8d" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 text-white py-3 pl-3"
                placeholder="athlete@dojo.com"
                placeholderTextColor="#8a8a8d"
                accessibilityLabel="Email"
              />
            </View>
          </View>

          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white/60 text-xs uppercase tracking-widest font-bold">Password</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Forgot password">
                <Text className="text-brand text-xs uppercase font-bold">Forgot?</Text>
              </Pressable>
            </View>
            <View className="flex-row items-center bg-background border border-white/10 rounded-lg px-4">
              <Ionicons name="lock-closed-outline" size={18} color="#8a8a8d" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 text-white py-3 pl-3"
                placeholder="••••••••"
                placeholderTextColor="#8a8a8d"
                accessibilityLabel="Password"
              />
            </View>
          </View>

          {error ? <Text className="text-brand mt-3">{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: loading, busy: loading }}
            className="bg-brand-container rounded-lg py-3 items-center mt-6 flex-row justify-center gap-2 active:opacity-80"
          >
            <Text className="text-white font-bold uppercase tracking-widest">
              {loading ? "Logging in..." : "Sign In"}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-white/10" />
            <Text className="text-white/50 text-xs uppercase tracking-widest mx-3">Or Continue With</Text>
            <View className="flex-1 h-px bg-white/10" />
          </View>

          {/* Social logins (not yet wired to a backend) */}
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className="flex-1 flex-row items-center justify-center gap-2 bg-background border border-white/10 rounded-lg py-3 active:opacity-80"
            >
              <Ionicons name="logo-google" size={18} color="#fff" />
              <Text className="text-white font-bold">Google</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              className="flex-1 flex-row items-center justify-center gap-2 bg-background border border-white/10 rounded-lg py-3 active:opacity-80"
            >
              <Ionicons name="logo-apple" size={18} color="#fff" />
              <Text className="text-white font-bold">Apple</Text>
            </Pressable>
          </View>

          <Link href="/register" className="text-white/60 text-center mt-6">
            Don&apos;t have an account? <Text className="text-brand font-bold">Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
