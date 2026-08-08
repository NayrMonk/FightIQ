import { Stack } from "expo-router";
import { Suspense, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAnalyticsSummary, usePersonalRecords } from "../src/api/hooks";
import { Card } from "../src/components/Card";
import { LazyBarChart } from "../src/components/LazyBarChart";
import { CardSkeleton, Skeleton, StatTileSkeleton } from "../src/components/Skeleton";
import { StatTile } from "../src/components/StatTile";
import { WidgetBoundary } from "../src/components/WidgetBoundary";

// ponytail: mockup shows Week/Month/Year/All Time range tabs, but the analytics API returns
// one fixed summary (no range param) — tabs are visual-only until the backend supports a range.
const RANGES = ["Week", "Month", "Year", "All Time"] as const;

export default function AnalyticsScreen() {
  const { data: summary, isLoading, isError, refetch } = useAnalyticsSummary();
  const { data: records, isLoading: recordsLoading } = usePersonalRecords();
  const [activeRange, setActiveRange] = useState<(typeof RANGES)[number]>("Month");

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Analytics", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white text-3xl font-bold mb-3">Performance Analytics</Text>

        <View className="flex-row gap-1 bg-surface-high rounded-lg p-1 border border-white/10 mb-4 self-start">
          {RANGES.map((range) => (
            <Pressable
              key={range}
              onPress={() => setActiveRange(range)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${range} range`}
              className={`px-3 py-2 rounded ${activeRange === range ? "bg-surface border border-white/10" : ""}`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wide ${
                  activeRange === range ? "text-white" : "text-white/50"
                }`}
              >
                {range}
              </Text>
            </Pressable>
          ))}
        </View>

        {isError ? (
          <View className="items-center py-10">
            <Text className="text-white/70 text-center mb-3">Couldn&apos;t load analytics.</Text>
            <Pressable
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              className="bg-brand-container rounded-lg px-4 py-2"
            >
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
                <StatTile label="Total sessions" value={summary.total_sessions_completed} />
                <StatTile label="Avg duration" value={`${Math.round(summary.avg_session_duration_sec / 60)}m`} />
              </View>
              <View className="flex-row gap-3 mb-3">
                <StatTile label="Current streak" value={`${summary.current_streak_days}d`} />
                <StatTile label="Consistency (4wk)" value={`${summary.consistency_pct_last_4_weeks}%`} />
              </View>
              <View className="flex-row gap-3 mb-4">
                <StatTile label="Avg intensity" value={summary.avg_perceived_intensity?.toFixed(1) ?? "—"} />
                <StatTile label="Round completion" value={`${Math.round(summary.round_completion_rate * 100)}%`} />
              </View>
            </WidgetBoundary>

            <WidgetBoundary label="Sessions chart">
              <Card className="mb-4">
                <Text className="text-white text-lg font-bold mb-4">Training Volume</Text>
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
            <Text className="text-white text-lg font-bold mb-3">Personal Records</Text>
            {recordsLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : records?.length ? (
              records.map((pr, idx) => (
                <View key={idx} className="flex-row justify-between py-2 border-b border-white/5">
                  <Text className="text-white/80 capitalize">{pr.record_type.replace(/_/g, " ")}</Text>
                  <Text className="text-mint font-semibold">{pr.value}</Text>
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
