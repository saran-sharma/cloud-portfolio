import photo from "@/assets/profilepic.jpeg";

// Picks up src/assets/saran-character.{png,webp,jpg} when it is added. Until then the
// real photograph is used, so the build never depends on a missing file.
const art = import.meta.glob("/src/assets/saran-character.{png,webp,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const artUrl = Object.values(art)[0];

export const hasCharacterArt = Boolean(artUrl);
export const characterImage: string = artUrl ?? photo;
export const characterAlt = hasCharacterArt ? "Illustrated portrait of Saran S." : "Portrait of Saran S.";
