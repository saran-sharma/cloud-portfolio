import { characterImage, hasCharacterArt } from "@/city/character";

/** Circular crop of the player artwork, centred on the face. Used for the map marker and dossier. */
export const PlayerFace = ({ className = "" }: { className?: string }) => (
  <span className={`sc-face ${hasCharacterArt ? "is-art" : ""} ${className}`} style={{ backgroundImage: `url(${characterImage})` }} role="img" aria-label="Saran S." />
);
