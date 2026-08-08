import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "../../src/stores/onboardingStore";

const DISCIPLINES: { name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "MMA", icon: "body-outline" },
  { name: "Boxing", icon: "hand-left-outline" },
  { name: "Muay Thai", icon: "flame-outline" },
  { name: "BJJ", icon: "hand-right-outline" },
  { name: "Kickboxing", icon: "flash-outline" },
  { name: "Wrestling", icon: "accessibility-outline" },
];

export default function SelectInterestsScreen() {
  const disciplines = useOnboardingStore((s) => s.disciplines);
  const toggleDiscipline = useOnboardingStore((s) => s.toggleDiscipline);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Progress indicator: step 1 of 4 */}
      <View className="flex-row gap-2 px-6 pt-4">
        <View className="h-1 flex-1 bg-brand rounded-full" />
        <View className="h-1 flex-1 bg-surface-high rounded-full" />
        <View className="h-1 flex-1 bg-surface-high rounded-full" />
        <View className="h-1 flex-1 bg-surface-high rounded-full" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} className="px-6">
        <View className="mt-8 mb-8">
          <Text className="text-white text-3xl font-bold tracking-tight mb-2">What are your disciplines?</Text>
          <Text className="text-white/60 text-base">Select all that apply to personalize your training data.</Text>
        </View>

        <View className="flex-row flex-wrap gap-4">
          {DISCIPLINES.map((d) => {
            const selected = disciplines.includes(d.name);
            return (
              <Pressable
                key={d.name}
                onPress={() => toggleDiscipline(d.name)}
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${d.name}`}
                accessibilityState={{ selected }}
                style={{ width: "47%" }}
                className={`aspect-square rounded-xl items-center justify-center gap-2 border active:opacity-80 ${
                  selected ? "bg-brand/15 border-brand" : "bg-surface/80 border-white/10"
                }`}
              >
                <Ionicons name={d.icon} size={40} color={selected ? "#FF2E4D" : "#e5e2e3"} />
                <Text className={`font-bold ${selected ? "text-brand" : "text-white"}`}>{d.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-4 pt-3 bg-background/90 border-t border-white/10">
        <Pressable
          onPress={() => router.push("/onboarding/training-goals")}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          className="bg-brand rounded-xl py-4 items-center flex-row justify-center gap-2 active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
        <Pressable
          onPress={() => router.push("/onboarding/training-goals")}
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
          className="items-center py-3"
        >
          <Text className="text-white/50 font-bold uppercase tracking-widest text-xs">Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
