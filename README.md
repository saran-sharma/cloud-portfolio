# cloud-portfolio

Personal portfolio for Saran S., Data Platform Engineer | AI & Cloud, based in
Chennai, India. React, TypeScript, Vite and Tailwind CSS, deployed as a static
site.

## What is on the page

- **Hero:** a first-person headline beside the existing portrait
  ([profilepic.jpeg](src/assets/profilepic.jpeg), used as supplied). On mobile the
  order is headline, photo, introduction.
- **About:** first-person introduction, how I work, and a short background
  timeline taken from the resume facts.
- **Selected work:** six featured projects, each with its own diagram, and three
  more. Every project opens a case study dialog.
- **Toolkit, experience, credentials and contact.** The experience section lists
  responsibilities by theme. No dates, titles or metrics are made up.

Content lives in [src/data/portfolio.ts](src/data/portfolio.ts). Project visuals
are in [ProjectVisual.tsx](src/components/ProjectVisual.tsx): a medallion pipeline,
an onboarding and promotion flow, a reporting architecture, a vertical
investigation flow, a storage decision tree, a PIM swimlane, a layered data
platform and an MCP sequence diagram. They are native
HTML and CSS, so they stay readable on small screens.
GymFlow AI has no diagram because there is nothing to show beyond its stack.

## Authenticity rules

- Case studies state what the work was and what I did. Outcomes appear only where
  the resume supports them.
- No screenshots, metrics, savings or production claims are invented.
- Internal names, identifiers, tenants, endpoints and financial data are left out.
- What still needs input is tracked in [docs/content-todo.md](docs/content-todo.md),
  together with the resume mismatches. That file is not shown on the website.

## Design

Saran City palette: deep navy, sunset magenta and orange, electric cyan accents. It
is shared by the game and Recruiter Mode, with a single dark theme. Oswald for
headlines, DM Sans for body text and IBM Plex Mono for small technical labels. Body
text is 17px, nothing renders below 13px, and the type scale is defined in
[src/index.css](src/index.css). Animation is limited to a small reveal and respects
`prefers-reduced-motion`.

## Interactive portrait

The hero photograph tilts toward the cursor (about 3.5 degrees at most), with a
warm spotlight that follows the pointer. It is built from local React pointer
events and CSS custom properties, with no animation library.

- [use-pointer-tilt.ts](src/hooks/use-pointer-tilt.ts) eases the pointer position
  inside one `requestAnimationFrame` loop that stops when everything has settled,
  so the portrait glides to the cursor, glides back on leave, and idles at zero cost.
- The pointer is measured against the stable outer container, not the tilted
  image, so the effect cannot feed back on itself. The photo scales up slightly
  with the tilt so its edges never show.
- The JPEG is flattened, so it moves as one plane. Depth comes from separate
  layers on top of it: the spotlight (follows the cursor), a soft ambient glow
  (moves the opposite way, more slowly), a small ruler and the name plate
  (deeper parallax). The photograph itself is not modified or cut out.
- It only runs for a fine, hovering pointer at 768px or wider and without
  `prefers-reduced-motion`. Touch, small screens and reduced-motion users get a
  static portrait with a fixed warm light. Nothing intercepts scrolling or clicks.

## Saran City (game mode) and Recruiter Mode

The site opens as **Saran City: The Engineering Chronicles**, an original
open-world style layer over the same portfolio content. The classic portfolio is
**Recruiter Mode**. It is always one click away (top bar, intro menu and a floating
button) and `/?mode=recruiter` opens it directly.

- **Flow:** start screen, player profile, city map, six districts, engineering
  missions, case studies, achievements, and contact in Recruiter Mode.
- **Districts:** Data Docks, Cloud Heights, Automation Works, Neon AI Labs,
  Operations HQ and Saran's Headquarters. Every portfolio project sits in one.
- **Missions:** six interactive simulations (data pipeline, cost review, incident
  investigation, storage assessment, PIM workflow, MCP request) plus the HQ dossier.
  They use fictional, synthetic data only and are lazy-loaded.
- **Progress:** XP, badges and visited districts are stored in `localStorage`
  (`saran-city:progress:v1`). Progress can be reset from the progress panel. XP only
  measures how much of the site has been explored. It is not a skill rating.
- **Accessibility:** keyboard operable, Escape goes back, `prefers-reduced-motion`
  disables the cinematic and map zoom, a list of districts replaces the map
  on narrow screens, and tap targets are at least 44px.
