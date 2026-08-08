import { Stack, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProfile } from "../src/api/hooks";
import { useAuthStore } from "../src/stores/authStore";

function SectionHeader({ label }: { label: string }) {
  return <Text className="text-mint text-xs font-bold uppercase tracking-widest px-1 mb-2">{label}</Text>;
}

/** Static, non-navigable row — placeholder for a screen that doesn't exist yet. */
function StaticRow({ icon, label, value, last }: { icon: string; label: string; value?: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between p-4 ${last ? "" : "border-b border-white/10"}`}>
      <View className="flex-row items-center gap-3">
        <Text className="text-white/60">{icon}</Text>
        <Text className="text-white">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-white/50 text-xs font-bold">{value}</Text>}
        <Text className="text-white/40">›</Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();
  const logout = useAuthStore((s) => s.logout);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [units, setUnits] = useState<"Metric" | "Imperial">("Metric");

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-row items-center px-4 pb-3 border-b border-white/10 bg-background"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="w-9 h-9 rounded-full border border-white/10 items-center justify-center mr-3 active:opacity-70"
        >
          <Text className="text-white text-base">‹</Text>
        </Pressable>
        <Text className="text-brand-container text-xl font-bold flex-1 text-center mr-9">FightIQ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        <Text className="text-white text-3xl font-bold mb-6">Settings</Text>

        <View className="mb-6">
          <SectionHeader label="Profile" />
          <View className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-white/10">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-surface-high items-center justify-center">
                  <Text className="text-lg">🥊</Text>
                </View>
                <View>
                  <Text className="text-white font-bold">{profile?.display_name || "Fighter"}</Text>
                  <Text className="text-brand-container text-xs font-bold">Change Avatar</Text>
                </View>
              </View>
              <Text className="text-white/40">›</Text>
            </View>
            <StaticRow icon="👤" label="Edit Personal Info" last />
          </View>
        </View>

        <View className="mb-6">
          <SectionHeader label="Training Preferences" />
          <View className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <StaticRow icon="🤖" label="Calibrate AI Coach" />
            <StaticRow icon="🥋" label="Manage Disciplines" />
            <StaticRow icon="🏋️" label="Equipment Setup" last />
          </View>
        </View>

        <View className="mb-6">
          <SectionHeader label="App Settings" />
          <View className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-white/10">
              <View className="flex-row items-center gap-3">
                <Text className="text-white/60">🔔</Text>
                <Text className="text-white">Push Notifications</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                accessibilityRole="switch"
                accessibilityLabel="Toggle push notifications"
                trackColor={{ true: "#FF2E4D", false: "#2A2A2B" }}
              />
            </View>
            <Pressable
              onPress={() => setUnits((u) => (u === "Metric" ? "Imperial" : "Metric"))}
              accessibilityRole="button"
              accessibilityLabel="Change measurement units"
              className="flex-row items-center justify-between p-4 border-b border-white/10 active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-white/60">📏</Text>
                <Text className="text-white">Measurement Units</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white/50 text-xs font-bold">{units}</Text>
                <Text className="text-white/40">›</Text>
              </View>
            </Pressable>
            <StaticRow icon="🌙" label="App Theme" value="Dark" last />
          </View>
        </View>

        <View className="mb-2">
          <SectionHeader label="Account" />
          <View className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <StaticRow icon="🛡️" label="Privacy & Security" />
            <StaticRow icon="❓" label="Help & Support" />
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Log out"
              className="flex-row items-center gap-3 p-4 active:opacity-70"
            >
              <Text className="text-brand">↩</Text>
              <Text className="text-brand font-bold">Logout</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
