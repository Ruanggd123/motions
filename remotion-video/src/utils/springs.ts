import { spring, interpolate, ExtrapolateType } from "remotion";

export const springPunch = (frame: number, fps: number): number =>
  spring({ frame, fps, config: { damping: 12, mass: 0.5, stiffness: 120 } });

export const springSmooth = (frame: number, fps: number): number =>
  spring({ frame, fps, config: { damping: 20, mass: 1.0, stiffness: 80 } });

export const springCinematic = (frame: number, fps: number): number =>
  spring({ frame, fps, config: { damping: 26, mass: 1.8, stiffness: 60 } });

export const fadeIn = (
  frame: number,
  startFrame: number,
  durationFrames: number
): number =>
  interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeOut = (
  frame: number,
  startFrame: number,
  durationFrames: number
): number =>
  interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const scaleIn = (
  frame: number,
  fps: number,
  delayFrames: number = 0
): number => {
  const adjustedFrame = Math.max(0, frame - delayFrames);
  return springPunch(adjustedFrame, fps);
};

export const slideUp = (
  frame: number,
  fps: number,
  distance: number = 100,
  delayFrames: number = 0
): number => {
  const progress = springSmooth(Math.max(0, frame - delayFrames), fps);
  return interpolate(progress, [0, 1], [distance, 0]);
};

export const rotateReverse = (
  frame: number,
  totalFrames: number,
  maxRotation: number = -720
): number =>
  interpolate(frame, [0, totalFrames], [0, maxRotation], {
    extrapolateRight: "clamp",
  });

export const glitchOffset = (frame: number, intensity: number = 10): number => {
  const seed = frame * 9301 + 49297;
  const pseudoRandom = ((seed % 233280) / 233280) * 2 - 1;
  return pseudoRandom * intensity;
};