import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TutorialAiCoachScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-row justify-end px-6 pt-4">
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          accessibilityLabel="Skip tutorial"
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="text-white/60 font-bold">Skip</Text>
          <Text className="text-white/60">›</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm mb-10">
          <View className="bg-surface/90 border border-white/10 rounded-xl p-4 flex-row items-start gap-4 self-start mb-4" style={{ maxWidth: "85%" }}>
            <View className="w-10 h-10 rounded-full bg-surface-high items-center justify-center border border-white/10">
              <Text className="text-mint text-lg">🤖</Text>
            </View>
            <View className="flex-1">
              <Text className="text-mint text-xs font-bold mb-1">Coach IQ</Text>
              <Text className="text-white text-sm">
                Great round! I noticed a <Text className="text-brand-container font-bold">+25% Output Spike</Text> in
                your striking volume.
              </Text>
            </View>
          </View>
          <View className="bg-brand-dark/60 border border-white/5 rounded-xl px-4 py-3 self-end" style={{ maxWidth: "70%" }}>
            <Text className="text-white text-sm">Show me the breakdown.</Text>
          </View>
        </View>

        <Text className="text-white text-3xl font-bold text-center tracking-tight mb-3">Meet Your AI Coach</Text>
        <Text className="text-white/60 text-base text-center max-w-sm">
          Coach IQ analyzes your training history to provide personalized feedback and custom workouts.
        </Text>
      </View>

      <View className="items-center px-6 pb-8">
        <View className="flex-row gap-2 mb-6 items-center">
          <View className="w-2 h-2 rounded-full bg-surface-high" />
          <View className="w-8 h-2 rounded-full bg-brand-container" />
          <View className="w-2 h-2 rounded-full bg-surface-high" />
        </View>
        <Pressable
          onPress={() => router.push("/onboarding/tutorial-analytics")}
          accessibilityRole="button"
          accessibilityLabel="Next"
          className="w-full max-w-sm bg-brand-container rounded-xl py-4 flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Text className="text-brand-dark font-bold">Next</Text>
          <Text className="text-brand-dark font-bold">→</Text>
        </Pressable>
      </View>
    </View>
  );
}
