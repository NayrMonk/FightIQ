import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TutorialTrackingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Mock phone visual */}
        <View className="w-full max-w-xs aspect-[9/16] max-h-96 bg-surface/60 border border-white/10 rounded-[32px] p-6 items-center mb-8">
          <View className="w-full flex-row justify-between items-center mb-8 opacity-60">
            <Text className="text-white text-sm">☰</Text>
            <Text className="text-white/80 text-xs font-bold tracking-widest">ROUND 1</Text>
            <Text className="text-white text-sm">⚙</Text>
          </View>
          <View className="w-40 h-40 rounded-full border-[10px] border-surface items-center justify-center mb-8" style={{ shadowColor: "#FF2E4D", shadowOpacity: 0.4, shadowRadius: 20 }}>
            <Text className="text-brand text-4xl font-bold tracking-tighter">2:45</Text>
            <Text className="text-white/60 text-[10px] font-bold tracking-widest mt-1">REMAINING</Text>
          </View>
          <View className="w-full flex-row gap-3">
            <View className="flex-1 bg-background border border-white/10 rounded-lg p-3 items-center">
              <Text className="text-mint text-[10px] font-bold mb-1">HEART RATE</Text>
              <Text className="text-white text-lg font-bold">
                165 <Text className="text-[10px] text-white/60">BPM</Text>
              </Text>
            </View>
            <View className="flex-1 bg-background border border-white/10 rounded-lg p-3 items-center">
              <Text className="text-mint text-[10px] font-bold mb-1">INTENSITY</Text>
              <Text className="text-white text-lg font-bold">
                82 <Text className="text-[10px] text-white/60">%</Text>
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-white text-3xl font-bold text-center mb-4">Track Every Round</Text>
        <Text className="text-white/60 text-base text-center max-w-md">
          Our intelligent timers capture your intensity, volume, and recovery in real-time. Stay focused on the
          fight, we&apos;ll handle the data.
        </Text>
      </View>

      <View className="items-center px-6 pb-8">
        <View className="flex-row gap-2 mb-8">
          <View className="w-8 h-1 rounded-full bg-brand" />
          <View className="w-8 h-1 rounded-full bg-surface-high" />
          <View className="w-8 h-1 rounded-full bg-surface-high" />
        </View>
        <View className="w-full max-w-sm gap-4">
          <Pressable
            onPress={() => router.push("/onboarding/tutorial-ai-coach")}
            accessibilityRole="button"
            accessibilityLabel="Next"
            className="w-full bg-brand rounded-xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white font-bold">Next</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="button"
            accessibilityLabel="Skip tutorial"
            className="w-full border border-white/10 rounded-xl py-4 items-center active:opacity-70"
          >
            <Text className="text-white/60 font-bold">Skip</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
