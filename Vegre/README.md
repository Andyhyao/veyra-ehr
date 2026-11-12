# Veyra — EHR landing page

Static marketing page for the Veyra EHR platform, built to match the reference
comp (hero lockup, device composition, floating KPI cards, product bento).

## Run

```bash
python3 -m http.server 4178 --directory .
```

Then open <http://localhost:4178>. The page itself needs no build — the only
network request is the webfont. Two generated files are checked in and only
need rebuilding when you change what they come from:

```bash
npm install            # once: Tailwind CLI 4.3.3, Motion 13.5.1 and Lenis 1.3.26, pinned
npm run build:css      # after changing tw: classes in index.html or assets/js/motion.js
npm run vendor:motion  # after upgrading Motion
npm run vendor:lenis   # after upgrading Lenis
```

## Structure

```
Vegre/
├── index.html              # whole page: nav → hero → product → bento → pricing → footer
├── package.json            # build tooling only (Tailwind CLI, Motion)
├── assets/
│   ├── css/style.css       # design tokens, components, responsive rules
│   ├── js/app.js           # header state, menus, reveals, counters, form, FAQ
│   └── img/                # logo lockups generated from the source SVGs
└── README.md
```

## Motion layer

`assets/js/motion.js` runs the page's motion on Motion (`assets/js/vendor/motion.js`,
the framework-free build of Framer Motion). Timing follows Apple's product-page
stagger: items 0.15 s apart, opacity over 0.9 s, a 30 px rise over 0.7 s, starting
when a group's top reaches 70% of the viewport.

- `data-stagger` marks a group (`="load"` runs on page load, the hero); its
  `data-stagger-item` descendants reveal in document order.
- `data-split` on a heading item splits it into words that rise, fade and sharpen
  one after another; a `.grad` span stays whole so its gradient survives.
- `data-scrub` lights a statement up word by word as it scrolls through;
  `data-scroll-scale` grows a scene from 0.92 to 1 as it enters; the hero devices
  separate in depth as the hero scrolls away.
- `data-lift` cards spring up on hover, `data-press` buttons give under a press.
  The springs drive `--lift`, `--lift-s` and `--press`, read by the `tw:lift` and
  `tw:press` utilities through the individual `translate`/`scale` properties, so
  they stack with any `transform` a component already has.

Tailwind (`assets/css/tw.src.css` → `assets/css/tw.css`) has no preflight and a
`tw:` prefix, so it only produces the handful of classes the motion layer uses.
Items start hidden through `tw:js:motion-safe:opacity-0`: the `js:` variant needs
scripting on and Motion loaded (motion.js sets `.no-motion` otherwise), and
`motion-safe:` keeps reduced-motion visitors on the plain page. The older
`.reveal` CSS and observer in `app.js` stay as a fallback but no element uses them.

## Scrolling and navigation

- **Smooth scrolling** is Lenis (`assets/js/vendor/lenis.js` + `assets/css/lenis.css`), set
  up at the top of `app.js`. It eases wheel, touch and every in-page anchor over the
  native scroll position, so the sticky header, reveal observers and Motion's
  scroll-linked effects keep working. Reduced motion keeps plain native scrolling.
- **Anchors** land below the fixed header via `scroll-padding-top: 76px` on `html`,
  which both Lenis and native scrolling honour. The hero is `#top`; both logos link there.
- **Menu deep links**: `data-plat-tab="appointments|analytics|…"` opens that screen of
  the section 03 platform, `data-record-open="meds|labs|history"` opens that record
  view in section 02, as the page scrolls to them.
- **Where the menus go**: Charting → record model (02); Scheduling → platform,
  Appointments; e-Prescribing → record model, Medications; Analytics → platform,
  Analytics; Primary care → 02; Specialty clinics → platform (03); Multi-site groups →
  implementation (04); Behavioral health → security ledger (06). Log in, About, Careers,
  Press and the legal links still point to `#` — there are no pages for them yet.
- **Back to top** (`.totop`) appears once the first screen is behind you; its ring fills
  with page progress, and it hands focus to the header logo after scrolling up.

## Content rules

This page follows the Veyra project standards in `AGENTS.md` and `Design.md`:
headlines in Manrope 800, body and controls in Inter, and no unsupported
claims. Specifically, the page must not assert certification, audited
compliance, implemented security controls, measured performance, or customer
adoption. Capability and security statements are written as design intent;
figures in the Design-targets band are targets, not results; and the example
organizations are labelled fictional where they appear. The demo form follows
the same rule: there is no backend behind it, so neither its resting note nor
its success message claims a reply is coming.

The Design-targets counters and the hero stat cards ship their real figure in
the HTML. `app.js` zeroes them at registration (never under
`prefers-reduced-motion`) and counts up when the group scrolls into view, so a
visitor without JavaScript reads the figures rather than a row of zeroes.

