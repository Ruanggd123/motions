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

export const Scene1Coffee: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const cupProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cupY = interpolate(cupProgress, [0, 0.3, 0.6, 1], [0, 300, 150, 0]);
  const cupRotation = interpolate(cupProgress, [0, 0.3, 0.6, 1], [0, 45, -20, 0]);
  const cupX = interpolate(cupProgress, [0, 0.3, 0.6, 1], [0, 80, 40, 0]);

  const liquidLevel = interpolate(cupProgress, [0, 0.3, 0.6, 1], [0.8, 0.2, 0.5, 0.8]);

  const dropCount = 8;
  const drops = Array.from({ length: dropCount }, (_, i) => {
    const dropProgress = interpolate(
      cupProgress,
      [0.2 + i * 0.03, 0.5 + i * 0.03],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const reverseDrop = 1 - dropProgress;
    const x = (i - dropCount / 2) * 20 + Math.sin(i * 1.5) * 15;
    const y = interpolate(reverseDrop, [0, 1], [200, 0]);
    const opacity = reverseDrop * 0.8;
    const size = 6 + Math.sin(i) * 2;
    return { x, y, opacity, size, key: i };
  });

  const characterEntry = springSmooth(Math.max(0, frame - 5), fps);
  const handReach = interpolate(
    cupProgress,
    [0.4, 0.7],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const tableEntry = springPunch(frame, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#EA580C" }}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            width: 800,
            height: 40,
            backgroundColor: "#8B4513",
            borderRadius: "8px 8px 0 0",
            transform: `scaleX(${tableEntry})`,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${cupX}px, ${cupY - 100}px) rotate(${cupRotation}deg)`,
        }}
      >
        <div
          style={{
            width: 80,
            height: 100,
            backgroundColor: "#FFFFFF",
            borderRadius: "8px 8px 20px 20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            border: "3px solid #E5E5E5",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${liquidLevel * 100}%`,
              backgroundColor: "#6F4E37",
              borderRadius: "0 0 17px 17px",
              transition: "height 0.1s",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -25,
              top: 20,
              width: 25,
              height: 40,
              border: "4px solid #E5E5E5",
              borderLeft: "none",
              borderRadius: "0 12px 12px 0",
            }}
          />
        </div>

        {drops.map((d) => (
          <div
            key={d.key}
            style={{
              position: "absolute",
              width: d.size,
              height: d.size * 1.3,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              backgroundColor: "#6F4E37",
              opacity: d.opacity,
              transform: `translate(${d.x}px, ${d.y}px)`,
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateX(${interpolate(handReach, [0, 1], [100, -20])}px) translateY(100px) scale(${characterEntry})`,
        }}
      >
        <Character pose="idle" scale={0.65} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 200,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 15), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 15), fps)})`,
          }}
        >
          <KineticText
            text="Seu café cai da mesa..."
            fontSize={48}
            color="#FFFFFF"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 320,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 40), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 40), fps)})`,
          }}
        >
          <KineticText
            text="e você já está segurando."
            fontSize={48}
            color="#FDE68A"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.15)",
            transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1}) rotate(${-frame * 2}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            transform: `scale(${1 + Math.sin(frame * 0.03) * 0.15}) rotate(${frame * 1.5}deg)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};