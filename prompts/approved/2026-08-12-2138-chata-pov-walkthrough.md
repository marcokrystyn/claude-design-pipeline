# Chata POV Walkthrough — Photo Sequence Animation

<!--
Created: 2026-08-12
Tags: animation, walkthrough, chaty, pov, portfolio-demo
Rules: instructions/CLAUDE_CHAT_INSTRUCTIONS.md
Standard: instructions/DESIGN_SYSTEM.md
No conversational commentary in this file.
-->

## Objective

Turn five static photos of a single rustic log cabin into a scroll- or auto-driven
POV walkthrough animation that feels like a guest arriving, moving through the cabin,
and settling in for the evening — as a portfolio demo piece proving the "Balíček
Pobyt" package on webovky-lureo.cz, and as the first end-to-end test of this pipeline.

## Context

- Subject: A single rustic log cabin (log-and-stone construction, exposed timber
  beams, warm wood interiors). Five photos in a fixed narrative order: (1) daytime
  exterior/arrival, (2) living room, (3) bedroom, (4) bathroom, (5) evening exterior
  with warm light in the windows.
- Audience: Small Czech accommodation owners (chaty/chalupy/Airbnb hosts) evaluating
  whether to buy the Balíček Pobyt package, viewing this as a portfolio sample.
- Where it will be used: Embedded as a demo preview in the Lureo portfolio section
  on webovky-lureo.cz, linked but not tied to a real client.

## Final Design Prompt

Build a full-bleed photo-sequence walkthrough component that presents the five
supplied images as a single continuous "visit," not a slideshow or carousel. Each
photo occupies the full viewport in turn; the transition between photos is a slow
cross-fade combined with a subtle Ken-Burns drift (slow scale from 1.0 to 1.06 and a
gentle pan toward the next image's implied direction of travel — outward at the
arrival shot, inward through the interior shots, settling to a static hold on the
final evening shot). Progress through the sequence is scroll-driven on desktop
(each photo pinned for a scroll distance before releasing to the next) and
auto-advancing with a visible thin progress bar on mobile (6s dwell per photo,
pausable on tap). A persistent bottom-left caption names the current room in Czech
("Příjezd", "Obývací pokoj", "Ložnice", "Koupelna", "Večer") in a small
uppercase serif label that cross-fades with the photo. A soft bottom gradient scrim
keeps the caption legible against any photo without darkening the images generally.
Between photos 4 and 5 (bathroom to evening exterior) let the cross-fade run
noticeably slower than the others, since that transition also implies a full
day-to-night jump — treat it as the emotional close of the sequence. Colour and
type language match the rest of webovky-lureo.cz: matte gold accent for the
progress bar and active caption, warm off-white text, no added filters or grading
on the source photos beyond a light shared contrast curve so all five read as one
consistent location.

## Technical Requirements

- Responsive: mobile-first; scroll-pin behaviour on desktop (≥1024px), auto-advance
  with tap-to-pause on mobile/tablet
- Breakpoints: 640 / 768 / 1024 / 1280
- Output format: React + TypeScript component with Tailwind classes, Framer Motion
  for cross-fades/Ken-Burns and scroll-linked progress
- Accessibility: each photo has descriptive alt text per room; progress/caption
  region is `aria-live="polite"`; component is fully usable (auto-advances, captions
  still readable) if JavaScript-driven scroll-pin fails, degrading to plain scroll
- Performance: only animate transform and opacity; images lazy-loaded except the
  first; each image served at an appropriately sized responsive srcset

## Motion / Animation

- Trigger: scroll position on desktop, autoplay timer on mobile
- Duration: 6s dwell per photo on mobile before auto-advance; cross-fade 900ms
  (1600ms for the bathroom→evening transition); Ken-Burns runs the full dwell/pin
  duration
- Easing: `ease-in-out` for cross-fades, linear for the Ken-Burns scale/pan
- Sequence: arrival (day exterior) → living room → bedroom → bathroom → evening
  exterior, always in this fixed order, no shuffling or looping mid-sequence
- Reduced-motion fallback: under `prefers-reduced-motion`, disable Ken-Burns and
  scroll-pin entirely; photos advance as simple opacity cross-fades on scroll/tap
  with no scale or pan

## Negative Constraints

- Avoid: carousel arrows/dots UI, autoplaying video, slideshow libraries with
  default easing, glassmorphism caption panels, more than one accent colour,
  filters that make the five photos look like different locations, parallax strong
  enough to cause motion sickness, captions in English, generic stock-photo
  styling added on top of the supplied images.

## Acceptance Criteria

- [ ] All five photos play in the fixed order with no skipped or repeated frames
- [ ] Bathroom → evening exterior transition reads as a deliberate day-to-night beat,
      not an abrupt cut
- [ ] Component holds 60fps on a mid-range Android phone during auto-advance
- [ ] With reduced-motion enabled, sequence still advances but with plain fades only
- [ ] Captions are legible against every one of the five source photos
- [ ] Works correctly with the five specific supplied photos without manual per-photo
      tuning
