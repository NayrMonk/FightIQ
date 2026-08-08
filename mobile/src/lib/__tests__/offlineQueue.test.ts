import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../../api/client";
import { queuePendingCompletion, retryPendingCompletion } from "../offlineQueue";

jest.mock("../../api/client", () => ({
  api: { post: jest.fn() },
}));

describe("offline completion queue", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("returns false and makes no request when nothing is queued", async () => {
    const synced = await retryPendingCompletion();
    expect(synced).toBe(false);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("persists a pending completion and successfully retries it", async () => {
    await queuePendingCompletion({
      userSessionId: 42,
      payload: { rounds_completed: 4, total_duration_sec: 900 },
    });
    (api.post as jest.Mock).mockResolvedValueOnce({});

    const synced = await retryPendingCompletion();

    expect(synced).toBe(true);
    expect(api.post).toHaveBeenCalledWith("/sessions/42/complete", {
      rounds_completed: 4,
      total_duration_sec: 900,
    });

    // A successful retry clears the queue so it isn't resent.
    (api.post as jest.Mock).mockClear();
    const secondAttempt = await retryPendingCompletion();
    expect(secondAttempt).toBe(false);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("keeps the pending completion queued when the retry request fails", async () => {
    await queuePendingCompletion({
      userSessionId: 7,
      payload: { rounds_completed: 2, total_duration_sec: 300 },
    });
    (api.post as jest.Mock).mockRejectedValueOnce(new Error("network down"));

    const synced = await retryPendingCompletion();
    expect(synced).toBe(false);

    (api.post as jest.Mock).mockResolvedValueOnce({});
    const retried = await retryPendingCompletion();
    expect(retried).toBe(true);
  });
});
