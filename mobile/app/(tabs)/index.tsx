import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useDashboard } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton, Skeleton, StatTileSkeleton } from "../../src/components/Skeleton";
import { StatTile } from "../../src/components/StatTile";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

const DISCIPLINE_ICON: Record<string, string> = {
  boxing: "🥊",
  mma: "🥋",
  wrestling: "🤼",
  bjj: "🤼",
  kickboxing: "🥊",
  conditioning: "🏃",
};

export default function HomeScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useDashboard();

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-white/70 text-center mb-3">Couldn&apos;t load your dashboard.</Text>
        <Pressable
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          className="bg-brand-container rounded-lg px-4 py-2"
        >
          <Text className="text-white font-bold uppercase tracking-widest text-xs">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const today = data?.today_session;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF2E4D" />}
    >
      {/* Greeting header */}
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-white text-2xl font-bold">Ready to train?</Text>
          <Text className="text-white/60 mt-1">Let&apos;s build on your momentum.</Text>
        </View>
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-full" />
        ) : (
          <View className="flex-row items-center gap-1 bg-surface border border-white/10 px-3 py-2 rounded-full">
            <Text className="text-xs">🔥</Text>
            <Text className="text-white text-xs font-bold uppercase tracking-wide">
              {data?.current_streak_days ?? 0} Day Streak
            </Text>
          </View>
        )}
      </View>

      {/* Today's focus */}
      {isLoading ? (
        <CardSkeleton lines={2} />
      ) : (
        <WidgetBoundary label="Today's session">
          {today ? (
            <Card className="mb-4">
              <View className="flex-row items-center gap-1 self-start bg-brand/20 border border-brand/50 px-3 py-1 rounded-full mb-3">
                <View className="w-1.5 h-1.5 rounded-full bg-brand" />
                <Text className="text-brand text-xs font-bold uppercase tracking-widest">Today&apos;s Focus</Text>
              </View>
              <Text className="text-white text-xl font-bold">{today.session_template.name}</Text>
              <Text className="text-white/60 mt-1 capitalize">{today.session_template.discipline}</Text>

              <View className="flex-row gap-6 mt-4">
                <View>
                  <Text className="text-white/50 text-xs font-bold uppercase tracking-wide">Duration</Text>
                  <Text className="text-white text-xl font-bold mt-0.5">
                    {today.session_template.estimated_duration_min}m
                  </Text>
                </View>
                <View>
                  <Text className="text-white/50 text-xs font-bold uppercase tracking-wide">Intensity</Text>
                  <Text className="text-brand text-xl font-bold mt-0.5 capitalize">
                    {today.session_template.intensity}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push(`/session/${today.session_template.id}`)}
                accessibilityRole="button"
                accessibilityLabel={today.status === "completed" ? "View session" : "Start session"}
                className="bg-brand-container rounded-lg py-3 items-center mt-4 active:opacity-80"
              >
                <Text className="text-white font-bold uppercase tracking-widest">
                  {today.status === "completed" ? "View Session" : "▶ Start Session"}
                </Text>
              </Pressable>
            </Card>
          ) : (
            <Card className="mb-4">
              <Text className="text-white text-lg font-semibold">No session scheduled today</Text>
              <Text className="text-white/60 mt-1">Rest day, or browse programmes to start one.</Text>
            </Card>
          )}
        </WidgetBoundary>
      )}

      {isLoading ? (
        <View className="flex-row gap-3 mb-4">
          <StatTileSkeleton />
          <StatTileSkeleton />
        </View>
      ) : (
        <WidgetBoundary label="Stats">
          <View className="flex-row gap-3 mb-4">
            <StatTile
              label="This week"
              value={`${data?.weekly_sessions_completed ?? 0}/${data?.weekly_sessions_scheduled ?? 0}`}
            />
            <StatTile label="Avg intensity" value={data?.avg_recent_intensity?.toFixed(1) ?? "—"} />
          </View>
        </WidgetBoundary>
      )}

      <Text className="text-white/50 text-xs font-bold uppercase tracking-wide mb-2">Recent Sessions</Text>
      {isLoading ? (
        <CardSkeleton lines={1} />
      ) : (
        <WidgetBoundary label="Recent sessions">
          {data?.recent_sessions.length ? (
            data.recent_sessions.map((s) => (
              <Card key={s.id} className="mb-2 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-12 h-12 rounded-full bg-surface-high items-center justify-center">
                    <Text className="text-base">
                      {DISCIPLINE_ICON[s.session_template.discipline?.toLowerCase()] ?? "🥊"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium">{s.session_template.name}</Text>
                    <Text className="text-white/40 text-xs mt-0.5">{s.scheduled_date}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-mint font-semibold">{s.result?.rounds_completed ?? 0} rounds</Text>
                  <Text className="text-white/30">›</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text className="text-white/60">No completed sessions yet — go finish your first one.</Text>
            </Card>
          )}
        </WidgetBoundary>
      )}
    </ScrollView>
  );
}
