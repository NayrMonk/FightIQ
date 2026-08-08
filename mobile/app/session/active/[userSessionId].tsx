import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useCompleteSession, useUserSessionDetail } from "../../../src/api/hooks";
import { queuePendingCompletion } from "../../../src/lib/offlineQueue";
import {
  playCountdownTick,
  playRestStartCue,
  playRoundStartCue,
  playSessionCompleteCue,
  preloadSessionSounds,
  unloadSessionSounds,
} from "../../../src/lib/sessionCues";
import { SessionTimer, type TimerPhase, type TimerSnapshot } from "../../../src/lib/sessionTimer";
import type { Round } from "../../../src/types/api";

const RING_SIZE = 280;
const RING_STROKE = 10;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function phaseLabel(phase: TimerPhase) {
  switch (phase) {
    case "working":
      return "Work";
    case "resting":
      return "Rest";
    case "paused":
      return "Paused";
    case "done":
      return "Complete";
    default:
      return "";
  }
}

// Derived purely from data already on screen (rounds + current snapshot) -- no new fetching.
function upNextLabel(rounds: Round[], snapshot: TimerSnapshot): string | null {
  const { phase, roundIndex } = snapshot;
  const isLastRound = roundIndex === rounds.length - 1;

  if (phase === "working") {
    const rest = rounds[roundIndex]?.rest_duration_sec ?? 0;
    if (rest > 0 && !isLastRound) return `Rest (${formatTime(rest)})`;
    if (!isLastRound) return `Round ${roundIndex + 2} - Work`;
    return "Finish";
  }
  if (phase === "resting") {
    return isLastRound ? "Finish" : `Round ${roundIndex + 2} - Work`;
  }
  return null;
}

export default function ActiveSessionScreen() {
  const { userSessionId } = useLocalSearchParams<{ userSessionId: string }>();
  const id = Number(userSessionId);
  const { data, isLoading } = useUserSessionDetail(id);
  const completeSession = useCompleteSession();

  const timerRef = useRef<SessionTimer | null>(null);
  const roundsCompletedRef = useRef(0);
  const elapsedSecRef = useRef(0);
  const startedAtRef = useRef(0);
  const lastTickSecondRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<TimerSnapshot | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    preloadSessionSounds();
    return () => {
      unloadSessionSounds();
      timerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!data || timerRef.current) return;

    const startedAt = Date.now();
    startedAtRef.current = startedAt;

    const timer = new SessionTimer(data.session_template.rounds, {
      onTick: (snap) => {
        setSnapshot(snap);
        const second = Math.floor(snap.remainingSec);
        if (
          (snap.phase === "working" || snap.phase === "resting") &&
          second <= 3 &&
          second > 0 &&
          lastTickSecondRef.current !== second
        ) {
          lastTickSecondRef.current = second;
          playCountdownTick();
        }
      },
      onPhaseChange: (phase) => {
        lastTickSecondRef.current = null;
        if (phase === "working") {
          playRoundStartCue();
        } else if (phase === "resting") {
          roundsCompletedRef.current += 1;
          playRestStartCue();
        } else if (phase === "done") {
          roundsCompletedRef.current += 1;
          elapsedSecRef.current = Math.round((Date.now() - startedAt) / 1000);
          playSessionCompleteCue();
          handleFinish(roundsCompletedRef.current);
        }
      },
    });
    timerRef.current = timer;
    timer.start();

    return () => {
      elapsedSecRef.current = Math.round((Date.now() - startedAt) / 1000);
    };
    // handleFinish is intentionally excluded: this effect must build the SessionTimer exactly
    // once when the session template loads, not re-run on every render handleFinish is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function handleFinish(roundsCompleted: number) {
    if (finishing) return;
    setFinishing(true);
    const payload = { rounds_completed: roundsCompleted, total_duration_sec: elapsedSecRef.current };
    try {
      await completeSession.mutateAsync({ userSessionId: id, payload });
      router.replace(`/session/summary/${id}`);
    } catch {
      // Offline or request failed: persist locally and retry next time the app is foregrounded.
      await queuePendingCompletion({ userSessionId: id, payload });
      router.replace("/");
    } finally {
      setFinishing(false);
    }
  }

  function handlePauseResume() {
    if (!timerRef.current || !snapshot) return;
    if (snapshot.phase === "paused") {
      timerRef.current.resume();
    } else {
      timerRef.current.pause();
    }
  }

  function handleEndEarly() {
    timerRef.current?.stop();
    elapsedSecRef.current = Math.round((Date.now() - startedAtRef.current) / 1000);
    handleFinish(roundsCompletedRef.current);
  }

  if (isLoading || !data || !snapshot) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF2E4D" />
      </View>
    );
  }

  const currentRound = data.session_template.rounds[snapshot.roundIndex];
  const phaseDuration =
    snapshot.phase === "working" ? currentRound?.work_duration_sec : currentRound?.rest_duration_sec;
  const progress = phaseDuration ? 1 - snapshot.remainingSec / phaseDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
  const ringColor = snapshot.phase === "resting" ? "#22F2A1" : "#FF2E4D";
  const nextLabel = upNextLabel(data.session_template.rounds, snapshot);
  const isPaused = snapshot.phase === "paused";

  return (
    <View className="flex-1 bg-background justify-between py-8">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 pt-6">
        <Text className="text-white text-2xl font-bold">
          Round {snapshot.roundIndex + 1} of {snapshot.totalRounds}
        </Text>
        <Text className="text-mint mt-1">{data.session_template.name}</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View style={{ width: RING_SIZE, height: RING_SIZE }} className="items-center justify-center">
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#2A2A2B"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={ringColor}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              originX={RING_SIZE / 2}
              originY={RING_SIZE / 2}
            />
          </Svg>
          <View className="absolute items-center">
            <Text
              className="text-6xl font-bold tracking-tighter"
              style={{ color: ringColor, fontVariant: ["tabular-nums"] }}
            >
              {formatTime(snapshot.remainingSec)}
            </Text>
            <Text className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
              {phaseLabel(snapshot.phase)}
            </Text>
          </View>
        </View>

        {nextLabel && (
          <View className="mt-8 flex-row items-center gap-3 bg-surface/50 border border-white/10 rounded-xl px-4 py-3">
            <Ionicons name="timer-outline" size={20} color="rgba(255,255,255,0.6)" />
            <View>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-white/60">Up Next</Text>
              <Text className="text-white">{nextLabel}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" style={{ marginLeft: 8 }} />
          </View>
        )}
      </View>

      <View className="w-full px-6 pb-6 gap-3">
        <Pressable
          onPress={handlePauseResume}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? "Resume" : "Pause"}
          className="flex-row bg-surface border border-white/10 h-14 rounded-full items-center justify-center gap-2 active:opacity-80"
        >
          <Ionicons name={isPaused ? "play" : "pause"} size={18} color="#FFFFFF" />
          <Text className="text-white font-bold uppercase tracking-widest">{isPaused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable
          onPress={handleEndEarly}
          disabled={finishing}
          accessibilityRole="button"
          accessibilityLabel="End session"
          accessibilityState={{ disabled: finishing, busy: finishing }}
          className="flex-row bg-brand-dark h-14 rounded-full items-center justify-center gap-2 active:opacity-80"
        >
          {!finishing && <Ionicons name="stop" size={18} color="#FFFFFF" />}
          <Text className="text-white font-bold uppercase tracking-widest">
            {finishing ? "Saving..." : "End Session"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
