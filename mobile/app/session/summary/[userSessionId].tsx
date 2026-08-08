import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useUserSessionDetail } from "../../../src/api/hooks";
import { api } from "../../../src/api/client";
import { Card } from "../../../src/components/Card";
import { StatTile } from "../../../src/components/StatTile";

export default function SessionSummaryScreen() {
  const { userSessionId } = useLocalSearchParams<{ userSessionId: string }>();
  const id = Number(userSessionId);
  const { data, isLoading, refetch } = useUserSessionDetail(id);
  const [intensity, setIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveIntensity() {
    if (!intensity) return;
    setSaving(true);
    try {
      await api.post(`/sessions/${id}/complete`, {
        rounds_completed: data?.result?.rounds_completed ?? 0,
        total_duration_sec: data?.result?.total_duration_sec ?? 0,
        perceived_intensity: Number(intensity),
        notes: notes || undefined,
      });
      setSaved(true);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF2E4D" />
      </View>
    );
  }

  const minutes = Math.floor((data.result?.total_duration_sec ?? 0) / 60);
  const seconds = (data.result?.total_duration_sec ?? 0) % 60;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Session Complete", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="items-center my-6">
          <Text className="text-mint text-xs font-bold uppercase tracking-widest mb-2">Session Complete</Text>
          <Text className="text-white text-2xl font-bold">{data.session_template.name}</Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <StatTile label="Rounds completed" value={data.result?.rounds_completed ?? 0} />
          <StatTile label="Duration" value={`${minutes}:${String(seconds).padStart(2, "0")}`} />
        </View>

        <Card className="mb-4">
          <Text className="text-white font-semibold mb-3">How intense did that feel? (1-10)</Text>
          <TextInput
            value={intensity}
            onChangeText={setIntensity}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="7"
            placeholderTextColor="#666"
            className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-3"
            accessibilityLabel="Perceived intensity, 1 to 10"
          />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)"
            placeholderTextColor="#666"
            multiline
            className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-3"
            accessibilityLabel="Notes, optional"
          />
          <Pressable
            onPress={handleSaveIntensity}
            disabled={saving || !intensity}
            accessibilityRole="button"
            accessibilityLabel="Save"
            accessibilityState={{ disabled: saving || !intensity, busy: saving }}
            className="bg-brand-container rounded-lg py-3 items-center active:opacity-80"
          >
            <Text className="text-white font-bold uppercase tracking-widest">
              {saved ? "Saved" : saving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </Card>

        <Pressable
          onPress={() => router.replace("/")}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          className="items-center py-3"
        >
          <Text className="text-white/60">Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
