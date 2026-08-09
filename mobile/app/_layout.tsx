import "../global.css";

import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Slot, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useRegisterPushToken } from "../src/api/hooks";
import { drainQueue } from "../src/lib/offlineQueue";
import { registerForPushNotificationsAsync } from "../src/lib/pushNotifications";
import { useAuthStore } from "../src/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function useDrainQueueOnForegroundAndReconnect() {
  const client = useQueryClient();
  const wasConnected = useRef<boolean | null>(null);

  useEffect(() => {
    const attempt = async () => {
      const { synced } = await drainQueue();
      if (synced > 0) {
        client.invalidateQueries({ queryKey: ["dashboard"] });
        client.invalidateQueries({ queryKey: ["history"] });
        client.invalidateQueries({ queryKey: ["analytics"] });
      }
    };
    attempt();

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") attempt();
    });

    const netInfoSub = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      if (isConnected && wasConnected.current === false) attempt();
      wasConnected.current = isConnected;
    });

    return () => {
      appStateSub.remove();
      netInfoSub();
    };
  }, [client]);
}

function usePushRegistrationOnLogin(token: string | null) {
  const registerPushToken = useRegisterPushToken();

  useEffect(() => {
    if (!token) return;
    registerForPushNotificationsAsync().then((expoPushToken) => {
      if (expoPushToken) registerPushToken.mutate(expoPushToken);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, isHydrated, hydrate } = useAuthStore();
  const pathname = usePathname();
  useDrainQueueOnForegroundAndReconnect();
  usePushRegistrationOnLogin(isHydrated ? token : null);

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
