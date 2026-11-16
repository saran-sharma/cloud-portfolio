# Saran City: world map and environment asset requirements

Status: **assets are not supplied yet.** The current map (`src/city/components/MapArt.tsx`) is a
flat, code-drawn stylized map. It is not a realistic coastal city and is not meant to pass as one.
Nothing below blocks the rest of the site; each item replaces or enriches a specific screen when it
arrives. No stock or AI imagery is used until an asset is explicitly approved.

## What changed in code (no new assets)
- Removed the random pseudo-3D buildings around each district.
- Districts are now flat street-lot zones with a clear plaza under each marker.
- Added a coastline with beach line and coastal boulevard, parks, boats and a compass.
- Added one deliberate landmark cluster per district (docks and cranes, towers, factory,
  research dome, radar dish, headquarters tower with helipad).

## How to read the tables
- **Type:** *Original* = commissioned or self-made artwork you own. *Licensed* = a stock or
  photo asset with a licence that permits web use and modification; the licence must be recorded
  in `docs/asset-licences.md` before it is committed.
- **Format:** WebP or AVIF preferred, with a 2x export for large images. Keep each file under
  about 300 KB (hero images under about 500 KB). All art must be free of Rockstar or other
  third-party game artwork.

## 1. Coastal city aerial / background imagery
| Item | Screen | Size / aspect | Type |
| --- | --- | --- | --- |
| Coastal metropolis aerial, dusk, sea at left and bottom, no readable signage | World map background (behind the SVG routes and markers) | 3000 x 1800 (5:3), plus 1500 x 900 for mobile | Licensed aerial photo, or original illustration |
| Map land/sea mask (land vs water) matching the aerial so routes and zones stay aligned | World map | Same 5:3, transparent PNG or SVG path | Original |
| Mobile map crop, composed for a 4:5 or 1:1 view | World map on phones | 1200 x 1500 | Original crop of the above |

## 2. Skyline and environment imagery
| Item | Screen | Size / aspect | Type |
| --- | --- | --- | --- |
| Sunset skyline panorama (tropical coastal skyline, palms, no logos) | Opening screen background, Recruiter hero background | 3200 x 1200 (8:3) | Licensed photo or original illustration |
| Skyline strip, transparent, silhouette only | Footer and section dividers | 3200 x 400 | Original (vector preferred) |
| Mobile-specific skyline crop | Mobile intro and Recruiter hero | 1200 x 700 | Original crop |

## 3. District-specific environment artwork
One shared lighting direction (low sun from the right, magenta/orange rim light, cyan accents) so
the six districts feel like one city. Each is used as the district page background under a dark
gradient, and as a banner on the map tooltip.

| District | Concept | Screen | Size / aspect | Type |
| --- | --- | --- | --- | --- |
| 01 Data Docks | Industrial waterfront, cranes, container yard, illuminated server halls | District page + banner | 2400 x 1350 (16:9), banner 1200 x 400 | Original or licensed |
| 02 Cloud Heights | Coastal business district, glass towers, infrastructure overlays | District page + banner | 2400 x 1350, banner 1200 x 400 | Original or licensed |
| 03 Automation Works | Technology-driven industrial district, assembly lines, deployment bays | District page + banner | 2400 x 1350, banner 1200 x 400 | Original or licensed |
| 04 Neon AI Labs | Innovation campus, research domes, computing visualizations | District page + banner | 2400 x 1350, banner 1200 x 400 | Original or licensed |
| 05 Operations HQ | Enterprise operations centre, monitoring wall, dashboards (synthetic data only) | District page + banner | 2400 x 1350, banner 1200 x 400 | Original (screens must show fictional data) |
| 06 Saran's Headquarters | Cinematic penthouse office at dusk, room for the portrait and career dossier | District page + banner | 2400 x 1350, banner 1200 x 400 | Original |

Mobile: a 1080 x 1350 (4:5) crop of each, or a safe-area note so it can be cropped in code.

## 4. Map landmarks and route elements
| Item | Screen | Size / aspect | Type |
| --- | --- | --- | --- |
| Landmark icon set, six pictorial landmarks (crane, tower cluster, factory, dome, radar dish, HQ tower) as one consistent SVG family | World map, mini-map | 120 x 120 each, SVG | Original |
| Marker set: default, hover, discovered, completed, locked | World map | 96 x 96, SVG | Original |
| Player marker frame for the character avatar (ring, pointer, shadow) | World map | 128 x 128, SVG | Original |
| Route styling: road base, dashed centre line, bridge and ferry variants | World map | SVG patterns | Original |
| Map decorations: boats, parks, beach line, compass | World map | SVG | Original |

## 5. Lighting and atmospheric assets
| Item | Screen | Size / aspect | Type |
| --- | --- | --- | --- |
| Sun disc and glow, layered for parallax | Opening, Recruiter hero | 1200 x 1200 PNG with alpha | Original |
| Film grain overlay, seamless tile | All full-screen scenes | 512 x 512, tiling | Original or licensed (CC0) |
| Light-leak / lens-flare overlays, 2 to 3 variants | Opening and district intros | 1920 x 1080, alpha | Original |
| Cloud / haze layers for slow parallax | Opening, map | 2400 x 600, alpha | Original |
| Ambient window-light sprite sheet (for the twinkling skyline) | Opening, Recruiter hero | 2048 x 256 | Original |

## 6. Character set (for consistency with the supplied player artwork)
| Item | Screen | Size / aspect | Type |
| --- | --- | --- | --- |
| Player art at higher resolution (the supplied file is 768 x 768) | Intro, profile, Recruiter hero | 1600 x 1600 or 1600 x 2000 | Original (re-export of the approved character) |
| Square badge crop on a simple background | Achievements, map marker | 512 x 512 | Original (from the approved character) |

## Delivery checklist
1. Name files `map-background.webp`, `district-data-docks.webp`, and so on; place them in
   `src/assets/city/`.
2. Provide a licence line for every non-original asset.
3. Confirm no readable brand names, real client names or third-party game artwork appear.
4. Once supplied, the map and district screens switch to them through the existing shared
   image modules; the code-drawn versions stay as fallbacks.
