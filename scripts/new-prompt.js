#!/usr/bin/env node
/**
 * Create a new prompt file in prompts/pending/ from the template.
 *
 *   npm run new -- "Chata hero animation" --objective "..." --tags animation,hero
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIRS, ensureDirs, buildFilename } from './lib/prompt.js';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const title = args._.join(' ').trim() || args.title;

if (!title) {
  console.error('Usage: npm run new -- "Prompt title" [--objective "..."] [--tags a,b]');
  process.exit(1);
}

ensureDirs();

const templatePath = path.join(DIRS.templates, 'PROMPT_TEMPLATE.md');
if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

const filename = buildFilename(title);
const destination = path.join(DIRS.pending, filename);

if (fs.existsSync(destination)) {
  console.error(`Refusing to overwrite existing prompt: ${destination}`);
  process.exit(1);
}

const content = fs
  .readFileSync(templatePath, 'utf8')
  .replaceAll('{{TITLE}}', title)
  .replaceAll('{{DATE}}', new Date().toISOString().slice(0, 10))
  .replaceAll('{{OBJECTIVE}}', typeof args.objective === 'string' ? args.objective : 'TODO: describe the real objective.')
  .replaceAll('{{TAGS}}', typeof args.tags === 'string' ? args.tags : '');

fs.writeFileSync(destination, content, 'utf8');
console.log(`Created prompts/pending/${filename}`);
console.log('Fill in the sections, then: npm run validate');
