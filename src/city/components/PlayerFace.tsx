import profileImage from "@/assets/profilepic.jpeg";

/** Circular crop of the real portrait, centred on the face. Used for the map marker and dossier. */
export const PlayerFace = ({ className = "" }: { className?: string }) => (
  <span className={`sc-face ${className}`} style={{ backgroundImage: `url(${profileImage})` }} role="img" aria-label="Saran S." />
);
