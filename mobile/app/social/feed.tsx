import { Stack } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useFeed } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

const EVENT_LABEL: Record<string, string> = {
  session_completed: "completed a session",
  personal_record: "set a personal record",
};

export default function FeedScreen() {
  const { data: events, isLoading, isError, refetch } = useFeed();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Activity Feed", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white text-3xl font-bold mb-4">Activity Feed</Text>

        {isError ? (
          <View className="items-center py-10">
            <Text className="text-white/70 text-center mb-3">Couldn&apos;t load the feed.</Text>
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
          <>
            <CardSkeleton lines={2} />
            <View className="h-3" />
            <CardSkeleton lines={2} />
          </>
        ) : (
          <WidgetBoundary label="Activity feed">
            {events?.length ? (
              events.map((event) => (
                <Card key={event.id} className="mb-3">
                  <Text className="text-white font-semibold">
                    {event.user.display_name ?? `User #${event.user.id}`}{" "}
                    <Text className="text-white/60 font-normal">{EVENT_LABEL[event.event_type] ?? event.event_type}</Text>
                  </Text>
                  {event.event_type === "session_completed" && (
                    <Text className="text-white/50 text-sm mt-1">
                      {String(event.payload.discipline ?? "")} · {String(event.payload.rounds_completed ?? "")} rounds
                    </Text>
                  )}
                  {event.event_type === "personal_record" && (
                    <Text className="text-mint text-sm mt-1">
                      {String(event.payload.record_type ?? "").replace(/_/g, " ")}: {String(event.payload.value ?? "")}
                    </Text>
                  )}
                  <Text className="text-white/30 text-xs mt-2">{new Date(event.created_at).toLocaleString()}</Text>
                </Card>
              ))
            ) : (
              <Card>
                <Text className="text-white/50">
                  No activity yet. Follow other athletes to see their sessions and records here.
                </Text>
              </Card>
            )}
          </WidgetBoundary>
        )}
      </ScrollView>
    </View>
  );
}
