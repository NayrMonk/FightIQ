import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../api/client";

const PENDING_KEY = "fightiq_pending_session_result";

interface PendingCompletion {
  userSessionId: number;
  payload: {
    rounds_completed: number;
    total_duration_sec: number;
    perceived_intensity?: number;
    notes?: string;
  };
}

export async function queuePendingCompletion(pending: PendingCompletion) {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export async function retryPendingCompletion(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  if (!raw) return false;

  const pending: PendingCompletion = JSON.parse(raw);
  try {
    await api.post(`/sessions/${pending.userSessionId}/complete`, pending.payload);
    await AsyncStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}
