#!/usr/bin/env node
/**
 * Validate every prompt file against the structure required by
 * instructions/CLAUDE_CHAT_INSTRUCTIONS.md. Exits non-zero on errors,
 * so it can gate CI.
 */
import { STAGES, listPrompts, validateFile } from './lib/prompt.js';

const only = process.argv.slice(2).filter((a) => STAGES.includes(a));
const stages = only.length ? only : STAGES;

let errorCount = 0;
let warningCount = 0;
let fileCount = 0;

for (const stage of stages) {
  const prompts = listPrompts(stage);
  if (!prompts.length) continue;

  console.log(`\n${stage}/`);
  for (const prompt of prompts) {
    fileCount += 1;
    const result = validateFile(prompt.fullPath);
    const ok = result.errors.length === 0;
    const mark = ok ? (result.warnings.length ? '!' : 'v') : 'x';
    console.log(`  [${mark}] ${result.file}`);
    for (const error of result.errors) {
      console.log(`        ERROR   ${error}`);
      errorCount += 1;
    }
    for (const warning of result.warnings) {
      console.log(`        WARN    ${warning}`);
      warningCount += 1;
    }
  }
}

console.log(
  `\nChecked ${fileCount} prompt file(s): ${errorCount} error(s), ${warningCount} warning(s).`
);
process.exit(errorCount > 0 ? 1 : 0);
