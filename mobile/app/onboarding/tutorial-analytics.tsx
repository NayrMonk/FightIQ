import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from "react-native-svg";

export default function TutorialAnalyticsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="flex-row gap-2 items-center">
            <View className="w-8 h-1 rounded-full bg-surface-high" />
            <View className="w-8 h-1 rounded-full bg-surface-high" />
            <View className="w-8 h-1 rounded-full bg-brand" />
          </View>
        </View>

        <View className="w-full aspect-video bg-surface border border-white/10 rounded-xl mb-8 overflow-hidden p-4 justify-center">
          <Svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", left: 0, top: 0 }}>
            <Defs>
              <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#22F2A1" stopOpacity={0.2} />
                <Stop offset="100%" stopColor="#22F2A1" stopOpacity={1} />
              </LinearGradient>
              <LinearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#22F2A1" stopOpacity={0.3} />
                <Stop offset="100%" stopColor="#1C1C1E" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              d="M 0 350 Q 100 350, 200 250 T 400 200 T 600 100 T 800 50 L 800 400 L 0 400 Z"
              fill="url(#areaGrad)"
            />
            <Path
              d="M 0 350 Q 100 350, 200 250 T 400 200 T 600 100 T 800 50"
              fill="none"
              stroke="url(#lineGrad)"
              strokeLinecap="round"
              strokeWidth={6}
            />
            <Circle cx={200} cy={250} r={6} fill="#22F2A1" />
            <Circle cx={400} cy={200} r={6} fill="#22F2A1" />
            <Circle cx={600} cy={100} r={6} fill="#22F2A1" />
            <Circle cx={800} cy={50} r={8} fill="#FFFFFF" />
          </Svg>
          <View className="absolute top-3 right-3 bg-background/80 border border-white/10 rounded-lg px-3 py-1.5 flex-row items-center gap-1.5">
            <Text className="text-mint text-xs">📈</Text>
            <Text className="text-mint text-sm font-bold">+24% Output</Text>
          </View>
        </View>

        <Text className="text-white text-3xl font-bold text-center mb-3">Level Up Your Game</Text>
        <Text className="text-white/60 text-base text-center">
          Turn your sweat into data. Visualize your progress with detailed analytics and discipline breakdowns.
        </Text>
      </View>

      <View className="px-6 pb-8">
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          accessibilityLabel="Enter dashboard"
          className="w-full bg-brand rounded-lg py-4 flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Text className="text-white font-bold">Enter Dashboard</Text>
          <Text className="text-white font-bold">→</Text>
        </Pressable>
      </View>
    </View>
  );
}
