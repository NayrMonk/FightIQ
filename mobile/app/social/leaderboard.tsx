import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useLeaderboard } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

const METRICS = [
  { key: "sessions" as const, label: "Sessions" },
  { key: "streak" as const, label: "Streak" },
];
const SCOPES = [
  { key: "global" as const, label: "Global" },
  { key: "following" as const, label: "Following" },
];

function ToggleRow<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { key: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row gap-1 bg-surface-high rounded-lg p-1 border border-white/10 self-start">
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          accessibilityRole="button"
          accessibilityLabel={`Show ${opt.label}`}
          className={`px-3 py-2 rounded ${active === opt.key ? "bg-surface border border-white/10" : ""}`}
        >
          <Text className={`text-xs font-bold uppercase tracking-wide ${active === opt.key ? "text-white" : "text-white/50"}`}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function LeaderboardScreen() {
  const [metric, setMetric] = useState<"sessions" | "streak">("sessions");
  const [scope, setScope] = useState<"global" | "following">("global");
  const { data: entries, isLoading, isError, refetch } = useLeaderboard(metric, scope);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Leaderboard", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white text-3xl font-bold mb-4">Leaderboard</Text>

        <View className="flex-row justify-between mb-4">
          <ToggleRow options={METRICS} active={metric} onChange={setMetric} />
          <ToggleRow options={SCOPES} active={scope} onChange={setScope} />
        </View>

        {isError ? (
          <View className="items-center py-10">
            <Text className="text-white/70 text-center mb-3">Couldn&apos;t load the leaderboard.</Text>
            <Pressable
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              className="bg-brand-container rounded-lg px-4 py-2"
            >
              <Text className="text-white font-bold uppercase tracking-widest text-xs">Retry</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <CardSkeleton lines={5} />
        ) : (
          <WidgetBoundary label="Leaderboard">
            <Card>
              {entries?.length ? (
                entries.map((entry) => (
                  <View
                    key={entry.user.id}
                    className="flex-row items-center justify-between py-2 border-b border-white/5"
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-white/40 font-bold w-6">{entry.rank}</Text>
                      <Text className="text-white font-semibold">{entry.user.display_name ?? `User #${entry.user.id}`}</Text>
                    </View>
                    <Text className="text-mint font-bold">
                      {entry.value}
                      {metric === "streak" ? "d" : ""}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-white/50">No data yet.</Text>
              )}
            </Card>
          </WidgetBoundary>
        )}
      </ScrollView>
    </View>
  );
}
