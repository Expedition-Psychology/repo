# Expedition Psychology — Design System

> Premium psychological training & consultancy for performance, resilience, and wellbeing in demanding environments.

This repository is the single source of truth for the Expedition Psychology brand in digital design: typography, colour, spacing, logos, reusable UI components, and full-screen UI kits. An automated compiler indexes the tokens and bundles the components so other projects can design *as* Expedition Psychology.

---

## 1. Company & context

**Expedition Psychology** delivers evidence-based psychological training to people who operate where uncertainty, pressure, and consequence are part of the landscape — expedition teams, adventure professionals, rescue organisations, healthcare providers, leaders, and individuals.

The work combines academic psychology with real operational experience and turns complex concepts into practical, field-ready skills: resilience, decision-making, confidence, emotional regulation, team dynamics, leadership, and recovery.

**Brand positioning:** clarity, credibility, and practicality. Scientific rigour meets the spirit of discovery. The experience should feel *premium, approachable, and authoritative* — never clinical, never corporate-cold, never adrenaline-bro.

**Surfaces in this system**
- **Marketing website** — the primary public surface (services, workshops, keynotes, online learning, expedition support). UI kit: `ui_kits/website/`.
- **Slide / keynote template** — for talks and workshop decks. Samples: `slides/`.

### Source materials provided
- `assets/branding-guidelines.jpeg` — the official one-page brand sheet (logos, fonts, colours, type ratio, diagram example). This is the canonical reference everything here is built from.
- Logo artwork: black & white, wordmark (`…W`) and symbol (`…S`) — now in `assets/`.
- Fonts named in the guidelines: **Arboria Medium** (headings) and **Nunito Light** (body). The Arboria binaries were *not* supplied — see Caveats.

No codebase, Figma file, or live URL was provided. If one exists, attach it and this system can be reconciled against the real product.

---

## 2. Content fundamentals — how Expedition Psychology writes

The voice is **calm, expert, and human**. It sounds like a seasoned practitioner who has actually been in the field — measured, never breathless. The reader is treated as a capable professional under real pressure.

- **Person:** Address the reader as **"you"**; the company is **"we"**. ("We help you think clearly when conditions are at their most challenging.")
- **Tone:** Grounded, confident, supportive. Authoritative without lecturing. Encouraging without cheerleading. Reassuring under pressure.
- **Clarity over cleverness:** Plain language, short sentences. **Avoid jargon** — and when a technical term is unavoidable, define it in field terms. This is a stated brand value.
- **Practical & actionable:** Favour verbs and concrete tools over theory. ("Check body language, breathing, speech, and eye contact." "Introduce yourself clearly and calmly.")
- **Casing:** Sentence case for body and most UI. **Title Case** for navigation labels, buttons, and short headings. Avoid ALL-CAPS except small overline/eyebrow labels (with wide tracking).
- **Spelling:** **British English** ("colours", "behaviour", "programme", "specialise"). The brand is UK-based.
- **Numbers & structure:** Numbered steps for procedures (the guidelines use "1. Initial Observation", "2. Verbal Contact"). Bulleted lists below a titled section for detail.
- **Emoji:** **None.** The brand expresses warmth through colour, space, and tone — not emoji.
- **What to avoid:** Hype, superlatives stacked high, fear-mongering, "crush it / beast mode" adventure-bro energy, and dense academic register. The bar is *credible and accessible*.

**Representative phrases (from brand materials):**
> "Think clearly, adapt effectively, and thrive in the environments that demand the most from you."
> "Bridging the gap between academic theory and operational performance."
> "1. Initial Observation — Check body language, breathing, speech, and eye contact."

---

## 3. Visual foundations

The aesthetic mirrors the environments served: **clean, modern, understated**. Lots of air. Confident type. Restrained colour with purposeful accents. Premium but never flashy.

### Colour
Two palettes, defined in `tokens/colors.css`.
- **Main palette** — the brand's everyday voice:
  - **Slate Plum `#5b4a6a`** (`--ep-plum`) — primary brand. Thoughtful, premium, "psychology".
  - **Pine `#4b7a6e`** (`--ep-pine`) — secondary brand / accent. Nature, expedition, steadiness. Default interactive accent.
  - **Paper `#f3f3f0`** (`--ep-paper`) — the default page surface; warm off-white, never pure white at full bleed.
  - **Ink `#2e2e2e`** (`--ep-ink`) — near-black for text and dark sections (not true `#000`).
- **Signal / diagram palette** — assessment scales, data viz, and status, ordered low→high: **Clay `#b6534b`** → **Ember `#c97a4a`** → **Sand `#d6b86c`** → **Sage `#6a977e`**. These are the "gauge" colours from the brand sheet's diagram example. Use them for charts and status, sparingly in chrome.
- A warm neutral grey scale (`--ep-neutral-*`) sits off the ink↔paper axis for borders, muted text, and sunken surfaces.
- **Vibe:** muted, slightly desaturated, earthy-but-cool. Nothing neon. Avoid blue-purple SaaS gradients entirely.

### Typography
- **Headings:** **Arboria Medium** — served live from the brand's Adobe Fonts (Typekit) kit (`use.typekit.net/frv6yjh.css`), family name `arboria`. The kit ships Arboria **Medium (500)**; headings use weight 500 throughout to render true Medium (no faux-bold).
- **Body:** **Nunito**, set **Light (300)** per the brand spec — this is the signature soft, humanist body texture. Step up to 400/600 for emphasis.
- The brand guide cites a heading:body size ratio of roughly **22pt : 12pt** — headings read clearly larger than body. The scale in `tokens/typography.css` honours this proportion.
- Full scale, weights, tracking, and line-heights live in `tokens/typography.css`.

