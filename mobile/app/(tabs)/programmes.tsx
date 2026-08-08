import { router } from "expo-router";
import { memo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { useProgrammes } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";
import type { ProgrammeSummary } from "../../src/types/api";

const ProgrammeRow = memo(function ProgrammeRow({ item }: { item: ProgrammeSummary }) {
  return (
    <Pressable onPress={() => router.push(`/programme/${item.id}`)}>
      <Card className="mb-3">
        <Text className="text-white text-lg font-bold">{item.name}</Text>
        <Text className="text-white/60 mt-1 capitalize">
          {item.discipline.replace("_", " ")} · {item.level} · {item.duration_weeks} weeks
        </Text>
        {item.description ? (
          <Text className="text-white/50 mt-2" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
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
        <Pressable onPress={() => refetch()} className="bg-brand-container rounded-lg px-4 py-2">
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
        ListEmptyComponent={
          <Card>
            <Text className="text-white/60">No programmes available yet.</Text>
          </Card>
        }
      />
    </WidgetBoundary>
  );
}
