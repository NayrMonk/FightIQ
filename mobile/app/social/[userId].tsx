import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useFollowers, useFollowing, useFollowUser, useUnfollowUser } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const id = Number(userId);

  const { data: following, isLoading: followingLoading } = useFollowing();
  const { data: followers, isLoading: followersLoading } = useFollowers();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isLoading = followingLoading || followersLoading;
  // ponytail: no GET /social/users/{id} endpoint exists — the summary comes from whichever
  // list (followers/following) the user was reached through. Falls back to a bare id label.
  const summary = following?.find((u) => u.id === id) ?? followers?.find((u) => u.id === id);
  const isFollowing = !!following?.find((u) => u.id === id);
  const label = summary?.display_name ?? `User #${id}`;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: label, headerStyle: { backgroundColor: "#0A0A0B" }, headerTintColor: "#fff" }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <CardSkeleton lines={2} />
        ) : (
          <WidgetBoundary label="User profile">
            <Card className="items-center py-6">
              <Text className="text-white text-2xl font-bold">{label}</Text>

              <Pressable
                onPress={() =>
                  isFollowing ? unfollowUser.mutate(id) : followUser.mutate(id)
                }
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? `Unfollow ${label}` : `Follow ${label}`}
                accessibilityState={{ busy: followUser.isPending || unfollowUser.isPending }}
                className={`rounded-lg px-6 py-3 mt-4 active:opacity-80 ${
                  isFollowing ? "bg-surface-high border border-white/10" : "bg-brand-container"
                }`}
              >
                <Text className={`font-bold uppercase tracking-widest text-xs ${isFollowing ? "text-white/70" : "text-white"}`}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </Pressable>
            </Card>
          </WidgetBoundary>
        )}
      </ScrollView>
    </View>
  );
}
