import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Character } from "../components/Character";
import { KineticText, BigNumber } from "../components/KineticText";
import { springPunch, springSmooth, rotateReverse } from "../utils/springs";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const clockRotation = rotateReverse(frame, durationInFrames, -720);
  const clockScale = springPunch(frame, fps);
  const clockOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const characterEntry = springSmooth(Math.max(0, frame - 10), fps);
  const characterY = interpolate(characterEntry, [0, 1], [200, 0]);

  const textEntry = springPunch(Math.max(0, frame - 20), fps);

  const particleCount = 12;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + frame * 0.02;
    const radius = 180 + Math.sin(frame * 0.05 + i) * 30;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const size = 4 + Math.sin(frame * 0.1 + i * 0.5) * 2;
    const opacity = 0.3 + Math.sin(frame * 0.08 + i) * 0.2;
    return { x, y, size, opacity, key: i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0D9488" }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.key}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              opacity: p.opacity,
              transform: `translate(${p.x}px, ${p.y}px)`,
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(-200px)`,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "6px solid rgba(255,255,255,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `rotate(${clockRotation}deg) scale(${clockScale})`,
            opacity: clockOpacity,
            boxShadow:
              "0 0 40px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 70,
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              transformOrigin: "bottom center",
              transform: `translateY(-35px) rotate(${frame * 3}deg)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 50,
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: 2,
              transformOrigin: "bottom center",
              transform: `translateY(-25px) rotate(${-frame * 8}deg)`,
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              position: "absolute",
            }}
          />
          {[...Array(12)].map((_, i) => {
            const tickAngle = (i / 12) * 360;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: i % 3 === 0 ? 4 : 2,
                  height: i % 3 === 0 ? 16 : 10,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 1,
                  transform: `rotate(${tickAngle}deg) translateY(-88px)`,
                  transformOrigin: "center center",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${characterY + 150}px) scale(${characterEntry})`,
        }}
      >
        <Character pose="shocked" scale={0.7} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 300,
        }}
      >
        <div
          style={{
            transform: `scale(${textEntry})`,
            opacity: textEntry,
          }}
        >
          <KineticText
            text="E se você pudesse voltar"
            fontSize={52}
            color="#FFFFFF"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 180,
        }}
      >
        <div
          style={{
            transform: `scale(${springPunch(Math.max(0, frame - 30), fps)})`,
            opacity: springPunch(Math.max(0, frame - 30), fps),
          }}
        >
          <BigNumber value="10s" color="#FFFFFF" size={140} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};