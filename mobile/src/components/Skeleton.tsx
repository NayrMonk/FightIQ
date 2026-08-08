import { useEffect, useState } from "react";
import { Animated, View, ViewProps } from "react-native";

export function Skeleton({ className = "", style, ...props }: ViewProps & { className?: string }) {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-surface-high rounded-lg ${className}`}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}

export function StatTileSkeleton() {
  return (
    <View className="flex-1 bg-surface border border-white/10 rounded-xl p-4 items-center">
      <Skeleton className="h-7 w-12 mb-2" />
      <Skeleton className="h-3 w-16" />
    </View>
  );
}

export function CardSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <View className="bg-surface border border-white/10 rounded-xl p-4">
      <Skeleton className="h-5 w-2/3 mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full mt-2" />
      ))}
    </View>
  );
}
