import { useState } from "react";
import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import { characterAlt, characterImage, hasCharacterArt } from "@/city/character";
import { gameIntroVideo, shouldPlayIntroVideo } from "@/city/videos";

interface PortraitProps {
  caption?: string;
  className?: string;
  videoActive?: boolean;
  onVideoEnd?: () => void;
}

/**
 * The player artwork: the illustrated character when src/assets/saran-character.* exists,
 * otherwise the real photograph. When an optional intro video is supplied and eligible,
 * it plays over the stage and crossfades back to the portrait on completion or error.
 */
export const Portrait = ({ caption, className = "", videoActive = false, onVideoEnd }: PortraitProps) => {
  const { ref, interactive, handlers } = usePointerTilt<HTMLElement>();
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = videoActive && gameIntroVideo.hasVideo && !videoFailed && shouldPlayIntroVideo();

  return (
    <figure ref={ref} className={`sc-portrait     ${interactive ? "is-interactive" : ""} ${hasCharacterArt ? "is-art" : ""} ${className}`} {...handlers}>
      <div className="sc-portrait-stage">
        <img src={characterImage} alt={characterAlt} width={1254} height={1254} loading="eager" decoding="async" draggable={false} />
        {showVideo && (
          <video
            className="sc-portrait-video"
            poster={characterImage}
            muted
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
            onEnded={onVideoEnd}
            onError={() => setVideoFailed(true)}
          >
            {gameIntroVideo.webm && <source src={gameIntroVideo.webm} type="video/webm" />}
            {gameIntroVideo.mp4 && <source src={gameIntroVideo.mp4} type="video/mp4" />}
          </video>
        )}
      </div>
      <div className="sc-portrait-grade" aria-hidden="true" />
      <div className="sc-portrait-light" aria-hidden="true" />
      <div className="sc-portrait-sheen" aria-hidden="true" />
      <div className="sc-portrait-hud" aria-hidden="true" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};
