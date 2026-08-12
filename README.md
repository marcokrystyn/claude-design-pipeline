# Claude Design Pipeline

GitHub workspace for a Claude Chat → prompt → Claude Design workflow.

Claude Chat writes structured design prompts into this repository. A design-capable
Claude workflow reads them and produces the designs. The scripts here enforce the
structure so nothing half-written reaches the design stage.

## Requirements

Node.js 18 or newer. No dependencies to install.

## Commands

```bash
npm run new -- "Chata hero animation"    # create a prompt in prompts/pending/
npm run validate                          # check every prompt's structure
npm run approve -- chata-hero             # pending/ -> approved/ (blocks on errors)
npm run complete -- chata-hero --design designs/chata-hero.html
npm run status                            # show the state of the pipeline
```

`approve` and `complete` accept a full filename or any unique fragment of one.

## Workflow

1. Claude Chat receives a design request.
2. Claude converts it into a structured design prompt (`npm run new`).
3. The prompt lands in `prompts/pending/`.
4. `npm run validate` confirms it has every required section.
5. `npm run approve` promotes it to `prompts/approved/`.
6. In a local Claude Code session on this repo, the `design-run` skill reads the
   approved prompt and builds the design.
7. The design is saved in `designs/`, and `npm run complete` moves the prompt to
   `prompts/completed/` with a completion stamp appended.
8. Optionally `/design-sync` pushes the resulting components into a claude.ai/design
   design-system project.

`npm run publish -- <name>` collapses steps 4, 5 and the commit+push into one
command.

## Folders

- `prompts/pending/` — drafted prompts, not yet reviewed
- `prompts/approved/` — validated prompts ready for Design Creator
- `prompts/completed/` — processed prompts with a completion stamp
- `designs/` — generated/exported design files
- `instructions/` — workflow rules and the design system
- `templates/` — the prompt template used by `npm run new`, plus a filled-in
  `EXAMPLE_PROMPT.md` showing what a complete prompt looks like
- `scripts/` — pipeline CLI

## Prompt structure

Every prompt file must contain an H1 title plus these sections:

- `## Objective`
- `## Final Design Prompt`
- `## Technical Requirements`
- `## Negative Constraints`

Filenames follow `YYYY-MM-DD-HHMM-short-description.md`. Existing prompts are never
overwritten: `new` refuses to write over a file, while `approve` and `complete`
auto-suffix the moved file (`-2`, `-3`, …) if the destination is taken.

`complete` only accepts prompts from `prompts/approved/`, so a draft cannot skip
the approval gate.

## CI

`.github/workflows/validate-prompts.yml` runs `npm run validate` on every push and
pull request that touches `prompts/` or `scripts/`. A prompt missing a required
section fails the build.

## Important — what cannot be automated

GitHub is the shared workspace. It holds the queue; it does not invoke the design
stage on its own.

There is no automatic push from this repository into claude.ai/design. Design
authorization is obtained through an interactive `/design-login` and is tied to a
claude.ai login — there is no machine credential to put in GitHub Secrets, so a
CI runner cannot hold it. The supported direction of travel is the reverse:
Claude Design's "Send to Claude Code Web" seeds a project into a workspace.

`/design-sync` is also not an execution path. It uploads a component library into
a design-system project; it does not accept a prompt and return a design.

So the design stage runs in a local Claude Code session via the `design-run`
skill, started by a human. Everything before it — drafting, validation, the
approval gate, and CI — is automated.
