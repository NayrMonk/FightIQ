import type { Round } from "../types/api";

export type TimerPhase = "idle" | "working" | "resting" | "paused" | "done";

export interface TimerSnapshot {
  phase: TimerPhase;
  roundIndex: number; // index into rounds array
  remainingSec: number;
  totalRounds: number;
}

interface PhaseInfo {
  phase: "working" | "resting";
  roundIndex: number;
  durationSec: number;
}

/**
 * Flattens rounds into a work/rest phase sequence and drives a countdown that is
 * recomputed from wall-clock time (expectedEndTime - now) rather than decremented
 * per tick, so it stays correct across app backgrounding.
 */
export class SessionTimer {
  private rounds: Round[];
  private phases: PhaseInfo[];
  private phaseIndex = 0;
  private phase: TimerPhase = "idle";
  private expectedEndTime = 0;
  private remainingAtPause = 0;
  private onTick: (snapshot: TimerSnapshot) => void;
  private onPhaseChange: (phase: TimerPhase, roundIndex: number) => void;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    rounds: Round[],
    callbacks: {
      onTick: (snapshot: TimerSnapshot) => void;
      onPhaseChange: (phase: TimerPhase, roundIndex: number) => void;
    }
  ) {
    this.rounds = rounds;
    this.onTick = callbacks.onTick;
    this.onPhaseChange = callbacks.onPhaseChange;
    this.phases = rounds.flatMap((round, roundIndex) => {
      const entries: PhaseInfo[] = [{ phase: "working", roundIndex, durationSec: round.work_duration_sec }];
      const isLastRound = roundIndex === rounds.length - 1;
      if (round.rest_duration_sec > 0 && !isLastRound) {
        entries.push({ phase: "resting", roundIndex, durationSec: round.rest_duration_sec });
      }
      return entries;
    });
  }

  start() {
    this.phaseIndex = 0;
    this.beginCurrentPhase();
    this.startTicking();
  }

  pause() {
    if (this.phase !== "working" && this.phase !== "resting") return;
    this.remainingAtPause = Math.max(0, Math.round((this.expectedEndTime - Date.now()) / 1000));
    this.phase = "paused";
    this.stopTicking();
    this.emit();
  }

  resume() {
    if (this.phase !== "paused") return;
    this.phase = this.phases[this.phaseIndex].phase;
    this.expectedEndTime = Date.now() + this.remainingAtPause * 1000;
    this.startTicking();
    this.emit();
  }

  stop() {
    this.stopTicking();
    this.phase = "idle";
  }

  getSnapshot(): TimerSnapshot {
    const remainingSec =
      this.phase === "paused"
        ? this.remainingAtPause
        : Math.max(0, Math.ceil((this.expectedEndTime - Date.now()) / 1000));
    return {
      phase: this.phase,
      roundIndex: this.phases[this.phaseIndex]?.roundIndex ?? 0,
      remainingSec,
      totalRounds: this.rounds.length,
    };
  }

  private beginCurrentPhase() {
    const current = this.phases[this.phaseIndex];
    if (!current) {
      this.phase = "done";
      this.stopTicking();
      this.onPhaseChange("done", this.rounds.length - 1);
      this.emit();
      return;
    }
    this.phase = current.phase;
    this.expectedEndTime = Date.now() + current.durationSec * 1000;
    this.onPhaseChange(current.phase, current.roundIndex);
    this.emit();
  }

  private startTicking() {
    this.stopTicking();
    this.intervalId = setInterval(() => this.tick(), 250);
  }

  private stopTicking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    if (this.phase !== "working" && this.phase !== "resting") return;
    const remaining = this.expectedEndTime - Date.now();
    if (remaining <= 0) {
      this.phaseIndex += 1;
      this.beginCurrentPhase();
      return;
    }
    this.emit();
  }

  private emit() {
    this.onTick(this.getSnapshot());
  }
}