- **Recruiter Mode look:** the portfolio now uses the Saran City identity: the same
  navy and sunset palette, Oswald display type, button shapes, skyline, and the same
  character module. Colour tokens come from [city.css](src/city/city.css) and the
  structural restyle is in [recruiter.css](src/city/recruiter.css), so the content
  components are unchanged. The light theme and its toggle were removed so there is
  one visual identity. The switch back to the game is a button in the header on every
  screen size (icon only on small screens), so nothing floats over the page. On phones the
  SaranAI launcher also sits in the header.
- **Code:** everything lives in [src/city](src/city). No new dependencies.
  [CityApp.tsx](src/city/components/CityApp.tsx) switches between the game and the
  portfolio ([Index.tsx](src/pages/Index.tsx)).
- **Screenshots:** [docs/screenshots](docs/screenshots). `before/` and `after/` show
  the Recruiter Mode change.

### Character artwork status

- **Supplied and integrated.** The owner-supplied stylized character
  `src/assets/saran-character.png` (768x768) is used through
  [character.ts](src/city/character.ts) on the opening screen, player profile, world-map
  marker, district dossier and the Recruiter Mode hero. It was supplied externally, not
  generated in this repository, and is used unmodified.
- The original photograph `src/assets/profilepic.jpeg` is unchanged and stays the
  fallback: if the character file is removed, every screen falls back to the photo.
- Crops are tuned separately for the large portraits (`object-position`) and the small
  circular avatars (`background-size` and `background-position`) under the `.is-art`
  rules in [city.css](src/city/city.css) and [recruiter.css](src/city/recruiter.css).
- The source file is 768px square, so it is upscaled in the large hero portraits. A
  higher-resolution export (about 1600px) would look sharper.

### Motion

All motion is code-based (CSS and a small requestAnimationFrame hook); no video file ships
today and nothing simulates one with filters.

- Character entrance, then a slow idle float and faint breathing scale, an occasional
  rim-light sheen and a brief HUD lock-on frame during the opening.
- **Replay intro** on the opening menu re-runs the entrance; it never replays on its own.
- Sun and skyline drift against the pointer, driven by
  [use-sky-parallax.ts](src/city/hooks/use-sky-parallax.ts) from local pointer events only.
- Skyline windows twinkle ([CitySkyline.tsx](src/city/components/CitySkyline.tsx)).
- Screen and district transitions, plus hover states on cards, chips and tiles.
- `prefers-reduced-motion` turns the idle, twinkle and parallax motion off. Parallax also
  stays off for touch devices and screens under 768px.

#### Optional intro videos (not supplied yet)

[videos.ts](src/city/videos.ts) picks up these files if they are added; with none present
the existing code-based intro and hero are used unchanged.

| Mode | Path | Length | Poster / fallback |
| --- | --- | --- | --- |
| Saran City | `src/assets/videos/saran-city-intro.webm` (+ optional `.mp4`) | 5-7 s, played once | `saran-character.png` |
| Recruiter Mode | `src/assets/videos/recruiter-tech-intro.webm` (+ optional `.mp4`) | 2-3 s, muted background | existing hero sky |

Videos are muted, `preload="none"`, and only mounted when their mode opens. They are
skipped for `prefers-reduced-motion`, Save-Data, and (Saran City only) viewports under
768px, and any load error falls back to the existing artwork. The files must be generated
externally; no placeholder video is included.

Known limitations: there is no sound; the player is a portrait, not a full-body
avatar; the missions are simulations of the kind of work done, not real client
systems; the mini-map is shown on screens 1600px or wider. The world map is a flat,
code-drawn city plan (coastline, parks, one landmark cluster per district). It is not a
realistic coastal city; the assets that would get it there are listed in
[docs/saran-city-asset-requirements.md](docs/saran-city-asset-requirements.md). The job
title on the resume ("Senior Cloud & DevOps Engineer") still differs from the site
("Data Platform Engineer | AI & Cloud"), and `public/resume.pdf` is the older resume. Both
are decisions for the owner and are listed in [docs/content-todo.md](docs/content-todo.md).

## Portfolio guide

The SaranAI button opens a local, rule-based guide. It is not a generative AI
service, makes no network requests and answers only from the public data above.

## Run and validate

```sh
npm ci
npm run dev
npm run test
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npm run build
```

Tests cover the hero identity, anchors, the menu, the single dark theme, the 404 page,
all eight case studies, contact delivery (EmailJS is mocked), the local guide, the
Saran City game logic (XP, badges, persistence, synthetic data) and its end-to-end
flow. Latest run: TypeScript clean, 70 of 70 tests pass, production build passes. Lint
reports 2 errors and 9 warnings, all pre-existing and identical to `main`. See
[docs/remediation-status.md](docs/remediation-status.md) for what is verified and what still
needs configuration.

