#!/usr/bin/env node
/**
 * Move a validated prompt from pending/ to approved/.
 * Approval is a hard gate: a prompt with structural errors cannot be approved.
 *
 *   npm run approve -- lureo-hero
 */
import { findPrompt, movePrompt, validateFile } from './lib/prompt.js';

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.error('Usage: npm run approve -- <filename-or-fragment>');
  process.exit(1);
}

let prompt;
try {
  prompt = findPrompt(query, ['pending']);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const result = validateFile(prompt.fullPath);
if (result.errors.length) {
  console.error(`Cannot approve ${result.file} — fix these first:`);
  for (const error of result.errors) console.error(`  - ${error}`);
  process.exit(1);
}
for (const warning of result.warnings) console.warn(`  WARN  ${warning}`);

const destination = movePrompt(prompt.fullPath, 'approved');
console.log(`Approved: prompts/approved/${destination.split('/').pop()}`);
