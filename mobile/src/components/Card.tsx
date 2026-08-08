import { View, ViewProps } from "react-native";

export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return <View className={`bg-surface border border-white/10 rounded-xl p-4 ${className}`} {...props} />;
}
