import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import profileImage from "@/assets/profilepic.jpeg";

/**
 * The real portrait with a cinematic grade built from CSS layers only.
 * The photograph is never altered: grading sits on top and the face stays natural.
 */
export const Portrait = ({ caption, className = "" }: { caption?: string; className?: string }) => {
  const { ref, interactive, handlers } = usePointerTilt<HTMLElement>();
  return (
    <figure ref={ref} className={`sc-portrait ${interactive ? "is-interactive" : ""} ${className}`} {...handlers}>
      <div className="sc-portrait-stage">
        <img src={profileImage} alt="Portrait of Saran S." width={1254} height={1254} loading="eager" decoding="async" draggable={false} />
      </div>
      <div className="sc-portrait-grade" aria-hidden="true" />
      <div className="sc-portrait-light" aria-hidden="true" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};
