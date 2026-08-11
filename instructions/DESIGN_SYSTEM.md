# Design System

Use this file as the persistent design-generation standard.

## General quality

- Premium, polished and intentional visual hierarchy.
- Avoid generic AI-looking layouts.
- Prefer strong typography, spacing and composition.
- Every element should have a clear purpose.
- Keep the visual language consistent across related designs.

## Prompt structure

Every generated prompt should specify, when relevant:

1. Objective
2. Subject
3. Audience
4. Composition
5. Layout
6. Visual style
7. Color system
8. Typography
9. Lighting
10. Materials/textures
11. Background/environment
12. Camera/perspective
13. Responsive behavior
14. Technical constraints
15. Negative constraints

## Output

The final prompt must be directly usable by the Claude design-generation workflow without additional explanation.

## Motion and animation

When a design includes motion, the prompt must specify it explicitly rather than
leaving it implied.

- State the trigger (page load, scroll into view, hover, click, continuous loop).
- State duration and easing, not just "smooth" or "modern".
- Prefer transform and opacity over animating layout properties.
- Stagger related elements instead of animating everything at once.
- Motion should support the hierarchy, never compete with the headline.
- Always define a reduced-motion fallback (`prefers-reduced-motion`).
- Loops must be seamless and calm enough to sit behind readable text.

Default timing language for this repository:

- Micro-interaction: 120-200 ms
- Entrance: 400-700 ms
- Ambient/background loop: 8-20 s
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, `ease-in-out` for loops

## Technical baseline

Unless a prompt says otherwise, designs target:

- React + TypeScript + Tailwind CSS
- Framer Motion for animation
- Deployment on Vercel
- Mobile-first, breakpoints at 640 / 768 / 1024 / 1280
