import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "fightiq_auth_token";
const REFRESH_TOKEN_KEY = "fightiq_refresh_token";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  isHydrated: false,
  hydrate: async () => {
    const [token, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    set({ token, refreshToken, isHydrated: true });
  },
  login: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
    set({ token: accessToken, refreshToken });
  },
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
    set({ token: accessToken, refreshToken });
  },
  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY);
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ token: null, refreshToken: null });
  },
}));
