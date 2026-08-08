import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useSessionTemplate, useStartSession } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { todayIso } from "../../src/lib/date";

export default function SessionPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = Number(id);
  const { data, isLoading } = useSessionTemplate(templateId);
  const startSession = useStartSession();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const userSession = await startSession.mutateAsync({
        session_template_id: templateId,
        scheduled_date: todayIso(),
      });
      router.push(`/session/active/${userSession.id}`);
    } finally {
      setStarting(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: data?.name ?? "Session", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      {isLoading || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF2E4D" />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <Text className="text-white/60 mb-1 capitalize">
              {data.discipline} · {data.estimated_duration_min} min · {data.intensity} intensity
            </Text>
            {data.description ? <Text className="text-white/50 mb-4">{data.description}</Text> : null}

            {data.rounds.map((round) => (
              <Card key={round.id} className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-bold">Round {round.round_number}</Text>
                  <Text className="text-mint text-xs uppercase tracking-wide">
                    {Math.round(round.work_duration_sec / 60)}m work
                    {round.rest_duration_sec > 0 ? ` / ${Math.round(round.rest_duration_sec / 60)}m rest` : ""}
                  </Text>
                </View>
                {round.round_exercises.map((re) => (
                  <View key={re.id} className="mb-1">
                    <Text className="text-white/80">{re.exercise.name}</Text>
                    {re.notes ? <Text className="text-white/50 text-xs">{re.notes}</Text> : null}
                  </View>
                ))}
              </Card>
            ))}
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-white/10">
            <Pressable
              onPress={handleStart}
              disabled={starting}
              accessibilityRole="button"
              accessibilityLabel="Start session"
              accessibilityState={{ disabled: starting, busy: starting }}
              className="bg-brand-container rounded-lg py-4 items-center active:opacity-80"
            >
              <Text className="text-white font-bold uppercase tracking-widest">
                {starting ? "Starting..." : "Start Session"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
