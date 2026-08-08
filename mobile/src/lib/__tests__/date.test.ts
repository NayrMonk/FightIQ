import { todayIso } from "../date";

describe("todayIso", () => {
  it("returns an ISO date string (YYYY-MM-DD) matching the system clock", () => {
    const result = todayIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });
});
