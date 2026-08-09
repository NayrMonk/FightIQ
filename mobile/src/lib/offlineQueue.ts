import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../api/client";

const QUEUE_KEY = "fightiq_pending_actions";
const MAX_ATTEMPTS = 5;

interface CompleteSessionPayload {
  userSessionId: number;
  payload: {
    rounds_completed: number;
    total_duration_sec: number;
    perceived_intensity?: number;
    notes?: string;
  };
}

interface QueuedAction {
  id: string;
  type: "complete_session";
  payload: CompleteSessionPayload;
  attempts: number;
  createdAt: string;
}

async function readQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(queue: QueuedAction[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(payload: CompleteSessionPayload) {
  const queue = await readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "complete_session",
    payload,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
  await writeQueue(queue);
}

async function runAction(action: QueuedAction) {
  const { userSessionId, payload } = action.payload;
  await api.post(`/sessions/${userSessionId}/complete`, payload);
}

export async function drainQueue(): Promise<{ synced: number; dropped: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, dropped: 0 };

  const remaining: QueuedAction[] = [];
  let synced = 0;
  let dropped = 0;

  for (const action of queue) {
    try {
      await runAction(action);
      synced += 1;
    } catch {
      const attempts = action.attempts + 1;
      if (attempts > MAX_ATTEMPTS) {
        dropped += 1;
      } else {
        remaining.push({ ...action, attempts });
      }
    }
  }

  await writeQueue(remaining);
  return { synced, dropped };
}
