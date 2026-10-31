import React from "react";
import {
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

export const SFX_TIMING = {
  clockRewind: { startSeconds: 0, duration: 3 },
  coffeeCatch: { startSeconds: 4, duration: 2 },
  carHorn: { startSeconds: 11, duration: 2 },
  goalScore: { startSeconds: 21, duration: 2 },
  glitch: { startSeconds: 26, duration: 4 },
  heartbeat: { startSeconds: 30, duration: 3 },
  chime: { startSeconds: 33, duration: 2 },
};

export const AudioTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSecond = frame / fps;

  // Ducking: música baixa quando narração está ativa (1s-38s)
  const musicVolume = interpolate(
    currentSecond,
    [0, 1, 38, 40],
    [0.4, 0.08, 0.08, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // SFX volumes com fade-in/out suave
  const sfxVolume = (startSec: number, durationSec: number): number => {
    const elapsed = currentSecond - startSec;
    if (elapsed < 0 || elapsed > durationSec) return 0;
    const fadeIn = Math.min(elapsed / 0.1, 1);
    const fadeOut = Math.min((durationSec - elapsed) / 0.1, 1);
    return fadeIn * fadeOut;
  };

  return (
    <>
      {/* Narração principal — volume máximo */}
      <Audio
        src={staticFile("audio/narration.mp3")}
        volume={1}
      />

      {/* Música de fundo com ducking dinâmico */}
      <Audio
        src={staticFile("audio/music.mp3")}
        volume={musicVolume}
      />

      {/* SFX: Relógio reverso */}
      <Audio
        src={staticFile("audio/sfx/clock-rewind.mp3")}
        volume={sfxVolume(SFX_TIMING.clockRewind.startSeconds, SFX_TIMING.clockRewind.duration) * 0.8}
      />

      {/* SFX: Café sendo pego */}
      <Audio
        src={staticFile("audio/sfx/coffee-catch.mp3")}
        volume={sfxVolume(SFX_TIMING.coffeeCatch.startSeconds, SFX_TIMING.coffeeCatch.duration) * 0.85}
      />

      {/* SFX: Buzina do carro */}
      <Audio
        src={staticFile("audio/sfx/car-horn.mp3")}
        volume={sfxVolume(SFX_TIMING.carHorn.startSeconds, SFX_TIMING.carHorn.duration) * 0.9}
      />

      {/* SFX: Gol marcado */}
      <Audio
        src={staticFile("audio/sfx/goal-score.mp3")}
        volume={sfxVolume(SFX_TIMING.goalScore.startSeconds, SFX_TIMING.goalScore.duration) * 0.9}
      />

      {/* SFX: Glitch digital */}
      <Audio
        src={staticFile("audio/sfx/glitch.mp3")}
        volume={sfxVolume(SFX_TIMING.glitch.startSeconds, SFX_TIMING.glitch.duration) * 0.7}
      />

      {/* SFX: Heartbeat */}
      <Audio
        src={staticFile("audio/sfx/heartbeat.mp3")}
        volume={sfxVolume(SFX_TIMING.heartbeat.startSeconds, SFX_TIMING.heartbeat.duration) * 0.6}
      />

      {/* SFX: Chime final */}
      <Audio
        src={staticFile("audio/sfx/chime.mp3")}
        volume={sfxVolume(SFX_TIMING.chime.startSeconds, SFX_TIMING.chime.duration) * 0.5}
      />
    </>
  );
};