import { describe, expect, it } from "vitest";
import { characterAlt, characterImage, hasCharacterArt } from "@/city/character";
import photo from "@/assets/profilepic.jpeg";

describe("character module", () => {
  it("uses the supplied character artwork and keeps the original photograph separate", () => {
    expect(hasCharacterArt).toBe(true);
    expect(characterImage).toContain("saran-character");
    expect(characterImage).not.toBe(photo);
    expect(photo).toContain("profilepic");
    expect(characterAlt).toBe("Illustrated portrait of Saran S.");
  });
});
