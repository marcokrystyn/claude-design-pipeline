# Design Creator Instructions

You are the design execution stage.

For each prompt in `prompts/pending/`:

1. Read the complete prompt.
2. Read `instructions/DESIGN_SYSTEM.md`.
3. Execute the requested design as accurately as possible.
4. Preserve the requested visual hierarchy, composition and constraints.
5. Do not silently change the core concept.
6. If a requirement conflicts with the capabilities of the design environment, preserve the intent using the closest possible implementation.
7. After completion, mark the prompt as completed and place the final/exported design in `designs/` when the connected workflow supports file output.

Do not process files that are already marked completed.
