import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useChallenges, useCreateChallenge, useJoinChallenge } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

const METRICS = ["total_sessions", "total_rounds", "streak_days"] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ChallengesScreen() {
  const { data: challenges, isLoading, isError, refetch } = useChallenges();
  const createChallenge = useCreateChallenge();
  const joinChallenge = useJoinChallenge();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("total_sessions");
  const [targetValue, setTargetValue] = useState("10");

  function handleCreate() {
    if (!title.trim()) return;
    createChallenge.mutate(
      {
        title: title.trim(),
        metric,
        target_value: Number(targetValue) || 1,
        start_date: todayIso(),
        end_date: inDaysIso(30),
      },
      {
        onSuccess: () => {
          setTitle("");
          setShowCreate(false);
        },
      }
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Challenges", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-3xl font-bold">Challenges</Text>
          <Pressable
            onPress={() => setShowCreate((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showCreate ? "Cancel new challenge" : "Create a new challenge"}
            className="bg-brand-container rounded-lg px-3 py-2"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">
              {showCreate ? "Cancel" : "+ New"}
            </Text>
          </Pressable>
        </View>

        {showCreate && (
          <Card className="mb-4">
            <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="30-day sessions push"
              placeholderTextColor="#666"
              className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
              accessibilityLabel="Challenge title"
            />

            <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Metric</Text>
            <View className="flex-row gap-2 mb-4">
              {METRICS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMetric(m)}
                  accessibilityRole="button"
                  accessibilityLabel={`Metric ${m.replace(/_/g, " ")}`}
                  className={`px-3 py-2 rounded-lg border ${
                    metric === m ? "bg-surface-high border-mint" : "border-white/10"
                  }`}
                >
                  <Text className={`text-xs ${metric === m ? "text-mint" : "text-white/60"}`}>
                    {m.replace(/_/g, " ")}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Target value</Text>
            <TextInput
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="number-pad"
              className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
              accessibilityLabel="Target value"
            />

            <Pressable
              onPress={handleCreate}
              accessibilityRole="button"
              accessibilityLabel="Create challenge"
              accessibilityState={{ busy: createChallenge.isPending }}
              className="bg-brand-container rounded-lg py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-bold uppercase tracking-widest">
                {createChallenge.isPending ? "Creating..." : "Create Challenge"}
              </Text>
            </Pressable>
            {createChallenge.isError && (
              <Text className="text-brand text-xs mt-2">
                Couldn&apos;t create challenge (coach/admin role required).
              </Text>
            )}
          </Card>
        )}

        {isError ? (
          <View className="items-center py-10">
            <Text className="text-white/70 text-center mb-3">Couldn&apos;t load challenges.</Text>
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
          <CardSkeleton lines={3} />
        ) : (
          <WidgetBoundary label="Challenges list">
            {challenges?.length ? (
              challenges.map((c) => (
                <Card key={c.id} className="mb-3">
                  <Text className="text-white text-lg font-bold">{c.title}</Text>
                  <Text className="text-white/50 text-sm mt-1">
                    {c.metric.replace(/_/g, " ")} · target {c.target_value} · {c.participant_count} joined
                  </Text>
                  <Text className="text-white/30 text-xs mt-1">
                    {c.start_date} – {c.end_date}
                  </Text>
                  <Pressable
                    onPress={() => joinChallenge.mutate(c.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Join ${c.title}`}
                    accessibilityState={{ busy: joinChallenge.isPending }}
                    className="bg-surface-high border border-white/10 rounded-lg py-2 items-center mt-3 active:opacity-80"
                  >
                    <Text className="text-mint font-bold uppercase tracking-widest text-xs">Join</Text>
                  </Pressable>
                </Card>
              ))
            ) : (
              <Card>
                <Text className="text-white/50">No challenges yet.</Text>
              </Card>
            )}
          </WidgetBoundary>
        )}
      </ScrollView>
    </View>
  );
}