`npm run lint` still reports two errors in unused shadcn files
([command.tsx](src/components/ui/command.tsx) and
[textarea.tsx](src/components/ui/textarea.tsx)). They predate the redesign and were
left alone.

## Public metadata

[index.html](index.html) has the canonical URL, Open Graph and Twitter tags and
Person structured data. [favicon.svg](public/favicon.svg) is the favicon.
[social-preview.png](public/social-preview.png) is the 1200x630 share image, built
from the same portrait and headline.

## Contact Form

The contact form sends through [EmailJS](https://www.emailjs.com/) directly from the
browser. All three values are **public identifiers**: they are visible in the shipped
JavaScript by design. Never put an EmailJS private key or access token in this project.

### Variables the code reads

| Variable | Where to find it in EmailJS |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | Email Services, the "Service ID" (looks like `service_xxxxxxx`) |
| `VITE_EMAILJS_TEMPLATE_ID` | Email Templates, the "Template ID" (looks like `template_xxxxxxx`) |
| `VITE_EMAILJS_PUBLIC_KEY` | Account, then General, "Public Key" (about 16 characters) |

They are read in [Contact.tsx](src/components/sections/Contact.tsx) and typed in
[vite-env.d.ts](src/vite-env.d.ts). `.env.example` lists them with placeholders only; `.env`
is git-ignored.

### Local setup
1. Copy `.env.example` to `.env`.
2. Replace the placeholders with your own values from the EmailJS dashboard.
3. Restart `npm run dev`. Vite only reads `.env` at start-up.

### Vercel setup
1. Vercel dashboard, your project, **Settings, Environment Variables**.
2. Add the three variables above with exactly those names, for **Production** (and
   Preview if you want the form to work on preview deployments).
3. **Redeploy.** Vite inlines these values at build time, so changing them does not affect an
   existing deployment until it is rebuilt (Deployments, the latest one, Redeploy).
4. In EmailJS, open **Account, Security** and add your domain
   (`saran-cloud-portfolio.vercel.app`) to the allowed origins if domain restriction is on.

### EmailJS template
Recommended template variables: `from_name`, `from_email`, `reply_to`, `to_email`, `message`
and `page_url`. Set the template's "To email" to your inbox and "Reply-To" to `{{reply_to}}`.

### Behaviour
- **Not configured** (any variable missing, or still a `your_...` placeholder): the button
  reads "Write in my email app" and opens a pre-filled `mailto:` message instead. Nothing
  claims delivery.
- **Sending:** the button shows "Sending...", is disabled, the fields are locked and the form
  is `aria-busy`. A second submit while one is in flight is ignored, so double clicks send once.
  A request that takes longer than 15 seconds is treated as failed.
- **Success:** a confirmation appears and the form is cleared only after EmailJS confirms.
- **Failure:** a clear message (with a specific one for rate limiting), the visitor's text is
  kept, the button is usable again, and a "send it from your email app" link carries the
  message as a `mailto:`.

### Status of delivery
Delivery is **not verified end to end, and the form is not yet configured with real
credentials.** When I tested, the local `.env` still held the `.env.example` placeholders for
the Template ID and Public Key (only the Service ID had a different value). A submission with
those was rejected by EmailJS with HTTP 400, "The Public Key is invalid", so no email was
delivered. That result says nothing about your real EmailJS account.

The form now treats any `your_...` placeholder value as **not configured** and uses the
`mailto:` fallback instead, so copying `.env.example` unchanged can never produce a form that
looks live but cannot send. To finish: put the real values in `.env` and in Vercel, redeploy,
then submit the live form once and confirm the email arrives in your inbox. Until you have
seen that email, treat delivery as unverified.

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) is mounted once in
[App.tsx](src/App.tsx). Custom events are sent from [analytics.ts](src/lib/analytics.ts) and use
fixed labels only, never anything a visitor typed:

- `resume_download` with `source`: `recruiter_hero`, `contact`, `assistant`, `game_hud`,
  `game_intro`, `game_hq` or `game_dossier`.
- `recruiter_mode_open` with `source`: `direct_link` (landing on `?mode=recruiter`) or `game`
  (switching from the game, with `from` set to the scene name).

Custom events appear in the Vercel dashboard only if your plan includes them; page views and
visitors work on all plans. Ad blockers can hide all of it.

**Verification status:** in a local browser test the events are queued on `window.va` with the
labels above and no visitor data, and the Analytics script path is present in the production
bundle. **Ingestion by Vercel is not verified.** The script only exists on a Vercel
deployment, so confirm by opening the live site, downloading the resume once, and checking
Analytics in the Vercel dashboard (custom events need a plan that includes them).
