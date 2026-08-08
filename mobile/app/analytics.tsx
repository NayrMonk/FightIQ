import { Stack } from "expo-router";
import { Suspense } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAnalyticsSummary, usePersonalRecords } from "../src/api/hooks";
import { Card } from "../src/components/Card";
import { LazyBarChart } from "../src/components/LazyBarChart";
import { CardSkeleton, Skeleton, StatTileSkeleton } from "../src/components/Skeleton";
import { StatTile } from "../src/components/StatTile";
import { WidgetBoundary } from "../src/components/WidgetBoundary";

export default function AnalyticsScreen() {
  const { data: summary, isLoading, isError, refetch } = useAnalyticsSummary();
  const { data: records, isLoading: recordsLoading } = usePersonalRecords();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Analytics", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isError ? (
          <View className="items-center py-10">
            <Text className="text-white/70 text-center mb-3">Couldn&apos;t load analytics.</Text>
            <Pressable onPress={() => refetch()} className="bg-brand-container rounded-lg px-4 py-2">
              <Text className="text-white font-bold uppercase tracking-widest text-xs">Retry</Text>
            </Pressable>
          </View>
        ) : isLoading || !summary ? (
          <>
            <View className="flex-row gap-3 mb-3">
              <StatTileSkeleton />
              <StatTileSkeleton />
            </View>
            <View className="flex-row gap-3 mb-4">
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
            </View>
            <CardSkeleton lines={3} />
          </>
        ) : (
          <>
            <WidgetBoundary label="Summary stats">
              <View className="flex-row gap-3 mb-3">
                <StatTile label="Current streak" value={`${summary.current_streak_days}d`} />
                <StatTile label="Consistency (4wk)" value={`${summary.consistency_pct_last_4_weeks}%`} />
              </View>
              <View className="flex-row gap-3 mb-4">
                <StatTile label="Avg duration" value={`${Math.round(summary.avg_session_duration_sec / 60)}m`} />
                <StatTile label="Avg intensity" value={summary.avg_perceived_intensity?.toFixed(1) ?? "—"} />
                <StatTile label="Round completion" value={`${Math.round(summary.round_completion_rate * 100)}%`} />
              </View>
            </WidgetBoundary>

            <WidgetBoundary label="Sessions chart">
              <Card className="mb-4">
                <Text className="text-mint text-xs font-bold uppercase tracking-widest mb-4">Sessions Completed</Text>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <LazyBarChart
                    data={[
                      { value: summary.sessions_last_7_days, label: "7d", frontColor: "#FF2E4D" },
                      { value: summary.sessions_last_30_days, label: "30d", frontColor: "#FF2E4D" },
                      { value: summary.total_sessions_completed, label: "All time", frontColor: "#22F2A1" },
                    ]}
                    barWidth={36}
                    spacing={28}
                    roundedTop
                    noOfSections={4}
                    yAxisTextStyle={{ color: "#888" }}
                    xAxisLabelTextStyle={{ color: "#888" }}
                    backgroundColor="transparent"
                    rulesColor="#2A2A2B"
                  />
                </Suspense>
              </Card>
            </WidgetBoundary>
          </>
        )}

        <WidgetBoundary label="Personal records">
          <Card>
            <Text className="text-mint text-xs font-bold uppercase tracking-widest mb-3">Personal Records</Text>
            {recordsLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : records?.length ? (
              records.map((pr, idx) => (
                <View key={idx} className="flex-row justify-between py-2 border-b border-white/5">
                  <Text className="text-white/80 capitalize">{pr.record_type.replace(/_/g, " ")}</Text>
                  <Text className="text-white font-semibold">{pr.value}</Text>
                </View>
              ))
            ) : (
              <Text className="text-white/50">No personal records yet.</Text>
            )}
          </Card>
        </WidgetBoundary>
      </ScrollView>
    </View>
  );
}
