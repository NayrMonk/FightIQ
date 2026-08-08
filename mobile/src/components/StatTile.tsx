import { Text, View } from "react-native";

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-surface border border-white/10 rounded-xl p-4 items-center">
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-mint text-xs mt-1 text-center uppercase tracking-wide">{label}</Text>
    </View>
  );
}
