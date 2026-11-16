# Saran Universe: character artwork brief

**Status: external asset required.** Image generation is not available in the coding
environment, and the character must not be faked with CSS filters, SVG or overlays. Generate
it with an image model that accepts a reference photo, then save it as
`src/assets/saran-character.png`. The original `src/assets/profilepic.jpeg` stays untouched.

Privacy note: the reference photo goes to whichever generation service you choose. Use one you
are comfortable sharing it with.

## Inputs
- Reference image: `src/assets/profilepic.jpeg`
- Output: `saran-character.png` (PNG or WebP, 4:5 portrait, at least 1600 x 2000 px)

## Prompt

```
Create a premium stylized 3D game-character portrait of the man in the reference photo, as the
protagonist of an original, high-end open-world video game. Chest-up, three-quarter view,
facing the camera with a natural, relaxed, slightly confident expression and a subtle smile.

IDENTITY (most important): the character must be immediately recognizable as the same real
person. Keep his exact facial structure, face shape, jawline, nose, eyebrows, eye shape and
spacing, smile, full dark beard and moustache shape, and the earring. Keep his natural curly
black hair exactly as is: the same volume, curl pattern, hairline and shape. Keep his original
warm brown skin tone with natural texture and pores. No beautifying, no skin smoothing, no
slimming, no age change.

STYLE: modern AAA game promotional artwork. High-quality stylized 3D character render with
semi-realistic proportions, detailed expressive eyes with realistic catchlights, individually
readable curls, fabric weave detail, and slightly stylized features that stay faithful to the
real face. Premium rendering quality, subtle subsurface scattering on the skin.

OUTFIT: premium casual streetwear. A dark charcoal-navy technical overshirt or bomber-style
jacket over a plain white or off-white tee or open-collar shirt. Modern, understated and
professional. No weapons, no logos, no criminal-game accessories.

LIGHTING AND BACKGROUND: cinematic golden-hour sunset rim light from camera right in warm
orange, with a soft coral and magenta fill from the left, and a faint electric-cyan accent on
the shadow side. Deep violet dusk sky behind him over a softly blurred tropical coastal city
skyline with palm silhouettes. Shallow depth of field, gentle film grain. Subject isolated and
well lit, with room around the head so it can be cropped square and circular.

AVOID: chibi, childish cartoon, anime, flat vector style, caricature, exaggerated features,
generic AI face, changed hairstyle or hairline, lighter or smoothed skin, extra accessories,
text, watermark, logos.
```

## Optional variants (generate from the same reference, same seed or character lock)
Consistency across the site matters more than variety. If the tool supports character
reference, produce these from the final approved character:

| File | Use | Notes |
| --- | --- | --- |
| `saran-character.png` | Intro, player profile, map marker, district dossier | Required. Face centred in upper third. |
| `saran-character-badge.png` | Achievement artwork | Optional. Square crop, simpler background. |

## Acceptance check before adding it
1. Side by side with the photo, it is recognizably the same person (hairline, beard, nose, eyes).
2. Skin tone matches the photo and is not smoothed or lightened.
3. Hair is the same curly style and volume.
4. No anime or chibi look and no weapons or extra accessories.

## How the site picks it up
[src/city/character.ts](../src/city/character.ts) looks for `src/assets/saran-character.png`
(or `.webp` / `.jpg`). When the file exists, the intro screen, player profile, map marker and
district dossier use it automatically. Until then they use the real photograph. After adding
it, check the face crop on the map marker and tune `object-position` /
`background-position` for `.is-art` in `src/city/city.css` if needed.
