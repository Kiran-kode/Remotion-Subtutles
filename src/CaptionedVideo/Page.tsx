import React from "react";
import { AbsoluteFill } from "remotion";

export const Page: React.FC<{ page: { text: string } }> = ({ page }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        bottom: 350,
        height: 150,
        display: "flex",
      }}
    >
      <div
        style={{
          fontSize: 80,
          color: "white",
          WebkitTextStroke: "8px black",
          paintOrder: "stroke",
          fontFamily: "sans-serif",
          textTransform: "none",
        }}
      >
        {page.text}
      </div>
    </AbsoluteFill>
  );
};
