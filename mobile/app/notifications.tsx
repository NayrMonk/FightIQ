import { Stack, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  group: "Today" | "Earlier";
}

// ponytail: static mock list standing in for a backend feed. Swap for a `useNotifications()`
// query hook (same shape) once a notifications endpoint exists.
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    icon: "🧠",
    iconColor: "text-mint",
    title: "AI Coach",
    body: "New recovery analysis ready based on your last sparring session.",
    time: "10m ago",
    read: false,
    group: "Today",
  },
  {
    id: "2",
    icon: "🥋",
    iconColor: "text-brand-container",
    title: "Training Reminder",
    body: "Boxing Fundamentals today at 5 PM. Don't forget your 16oz gloves.",
    time: "2h ago",
    read: false,
    group: "Today",
  },
  {
    id: "3",
    icon: "🎖️",
    iconColor: "text-mint",
    title: "Achievement",
    body: "12-Day Streak reached! Consistent grind pays off.",
    time: "Yesterday",
    read: true,
    group: "Earlier",
  },
  {
    id: "4",
    icon: "✅",
    iconColor: "text-brand-container",
    title: "New Program",
    body: "Muay Thai Power added to your weekly schedule.",
    time: "Oct 12",
    read: true,
    group: "Earlier",
  },
  {
    id: "5",
    icon: "🔄",
    iconColor: "text-white/60",
    title: "System Update",
    body: "FightIQ v2.4 installed. Enjoy improved round tracking.",
    time: "Oct 10",
    read: true,
    group: "Earlier",
  },
];

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <View className={`bg-surface border border-white/10 rounded-xl p-4 flex-row gap-4 overflow-hidden ${item.read ? "opacity-80" : ""}`}>
      {!item.read && <View className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />}
      <View className="w-12 h-12 rounded-full bg-surface-high items-center justify-center">
        <Text className={item.iconColor}>{item.icon}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white font-bold text-sm">{item.title}</Text>
          <Text className="text-white/50 text-xs">{item.time}</Text>
        </View>
        <Text className="text-white/60 text-sm pr-4">{item.body}</Text>
      </View>
      {!item.read && <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand" />}
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const today = notifications.filter((n) => n.group === "Today");
  const earlier = notifications.filter((n) => n.group === "Earlier");

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-row justify-between items-center px-4 pb-3 border-b border-white/10 bg-background"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-9 h-9 rounded-full border border-white/10 items-center justify-center active:opacity-70"
          >
            <Text className="text-white text-base">‹</Text>
          </Pressable>
          <Text className="text-brand-container text-xl font-bold tracking-tight">Notifications</Text>
        </View>
        <Pressable onPress={handleMarkAllRead} accessibilityRole="button" accessibilityLabel="Mark all as read">
          <Text className="text-mint font-bold text-sm">Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {today.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-2">Today</Text>
            <View className="gap-2">
              {today.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {earlier.length > 0 && (
          <View>
            <Text className="text-white text-lg font-bold mb-2">Earlier</Text>
            <View className="gap-2">
              {earlier.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {notifications.length === 0 && (
          <Text className="text-white/50 text-center mt-10">You&apos;re all caught up.</Text>
        )}
      </ScrollView>
    </View>
  );
}
