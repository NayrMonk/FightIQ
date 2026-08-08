import "../global.css";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Slot, usePathname } from "expo-router";
import { useEffect } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { retryPendingCompletion } from "../src/lib/offlineQueue";
import { useAuthStore } from "../src/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function useRetryPendingCompletionOnForeground() {
  const client = useQueryClient();
  useEffect(() => {
    const attempt = async () => {
      const synced = await retryPendingCompletion();
      if (synced) {
        client.invalidateQueries({ queryKey: ["dashboard"] });
        client.invalidateQueries({ queryKey: ["history"] });
        client.invalidateQueries({ queryKey: ["analytics"] });
      }
    };
    attempt();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") attempt();
    });
    return () => sub.remove();
  }, [client]);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, isHydrated, hydrate } = useAuthStore();
  const pathname = usePathname();
  useRetryPendingCompletionOnForeground();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return <View className="flex-1 bg-background" />;
  }

  const inAuthGroup = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!token && !inAuthGroup) {
    return <Redirect href="/login" />;
  }
  if (token && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <Slot />
          </AuthGate>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
