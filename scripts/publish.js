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

function capture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
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

const pendingPath = prompt.fullPath;

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

// Stage both sides of the move. Staging only the new path leaves the pending
// copy committed, so the prompt ends up in two stages at once and a fresh
// clone reports it as both waiting for review and approved. The old path is
// only staged when git already tracks it — a never-committed draft has
// nothing to delete, and naming it would fail the pathspec.
const staged = [relPath];
if (!alreadyApproved) {
  const pendingRel = path.relative(ROOT, pendingPath);
  if (capture(`git ls-files -- "${pendingRel}"`)) staged.push(pendingRel);
}
run(`git add -A -- ${staged.map((p) => `"${p}"`).join(' ')}`);

if (capture('git diff --cached --name-only')) {
  run(`git commit -m "Publish prompt: ${path.basename(relPath)}"`);
} else {
  console.log('Nothing new to commit — prompt is already committed.');
}

run('git push origin HEAD');
console.log(`Pushed ${relPath} to origin.`);
