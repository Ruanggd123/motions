import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface CharacterProps {
  pose?: "idle" | "shocked" | "pointing" | "running";
  scale?: number;
  x?: number;
  y?: number;
  opacity?: number;
  flipX?: boolean;
}

export const Character: React.FC<CharacterProps> = ({
  pose = "idle",
  scale = 1,
  x = 0,
  y = 0,
  opacity = 1,
  flipX = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const breathe = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [1, 1.015, 1],
    { extrapolateRight: "clamp" }
  );

  const poseOffsetY =
    pose === "shocked"
      ? interpolate(frame % 10, [0, 5, 10], [0, -8, 0])
      : pose === "running"
        ? interpolate(frame % 8, [0, 4, 8], [0, -12, 0])
        : 0;

  const poseScale =
    pose === "shocked"
      ? interpolate(frame % 15, [0, 3, 15], [1, 1.05, 1])
      : 1;

  const finalScale = scale * breathe * poseScale;
  const finalY = y + poseOffsetY;
  const transformX = flipX ? "scaleX(-1)" : "";

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${finalY}px) scale(${finalScale}) ${transformX}`,
        opacity,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile("character-master.png")}
        style={{
          width: 400,
          height: 700,
          objectFit: "contain",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
        }}
      />
    </AbsoluteFill>
  );
};