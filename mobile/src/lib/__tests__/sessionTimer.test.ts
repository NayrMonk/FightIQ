import { SessionTimer, type TimerPhase } from "../sessionTimer";
import type { Round } from "../../types/api";

function makeRound(overrides: Partial<Round>): Round {
  return {
    id: 1,
    round_number: 1,
    round_type: "work",
    work_duration_sec: 2,
    rest_duration_sec: 1,
    round_exercises: [],
    ...overrides,
  };
}

describe("SessionTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("walks through work -> rest -> work -> done in order, skipping rest after the final round", () => {
    const rounds: Round[] = [
      makeRound({ id: 1, round_number: 1, work_duration_sec: 2, rest_duration_sec: 1 }),
      makeRound({ id: 2, round_number: 2, work_duration_sec: 2, rest_duration_sec: 1 }),
    ];

    const phaseLog: { phase: TimerPhase; roundIndex: number }[] = [];
    const timer = new SessionTimer(rounds, {
      onTick: () => {},
      onPhaseChange: (phase, roundIndex) => phaseLog.push({ phase, roundIndex }),
    });

    timer.start();
    expect(phaseLog).toEqual([{ phase: "working", roundIndex: 0 }]);

    jest.advanceTimersByTime(2000); // round 1 work finishes -> rest
    expect(phaseLog).toEqual([
      { phase: "working", roundIndex: 0 },
      { phase: "resting", roundIndex: 0 },
    ]);

    jest.advanceTimersByTime(1000); // round 1 rest finishes -> round 2 work
    expect(phaseLog).toEqual([
      { phase: "working", roundIndex: 0 },
      { phase: "resting", roundIndex: 0 },
      { phase: "working", roundIndex: 1 },
    ]);

    jest.advanceTimersByTime(2000); // round 2 work finishes -> no rest (last round) -> done
    expect(phaseLog).toEqual([
      { phase: "working", roundIndex: 0 },
      { phase: "resting", roundIndex: 0 },
      { phase: "working", roundIndex: 1 },
      { phase: "done", roundIndex: 1 },
    ]);

    timer.stop();
  });

  it("pause freezes the remaining time and resume continues from where it left off", () => {
    const rounds: Round[] = [makeRound({ work_duration_sec: 10, rest_duration_sec: 0 })];
    const timer = new SessionTimer(rounds, { onTick: () => {}, onPhaseChange: () => {} });

    timer.start();
    jest.advanceTimersByTime(4000);
    timer.pause();

    const pausedSnapshot = timer.getSnapshot();
    expect(pausedSnapshot.phase).toBe("paused");
    expect(pausedSnapshot.remainingSec).toBe(6);

    // Time passing while paused must not eat into the remaining countdown.
    jest.advanceTimersByTime(5000);
    expect(timer.getSnapshot().remainingSec).toBe(6);

    timer.resume();
    expect(timer.getSnapshot().phase).toBe("working");
    expect(timer.getSnapshot().remainingSec).toBe(6);

    timer.stop();
  });
});
