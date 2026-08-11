#!/usr/bin/env node
/** Print the current state of the pipeline. */
import fs from 'node:fs';
import { DIRS, STAGES, listPrompts, validateFile } from './lib/prompt.js';

console.log('Claude Design Pipeline — status\n');

for (const stage of STAGES) {
  const prompts = listPrompts(stage);
  console.log(`${stage.padEnd(10)} ${prompts.length}`);
  for (const prompt of prompts) {
    const result = validateFile(prompt.fullPath);
    const mark = result.errors.length ? 'x' : result.warnings.length ? '!' : 'v';
    console.log(`  [${mark}] ${prompt.file}`);
  }
}

const designs = fs.existsSync(DIRS.designs)
  ? fs.readdirSync(DIRS.designs).filter((f) => !f.startsWith('.'))
  : [];
console.log(`\ndesigns    ${designs.length}`);
for (const design of designs) console.log(`  - ${design}`);

const pendingCount = listPrompts('pending').length;
const approvedCount = listPrompts('approved').length;
console.log('\nNext:');
if (pendingCount) console.log(`  ${pendingCount} prompt(s) waiting for review -> npm run approve -- <name>`);
if (approvedCount) console.log(`  ${approvedCount} prompt(s) ready for Claude Design`);
if (!pendingCount && !approvedCount) console.log('  Queue is empty -> npm run new -- "Title"');
