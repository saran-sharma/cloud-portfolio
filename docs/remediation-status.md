# Portfolio remediation: verified versus still to configure

Branch: `feat/portfolio-remediation`. This is the honest status of each item. "Verified" means
it was observed working; "not verified" means the code is in place but nothing has confirmed it
works end to end in the external service.

## Verified (observed)
| Item | How it was verified |
| --- | --- |
| TypeScript | `tsc --noEmit -p tsconfig.app.json`: clean |
| Tests | `npm run test`: 70 of 70 pass (7 files) |
| Production build | `npm run build`: passes |
| Lint | 2 errors, 9 warnings, **identical to `main`**; compared file by file, 0 new errors and 0 new warnings. The 2 errors are in `ui/command.tsx` and `ui/textarea.tsx` and predate this work |
| Character artwork | Rendered in Edge on the opening screen, profile, map marker, HQ dossier and Recruiter hero; image loads, `object-fit: cover`, no distortion |
| Layout | Edge at 1440x900, 820x1180 and 390x844: no horizontal overflow, no console errors, no failed assets (the `/_vercel/insights` request is expected to 404 locally) |
| Mobile and accessibility fixes | 56 automated browser checks passed: control names, no floating-control overlap with text, keyboard reach of all six map markers, district intro with no overlapping titles, nav active state, footer wordmark, resume PDF download |
| Contact form behaviour | Loading state, double-submit sends one request, 15 s timeout, rate-limit message, failure keeps the message and shows the mailto link, never shows success on failure. All against **mocked** network responses |
| Placeholder safety | A `.env` still holding `your_...` placeholders now uses the mailto fallback and makes no EmailJS request (desktop, tablet, mobile) |
| Analytics payloads | Events queue on `window.va` as `resume_download {source}` and `recruiter_mode_open {source, from?}` with fixed labels only; no names, emails, messages or ids |
| Secrets | `.env` is git-ignored and untracked. No `.env` value appears in any tracked or new file; no private key is referenced in client code |

## NOT verified (needs configuration or the live service)
| Item | Why | What to do |
| --- | --- | --- |
| **EmailJS delivery** | The local `.env` still holds placeholders for the Template ID and Public Key, so no real submission has been possible. An earlier test with them got HTTP 400 "The Public Key is invalid", which only reflects the placeholder | Set the three `VITE_EMAILJS_*` values (see README) locally and in Vercel, redeploy, submit the live form once and confirm the email arrives |
| **Success path with real credentials** | Only tested with a mocked 200 response | Same as above |
| **Vercel event ingestion** | The Analytics script only exists on a Vercel deployment, so it cannot be observed locally. Custom events also need a plan that includes them | After deploying, download the resume on the live site and check the Vercel Analytics dashboard |
| **Vercel environment variables** | Not set by this change | Add the three variables to the Production environment, then redeploy |

## Known limitations
- A 15 second send timeout reports failure, but the request may still complete afterwards, so a
  visitor who retries could, rarely, send twice.
- The world map is a flat, code-drawn plan, not a realistic city. Required assets are listed in
  [saran-city-asset-requirements.md](./saran-city-asset-requirements.md).
- The supplied character art is 768x768 and is upscaled in the large hero portraits.
- Decisions still open: the resume job title versus the site title, and replacing
  `public/resume.pdf` (see [content-todo.md](./content-todo.md)).

## Files changed
See the pull request description for the exact list.
