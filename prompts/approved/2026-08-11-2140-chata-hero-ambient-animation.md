# Chata Hero — Ambient Animation

<!--
Created: 2026-08-11
Tags: animation, hero, chaty, ambient
Rules: instructions/CLAUDE_CHAT_INSTRUCTIONS.md
Standard: instructions/DESIGN_SYSTEM.md
-->

## Objective

Give cottage and cabin rental websites a hero section whose motion sells the feeling
of the place — calm, remote, worth booking — without ever competing with the headline
or the booking CTA.

## Context

- Subject: A single rental cottage or cabin, photographed or illustrated in landscape.
- Audience: Czech families and couples booking a weekend or week away, mostly on mobile.
- Where it will be used: Above the fold on the cottage's own website, replacing a
  static photo or an outdated slideshow.

## Final Design Prompt

Design a full-bleed hero section for a countryside cottage rental. A wide landscape
image of the cottage fills the viewport behind a dark, bottom-weighted gradient scrim
that keeps text legible without flattening the photograph. Layer three slow ambient
motion elements over the scene: a very gradual parallax drift of the background image
as the user scrolls, a soft directional light that breathes almost imperceptibly across
the image on a long loop, and a fine particle layer suggesting drifting snow, pollen or
dust depending on the season, sparse enough to read as atmosphere rather than effect.
On load, the composition assembles in a staggered sequence — the scrim resolves first,
then the headline rises and fades in, then the subheadline, then the primary CTA, each
offset by roughly 90 ms so the eye is led downward through the hierarchy. Typography is
editorial and confident: a large serif or high-contrast display headline naming the
cottage and its setting, a restrained sans-serif subheadline carrying capacity and
location, and a single solid primary CTA reading "Rezervovat termín" with a quieter
ghost secondary action beside it. Colour language is warm and natural — deep forest and
charcoal in the scrim, warm off-white for text, a single amber accent reserved for the
CTA. The overall impression should be a still place that is quietly alive, closer to a
premium hotel site than a booking portal listing.

## Technical Requirements

- Responsive: mobile-first, hero fills 100svh on mobile and 90vh on desktop
- Breakpoints: 640 / 768 / 1024 / 1280
- Output format: React + TypeScript component with Tailwind classes, Framer Motion for entrance and loops
- Accessibility: headline is a real `h1`, CTA is a focusable button/link with visible focus ring, scrim keeps text contrast at 4.5:1 or better
- Performance: animate only transform and opacity, particle layer capped and paused when the hero leaves the viewport, background image served responsively

## Motion / Animation

- Trigger: entrance on mount, parallax on scroll, ambient loops continuous
- Duration: entrance 600 ms per element, light loop 16 s, particle drift 20 s
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, `ease-in-out` for loops
- Sequence: scrim → headline → subheadline → CTA, staggered 90 ms
- Reduced-motion fallback: under `prefers-reduced-motion` disable parallax, light loop and particles entirely; entrance becomes a plain opacity fade of 200 ms

## Negative Constraints

- Avoid: autoplaying video backgrounds, carousels or slideshows, glassmorphism panels,
  bouncy or elastic easing, parallax strong enough to cause motion sickness, particle
  effects dense enough to read as a screensaver, stock-photo styling, generic SaaS
  layouts, more than one accent colour, animated text that types itself out.

## Acceptance Criteria

- [ ] Headline is readable on the first frame, before any animation completes
- [ ] Entire hero holds 60fps on a mid-range Android phone
- [ ] With reduced-motion enabled, nothing moves except a single short fade
- [ ] CTA is reachable by keyboard and visibly focused
- [ ] Hero works with any landscape photo the cottage owner supplies, including a poor one
