import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useProfile, useUpdateProfile } from "../../src/api/hooks";
import { Card } from "../../src/components/Card";
import { CardSkeleton } from "../../src/components/Skeleton";
import { WidgetBoundary } from "../../src/components/WidgetBoundary";
import { useAuthStore } from "../../src/stores/authStore";

export default function ProfileScreen() {
  const { data, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const logout = useAuthStore((s) => s.logout);

  const [displayName, setDisplayName] = useState("");
  const [primaryDiscipline, setPrimaryDiscipline] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Syncs async-loaded server data into locally-editable form fields once it arrives;
  // there's no render-time source of truth to derive these from since the fields are
  // user-editable afterward.
  useEffect(() => {
    if (data) {
      setDisplayName(data.display_name ?? "");
      setPrimaryDiscipline(data.primary_discipline ?? "");
      setExperienceLevel(data.experience_level ?? "");
    }
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        <CardSkeleton lines={4} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-white/70 text-center mb-3">Couldn&apos;t load your profile.</Text>
        <Pressable
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          className="bg-brand-container rounded-lg px-4 py-2"
        >
          <Text className="text-white font-bold uppercase tracking-widest text-xs">Retry</Text>
        </Pressable>
      </View>
    );
  }

  function handleSave() {
    updateProfile.mutate({
      display_name: displayName || null,
      primary_discipline: primaryDiscipline || null,
      experience_level: experienceLevel || null,
    });
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <WidgetBoundary label="Profile form">
      <Card className="mb-4">
        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
          placeholderTextColor="#666"
          accessibilityLabel="Display name"
        />

        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Primary Discipline</Text>
        <TextInput
          value={primaryDiscipline}
          onChangeText={setPrimaryDiscipline}
          placeholder="boxing, mma, muay_thai..."
          className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
          placeholderTextColor="#666"
          accessibilityLabel="Primary discipline"
        />

        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">Experience Level</Text>
        <TextInput
          value={experienceLevel}
          onChangeText={setExperienceLevel}
          placeholder="beginner, intermediate, advanced"
          className="bg-background border border-white/10 text-white rounded-lg px-4 py-3 mb-2"
          placeholderTextColor="#666"
          accessibilityLabel="Experience level"
        />

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
          accessibilityState={{ busy: updateProfile.isPending }}
          className="bg-brand-container rounded-lg py-3 items-center mt-4 active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Text>
        </Pressable>
      </Card>
      </WidgetBoundary>

      <Pressable
        onPress={() => router.push("/settings")}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        className="bg-surface border border-white/10 rounded-lg px-4 py-3 flex-row justify-between items-center mb-4 active:opacity-80"
      >
        <Text className="text-white font-semibold">Settings</Text>
        <Text className="text-white/40">›</Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        className="items-center py-3"
      >
        <Text className="text-brand font-semibold">Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}
