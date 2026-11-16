# Saran Universe: design reference study

First deliverable of the reference-led redesign. **Nothing in the interface has been redesigned
yet.** This study is for review before any visual work starts.

## Limitations (read first)
- **No reference screenshots were captured.** The only inspection tool available was a text
  fetch, and the embedded browser screenshot tool was unreliable earlier in this project. There
  are no screenshot paths to cite. Everything below about layout, typography, colour and image
  treatment on the Rockstar site is therefore **not verified** and is marked as such.
- **GTA VI site (rockstargames.com/VI):** only the server-rendered text was retrieved.
- **Bruno Simon:** text and UI copy retrieved, not the rendered 3D scene.
- **Robby Leonardi:** the fetch failed (network/TLS). Nothing was inspected.
- Rockstar artwork must not be used as production assets. It is an art-direction reference only.

## 1. GTA VI website
**Observed (from retrieved text):**
- The page leads with the release date, platform marks and a single pre-load call to action,
  then a short location-led story block headed "Vice City, USA." with one dense paragraph and
  the title logo. Copy is short, confident and place-first.
- A "Skip to Main Content" link and a "Scroll for more content" cue are present.
- Imagery is served as large responsive JPEGs (up to 3840 px wide), with separate mobile and
  desktop crops, so art direction is done per breakpoint.

**Not verified (needs a real browser pass):** palette, type families, section transitions,
layering, navigation styling, image grading.

**Takeaways to carry over (design principles, not Rockstar assets):**
- One idea per screen, a place-first headline and very little body copy.
- Separate art-directed crops for mobile and desktop rather than shrinking one image.
- A skip link and a scroll cue.

## 2. Bruno Simon
**Observed:** the site is a 3D world you drive through (WASD, Shift, Space, Enter to interact,
M for map). It has an options menu (audio, quality), achievements and a reset, a touch scheme
(one finger drives, two move the camera), a "I'm stuck" escape hatch, and an "Behind the scene"
credits page. Built with Three.js, Rapier physics and Howler audio.

**What makes it interactive:** content is places you travel to; interaction is a single "Enter"
action at a location; there is persistent progress; a map; an escape hatch for stuck users.

**Adapt, do not copy:** the driving mechanic is out. Keep the ideas of places as content,
one-action interaction, achievements, a map, and a visible way out. Three.js is not justified
for Saran Universe (click-to-explore, no physics), so none is proposed.

## 3. Robby Leonardi
**Not inspected (fetch failed).** The brief describes it as a gamified resume where
professional information is discovered by moving through scenes. I will not make observations
beyond that until I can load it. Please share screenshots, or I retry in a real browser.

## 4. Recommended palette (proposal, not extracted from the references)
Drop the current black-neon dashboard base. Warm, sunset-led, with cyan only as an accent:

| Role | Colour |
| --- | --- |
| Night sky | `#1a0f2e` to `#3b1a5a` |
| Dusk violet | `#5a2a7a` |
| Magenta / coral | `#d6336c` / `#ff6b5e` |
| Sunset orange | `#ff8a3d` |
| Golden light | `#ffcf7a` |
| Cyan accent | `#22d3ee` (small areas only) |
| Paper / text | `#fff5ea` on dark, `#1a0f2e` on light |

## 5. Typography direction
Large condensed display for district and title moments (Oswald is already loaded), a calm
humanist sans for reading (DM Sans), and mono only for technical labels. Reduce the repeated
mono kickers that make the current UI feel templated.

## 6. Image treatment
- Photography or properly licensed imagery with a consistent warm grade (sunset gradient map,
  light grain, soft vignette), applied with CSS so the files stay untouched.
- Separate crops per breakpoint.
- SVG only for the map, routes and technical diagrams.
- The character uses real generated artwork, not CSS (see
  [saran-character-prompt.md](./saran-character-prompt.md)).

## 7. World map composition
Replace the abstract polygon city with one coherent coastal-city illustration or photo-based
map: sea at the left and bottom, a waterfront (Data Docks), a downtown skyline (Cloud Heights),
an industrial belt (Automation Works), a campus (Neon AI Labs), an operations centre (Operations
HQ) and a hillside headquarters (Saran's HQ), joined by visible roads. Hotspots are real
buttons with labels, a focus state and a route line from the player.

## 8. Character profile treatment
Large character art on one side, name and role in display type on the other, the role line
`DATA PLATFORM ENGINEER | AI & CLOUD` and `CHENNAI, INDIA`, subtle cursor depth (reuse the
existing tilt hook). Real facts only.

## 9. District navigation
Each district is a full-bleed location banner with a title, a one-line story, mission markers
placed on the scene and project discoveries as labelled hotspots, instead of a uniform card
grid. A persistent "Back to city" control and the existing mini-map stay.

## 10. Recommended experience architecture
Start screen, character introduction, city map, district, mission, achievements, Recruiter
Mode. This is the current flow and it should stay. Game state, missions and Recruiter Mode are
untouched. Only the visual layer and the map and district artwork change.

## Assets needed from you (I will not fill these with stock or random AI images)
1. `saran-character.png`, from the brief in `docs/saran-character-prompt.md`.
2. Environment imagery for six districts and the map backdrop: either licensed photos or
   commissioned or generated art you approve. Tell me the source and licence.
3. Screenshots of the Rockstar and Leonardi sites, or permission to retry in a real browser, so
   the unverified sections above can be completed.

## Comparison (design review before implementation)
| Area | Current problem | Proposed solution |
| --- | --- | --- |
| Opening screen | Generic game intro | Place-first headline and character art, one call to action |
| Player portrait | Photo in a neon frame | Character artwork with a warm grade |
| World map | Abstract SVG city | Coherent coastal map with roads and hotspots |
| Districts | Similar, card-based | Location banners with markers placed on the scene |
| Missions | Dashboard-like panels | Same logic, restyled inside each location |
| Typography | Repetitive mono labels | Display type plus calm sans, fewer labels |
| Imagery | Synthetic SVG graphics | Supplied imagery with a consistent CSS grade |
