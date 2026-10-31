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

export const Scene2Street: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const carProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const carX = interpolate(carProgress, [0, 0.5, 1], [600, 100, -200]);
  const carScale = interpolate(carProgress, [0, 0.5, 1], [0.6, 1, 1.2]);

  const dodgeProgress = interpolate(
    carProgress,
    [0.35, 0.55],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const characterDodgeX = interpolate(dodgeProgress, [0, 0.5, 1], [0, -120, -80]);
  const characterDodgeY = interpolate(dodgeProgress, [0, 0.3, 0.6, 1], [0, -60, -30, 0]);
  const characterRotation = interpolate(dodgeProgress, [0, 0.5, 1], [0, -15, -5]);

  const hornTriggered = carProgress > 0.45 && carProgress < 0.55;
  const hornScale = hornTriggered
    ? 1 + Math.sin(frame * 0.8) * 0.15
    : 0;

  const trailCount = 5;
  const trails = Array.from({ length: trailCount }, (_, i) => {
    const trailOpacity = interpolate(
      dodgeProgress,
      [0.2, 0.8],
      [0, 0.3 - i * 0.05],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const trailX = characterDodgeX + i * 25;
    return { opacity: trailOpacity, x: trailX, key: i };
  });

  const roadLineOffset = (frame * 8) % 200;

  return (
    <AbsoluteFill style={{ backgroundColor: "#6B7280" }}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 300,
            backgroundColor: "#374151",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: i * 200 - roadLineOffset,
                width: 100,
                height: 8,
                backgroundColor: "#FBBF24",
                borderRadius: 4,
                transform: "translateY(-50%)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${carX}px, 50px) scale(${carScale})`,
        }}
      >
        <div
          style={{
            width: 280,
            height: 120,
            backgroundColor: "#EF4444",
            borderRadius: "20px 60px 10px 10px",
            position: "relative",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 40,
              width: 100,
              height: 50,
              backgroundColor: "rgba(135,206,250,0.6)",
              borderRadius: "10px 30px 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -15,
              left: 30,
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#1F2937",
              border: "4px solid #6B7280",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -15,
              right: 30,
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#1F2937",
              border: "4px solid #6B7280",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 30,
              left: -10,
              width: 20,
              height: 15,
              backgroundColor: "#FBBF24",
              borderRadius: "4px 0 0 4px",
              boxShadow: hornTriggered ? "0 0 20px #FBBF24" : "none",
            }}
          />
        </div>

        {hornTriggered && (
          <div
            style={{
              position: "absolute",
              left: -80,
              top: -40,
              fontSize: 48,
              transform: `scale(${hornScale})`,
              opacity: hornScale,
            }}
          >
            🔊
          </div>
        )}
      </AbsoluteFill>

      {trails.map((t) => (
        <AbsoluteFill
          key={t.key}
          style={{
            justifyContent: "center",
            alignItems: "center",
            transform: `translate(${t.x + 50}px, ${characterDodgeY + 80}px) rotate(${characterRotation}deg)`,
            opacity: t.opacity,
          }}
        >
          <Character pose="running" scale={0.55} />
        </AbsoluteFill>
      ))}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${characterDodgeX + 50}px, ${characterDodgeY + 80}px) rotate(${characterRotation}deg) scale(${springSmooth(Math.max(0, frame - 3), fps)})`,
        }}
      >
        <Character pose="running" scale={0.55} />
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
            text="Na rua, você desvia"
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
            text="antes dele buzinar."
            fontSize={48}
            color="#FCA5A5"
            delayPerChar={1.5}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};