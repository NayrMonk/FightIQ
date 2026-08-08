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

const RING_SIZE = 220;
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
      return "WORK";
    case "resting":
      return "REST";
    case "paused":
      return "PAUSED";
    case "done":
      return "COMPLETE";
    default:
      return "";
  }
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

  return (
    <View className="flex-1 bg-background items-center justify-between py-8">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="items-center">
        <Text className="text-white/60 uppercase tracking-widest">{data.session_template.name}</Text>
        <Text className="text-white/40 mt-1">
          Round {snapshot.roundIndex + 1} / {snapshot.totalRounds}
        </Text>
      </View>

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
          <Text className="text-white text-5xl font-bold">{formatTime(snapshot.remainingSec)}</Text>
          <Text className="mt-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ringColor }}>
            {phaseLabel(snapshot.phase)}
          </Text>
        </View>
      </View>

      <View className="w-full px-6 flex-row gap-3">
        <Pressable
          onPress={handlePauseResume}
          className="flex-1 bg-surface border border-white/10 h-14 rounded-full items-center justify-center active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            {snapshot.phase === "paused" ? "Resume" : "Pause"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleEndEarly}
          disabled={finishing}
          className="flex-1 bg-brand-container h-14 rounded-full items-center justify-center active:opacity-80"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            {finishing ? "Saving..." : "End Session"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