### Space, layout & shape
- **8px base grid** (`--space-*`). Spacing is generous and calm; premium brands breathe.
- **Radii** are gentle and modern (`--radius-md: 10px`, `--radius-lg: 16px`) — present but never bubbly. Pills (`--radius-pill`) for tags/badges and some buttons only.
- **Layout:** centred max-width containers (`--container-*`), wide section padding (`--section-y`). Generous left-aligned text blocks; avoid centring long copy.

### Surfaces, borders & shadows
- **Cards:** raised white (`--surface-raised`) on the paper page, a hairline `--border-subtle` border, gentle `--shadow-sm`/`--shadow-md`, radius `--radius-lg`. Soft and quiet — not heavy, not glassy.
- **Shadows** are low, soft, and ink-tinted (`tokens/spacing.css`). Never harsh black drop shadows. Elevation is communicated mostly by surface colour + a whisper of shadow.
- **Borders** are hairline (1px) and low-contrast; structure comes from spacing first, lines second.
- Dark sections use `--ep-ink` (or `--ep-plum`) full-bleed with `--ep-paper` text — used for emphasis bands and hero/CTA moments.

### Imagery
- Real photography of expedition / rescue / mountain / clinical-field environments. **Cool, natural, slightly desaturated** — overcast light, stone, snow, sea, alpine. Human, in-the-field, never stocky or staged-corporate. May carry a subtle grain.
- The mountain-peak symbol can be used as a large, low-contrast watermark/texture in brand bands.

### Motion & states
- **Motion:** subtle and purposeful. Short fades and small transl(`--dur-base` 220ms, `--ease-out`). **No bounce, no spring, no parallax theatrics.** Respect `prefers-reduced-motion`.
- **Hover:** slight darkening of fills (or a quiet tint wash on ghost elements) + at most a 1px lift; links underline. No colour-jumping.
- **Press/active:** settle down 1px and/or a touch darker — a calm, physical "set", never a big shrink.
- **Focus:** visible pine focus ring (`--shadow-focus` / `--focus-ring`) — accessibility is non-negotiable for this audience.
- **Transparency / blur:** used rarely — a light scrim over imagery for text legibility, occasionally a soft backdrop blur on a sticky header. Not a glassmorphism brand.

---

## 4. Iconography

The brand sheet ships **no custom icon set**, so this system standardises on **[Lucide](https://lucide.dev)** — open-source, outline, consistent 2px stroke with rounded caps/joins. Lucide's calm, geometric outline language matches the logo's line-drawn mountain mark and the understated aesthetic. **This is a substitution** (flagged) — swap to a bespoke set if the brand commissions one.

- **Style:** outline only, ~1.75–2px stroke, rounded line caps. `currentColor` so icons inherit text colour. Default size 20–24px; never below 16px.
- **Load:** via CDN — `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or inline the individual SVG. UI-kit screens use Lucide.
- **Emoji:** never used as iconography or decoration.
- **Unicode:** avoid as icons; use Lucide glyphs instead. Arrows in CTAs use Lucide `arrow-right` / `arrow-up-right`.
- **Brand mark:** the mountain-and-psi **symbol** (`assets/logo-symbol-*.png`) is the one bespoke glyph — used as app icon, favicon, watermark, and bullet/section accent. Do not redraw it; use the supplied artwork.

See the **Brand** cards in the Design System tab for logo usage and clear-space.

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry point (import-only). Consumers link this.
- `readme.md` — this file.
- `SKILL.md` — portable Agent-Skill manifest.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `base.css`.

**`assets/`** — logos (`logo-wordmark-black/white.png`, `logo-symbol-black/white/green/purple.png`), `branding-guidelines.jpeg`.

**`guidelines/`** — foundation specimen cards (Type, Colors, Spacing, Brand) shown in the Design System tab.

**`components/core/`** — reusable React primitives: `Button`, `Badge`, `Tag`, `Card`, `Input`, `Eyebrow`, `Stat`, `Logo`. Each ships `.jsx` + `.d.ts` + `.prompt.md`; the directory card is `components/core/core.card.html`.

**`ui_kits/website/`** — high-fidelity recreation of the Expedition Psychology marketing site (`index.html` + screen JSX).

**`slides/`** — keynote/workshop slide template samples (`title`, `section`, `content`, `diagram`, `quote`, `closing`).

**`templates/`** — copy-and-go starting scaffolds for consuming projects. `marketing-page/` (hero + services + CTA, loads the system via `ds-base.js`).

> **Namespace for cards/kits:** components are exposed on `window.ExpeditionPsychologyDesignSystem_4e7d0e`. Run `check_design_system` if this hash ever changes.

---

## 6. Caveats
- **Arboria is now live** via the brand's Adobe Fonts (Typekit) kit — the earlier Poppins substitution has been removed. The kit serves Arboria **Medium (500)** only, which matches the brand spec; if you later need other Arboria weights (Book, Bold) for hierarchy, add them to the kit and they'll be available under family `arboria`.
- **Icons are Lucide** (substitution) — no bespoke icon set was provided.
- **No product codebase / Figma** was supplied, so the website UI kit and slides are built from the brand guidelines and company description as a faithful *interpretation*, not a pixel recreation of an existing site. Share the live site or Figma to reconcile.
