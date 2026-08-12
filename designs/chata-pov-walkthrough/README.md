# Chata POV Walkthrough

Built from `prompts/completed/2026-08-12-2138-chata-pov-walkthrough.md`.

Five stills of one cabin play as a single continuous visit rather than a slideshow.
Desktop pins the sequence to scroll; mobile auto-advances with a tap to pause.

## Files

- `ChataPovWalkthrough.tsx` — the component
- `photos.ts` — the five frames in narrative order
- `photos/` — drop the photographs here

## Use

```tsx
import ChataPovWalkthrough from './designs/chata-pov-walkthrough/ChataPovWalkthrough';
import { chataPhotos } from './designs/chata-pov-walkthrough/photos';

export default function Portfolio() {
  return <ChataPovWalkthrough photos={chataPhotos} />;
}
```

Requires `react`, `framer-motion` and Tailwind. The component is marked
`'use client'` for Next.js App Router; the directive is harmless elsewhere.

## Adding the photographs

Put five images in `photos/` in this order, then point `photos.ts` at them:

| # | file | caption | drift |
|---|---|---|---|
| 1 | `1-prijezd.jpg` | Příjezd | out |
| 2 | `2-obyvak.jpg` | Obývací pokoj | in |
| 3 | `3-loznice.jpg` | Ložnice | in |
| 4 | `4-koupelna.jpg` | Koupelna | in |
| 5 | `5-vecer.jpg` | Večer | hold |

The drift column is derived from position, not from the photograph, so the five
images need no individual tuning. `photos.ts` also lists 800/1600/2400px `srcSet`
candidates — generate those sizes, or delete the `srcSet` lines and ship `src`
alone.

Order is fixed and the sequence never loops: it settles on the evening shot.

## Timing

| | value |
|---|---|
| Dwell per photo | 6000 ms |
| Cross-fade | 900 ms |
| Bathroom → evening cross-fade | 1600 ms |
| Ken-Burns | scale 1.0 → 1.06, pan 1.5%, linear |

On desktop the sequence is scroll-driven, where a wall-clock duration has no
meaning. The millisecond values are carried across as their share of one dwell, so
the closing transition still reads as noticeably slower than the rest — the ratio
survives even though the literal timings cannot.

## Behaviour

- **≥1024px** — pinned; the section is `500vh` tall and scroll position drives
  opacity, scale and pan.
- **<1024px** — auto-advance every 6s, tap anywhere to pause. A hairline progress
  bar shows the dwell. There is a keyboard-reachable pause button that stays
  invisible until focused, so the sequence gains no visible chrome.
- **`prefers-reduced-motion`** — the pin and the Ken-Burns both drop out. The
  sequence still advances, as plain opacity cross-fades with no scale or pan.
- **No JavaScript** — the frames render as a plain captioned stack that scrolls
  normally, captions still legible.

## Colour and type

One accent throughout: matte gold `#C6A15B`, on warm off-white `#F5F0E8` over a
near-black `#0E0C0A` ground. Captions are a small uppercase serif at
`0.22em` tracking.

The photographs carry one shared curve — `contrast(1.04) saturate(1.02)` — applied
identically to all five so they read as one location. There is no per-photo
grading.

## What needs checking against the real photographs

Two of the prompt's acceptance criteria cannot be settled from code:

- **Caption legibility on all five frames.** The scrim covers only the lower band,
  by design, so the photographs are not darkened as a whole. A very bright
  bottom-left corner in one of the frames could still fight the gold caption.
  Check each frame; if one fails, deepen the scrim rather than tinting the image.
- **60fps on a mid-range Android phone.** Only `transform` and `opacity` are
  animated and the images are lazy-loaded past the first, which is the right
  shape for it — but frame rate depends on the delivered image sizes. Measure it
  once the real photographs are in.
