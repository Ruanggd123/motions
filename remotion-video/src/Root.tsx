import React from "react";
import { Composition } from "remotion";
import { TimeTravelVideo } from "./TimeTravelVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TimeTravelVideo"
        component={TimeTravelVideo}
        durationInFrames={30 * 45} // 45 segundos @ 30fps
        fps={30}
        width={1080}
        height={1920} // Vertical 9:16
      />
    </>
  );
};