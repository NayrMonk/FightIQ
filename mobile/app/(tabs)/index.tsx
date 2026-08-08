import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useDashboard } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton, StatTileSkeleton } from "../../src/components/Skeleton";
import { StatTile } from "../../src/components/StatTile";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

export default function HomeScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useDashboard();

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-white/70 text-center mb-3">Couldn&apos;t load your dashboard.</Text>
        <Pressable onPress={() => refetch()} className="bg-brand-container rounded-lg px-4 py-2">
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
      <Text className="text-white/50 mb-1">Today</Text>

      {isLoading ? (
        <CardSkeleton lines={2} />
      ) : (
        <WidgetBoundary label="Today's session">
          {today ? (
            <Card className="mb-4">
              <Text className="text-white text-xl font-bold">{today.session_template.name}</Text>
              <Text className="text-white/60 mt-1 capitalize">
                {today.session_template.discipline} · {today.session_template.estimated_duration_min} min ·{" "}
                {today.session_template.intensity} intensity
              </Text>
              <Pressable
                onPress={() => router.push(`/session/${today.session_template.id}`)}
                className="bg-brand-container rounded-lg py-3 items-center mt-4 active:opacity-80"
              >
                <Text className="text-white font-bold uppercase tracking-widest">
                  {today.status === "completed" ? "View Session" : "Start Session"}
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
          <StatTileSkeleton />
        </View>
      ) : (
        <WidgetBoundary label="Stats">
          <View className="flex-row gap-3 mb-4">
            <StatTile label="Streak (days)" value={data?.current_streak_days ?? 0} />
            <StatTile
              label="This week"
              value={`${data?.weekly_sessions_completed ?? 0}/${data?.weekly_sessions_scheduled ?? 0}`}
            />
            <StatTile label="Avg intensity" value={data?.avg_recent_intensity?.toFixed(1) ?? "—"} />
          </View>
        </WidgetBoundary>
      )}

      <Text className="text-white/50 mb-2">Recent sessions</Text>
      {isLoading ? (
        <CardSkeleton lines={1} />
      ) : (
        <WidgetBoundary label="Recent sessions">
          {data?.recent_sessions.length ? (
            data.recent_sessions.map((s) => (
              <Card key={s.id} className="mb-2 flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-medium">{s.session_template.name}</Text>
                  <Text className="text-white/40 text-xs mt-0.5">{s.scheduled_date}</Text>
                </View>
                <Text className="text-mint font-semibold">{s.result?.rounds_completed ?? 0} rounds</Text>
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