Text colour is token-driven for contrast: `--muted` is the on-light grey,
`--muted-d` the on-navy one, and `--green-ink` the text-safe green (`--green`
stays for fills and icons). Every text/background pair on the page meets WCAG
AA; check with the sweep before changing a colour.

The page uses a **liquid-glass card material**: `.glass` (translucent fill,
`backdrop-filter: saturate(180%) blur(20px)`, a hairline light border, an inner
top highlight and a diagonal specular sheen via `::after`). Glass needs
something behind it to refract, so sections carrying glass cards use
`.sec--wash` (CSS-only ambient blobs) or `.sec--amb` (explicit `.amb` spans).
The same material is applied to the hero stat cards, the record panel, the
implementation steps, the platform cards and KPIs, the CTA panel and section 08.

Section 08 is the bento: two device cells above a wide scene card holding three
floating glass panels (capability chips, audit chip, clinician) around a front-view phone.
Styles are prefixed `bx__`.

Section 07 is the navy security ledger (artboard 07·A): a control inventory
beside an append-only audit trail, prefixed `ledger__`. Section 08 is proof by
mechanism (artboard 08·A): four properties a practice can verify, each with a
"Check it" line, prefixed `proof__`. Both replace certification badges and
adoption counts with evidence, per the content rules above.

Section 03 is the platform preview: one navy shell whose seven sidebar menus
are a real tab widget (roving tabindex, Arrow/Home/End keys, `aria-selected`,
linked `tabpanel`s) switching Dashboard, Patients, Appointments, Messages,
Care team, Analytics and Settings. Styles are prefixed `plat-`. The views are
modelled on the supplied reference sheets for sections 02-06.

Removed in the latest pass: the pricing section, the old three-tile bento,
the design-principle quote and the FAQ. Their CSS (`.plan*`, `.tile*`, `.ui-*`,
`.faq*`) is still in the stylesheet, unused, in case any of them come back.

Section 02 uses the "Evidence panel" direction (artboard B) — a copy column
beside a record panel whose History / Lab results / Medications buttons swap
fictional demo rows. Its styles are prefixed `record-`.

## Notes

- **Logos** were cut from `Veyra-Logo-01.svg` / `Veyra-Logo-02.svg`: the artboard
  background was dropped and the viewBox tightened to the artwork, giving
  `veyra-logo.svg` (dark), `veyra-logo-light.svg` (on dark), `veyra-mark-white.svg`
  and `favicon.svg`. The `favicon-32.png` and `apple-touch-icon.png` fallbacks are
  rasterised from `favicon.svg`.
