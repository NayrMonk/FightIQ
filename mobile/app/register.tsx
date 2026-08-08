import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../src/api/client";
import { useAuthStore } from "../src/stores/authStore";

const GENDERS = ["Male", "Female", "Other"] as const;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  // UI-only fields from the design (no backend fields for these yet)
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("Male");

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string }>("/auth/register", { email, password });
      await login(res.access_token);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Progress indicator (step 2 of 4 in the onboarding flow) */}
      <View className="flex-row gap-2 px-6 pt-4">
        <View className="h-1 flex-1 bg-brand/50 rounded-full" />
        <View className="h-1 flex-1 bg-brand rounded-full" />
        <View className="h-1 flex-1 bg-surface-high rounded-full" />
        <View className="h-1 flex-1 bg-surface-high rounded-full" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" className="px-6">
        <View className="mt-8 mb-8">
          <Text className="text-brand text-3xl font-bold tracking-tight mb-2">Tell us about yourself.</Text>
          <Text className="text-white/60 text-base">
            Basic details help us calibrate your initial training parameters.
          </Text>
        </View>

        <View className="bg-surface/80 border border-white/10 rounded-xl p-5 gap-5">
          <View>
            <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-background border border-white/10 text-white rounded-lg px-4 py-3"
              placeholder="athlete@dojo.com"
              placeholderTextColor="#8a8a8d"
              accessibilityLabel="Email"
            />
          </View>

          <View>
            <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-background border border-white/10 text-white rounded-lg px-4 py-3"
              placeholder="••••••••"
              placeholderTextColor="#8a8a8d"
              accessibilityLabel="Password"
            />
          </View>

          <View>
            <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              className="bg-background border border-white/10 text-white rounded-lg px-4 py-3"
              placeholder="Fighter Name"
              placeholderTextColor="#8a8a8d"
              accessibilityLabel="Full name"
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">Age</Text>
              <View className="flex-row items-center bg-background border border-white/10 rounded-lg px-4">
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="flex-1 text-white text-2xl font-bold py-3"
                  placeholder="00"
                  placeholderTextColor="#8a8a8d"
                  accessibilityLabel="Age"
                />
                <Text className="text-white/50 text-xs font-bold">YRS</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">Weight</Text>
              <View className="flex-row items-center bg-background border border-white/10 rounded-lg px-4">
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="number-pad"
                  maxLength={3}
                  className="flex-1 text-white text-2xl font-bold py-3"
                  placeholder="000"
                  placeholderTextColor="#8a8a8d"
                  accessibilityLabel="Weight"
                />
                <Text className="text-white/50 text-xs font-bold">LBS</Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-white text-xs uppercase tracking-widest font-bold mb-2">
              Division Classification
            </Text>
            <View className="flex-row gap-2">
              {GENDERS.map((g) => {
                const selected = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${g}`}
                    accessibilityState={{ selected }}
                    className={`flex-1 rounded-lg py-3 items-center border ${
                      selected ? "bg-brand/15 border-brand" : "bg-background border-white/10"
                    }`}
                  >
                    <Text className={`font-bold ${selected ? "text-brand" : "text-white"}`}>{g}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? <Text className="text-brand">{error}</Text> : null}
        </View>

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Create account"
          accessibilityState={{ disabled: loading, busy: loading }}
          className="bg-brand rounded-lg py-4 items-center mt-6 flex-row justify-center gap-2 active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            {loading ? "Creating..." : "Continue"}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </Pressable>

        <Link href="/login" className="text-white/60 text-center mt-6 mb-6">
          Already have an account? <Text className="text-brand font-bold">Log in</Text>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
