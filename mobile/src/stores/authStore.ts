import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "fightiq_auth_token";

interface AuthState {
  token: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isHydrated: false,
  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ token, isHydrated: true });
  },
  login: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token });
  },
  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null });
  },
}));
