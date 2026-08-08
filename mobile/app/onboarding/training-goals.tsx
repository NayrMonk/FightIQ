import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "../../src/stores/onboardingStore";

const GOALS: { id: string; icon: keyof typeof Ionicons.glyphMap; title: string; description: string }[] = [
  { id: "Improve Technique", icon: "body-outline", title: "Improve Technique", description: "Focus on form, combinations, and defensive mastery." },
  { id: "Build Conditioning", icon: "pulse-outline", title: "Build Conditioning", description: "Enhance cardio, stamina, and muscular endurance for longer rounds." },
  { id: "Prepare for a Fight", icon: "flame-outline", title: "Prepare for a Fight", description: "Intensive camp simulation balancing sparring, S&C, and weight cuts." },
  { id: "General Fitness", icon: "barbell-outline", title: "General Fitness", description: "Use combat sports principles to stay lean and active." },
];

const EXPERIENCE_LEVELS: { id: string; icon: keyof typeof Ionicons.glyphMap; label: string; years: string }[] = [
  { id: "Beginner", icon: "ribbon-outline", label: "Beginner", years: "0-1 Years" },
  { id: "Intermediate", icon: "medal-outline", label: "Intermediate", years: "1-3 Years" },
  { id: "Advanced", icon: "trophy-outline", label: "Advanced", years: "3+ Years" },
];

export default function TrainingGoalsScreen() {
  const goal = useOnboardingStore((s) => s.goal);
  const experience = useOnboardingStore((s) => s.experience);
  const setGoal = useOnboardingStore((s) => s.setGoal);
  const setExperience = useOnboardingStore((s) => s.setExperience);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Progress indicator: step 3 of 4 */}
      <View className="px-6 pt-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white/50 text-xs uppercase tracking-widest font-bold">Step 3 of 3</Text>
          <Text className="text-brand text-xs uppercase tracking-widest font-bold">Final Setup</Text>
        </View>
        <View className="h-1 bg-surface-high rounded-full overflow-hidden">
          <View className="h-full w-full bg-brand rounded-full" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="px-6">
        <View className="mt-6 mb-8">
          <Text className="text-white text-3xl font-bold tracking-tight mb-2">Define your trajectory.</Text>
          <Text className="text-white/60 text-base">
            We&apos;ll tailor your dashboard and training regimens based on your current focus and experience level.
          </Text>
        </View>

        <Text className="text-white text-lg font-semibold border-b border-white/10 pb-2 mb-4">Primary Goal</Text>
        <View className="gap-3 mb-8">
          {GOALS.map((g) => {
            const selected = goal === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => setGoal(g.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select goal: ${g.title}`}
                accessibilityState={{ selected }}
                className={`flex-row items-start gap-4 rounded-lg p-4 border active:opacity-80 ${
                  selected ? "bg-brand/15 border-brand" : "bg-surface/80 border-white/10"
                }`}
              >
                <Ionicons name={g.icon} size={26} color={selected ? "#FF2E4D" : "#8a8a8d"} />
                <View className="flex-1">
                  <Text className={`font-bold mb-1 ${selected ? "text-brand" : "text-white"}`}>{g.title}</Text>
                  <Text className="text-white/50 text-sm">{g.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-white text-lg font-semibold border-b border-white/10 pb-2 mb-4">Experience Level</Text>
        <View className="flex-row gap-3">
          {EXPERIENCE_LEVELS.map((e) => {
            const selected = experience === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setExperience(e.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select experience: ${e.label}`}
                accessibilityState={{ selected }}
                className={`flex-1 items-center gap-2 rounded-lg py-4 border active:opacity-80 ${
                  selected ? "bg-brand/15 border-brand" : "bg-surface/80 border-white/10"
                }`}
              >
                <Ionicons name={e.icon} size={28} color={selected ? "#FF2E4D" : "#8a8a8d"} />
                <Text className={`font-bold text-xs ${selected ? "text-brand" : "text-white"}`}>{e.label}</Text>
                <Text className="text-white/40 text-[10px]">{e.years}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-6 pb-4 pt-3 bg-background/90 border-t border-white/10">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="px-6 py-3 rounded-lg border border-mint items-center justify-center active:opacity-80"
        >
          <Text className="text-mint font-bold uppercase tracking-widest">Back</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/onboarding/welcome-summary")}
          accessibilityRole="button"
          accessibilityLabel="Complete setup"
          className="flex-1 bg-brand rounded-lg py-3 items-center flex-row justify-center gap-2 active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">Complete Setup</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
