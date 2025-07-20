import { useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

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
        const wordStart = index * wordDuration;
        const wordEnd = wordStart + wordDuration;
        const isActive = frame >= wordStart && frame < wordEnd;

        return (
          <span
            key={index}
            style={{
              padding: "6px 10px",
              backgroundColor: isActive ? "purple" : "transparent",
              color: isActive ? "white" : "white",
              borderRadius: 8,
              transition: "all 0.1s ease",
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

