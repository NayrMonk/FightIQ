import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../../api/client";
import { drainQueue, enqueue } from "../offlineQueue";

jest.mock("../../api/client", () => ({
  api: { post: jest.fn() },
}));

const QUEUE_KEY = "fightiq_pending_actions";

describe("offline action queue", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("returns zero counts and makes no request when nothing is queued", async () => {
    const result = await drainQueue();
    expect(result).toEqual({ synced: 0, dropped: 0 });
    expect(api.post).not.toHaveBeenCalled();
  });

  it("persists a pending completion and successfully retries it", async () => {
    await enqueue({
      userSessionId: 42,
      payload: { rounds_completed: 4, total_duration_sec: 900 },
    });
    (api.post as jest.Mock).mockResolvedValueOnce({});

    const result = await drainQueue();

    expect(result).toEqual({ synced: 1, dropped: 0 });
    expect(api.post).toHaveBeenCalledWith("/sessions/42/complete", {
      rounds_completed: 4,
      total_duration_sec: 900,
    });

    // A successful drain clears the queue so it isn't resent.
    (api.post as jest.Mock).mockClear();
    const secondAttempt = await drainQueue();
    expect(secondAttempt).toEqual({ synced: 0, dropped: 0 });
    expect(api.post).not.toHaveBeenCalled();
  });

  it("keeps the pending completion queued when the retry request fails", async () => {
    await enqueue({
      userSessionId: 7,
      payload: { rounds_completed: 2, total_duration_sec: 300 },
    });
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("network down"));

    const result = await drainQueue();
    expect(result).toEqual({ synced: 0, dropped: 0 });

    (api.post as jest.Mock).mockResolvedValueOnce({});
    const retried = await drainQueue();
    expect(retried).toEqual({ synced: 1, dropped: 0 });
  });

  it("queues two items back-to-back without clobbering either", async () => {
    await enqueue({
      userSessionId: 1,
      payload: { rounds_completed: 1, total_duration_sec: 100 },
    });
    await enqueue({
      userSessionId: 2,
      payload: { rounds_completed: 2, total_duration_sec: 200 },
    });

    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const stored = JSON.parse(raw as string);
    expect(stored).toHaveLength(2);
    expect(stored[0].id).not.toEqual(stored[1].id);

    (api.post as jest.Mock).mockResolvedValue({});
    const result = await drainQueue();

    expect(result).toEqual({ synced: 2, dropped: 0 });
    expect(api.post).toHaveBeenCalledWith("/sessions/1/complete", {
      rounds_completed: 1,
      total_duration_sec: 100,
    });
    expect(api.post).toHaveBeenCalledWith("/sessions/2/complete", {
      rounds_completed: 2,
      total_duration_sec: 200,
    });
  });

  it("drops an item after it exceeds 5 failed attempts", async () => {
    await enqueue({
      userSessionId: 99,
      payload: { rounds_completed: 3, total_duration_sec: 500 },
    });
    (api.post as jest.Mock).mockRejectedValue(new Error("network down"));

    let result;
    for (let i = 0; i < 5; i++) {
      result = await drainQueue();
      expect(result).toEqual({ synced: 0, dropped: 0 });
    }

    // 6th failure exceeds the max attempts and the item is dropped.
    result = await drainQueue();
    expect(result).toEqual({ synced: 0, dropped: 1 });

    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const stored = JSON.parse(raw as string);
    expect(stored).toHaveLength(0);

    (api.post as jest.Mock).mockClear();
    const finalDrain = await drainQueue();
    expect(finalDrain).toEqual({ synced: 0, dropped: 0 });
    expect(api.post).not.toHaveBeenCalled();
  });
});
