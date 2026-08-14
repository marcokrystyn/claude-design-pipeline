# Chata Flythrough — production spec

A five-clip flythrough with real camera movement, generated per-photo by an
image-to-video model and joined into one continuous visit that loops.

This is a different piece from `../chata-pov-walkthrough/`, which cross-fades
five *stills* in the browser. That one needs no generation and no video hosting;
this one needs both, and buys genuine camera motion for it.

## Files

- `PORADI.txt` — the five photos in narrative order, verbatim as supplied
- `PROMPTY.txt` — one image-to-video prompt per clip, plus the shared negative
  prompt, verbatim as supplied
- `photos/` — the five source stills, named as in `PORADI.txt`
- `clips/` — the generated clips land here

## Workflow

1. Put the five stills in `photos/` under the names in `PORADI.txt`.
2. Generate each clip in an image-to-video tool — Runway, Kling, Veo, Sora,
   Hailuo. Always image-to-video with the still as the start frame, never
   text-to-video, or the architecture will not survive.
3. Save the results in `clips/` as `01…05`.
4. Join them, or hand them to a player component that plays them back to back.

Clip 5 ends on the same vantage point clip 1 opens on, so the sequence loops
without a visible seam.

## Two things worth resolving before generating

Generation is the expensive step, so these are cheaper to settle first.

**Clip 2 travels the wrong way for the cut that follows it.** `PORADI.txt` calls
clip 2 the outside→inside transition, but its prompt ends the camera drifting
"toward the timber railing and the open valley view beyond" — facing away from
the cabin. Cutting from that to a kitchen interior reverses direction mid-move,
which reads as a jump rather than as walking in. If clip 2 is meant to carry the
viewer indoors, it should end facing the door or the interior wall instead.

**The five stills may not be one property.** Photos 01 and 05 are plainly the
same cabin from the same vantage — that part works, and the loop depends on it.
Photo 02's surroundings do not match them: an autumn deciduous hillside and a
misty valley, against 01/05's evergreen forest, mown lawn and stacked stone
retaining wall. The two interiors cannot be tied to either from the images
alone. A viewer who notices will read it as a stitched-together sample rather
than one visit, which is the opposite of what a portfolio demo is for. Either
source a deck photo from the same property, or drop clip 2 and let clip 1 land
directly on the interior.

## Notes carried from the supplied spec

- The property has no pool. Never let the words "pool" or "outdoor lounge" into
  a prompt — the model will invent one.
- 5–6s clips hold geometry better than 10s. If the structure starts to ripple,
  slow the camera rather than shortening the prompt.
