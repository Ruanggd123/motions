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

export const Scene3Goal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ballProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ballPhase = ballProgress < 0.4 ? "forward" : ballProgress < 0.6 ? "reverse" : "goal";

  let ballX: number, ballY: number;
  if (ballPhase === "forward") {
    const p = ballProgress / 0.4;
    ballX = interpolate(p, [0, 1], [-200, 150]);
    ballY = interpolate(p, [0, 0.5, 1], [100, -50, 80]);
  } else if (ballPhase === "reverse") {
    const p = (ballProgress - 0.4) / 0.2;
    ballX = interpolate(p, [0, 1], [150, -100]);
    ballY = interpolate(p, [0, 0.5, 1], [80, -30, 50]);
  } else {
    const p = (ballProgress - 0.6) / 0.4;
    ballX = interpolate(p, [0, 1], [-100, 200]);
    ballY = interpolate(p, [0, 0.3, 1], [50, -80, -20]);
  }

  const ballRotation = frame * 8;
  const ballScale = 1 + Math.sin(frame * 0.1) * 0.05;

  const goalNetWave = ballPhase === "goal"
    ? Math.sin(frame * 0.3) * 15 * interpolate(ballProgress, [0.7, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const characterKick = ballPhase === "goal"
    ? interpolate((ballProgress - 0.6) / 0.15, [0, 0.5, 1], [0, -20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const glowIntensity = ballPhase === "goal"
    ? interpolate(ballProgress, [0.65, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const crowdParticles = Array.from({ length: 20 }, (_, i) => {
    const active = ballPhase === "goal" && ballProgress > 0.75;
    const angle = (i / 20) * Math.PI * 2;
    const dist = active ? 100 + Math.sin(frame * 0.2 + i) * 50 : 0;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist - 100;
    const opacity = active ? 0.6 + Math.sin(frame * 0.15 + i) * 0.3 : 0;
    const colors = ["#FBBF24", "#EF4444", "#3B82F6", "#10B981", "#FFFFFF"];
    return { x, y, opacity, color: colors[i % colors.length], size: 6 + Math.sin(i) * 3, key: i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#16A34A" }}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 200,
        }}
      >
        <div
          style={{
            width: 500,
            height: 250,
            border: "8px solid #FFFFFF",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            position: "relative",
            boxShadow: "0 0 30px rgba(255,255,255,0.2)",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: "absolute",
                left: `${(i + 1) * 12.5}%`,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: "rgba(255,255,255,0.3)",
                transform: `translateX(${goalNetWave * Math.sin(i * 0.5)}px)`,
              }}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: "absolute",
                top: `${(i + 1) * 20}%`,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: "rgba(255,255,255,0.3)",
                transform: `translateY(${goalNetWave * Math.cos(i * 0.7)}px)`,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${ballX}px, ${ballY}px)`,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            transform: `rotate(${ballRotation}deg) scale(${ballScale})`,
            boxShadow: `0 0 ${20 + glowIntensity * 40}px rgba(255,255,255,${0.3 + glowIntensity * 0.5})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "20%",
              width: "25%",
              height: "25%",
              backgroundColor: "#1F2937",
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "15%",
              width: "20%",
              height: "20%",
              backgroundColor: "#1F2937",
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
        </div>
      </AbsoluteFill>

      {crowdParticles.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${p.y}px)`,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(200px) translateX(${characterKick}px) scale(${springSmooth(Math.max(0, frame - 3), fps)})`,
        }}
      >
        <Character pose="idle" scale={0.5} />
      </AbsoluteFill>

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
            transform: `scale(${springPunch(Math.max(0, frame - 10), fps)})`,
          }}
        >
          <KineticText
            text="No jogo, você volta"
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
          paddingTop: 300,
        }}
      >
        <div
          style={{
            opacity: springPunch(Math.max(0, frame - 35), fps),
            transform: `scale(${springPunch(Math.max(0, frame - 35), fps)})`,
          }}
        >
          <KineticText
            text="e marca o gol perdido."
            fontSize={48}
            color="#FDE68A"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>

      {ballPhase === "reverse" && (
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
              height: "100%",
              background: "radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)",
              animation: "none",
              opacity: 0.5 + Math.sin(frame * 0.2) * 0.3,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};