import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import { characterAlt, characterImage, hasCharacterArt } from "@/city/character";

/**
 * The player artwork: the illustrated character when src/assets/saran-character.* exists,
 * otherwise the real photograph. Grading sits on top as CSS layers and never alters the file.
 */
export const Portrait = ({ caption, className = "" }: { caption?: string; className?: string }) => {
  const { ref, interactive, handlers } = usePointerTilt<HTMLElement>();
  return (
    <figure ref={ref} className={`sc-portrait     ${interactive ? "is-interactive" : ""} ${hasCharacterArt ? "is-art" : ""} ${className}`} {...handlers}>
      <div className="sc-portrait-stage">
        <img src={characterImage} alt={characterAlt} width={1254} height={1254} loading="eager" decoding="async" draggable={false} />
      </div>
      <div className="sc-portrait-grade" aria-hidden="true" />
      <div className="sc-portrait-light" aria-hidden="true" />
      <div className="sc-portrait-sheen" aria-hidden="true" />
      <div className="sc-portrait-hud" aria-hidden="true" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};
