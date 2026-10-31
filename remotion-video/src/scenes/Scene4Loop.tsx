import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Character } from "../components/Character";
import { KineticText } from "../components/KineticText";
import { springPunch, springSmooth, glitchOffset } from "../utils/springs";

export const Scene4Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const glitchIntensity = interpolate(
    frame,
    [0, durationInFrames * 0.3, durationInFrames * 0.7, durationInFrames],
    [0, 5, 15, 25],
    { extrapolateRight: "clamp" }
  );

  const glitchX = glitchOffset(frame, glitchIntensity);
  const glitchY = glitchOffset(frame + 100, glitchIntensity * 0.5);

  const colorShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360],
    { extrapolateRight: "clamp" }
  );

  const duplicateCount = Math.min(
    Math.floor(interpolate(frame, [0, durationInFrames], [0, 4], { extrapolateRight: "clamp" })),
    3
  );

  const duplicates = Array.from({ length: duplicateCount }, (_, i) => {
    const offset = (i + 1) * 80;
    const opacity = 0.3 - i * 0.08;
    const hueRotate = (i + 1) * 120;
    return { offset, opacity, hueRotate, key: i };
  });

  const scanlineOpacity = interpolate(
    frame % 4,
    [0, 2, 4],
    [0.05, 0.12, 0.05]
  );

  const textGlitch = frame > durationInFrames * 0.4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#581C87",
        filter: `hue-rotate(${colorShift * 0.1}deg)`,
      }}
    >
      {/* Scanlines overlay */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,${scanlineOpacity}) 2px,
            rgba(0,0,0,${scanlineOpacity}) 4px
          )`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Glitch bars */}
      {frame % 30 < 3 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 8,
              backgroundColor: "rgba(239,68,68,0.4)",
              top: `${30 + Math.sin(frame * 0.5) * 20}%`,
              transform: `translateX(${glitchX * 3}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 4,
              backgroundColor: "rgba(59,130,246,0.3)",
              top: `${60 + Math.cos(frame * 0.7) * 15}%`,
              transform: `translateX(${-glitchX * 2}px)`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Duplicate characters with offset */}
      {duplicates.map((d) => (
        <AbsoluteFill
          key={d.key}
          style={{
            justifyContent: "center",
            alignItems: "center",
            transform: `translate(${d.offset + glitchX}px, ${glitchY}px)`,
            opacity: d.opacity,
            filter: `hue-rotate(${d.hueRotate}deg)`,
          }}
        >
          <Character pose="shocked" scale={0.55} />
        </AbsoluteFill>
      ))}

      {/* Main character */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${glitchX}px, ${glitchY}px) scale(${springSmooth(Math.max(0, frame - 3), fps)})`,
        }}
      >
        <Character pose="shocked" scale={0.55} />
      </AbsoluteFill>

      {/* Text with glitch effect */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 180,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 10), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 10), fps)}) translateX(${textGlitch ? glitchX * 2 : 0}px)`,
          }}
        >
          <KineticText
            text="Só que toda vez que volta..."
            fontSize={44}
            color={textGlitch ? "#FCA5A5" : "#FFFFFF"}
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 300,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 40), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 40), fps)}) translateX(${textGlitch ? -glitchX * 1.5 : 0}px)`,
          }}
        >
          <KineticText
            text="algo muda sem você perceber."
            fontSize={44}
            color="#C4B5FD"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      {/* Vignette darkening */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${interpolate(frame, [0, durationInFrames], [0, 0.5], { extrapolateRight: "clamp" })}) 100%)`,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    </AbsoluteFill>
  );
};