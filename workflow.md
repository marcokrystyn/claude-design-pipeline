# Workflow Protocol

## Stage 1 — Request

User gives Claude Chat a design request.

Example:

"Create a premium hero section for Lureo, a modern web design studio."

## Stage 2 — Prompt

Claude Chat creates a detailed prompt and saves it to:

`prompts/pending/`

## Stage 3 — Design

The connected Claude design workflow reads the pending prompt and creates the design.

## Stage 4 — Completion

Processed prompts belong in:

`prompts/completed/`

Generated/exported assets belong in:

`designs/`

## Naming

Use descriptive filenames.

Example:

`2026-08-11-1945-lureo-hero-section.md`

Avoid generic names such as:

`prompt1.md`
`design-final-final2.md`
