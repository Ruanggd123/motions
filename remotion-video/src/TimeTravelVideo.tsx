import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { HookScene } from "./scenes/HookScene";
import { Scene1Coffee } from "./scenes/Scene1Coffee";
import { Scene2Street } from "./scenes/Scene2Street";
import { Scene3Goal } from "./scenes/Scene3Goal";
import { Scene4Loop } from "./scenes/Scene4Loop";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { AudioTrack } from "./components/AudioTrack";

// Duração de cada cena em frames (30fps)
const SCENE_DURATIONS = {
  hook: 4 * 30,       // 4s = 120 frames
  coffee: 7 * 30,     // 7s = 210 frames
  street: 7 * 30,     // 7s = 210 frames
  goal: 7 * 30,       // 7s = 210 frames
  loop: 8 * 30,       // 8s = 240 frames
  cta: 5 * 30,        // 5s = 150 frames
};

// Transição entre cenas (overlap em frames)
const TRANSITION_FRAMES = 15; // 0.5s de crossfade

// Offsets acumulados
const OFFSETS = {
  hook: 0,
  coffee: SCENE_DURATIONS.hook - TRANSITION_FRAMES,
  street: SCENE_DURATIONS.hook + SCENE_DURATIONS.coffee - TRANSITION_FRAMES * 2,
  goal: SCENE_DURATIONS.hook + SCENE_DURATIONS.coffee + SCENE_DURATIONS.street - TRANSITION_FRAMES * 3,
  loop: SCENE_DURATIONS.hook + SCENE_DURATIONS.coffee + SCENE_DURATIONS.street + SCENE_DURATIONS.goal - TRANSITION_FRAMES * 4,
  cta: SCENE_DURATIONS.hook + SCENE_DURATIONS.coffee + SCENE_DURATIONS.street + SCENE_DURATIONS.goal + SCENE_DURATIONS.loop - TRANSITION_FRAMES * 5,
};

interface SceneWrapperProps {
  children: React.ReactNode;
  from: number;
  durationInFrames: number;
}

const SceneWrapper: React.FC<SceneWrapperProps> = ({
  children,
  from,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;

  // Fade in nos primeiros TRANSITION_FRAMES
  const fadeIn = interpolate(
    localFrame,
    [0, TRANSITION_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out nos últimos TRANSITION_FRAMES
  const fadeOut = interpolate(
    localFrame,
    [durationInFrames - TRANSITION_FRAMES, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ opacity }}>
        {children}
      </AbsoluteFill>
    </Sequence>
  );
};

export const TimeTravelVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Áudio sincronizado */}
      <AudioTrack />

      {/* Cena 1: Hook — Relógio Reverso */}
      <SceneWrapper from={OFFSETS.hook} durationInFrames={SCENE_DURATIONS.hook}>
        <HookScene />
      </SceneWrapper>

      {/* Cena 2: Café Caindo Reverso */}
      <SceneWrapper from={OFFSETS.coffee} durationInFrames={SCENE_DURATIONS.coffee}>
        <Scene1Coffee />
      </SceneWrapper>

      {/* Cena 3: Rua — Desviar do Carro */}
      <SceneWrapper from={OFFSETS.street} durationInFrames={SCENE_DURATIONS.street}>
        <Scene2Street />
      </SceneWrapper>

      {/* Cena 4: Jogo — Gol Perdido */}
      <SceneWrapper from={OFFSETS.goal} durationInFrames={SCENE_DURATIONS.goal}>
        <Scene3Goal />
      </SceneWrapper>

      {/* Cena 5: Loop Temporal — Glitch */}
      <SceneWrapper from={OFFSETS.loop} durationInFrames={SCENE_DURATIONS.loop}>
        <Scene4Loop />
      </SceneWrapper>

      {/* Cena 6: CTA — Pergunta Final */}
      <SceneWrapper from={OFFSETS.cta} durationInFrames={SCENE_DURATIONS.cta}>
        <Scene5CTA />
      </SceneWrapper>
    </AbsoluteFill>
  );
};