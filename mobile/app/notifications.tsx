import { Stack, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMarkAllNotificationsRead, useNotifications } from "../src/api/hooks";
import type { NotificationResponse } from "../src/types/api";

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

const TYPE_ICON: Record<string, { icon: string; iconColor: string }> = {
  session_reminder: { icon: "⏰", iconColor: "text-brand-container" },
  streak_risk: { icon: "🔥", iconColor: "text-mint" },
  new_activity: { icon: "👥", iconColor: "text-brand-container" },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    const diffMin = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.round(diffMin / 60)}h ago`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toNotificationItem(n: NotificationResponse): NotificationItem {
  const { icon, iconColor } = TYPE_ICON[n.type] ?? { icon: "🔔", iconColor: "text-white/60" };
  const isToday = new Date(n.created_at).toDateString() === new Date().toDateString();
  return {
    id: String(n.id),
    icon,
    iconColor,
    title: n.title,
    body: n.body,
    time: formatTime(n.created_at),
    read: n.read_at !== null,
    group: isToday ? "Today" : "Earlier",
  };
}

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
  const { data } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = (data ?? []).map(toNotificationItem);
  const today = notifications.filter((n) => n.group === "Today");
  const earlier = notifications.filter((n) => n.group === "Earlier");

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
        <Pressable onPress={() => markAllRead.mutate()} accessibilityRole="button" accessibilityLabel="Mark all as read">
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
