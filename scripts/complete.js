#!/usr/bin/env node
/**
 * Move a processed prompt to completed/ and stamp it with a completion note.
 *
 *   npm run complete -- lureo-hero --design designs/lureo-hero.html
 */
import fs from 'node:fs';
import { findPrompt, movePrompt } from './lib/prompt.js';

const argv = process.argv.slice(2);
const flagIndex = argv.indexOf('--design');
const designRef = flagIndex !== -1 ? argv[flagIndex + 1] : null;
const query = (flagIndex === -1 ? argv : argv.slice(0, flagIndex)).join(' ').trim();

if (!query) {
  console.error('Usage: npm run complete -- <filename-or-fragment> [--design <path-or-url>]');
  process.exit(1);
}

let prompt;
try {
  prompt = findPrompt(query, ['pending', 'approved']);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const destination = movePrompt(prompt.fullPath, 'completed');

const stamp = [
  '',
  '---',
  '',
  '## Completion',
  '',
  `- Completed: ${new Date().toISOString()}`,
  `- Came from: prompts/${prompt.stage}/`,
  designRef ? `- Design output: ${designRef}` : '- Design output: (not recorded)',
  '',
].join('\n');

fs.appendFileSync(destination, stamp, 'utf8');
console.log(`Completed: prompts/completed/${destination.split('/').pop()}`);
