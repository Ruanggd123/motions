import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Character } from "../components/Character";
import { KineticText } from "../components/KineticText";
import { springPunch, springSmooth } from "../utils/springs";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const characterEntry = springSmooth(frame, fps);
  const characterY = interpolate(characterEntry, [0, 1], [100, 0]);

  const optionDelay = 25;
  const leftOptionEntry = springPunch(Math.max(0, frame - optionDelay), fps);
  const rightOptionEntry = springPunch(Math.max(0, frame - optionDelay - 8), fps);

  const leftFloat = Math.sin(frame * 0.06) * 8;
  const rightFloat = Math.sin(frame * 0.06 + Math.PI) * 8;

  const fadeOutStart = durationInFrames - 15;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const questionEntry = springPunch(Math.max(0, frame - 10), fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Character centered */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${characterY + 50}px) scale(${characterEntry})`,
          opacity: fadeOut,
        }}
      >
        <Character pose="pointing" scale={0.6} />
      </AbsoluteFill>

      {/* Question text */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 160,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            transform: `scale(${questionEntry})`,
            opacity: questionEntry,
          }}
        >
          <KineticText
            text="Você usaria esse poder..."
            fontSize={46}
            color="#FFFFFF"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      {/* Two options floating */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 400,
          }}
        >
          {/* Option: USAR */}
          <div
            style={{
              padding: "24px 48px",
              backgroundColor: "rgba(16,185,129,0.2)",
              border: "3px solid #10B981",
              borderRadius: 16,
              transform: `scale(${leftOptionEntry}) translateY(${leftFloat}px)`,
              opacity: leftOptionEntry,
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#10B981",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              USAR
            </span>
          </div>

          {/* Option: MEDO */}
          <div
            style={{
              padding: "24px 48px",
              backgroundColor: "rgba(239,68,68,0.2)",
              border: "3px solid #EF4444",
              borderRadius: 16,
              transform: `scale(${rightOptionEntry}) translateY(${rightFloat}px)`,
              opacity: rightOptionEntry,
              boxShadow: "0 0 30px rgba(239,68,68,0.3)",
            }}
          >
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#EF4444",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              MEDO
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Subtitle */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 250,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 50), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 50), fps)})`,
          }}
        >
          <KineticText
            text="Comenta aí 👇"
            fontSize={38}
            color="#A1A1AA"
            delayPerChar={2}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};