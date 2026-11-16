# Saran Universe

> *Every system has a story. Explore mine.*

**Live:** [saran-cloud-portfolio.vercel.app](https://saran-cloud-portfolio.vercel.app/)

Most portfolios are a list of buzzwords with a headshot. This one is a small universe you can
walk around in.

I'm **Saran S.**, a Data Platform Engineer (AI & Cloud) from Chennai, India. I build data
platforms on Azure, Databricks and Microsoft Fabric, and I automate the parts that slow them
down. This site is where that work lives, told two ways:

| | **Saran Universe** (game mode) | **Recruiter Mode** |
| --- | --- | --- |
| **For** | Curious people with five minutes | People with a shortlist and a deadline |
| **Feels like** | An open-world intro, a map, districts, missions | A clean, fast, conventional portfolio |
| **You get** | XP, badges, interactive engineering missions | Experience, skills, case studies, resume, contact form |
| **Get there** | Default. Open the site | Header button, intro menu, or `/?mode=recruiter` |

Same content, same palette, same character. Only the pace changes. You can hop between the two
at any time and the site remembers where you were.

---

## A quick tour

1. **The opening.** A short cinematic, then a menu: *Start your journey*, *Enter Saran
   Universe*, *Recruiter Mode*, *Download resume*. Skip it any time. Replay it if you liked it.
2. **The player profile.** Meet the protagonist (that's me, illustrated).
3. **The map.** Six districts, each home to real portfolio projects:
   - **Data Docks:** *Where data comes ashore.*
   - **Cloud Heights:** *The platform above the platform.*
   - **Automation Works:** *If it repeats, it ships itself.*
   - **Neon AI Labs:** *Intelligence, with a human in the loop.*
   - **Operations HQ:** *See the platform. Then ask why.*
   - **Saran's Headquarters:** *The engineer behind the universe.* The dossier, resume and contact.
4. **The missions.** Six small simulations (a data pipeline, a cost review, an incident
   investigation, a storage assessment, a PIM workflow, an MCP request). They use made-up,
   synthetic data only. They show *how I think*, not anything from a client.
5. **Case studies.** Every project opens a write-up of what the work was and what I did.

XP and badges only measure how much of the site you've explored. They are not a skill rating.
(Please don't read "Level 7" as an assessment of my Spark.)

---

## The honesty clause

Portfolios tend to inflate. This one has rules:

- Case studies say what the work was and what **I** did. Outcomes appear only where my resume
  supports them.
- No invented screenshots, metrics, savings or production claims.
- Internal names, identifiers, tenants, endpoints and financial data are left out.
- Open questions live in [docs/content-todo.md](docs/content-todo.md) (not shown on the site).
  Known one: my resume still says "Senior Cloud & DevOps Engineer" while the site says
  "Data Platform Engineer | AI & Cloud". `public/resume.pdf` is the older resume. Both are my
  call to make.

Content lives in [src/data/portfolio.ts](src/data/portfolio.ts). Project diagrams are native HTML
and CSS in [ProjectVisual.tsx](src/components/ProjectVisual.tsx), so they stay readable on a
phone.

---

## The look

Deep navy sky, sunset magenta and orange, electric cyan for anything you can act on. Oswald for
headlines, DM Sans for reading, IBM Plex Mono for small technical labels. One dark theme, shared
by both modes, so switching never feels like changing websites. Colour tokens come from
[city.css](src/city/city.css); Recruiter Mode restyles on top in
[recruiter.css](src/city/recruiter.css) without touching the content components.

Everything is original art direction in code. The skyline is SVG, the sun is CSS, and the map is
a flat, hand-drawn city plan. It is deliberately not a photorealistic coastline (see
[docs/saran-city-asset-requirements.md](docs/saran-city-asset-requirements.md) for what would
take it there).

### The protagonist

The stylized character in [src/assets/saran-character.png](src/assets/saran-character.png) was
supplied by me and is used unmodified. It appears on the opening screen, player profile, map
marker, district dossier and the Recruiter Mode hero, all through one module,
[character.ts](src/city/character.ts). Crops are tuned separately for big portraits and small
circular avatars.

The original photo, [profilepic.jpeg](src/assets/profilepic.jpeg), is never touched and acts as
the fallback: delete the character file and every screen quietly falls back to the photo.

Honest caveat: the source image is 768px square, so large hero portraits are upscaled. A ~1600px
export would look sharper.

### Motion (all code, no fake video)

**Saran Universe**

- Character entrance, slow idle float, faint breathing, an occasional rim-light sheen, and a brief
  HUD lock-on frame during the opening.
- The sun and skyline drift against your pointer
  ([use-sky-parallax.ts](src/city/hooks/use-sky-parallax.ts)), and skyline windows twinkle.
- **Replay intro** re-runs the entrance on demand (the video clip when allowed, otherwise the code
  intro). It never replays by itself.

**Recruiter Mode scroll experience** (inspired by the cinematic scroll pacing of
[Rockstar's GTA VI page](https://www.rockstargames.com/VI) and the playful world of
[Bruno Simon's portfolio](https://bruno-simon.com/); patterns re-implemented from scratch, nothing
copied)

- **A day in one scroll.** The hero is a sunrise: the sun climbs from behind the skyline on load.
  As you scroll, a fixed backdrop ([ScrollSky.tsx](src/components/ScrollSky.tsx)) moves through
  morning and daylight (a sun arcs across the right margin), then dusk, and ends in night with two
  star layers, a moon and a dim skyline. The last sections of the page are fully night. On phones
  the sun and moon are hidden to keep headings clear; the colour shift still happens.
- **Hero.** The sun sets lower and the copy drifts up faster than the page as you scroll away.
- **Saran Universe card** ([ScrollFilm.tsx](src/components/ScrollFilm.tsx), [film-frames.ts](src/components/film-frames.ts)):
  a framed cinematic card between Credentials and Contact that invites the visitor into the game ("Explore the
  work as a world", with an Enter Saran Universe button). As the card passes through the viewport a canvas blends
  between 36 frames taken from the opening clip, so the clip plays with the scroll and rewinds when you scroll
  back. The page keeps scrolling normally; nothing is pinned. The frames
  (`public/videos/scroll/frame-001.webp` to `frame-036.webp`, 1024px wide, about 1.6 MB in total) are stills from
  the clip, so this is the same footage and not a new video. They are requested only when the card is within
  about two screens (first, middle and last frames first), so opening Recruiter Mode downloads none of them.
  Reduced motion, Save-Data, phones and any load failure show the clip's final frame instead, with the same
  text and button. If the clip is ever replaced, re-extract the frames and the home still from it.
- **Network backdrop in the hero** ([NetworkBackdrop.tsx](src/components/NetworkBackdrop.tsx),
  [network-scene.ts](src/components/network-scene.ts)): a canvas of slowly drifting nodes, thin cobalt
  and cyan links, hexagon-outlined "service" nodes, a faint golden reflection from the horizon and
  small data particles that slide along the links. It is deliberately thin where the headline, copy and
  buttons sit, fades out toward the skyline, and runs at about 24 fps. It pauses when the hero is
  off screen or the tab is hidden, and with `prefers-reduced-motion` draws one still frame. It is
  code, not a video, and it is replaced by the optional Recruiter video clip if one is ever added.
- **Progress bar** across the top of the page, and **chapter numbers** (01 to 06) that drift behind
  each heading while the section rule draws itself in.
- **Rise-in reveals.** Panels fade up, their contents follow one after another, and project
  diagrams slide in from the side with a light parallax.
- **Technology ribbon** ([TechMarquee.tsx](src/components/TechMarquee.tsx)): two rows slide in
  opposite directions as it scrolls past. Names come from the Toolkit data, so nothing is invented.
- **Experience timeline** whose line fills and nodes light up as you reach them, **Toolkit chips**
  that pop in, and a **cursor spotlight** on panels (mouse only).
- All of it is driven by CSS variables written by
  [use-scroll-effects.ts](src/hooks/use-scroll-effects.ts), one `requestAnimationFrame`-throttled
  scroll listener that writes only to small subtrees and animates only `transform` and `opacity`.
  In a headless Edge run, scrolling the full page held a 17ms median frame time at 1440px.

**Everywhere:** `prefers-reduced-motion` turns the idle, twinkle, parallax, cinematic and all scroll
effects off (the page renders static, the ribbon wraps, the progress bar is hidden). Touch devices
and screens under 768px skip the pointer effects too.

### Intro videos

**Saran Universe opening (included).** [public/videos/saran-universe-intro.mp4](public/videos/saran-universe-intro.mp4)
is a character entrance clip I generated externally with the owner-supplied character art as the
reference (1280x720, about 8 s, silent use only). It plays as a full-bleed layer *behind* the game
interface, cropped with `object-fit: cover` so there are no black side areas, then dissolves into the
title and menu. Its poster, `saran-universe-intro-poster.jpg`, is simply the clip's first frame.

- Muted, `playsInline`, `autoplay`, never with sound. It is requested only when the game opening
  mounts, so Recruiter Mode never downloads it (the file is in `public/`, never bundled).
- **Skip intro** (button, or any key) and **Replay intro** (on the menu). It plays once on a first
  visit and is remembered as seen once playback actually starts, so reloads and later navigation do
  not replay it.
- **Fallback is the existing code-based intro** (sunset sky, skyline and the animated character art)
  whenever the clip is not wanted or cannot play: `prefers-reduced-motion` (fully static, no Skip or
  Replay), Save-Data, screens under 768px, a missing or broken file, a browser that refuses
  autoplay, or playback that has not started after 5 s.
- Reserves its space (`width`/`height` plus an absolutely positioned layer), so it causes no layout
  shift.

**Home screen.** On screens 901px and wider, the intro does not cut to a different picture. The clip's own
final frame (`public/videos/saran-universe-home.jpg`, a still extracted from the clip) is the home screen: the
title and menu fade in over it behind a left-hand scrim, and the clip dissolves into the identical still (mean
pixel difference about 2 to 4 out of 255 in a real-browser handoff test). The sunset sky, black bar and the
second portrait card are not used there. The same home is shown to returning visitors, with reduced motion and
with Save-Data, using only the 150 KB still and no video download. The clip and the still share one crop
(`--sc-film-x` in [city.css](src/city/city.css)) so the face stays clear of the title on 4:3 and 16:10 screens as
well as 16:9. Under 901px, or if the still fails to load, the original sunset and portrait-card layout is used.
If the clip is ever replaced, re-extract `saran-universe-home.jpg` from its exact last frame.

**Recruiter Mode background clip (optional, not included).** If
`src/assets/videos/recruiter-tech-intro.webm` or `.mp4` is added, [videos.ts](src/city/videos.ts)
picks it up for the hero background (muted, `preload="none"`, skipped for reduced motion and
Save-Data). With none present, nothing changes.

---

## Run it yourself

```sh
npm ci
npm run dev        # http://localhost:5173
npm run test
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npm run build
```

Stack: React, TypeScript, Vite, Tailwind CSS, deployed as a static site on Vercel.

**Last verified run:** TypeScript clean, 80 of 80 tests pass, production build passes. Lint
reports 2 errors and 9 warnings, all pre-existing and identical to `main`. The two errors are in
unused shadcn files ([command.tsx](src/components/ui/command.tsx),
[textarea.tsx](src/components/ui/textarea.tsx)) that I left alone. What is verified versus what
still needs configuration is tracked in [docs/remediation-status.md](docs/remediation-status.md).

Accessibility basics: keyboard operable, Escape goes back, a district list replaces the map on
narrow screens, tap targets are at least 44px, and nothing hides behind floating buttons on
phones.

Progress is saved in your browser's `localStorage` (`saran-city:progress:v1`; the key keeps its
original name so earlier progress is not lost). You can reset it from the progress panel.

### SaranAI

The SaranAI button is a local, rule-based guide. It is **not** a generative AI service, makes no
network requests, and answers only from the public data on the site.

---

## Contact form setup

The form sends through [EmailJS](https://www.emailjs.com/) straight from the browser. All three
values are **public identifiers** and are visible in the shipped JavaScript by design. Never put
an EmailJS private key or access token in this project.

| Variable | Where to find it in EmailJS |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | Email Services, "Service ID" (`service_xxxxxxx`) |
| `VITE_EMAILJS_TEMPLATE_ID` | Email Templates, "Template ID" (`template_xxxxxxx`) |
| `VITE_EMAILJS_PUBLIC_KEY` | Account, General, "Public Key" (about 16 characters) |

**Locally:** copy `.env.example` to `.env`, fill in your own values, restart `npm run dev`
(Vite only reads `.env` at start-up). `.env` is git-ignored.

**On Vercel:**
1. Project, **Settings, Environment Variables**.
2. Add the three variables with exactly those names for **Production** (and Preview if wanted).
3. **Redeploy.** Vite inlines them at build time, so existing deployments don't change.
4. In EmailJS, **Account, Security**: add `saran-cloud-portfolio.vercel.app` to allowed origins if
   domain restriction is on.

**Template:** suggested variables are `from_name`, `from_email`, `reply_to`, `to_email`,
`message` and `page_url`. Set "To email" to your inbox and "Reply-To" to `{{reply_to}}`.

### How the form behaves

- **Not configured** (a variable is missing or still a `your_...` placeholder): the button says
  "Write in my email app" and opens a pre-filled `mailto:`. It never pretends to have sent.
- **Sending:** button shows "Sending...", fields lock, the form is `aria-busy`, and extra clicks
  are ignored. A request over 15 seconds counts as failed.
- **Success:** confirmation and a cleared form, only after EmailJS confirms.
- **Failure:** a clear message (a specific one for rate limits), your text is kept, and a "send it
  from your email app" link carries the message as a `mailto:`.

### Is it verified? Not yet.

Delivery is **not verified end to end, and the form is not configured with real credentials.**
In testing, the local `.env` still held `.env.example` placeholders, and EmailJS rejected the
request with HTTP 400 ("The Public Key is invalid"), so nothing was delivered. That says nothing
about a real account. To close it out: set real values locally and on Vercel, redeploy, submit
the live form once, and confirm the email lands in the inbox. Until then, treat delivery as
unverified.

---

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) is mounted once in
[App.tsx](src/App.tsx). Custom events come from [analytics.ts](src/lib/analytics.ts) and use
**fixed labels only**, never anything a visitor typed:

- `resume_download` with `source`: `recruiter_hero`, `contact`, `assistant`, `game_hud`,
  `game_intro`, `game_hq` or `game_dossier`.
- `recruiter_mode_open` with `source`: `direct_link` (landing on `?mode=recruiter`) or `game`
  (switching from the game, with `from` set to the scene name).

Event ingestion in the Vercel dashboard is not yet confirmed.

---

## Known limits

- No sound, on purpose.
- The player is a portrait, not a full-body avatar.
- Missions simulate the *kind* of work I do; they are not client systems.
- The mini-map only appears on screens 1600px or wider.
- The world map is a stylized plan, not a realistic coastal city.

## Map of the repo

| Where | What |
| --- | --- |
| [src/city](src/city) | The whole game layer: scenes, map, missions, state, character, videos |
| [src/pages/Index.tsx](src/pages/Index.tsx) | The conventional portfolio used by Recruiter Mode |
| [src/data/portfolio.ts](src/data/portfolio.ts) | All portfolio content |
| [docs](docs) | Asset requirements, design reference, remediation status, content to-dos, screenshots |
| [index.html](index.html) | Canonical URL, Open Graph, Twitter tags and Person structured data |

Built by Saran S. If something here sparks a conversation, the contact form (or the mailto
fallback) is the easiest way in.
