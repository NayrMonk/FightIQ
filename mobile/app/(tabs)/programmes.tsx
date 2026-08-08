import { router } from "expo-router";
import { memo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { useProgrammes } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";
import type { ProgrammeSummary } from "../../src/types/api";

function levelBadgeClass(level: string) {
  switch (level.toLowerCase()) {
    case "beginner":
      return "text-mint";
    case "advanced":
      return "text-brand";
    default:
      return "text-brand-container";
  }
}

const ProgrammeRow = memo(function ProgrammeRow({ item }: { item: ProgrammeSummary }) {
  return (
    <Pressable
      onPress={() => router.push(`/programme/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.level}, ${item.duration_weeks} weeks`}
    >
      <Card className="mb-3">
        <View className="flex-row items-center gap-2 mb-3">
          <Text className={`px-2 py-1 rounded bg-surface-high text-xs font-bold uppercase tracking-widest ${levelBadgeClass(item.level)}`}>
            {item.level}
          </Text>
          <Text className="px-2 py-1 rounded bg-surface-high text-xs font-bold uppercase tracking-widest text-white/60">
            {item.duration_weeks} weeks
          </Text>
        </View>
        <Text className="text-white text-lg font-bold">{item.name}</Text>
        {item.description ? (
          <Text className="text-white/50 mt-1" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between border-t border-white/10 mt-3 pt-3">
          <Text className="text-white/70 font-semibold capitalize">{item.discipline.replace("_", " ")}</Text>
          <View className="w-8 h-8 rounded-full bg-brand-container items-center justify-center">
            <Text className="text-white font-bold">→</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

export default function ProgrammesScreen() {
  const { data, isLoading, isError, refetch } = useProgrammes();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4 gap-3">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={2} />
        <CardSkeleton lines={2} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-white/70 text-center mb-3">Couldn&apos;t load programmes.</Text>
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

  return (
    <WidgetBoundary label="Programmes">
      <FlatList
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProgrammeRow item={item} />}
        windowSize={5}
        initialNumToRender={8}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-white text-3xl font-bold">Training Programs</Text>
            <Text className="text-white/60 mt-1">Select your next combat discipline and focus block.</Text>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text className="text-white/60">No programmes available yet.</Text>
          </Card>
        }
      />
    </WidgetBoundary>
  );
}
