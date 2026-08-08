import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
      const res = await api.post<{ access_token: string }>("/auth/login", { email, password });
      await login(res.access_token);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-brand text-4xl font-bold uppercase tracking-tight mb-1">FightIQ</Text>
        <Text className="text-white/80 text-base">Train Smarter. Fight Harder.</Text>
      </View>

      <View className="bg-surface border border-white/10 rounded-xl p-5">
        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
          placeholder="athlete@dojo.com"
          placeholderTextColor="#666"
        />

        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-2"
          placeholder="••••••••"
          placeholderTextColor="#666"
        />

        {error ? <Text className="text-brand mb-2">{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-brand-container rounded-lg py-3 items-center mt-4 active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            {loading ? "Logging in..." : "Sign In"}
          </Text>
        </Pressable>
      </View>

      <Link href="/register" className="text-white/60 text-center mt-6">
        Don&apos;t have an account? <Text className="text-brand font-bold">Sign Up</Text>
      </Link>
    </View>
  );
}