- **Section 08's two device cells are supplied footage, not renders.** Each clip is a device
  already shot in a scene, so neither cell draws a bezel: `.bx__stage--shot` carries the clips'
  flat backdrop (`#E8E8E8`) and `.bx__shot` sits the clip in it. The two clips were graded
  differently — on-rounds came in at `#DADADA` — so its web asset is pushed through
  `curves=all='0/0 0.8549/0.9176 1/1'`, which lands its backdrop on the station clip's `#E8E8E8`
  while leaving the phone's blacks and the screen's whites alone. The second control point is
  aimed at 234/255 rather than 232/255 because the VP9 round-trip loses two levels.
  - **At the station** — `assets/video/in-practice-screen.{webm,mp4}`, 13.75 s, 1120 × 794,
    from `08 In Pratice Original.mov` (2200 × 1560, 120 fps; the user's spelling). Three shots
    cut together: the dashboard loading in, then two push-ins. The source's last 2.7 s are a
    frozen frame, so the asset stops at 13.75 s and loops on a hard cut, matching the clip's
    own two cuts at 4.25 s and 9.5 s. Its 1.41 ratio is the cell's own, so it fills the stage
    exactly on desktop with no crop. (An earlier 3006 × 1560 cut of the same animation needed
    an `object-fit: cover` rule to fill the cell; that rule is gone.)
  - **On rounds** — `assets/video/on-rounds-screen.{webm,mp4}`, 4.9 s, 1072 × 760, from
    `On arounds-Section 08-Veyra.mov` (2200 × 1560, 120 fps). The source runs two cycles
    separated by fades to black, so the asset is one cycle (2.4917 s → 8.05 s at 30 fps) whose
    last 0.6 s is cross-dissolved back over its own first 0.6 s. Without that the card flashed
    fully black for ~0.3 s every loop. The backdrop curve above is applied on top.

  `../motion-in-practice/` and `../motion-on-rounds/` still hold the previous rendered loops.
  The CSS device frame those cells used to draw is gone: `device-frame.png` and the
  `.bx__dev*` rules were deleted once the supplied footage replaced them.
  the "Everything in context" scene centres a front-view CSS iPhone (`.bx__iphone`), cropped by
  the scene's bottom edge, around
  `assets/video/in-context-screen.{webm,mp4}` (13 s, same size) between the floating panels.
  Its cards stage in on scroll, then a decorative demo pointer (`.bx__cursor`) tours them,
  giving each the `.is-hover` state in turn. It pauses off screen and while a real mouse is over
  the card, and is skipped on phone layouts and under `prefers-reduced-motion`. The phone's
  photo is a head-and-shoulders recut (`motion-in-context/assets/patient-photo.jpg`; the full
  frame is kept beside it as `patient-photo-full.jpg`).
  Each has a `-poster.jpg` still. Only the in-context loop still comes from a HyperFrames
  project (`../motion-in-context/`); re-render there and copy the files over. The two device
  cells do not — re-rendering `../motion-in-practice/` or `../motion-on-rounds/` would
  overwrite the supplied footage.
  `app.js` plays every `.bx__loop` only while it is on screen and never under
  `prefers-reduced-motion`.
- **Other device mockups** (hero laptop, phone, bento tiles) are pure HTML/CSS —
  no screenshots. They size themselves with container query units (`cqi`), so
  the whole UI scales with its frame. The container is declared on the bezel,
  not the screen, because an element's own container units resolve against an
  *ancestor* container.
- **Copy, logos and metrics are placeholder content** for a fictional product.
  The clinic names, the testimonial and the compliance claims (HIPAA, SOC 2)
  are invented for the comp — replace them before anything ships publicly.
- **Hero devices** are the supplied mockups with a rendered screen loop laid over the screen
  each already shows: `.stage__mac` wraps `hero-macbook-analytics.webp` + `assets/video/hero-mac.{webm,mp4}`
  (10 s, 966 × 630, the practice-analytics screen ticking over), `.stage__phone` wraps `hero-iphone.webp`
  + `assets/video/hero-phone.{webm,mp4}` (12 s, 402 × 874, the mobile site scrolling). The camera
  notch and Dynamic Island are redrawn on top. Videos use `preload="none"`, so the still image
  shows until a loop plays; they share the play-while-visible observer and stay still under
  `prefers-reduced-motion`. Sources: `../motion-hero-mac/` and `../motion-hero-phone/`.
- **Hero composition** is driven by two custom properties on `.hero`:
  `--pull` (how far the device group slides left out of its column) and
  `--phone-x` (the phone's offset). Each breakpoint re-sets those two values,
  so the laptop, phone and stat cards always move as one group.
- On a fine pointer the hero layers drift against the cursor — cards furthest,
  laptop least — for depth. Motion respects `prefers-reduced-motion`; reveals,
  counters and parallax all fall back to their resting state.
- **The hero's "Watch video" button is parked**, not deleted: there is no video
  to point it at yet. It sits commented out in `.hero__cta` in `index.html`, and
  its `.btn--outline` and `.play` rules are untouched in `style.css`, so restoring
  it is uncommenting those four lines. The canvas artboards have it removed from
  the hero and from the case-study phone mockup. One copy is still rendered into
  the hero phone's loop (`../motion-hero-phone/compositions/mobile.html` draws the
  mobile hero, button and all); re-render there if the button stays gone for good.
- **Touch targets** are 44px minimum on the device cells, the footer columns and
  the legal row. The header logo and burger need `flex:none` at phone widths or
  the row shrinks them under 44px, which is why `.hdr__in` also drops its gap to
  12px there; if you widen the header button, re-check that the row still fits.
- **Deployed on Vercel** at <https://veyra-ehr.vercel.app>, from this repo's
  `main`. `vercel.json` at the repo root points `outputDirectory` at `Vegre/`,
  so there is no build step; `404.html` is served automatically for unknown
  paths with a real 404 status.
- **Social cards** live in `<head>`: `og:*` plus `twitter:card`, with
  `assets/img/og-cover.jpg` (1200 x 630, composed from the hero laptop still).
  `og:image`, `og:url` and `rel=canonical` are absolute against
  `https://veyra-ehr.vercel.app`; change all four together if the site moves to
  its own domain.
- **Icons**: `favicon.svg` for modern browsers, `favicon-32.png` for Safari
  before 16, and `apple-touch-icon.png` (180px) for iOS home screens. All three
  are rasterised from the same SVG, so regenerate them together.
- **Brand blues come from tokens**, including inside `linear-gradient()` — there
  are no literal `#2563EB` or `#1D4ED8` outside the `:root` block, so retheming
  is a one-line change. The lighter one-off blues in the device mockups
  (`#4F8BFF`, `#9EC0FF`, and so on) are deliberately literal.
- CSS and JS are loaded with a `?v=` query. Bump it when you edit them, or a
  browser that cached the old file will keep serving it.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--blue` | `#2563EB` | brand, CTAs, accents |
| `--ink` | `#0B1324` | headings, dark surfaces |
| `--slate` | `#475569` | body copy |
| `--soft` | `#F5F8FD` | alternating section backgrounds |
| `--line` | `#E5EAF2` | borders, dividers |
