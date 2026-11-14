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
HTML and CSS, so they stay readable on small screens and in both themes.
GymFlow AI has no diagram because there is nothing to show beyond its stack.

## Authenticity rules

- Case studies state what the work was and what I did. Outcomes appear only where
  the resume supports them.
- No screenshots, metrics, savings or production claims are invented.
- Internal names, identifiers, tenants, endpoints and financial data are left out.
- What still needs input is tracked in [docs/content-todo.md](docs/content-todo.md),
  together with the resume mismatches. That file is not shown on the website.

## Design

Near-black, ivory and bronze palette with a light theme. Oswald for headlines, DM
Sans for body text and IBM Plex Mono for small technical labels. Body text is
17px, nothing renders below 13px, and the type scale is defined in
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
- **Code:** everything lives in [src/city](src/city). No new dependencies.
  [CityApp.tsx](src/city/components/CityApp.tsx) switches between the game and the
  unchanged [Index.tsx](src/pages/Index.tsx).
- **Screenshots:** [docs/screenshots](docs/screenshots) (desktop 1440x900, tablet
  820x1180, mobile 390x844).

Known limitations: there is no sound; the player is the supplied portrait, not a
full-body avatar; the missions are simulations of the kind of work done, not real
client systems; the mini-map is shown on screens 1600px or wider.

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

Tests cover the hero identity, anchors, themes and menu, the 404 page, all eight
case studies, contact delivery (EmailJS is mocked), the local guide, the Saran City
game logic (XP, badges, persistence, synthetic data) and its end-to-end flow.

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

The contact form uses EmailJS.

1. Create an EmailJS service and email template.
2. Copy `.env.example` to `.env`.
3. Fill in:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

Recommended EmailJS template variables:

- `from_name`
- `from_email`
- `reply_to`
- `to_email`
- `message`
- `page_url`

If configuration is absent, the site displays an explicit delivery notice and
direct email link. Errors are logged and shown to the visitor; the form is only
cleared after EmailJS confirms successful delivery. Existing environment values
are not modified.
