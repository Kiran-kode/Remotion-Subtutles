import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  cancelRender,
  continueRender,
  delayRender,
  getStaticFiles,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  watchStaticFile,
  interpolate,
  useCurrentFrame,
  
} from "remotion";
import { z } from "zod";    
import SubtitlePage from "./SubtitlePage";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "../load-font";
import { NoCaptionFile } from "./NoCaptionFile";

export type SubtitleProp = {
  startInSeconds: number;
  text: string;
};

export const captionedVideoSchema = z.object({
  src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

const getFileExists = (file: string) => {
  const files = getStaticFiles();
  const fileExists = files.find((f) => f.src === file);
  return Boolean(fileExists);
};

export const CaptionedVideo: React.FC<{ src: string }> = ({ src }) => {
  const [subtitles, setSubtitles] = useState<SubtitleProp[] | null>(null); // 🟡 initially null
  const [handle] = useState(() => delayRender("loading subtitles"));
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const subtitlesFile = src
    .replace(/.mp4$/, ".json")
    .replace(/.mkv$/, ".json")
    .replace(/.mov$/, ".json")
    .replace(/.webm$/, ".json");

  const fetchSubtitles = useCallback(async () => {
    try {
      await loadFont();
      const res = await fetch(subtitlesFile);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const data = await res.json();
      setSubtitles(data);
      continueRender(handle);
    } catch (e) {
      console.error(" Error while loading subtitles:", e);
      cancelRender(e);
    }
  }, [handle, subtitlesFile]);

  useEffect(() => {
    fetchSubtitles();

    const c = watchStaticFile(subtitlesFile, () => {
      fetchSubtitles();
    });

    return () => {
      c.cancel();
    };
  }, [fetchSubtitles, subtitlesFile]);

  const pages = useMemo(() => {
    if (!subtitles) return [];
    return subtitles.map((subtitle, idx, arr) => {
      const startMs = subtitle.startInSeconds * 1000;
      const endMs =
        idx < arr.length - 1
          ? arr[idx + 1].startInSeconds * 1000
          : startMs + 1500;
      return {
        startMs,
        endMs,
        text: subtitle.text,
      };
    });
  }, [subtitles]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill>
        <OffthreadVideo
          style={{ objectFit: "cover" }}
          src={src}
        />
        {/* <Audio src={src} /> */}

      </AbsoluteFill>

      {/* Only render subtitle pages if subtitles are loaded */}
      {subtitles &&
        pages.map((page, index) => {
          const subtitleStartFrame = Math.floor((page.startMs / 1000) * fps);
          const subtitleEndFrame = Math.floor((page.endMs / 1000) * fps);
          const durationInFrames = subtitleEndFrame - subtitleStartFrame;

          if (durationInFrames <= 0) {
            return null;
          }

          const enterProgress = interpolate(
            frame,
            [subtitleStartFrame, subtitleStartFrame + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <Sequence
              key={index}
              from={subtitleStartFrame}
              durationInFrames={durationInFrames}
            >
              <SubtitlePage page={page} enterProgress={enterProgress} />
            </Sequence>
          );
        })}

      {!getFileExists(subtitlesFile) && <NoCaptionFile />}
    </AbsoluteFill>
  );
};
