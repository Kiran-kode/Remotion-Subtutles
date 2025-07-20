import { useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { interpolate } from "remotion";

export const SubtitlePage: React.FC<{
  page: {
    text: string;
    startMs: number;
    endMs: number;
  };
  enterProgress: number;
}> = ({ page, enterProgress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = page.text.split(" ");
  const totalFrames = Math.floor(((page.endMs - page.startMs) / 1000) * fps);
  const wordDuration = totalFrames / words.length;

  return (
    <div
      style={{
        fontSize: 60,
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        padding: "7rem",
        alignItems: "end",
        height: "100%",
        width: "100%",
        gap: 10,
        flexWrap: "nowrap",
        textAlign: "center",
      }}
    >
     {words.map((word, index) => {
  const wordStart = Math.floor(index * wordDuration);
  const wordEnd = Math.floor(wordStart + wordDuration);
  const isActive = frame >= wordStart && frame < wordEnd;

  const appear = interpolate(
    frame,
    [wordStart, wordStart + 5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );


        return (
          <span
      key={index}
      style={{
        padding: "6px 10px",
        backgroundColor: isActive ? "purple" : "transparent",
        color: "white",
        borderRadius: 8,
        opacity: isActive ? appear : 0.8,
        transform: `scale(${isActive ? 0.95 + 0.05 * appear : 0.95})`,
      }}
    >
      {word}
    </span>
        );
      })}
    </div>
  );
};

export default SubtitlePage

