#!/usr/bin/env node
/**
 * One-shot: approve a pending prompt, then commit + push it to main.
 * This is what makes the pipeline "automated" — one command instead of
 * approve -> git add -> git commit -> git push done by hand each time.
 *
 *   npm run publish -- chata-pov-walkthrough
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { findPrompt, validateFile, movePrompt, ROOT } from './lib/prompt.js';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.error('Usage: npm run publish -- <filename-or-fragment>');
  process.exit(1);
}

// Find it in pending (normal case) or approved (already approved, just needs pushing).
let prompt;
let alreadyApproved = false;
try {
  prompt = findPrompt(query, ['pending']);
} catch {
  try {
    prompt = findPrompt(query, ['approved']);
    alreadyApproved = true;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (!alreadyApproved) {
  const result = validateFile(prompt.fullPath);
  if (result.errors.length) {
    console.error(`Cannot publish ${result.file} — fix these first:`);
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  for (const warning of result.warnings) console.warn(`  WARN  ${warning}`);
  prompt.fullPath = movePrompt(prompt.fullPath, 'approved');
  console.log(`Approved: ${path.relative(ROOT, prompt.fullPath)}`);
}

const relPath = path.relative(ROOT, prompt.fullPath);
run(`git add "${relPath}"`);
run(`git commit -m "Publish prompt: ${path.basename(relPath)}"`);
run('git push origin HEAD');
console.log(`Pushed ${relPath} to origin.`);
