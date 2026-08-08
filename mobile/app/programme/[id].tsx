import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useProgramme } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgrammeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useProgramme(Number(id));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: data?.name ?? "Programme", headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      {isLoading || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF2E4D" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="text-white/60 mb-4">{data.description}</Text>

          {data.weeks.map((week) => (
            <View key={week.id} className="mb-6">
              <Text className="text-mint text-xs font-bold uppercase tracking-widest mb-2">
                Week {week.week_number}
              </Text>
              {week.scheduled_sessions.map((scheduled) => (
                <Pressable
                  key={scheduled.id}
                  onPress={() => router.push(`/session/${scheduled.session_template.id}`)}
                >
                  <Card className="mb-2 flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-white/50 text-xs mb-0.5">{DAY_LABELS[scheduled.day_of_week]}</Text>
                      <Text className="text-white font-semibold">{scheduled.session_template.name}</Text>
                      <Text className="text-white/50 text-xs mt-0.5 capitalize">
                        {scheduled.session_template.estimated_duration_min} min · {scheduled.session_template.intensity} intensity
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
