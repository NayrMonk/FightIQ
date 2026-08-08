import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "../../src/stores/onboardingStore";

export default function WelcomeSummaryScreen() {
  const disciplines = useOnboardingStore((s) => s.disciplines);
  const goal = useOnboardingStore((s) => s.goal);
  const experience = useOnboardingStore((s) => s.experience);

  const disciplineLabel = disciplines.length ? disciplines.join(", ") : "Not set";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Hero */}
        <View className="items-center mb-6">
          <View className="w-32 h-32 rounded-full bg-surface-high border-2 border-brand-container items-center justify-center mb-4">
            <Ionicons name="person" size={56} color="#8a8a8d" />
          </View>
          <Text className="text-white text-3xl font-bold tracking-tight text-center">
            Welcome to <Text className="text-brand-container">FightIQ</Text>!
          </Text>
          <Text className="text-white/60 text-base mt-2 text-center">
            Your profile is locked in. It&apos;s time to work.
          </Text>
        </View>

        {/* Profile summary card */}
        <View className="bg-surface/80 border border-white/10 rounded-xl p-4 gap-3 mb-8">
          <Text className="text-mint text-xs uppercase tracking-widest font-bold border-b border-white/10 pb-2 mb-1">
            Your Profile
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="body-outline" size={18} color="#8a8a8d" />
              <Text className="text-white/60">Discipline</Text>
            </View>
            <Text className="text-white font-bold">{disciplineLabel}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="flag-outline" size={18} color="#8a8a8d" />
              <Text className="text-white/60">Goal</Text>
            </View>
            <Text className="text-white font-bold">{goal ?? "Not set"}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="speedometer-outline" size={18} color="#8a8a8d" />
              <Text className="text-white/60">Experience</Text>
            </View>
            <Text className="text-white font-bold">{experience ?? "Not set"}</Text>
          </View>
        </View>

        {/* What's next */}
        <View className="items-center gap-2 mb-10 px-4">
          <Ionicons name="sparkles-outline" size={30} color="#FF2E4D" />
          <Text className="text-white text-xl font-semibold">AI Calibration Active</Text>
          <Text className="text-white/60 text-center">
            Your AI Coach is analyzing your profile to generate your first custom training session.
          </Text>
        </View>

        <View className="mt-auto gap-3">
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="button"
            accessibilityLabel="Go to dashboard"
            className="bg-brand-container rounded-lg py-4 items-center flex-row justify-center gap-2 active:opacity-80"
          >
            <Text className="text-white font-bold uppercase tracking-widest">Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/programmes")}
            accessibilityRole="button"
            accessibilityLabel="Explore training programs"
            className="border border-mint rounded-lg py-3.5 items-center active:opacity-80"
          >
            <Text className="text-mint font-bold uppercase tracking-widest">Explore Programs</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
