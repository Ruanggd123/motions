import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { springPunch, springSmooth } from "../utils/springs";

interface KineticTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  delayPerChar?: number;
  startY?: number;
  style?: React.CSSProperties;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize = 64,
  color = "#FFFFFF",
  fontWeight = 800,
  delayPerChar = 2,
  startY = 40,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 4px",
        ...style,
      }}
    >
      {text.split("").map((char, i) => {
        const charDelay = i * delayPerChar;
        const progress = springPunch(Math.max(0, frame - charDelay), fps);
        const yOffset = interpolate(progress, [0, 1], [startY, 0]);
        const scale = interpolate(progress, [0, 1], [0.5, 1]);
        const charOpacity = interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]);

        return (
          <span
            key={`${i}-${char}`}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              letterSpacing: "-0.03em",
              transform: `translateY(${yOffset}px) scale(${scale})`,
              opacity: charOpacity,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              minWidth: char === " " ? "0.3em" : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

interface BigNumberProps {
  value: string;
  color?: string;
  size?: number;
  pulseIntensity?: number;
}

export const BigNumber: React.FC<BigNumberProps> = ({
  value,
  color = "#0D9488",
  size = 180,
  pulseIntensity = 0.08,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryScale = springPunch(frame, fps);
  const pulse =
    1 +
    Math.sin(frame * 0.15) * pulseIntensity * springSmooth(frame, fps);

  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        letterSpacing: "-0.05em",
        transform: `scale(${entryScale * pulse})`,
        textShadow: `0 0 40px ${color}66, 0 4px 20px rgba(0,0,0,0.5)`,
        textAlign: "center",
      }}
    >
      {value}
    </div>
  );
};