import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

// ponytail: bell.wav/beep.wav are generated sine-tone placeholders, swap for real cue recordings when available.
let bellPlayer: AudioPlayer | null = null;
let beepPlayer: AudioPlayer | null = null;

export function preloadSessionSounds() {
  bellPlayer = createAudioPlayer(require("../../assets/sounds/bell.wav"));
  beepPlayer = createAudioPlayer(require("../../assets/sounds/beep.wav"));
}

export function unloadSessionSounds() {
  bellPlayer?.remove();
  beepPlayer?.remove();
  bellPlayer = null;
  beepPlayer = null;
}

function replay(player: AudioPlayer | null) {
  if (!player) return;
  player.seekTo(0);
  player.play();
}

export async function playRoundStartCue() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  replay(bellPlayer);
}

export async function playRestStartCue() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  replay(bellPlayer);
}

export async function playCountdownTick() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  replay(beepPlayer);
}

export async function playSessionCompleteCue() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  replay(bellPlayer);
}
