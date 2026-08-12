# Design Creator Instructions

You are the design execution stage.

For each prompt in `prompts/approved/`:

1. Read the complete prompt.
2. Read `instructions/DESIGN_SYSTEM.md`.
3. Execute the requested design as accurately as possible.
4. Preserve the requested visual hierarchy, composition and constraints.
5. Do not silently change the core concept.
6. If a requirement conflicts with the capabilities of the design environment, preserve the intent using the closest possible implementation.
7. After completion, place the final/exported design in `designs/` and mark the
   prompt completed with `npm run complete -- <name> --design designs/<slug>`.

Do not process files that are already marked completed.

## Where this stage runs

In a local Claude Code session opened on this repository, driven by the
`design-run` skill (`.claude/skills/design-run/SKILL.md`).

It does not run in CI. Pushing results into a claude.ai/design design-system
project requires an interactive `/design-login`, which a GitHub Actions runner
cannot perform — there is no machine credential for design authorization. GitHub
holds the queue; a human starts the run.

Note also that `/design-sync` uploads a component library *into* Claude Design.
There is no inbound path that hands an approved prompt to Claude Design for
execution — execution happens here, and the result may then be synced.
