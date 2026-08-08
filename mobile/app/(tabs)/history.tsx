import { router } from "expo-router";
import { memo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { useHistory } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";
import type { UserSession } from "../../src/types/api";

const HistoryRow = memo(function HistoryRow({ item }: { item: UserSession }) {
  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white font-semibold">{item.session_template.name}</Text>
          <Text className="text-white/50 text-xs mt-0.5">{item.scheduled_date}</Text>
        </View>
        <View className="items-end">
          <Text className="text-mint font-bold">{item.result?.rounds_completed ?? 0} rounds</Text>
          {item.result?.perceived_intensity ? (
            <Text className="text-white/50 text-xs mt-0.5">Intensity {item.result.perceived_intensity}/10</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
});

export default function HistoryScreen() {
  const { data, isLoading, isError, refetch } = useHistory();

  return (
    <View className="flex-1 bg-background">
      <Pressable onPress={() => router.push("/analytics")} className="mx-4 mt-4">
        <Card className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">View Analytics</Text>
          <Text className="text-mint">→</Text>
        </Card>
      </Pressable>

      {isLoading ? (
        <View className="p-4 gap-3">
          <CardSkeleton lines={1} />
          <CardSkeleton lines={1} />
          <CardSkeleton lines={1} />
        </View>
      ) : isError ? (
        <View className="items-center py-10 px-6">
          <Text className="text-white/70 text-center mb-3">Couldn&apos;t load history.</Text>
          <Pressable onPress={() => refetch()} className="bg-brand-container rounded-lg px-4 py-2">
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WidgetBoundary label="History">
          <FlatList
            contentContainerStyle={{ padding: 16 }}
            data={data ?? []}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <HistoryRow item={item} />}
            windowSize={5}
            initialNumToRender={10}
            ListEmptyComponent={
              <Card>
                <Text className="text-white/60">No completed sessions yet.</Text>
              </Card>
            }
          />
        </WidgetBoundary>
      )}
    </View>
  );
}
