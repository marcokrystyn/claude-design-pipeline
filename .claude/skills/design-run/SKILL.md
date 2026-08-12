---
name: design-run
description: Execute an approved design prompt from this repository — read it, build the design into designs/, check it against its own acceptance criteria, optionally push it to claude.ai/design, and mark the prompt completed. Use when the user asks to run, execute, or build an approved prompt, or names a prompt in prompts/approved/.
---

# Run an approved design prompt

This is the design execution stage of the pipeline. It runs in a local Claude Code
session, not in CI — pushing to claude.ai/design needs an interactive
`/design-login`, which a GitHub Actions runner cannot do.

## 1. Pick the prompt

```bash
npm run status
```

If the user named a prompt, use it. If not and exactly one prompt is approved, use
that one. If several are approved and the user did not choose, ask which one —
do not guess.

Only prompts in `prompts/approved/` are eligible. A prompt still in `pending/` has
not passed the approval gate; run `npm run approve -- <name>` first, or tell the
user why it cannot be approved.

## 2. Read everything before building

Read, in this order:

1. The full prompt file — every section, not just `## Final Design Prompt`.
2. `instructions/DESIGN_SYSTEM.md` — the quality bar the output is held to.

The prompt's own sections are the spec:

- `## Final Design Prompt` — what to build.
- `## Technical Requirements` — output format, breakpoints, accessibility,
  performance. These are constraints, not suggestions.
- `## Motion / Animation` — timings, easings, reduced-motion fallback, if present.
- `## Negative Constraints` — things that must NOT appear. Check the finished
  design against each one explicitly.
- `## Acceptance Criteria` — the checklist the result is judged by, if present.

## 3. Build it

Write the design into `designs/<slug>/`, where `<slug>` is the prompt filename
without its date prefix and extension. Use the output format named in the prompt's
`## Technical Requirements` — do not substitute a different stack because it is
more convenient.

If a requirement cannot be met in the chosen format, implement the closest thing
that preserves the intent and say so plainly in the summary. Do not silently
change the core concept.

## 4. Check before claiming done

Walk the `## Acceptance Criteria` and `## Negative Constraints` one item at a time
and state, for each, whether the built design satisfies it. Anything you could not
verify without running the design in a browser — frame rates, legibility against
real photos — say so rather than asserting it passes.

## 5. Push to claude.ai/design (optional)

Only when the user wants the result in their Claude Design design-system project:

```
/design-sync
```

This needs design authorization. If it is missing, the session will say so and the
user runs `/design-login` in an interactive terminal first. This step is not
available in Claude Code on the web or in CI — skip it there and leave the design
in `designs/`.

Note that `/design-sync` uploads a component library into a design-system project.
It is not a way to send the prompt to Claude Design for execution — execution is
what this skill just did.

## 6. Mark it completed

```bash
npm run complete -- <name> --design designs/<slug>
```

This moves the prompt to `prompts/completed/` and appends a completion stamp
recording where the design landed. It only accepts prompts from `approved/`.

Then commit the design and the moved prompt together, so the repository never
records a prompt as completed without the design it produced.
