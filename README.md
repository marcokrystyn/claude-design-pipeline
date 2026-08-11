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
6. A design-capable Claude workflow reads the approved prompt and creates the design.
7. The design is saved in `designs/`, and `npm run complete` moves the prompt to
   `prompts/completed/` with a completion stamp appended.

## Folders

- `prompts/pending/` — drafted prompts, not yet reviewed
- `prompts/approved/` — validated prompts ready for Design Creator
- `prompts/completed/` — processed prompts with a completion stamp
- `designs/` — generated/exported design files
- `instructions/` — workflow rules and the design system
- `templates/` — the prompt template used by `npm run new`
- `scripts/` — pipeline CLI

## Prompt structure

Every prompt file must contain an H1 title plus these sections:

- `## Objective`
- `## Final Design Prompt`
- `## Technical Requirements`
- `## Negative Constraints`

Filenames follow `YYYY-MM-DD-HHMM-short-description.md`. Existing prompts are never
overwritten — `new`, `approve` and `complete` all refuse to clobber a file.

## CI

`.github/workflows/validate-prompts.yml` runs `npm run validate` on every push and
pull request that touches `prompts/` or `scripts/`. A prompt missing a required
section fails the build.

## Important

GitHub is the shared workspace. It does not itself press buttons or invoke Claude
Design automatically. The exact automation depends on the Claude feature/interface
connected to this repository.
