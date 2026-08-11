import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
export const ROOT = path.resolve(path.dirname(__filename), '..', '..');

export const DIRS = {
  pending: path.join(ROOT, 'prompts', 'pending'),
  approved: path.join(ROOT, 'prompts', 'approved'),
  completed: path.join(ROOT, 'prompts', 'completed'),
  designs: path.join(ROOT, 'designs'),
  templates: path.join(ROOT, 'templates'),
  instructions: path.join(ROOT, 'instructions'),
};

/** Sections every prompt file must contain, per instructions/CLAUDE_CHAT_INSTRUCTIONS.md */
export const REQUIRED_SECTIONS = [
  'Objective',
  'Final Design Prompt',
  'Technical Requirements',
  'Negative Constraints',
];

export const STAGES = ['pending', 'approved', 'completed'];

export function ensureDirs() {
  for (const dir of Object.values(DIRS)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Turn any text into a safe, ascii-ish filename slug. Handles Czech diacritics. */
export function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

/** YYYY-MM-DD-HHMM in local time, matching the naming rule in workflow.md */
export function timestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + '-' + pad(date.getHours()) + pad(date.getMinutes());
}

export function buildFilename(title, date = new Date()) {
  return `${timestamp(date)}-${slugify(title)}.md`;
}

export function listPrompts(stage) {
  const dir = DIRS[stage];
  if (!dir || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .sort()
    .map((file) => ({
      stage,
      file,
      fullPath: path.join(dir, file),
    }));
}

export function allPrompts() {
  return STAGES.flatMap(listPrompts);
}

/** Extract "## Section" headings and their body text. */
export function parseSections(markdown) {
  const sections = {};
  const lines = markdown.split(/\r?\n/);
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current !== null) sections[current] = buffer.join('\n').trim();
  };

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1];
      buffer = [];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

export function parseTitle(markdown) {
  const match = /^#\s+(.+?)\s*$/m.exec(markdown);
  return match ? match[1] : null;
}

/**
 * Validate a single prompt file.
 * Returns { file, errors: [], warnings: [] }
 */
export function validateFile(fullPath) {
  const file = path.basename(fullPath);
  const errors = [];
  const warnings = [];
  const raw = fs.readFileSync(fullPath, 'utf8');

  if (!parseTitle(raw)) {
    errors.push('Missing H1 title (a line starting with "# ").');
  }

  const sections = parseSections(raw);
  const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '').trim();

  for (const required of REQUIRED_SECTIONS) {
    if (!(required in sections)) {
      errors.push(`Missing required section: "## ${required}".`);
      continue;
    }
    const body = stripComments(sections[required]);
    if (!body) {
      errors.push(`Section "## ${required}" is empty.`);
    } else if (/^(TODO|TBD|\.\.\.|-)\s*$/im.test(body) || /\bTODO\b/.test(body)) {
      errors.push(`Section "## ${required}" still contains a TODO placeholder.`);
    }
  }

  const finalPrompt = stripComments(sections['Final Design Prompt'] || '');
  const words = finalPrompt.split(/\s+/).filter(Boolean).length;
  if (finalPrompt && !/\bTODO\b/.test(finalPrompt) && words < 40) {
    warnings.push(
      `"Final Design Prompt" is only ${words} words — the design system asks for a highly specific prompt.`
    );
  }

  // Naming rule from workflow.md: YYYY-MM-DD-HHMM-short-description.md
  const namePattern = /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+\.(md|txt)$/;
  const exempt = /^(EXAMPLE|README|TEMPLATE)\.(md|txt)$/i;
  if (!namePattern.test(file) && !exempt.test(file)) {
    warnings.push(
      'Filename does not follow YYYY-MM-DD-HHMM-short-description.md from workflow.md.'
    );
  }

  if (/\b(as an ai|I hope this helps|let me know if)\b/i.test(raw)) {
    warnings.push('Looks like conversational commentary leaked into the prompt file.');
  }

  return { file, fullPath, errors, warnings };
}

/** Move a prompt between stages without ever overwriting an existing file. */
export function movePrompt(fullPath, toStage) {
  const target = DIRS[toStage];
  if (!target) throw new Error(`Unknown stage: ${toStage}`);
  fs.mkdirSync(target, { recursive: true });

  const base = path.basename(fullPath);
  let destination = path.join(target, base);
  if (fs.existsSync(destination)) {
    const ext = path.extname(base);
    const stem = base.slice(0, -ext.length);
    let counter = 2;
    while (fs.existsSync(destination)) {
      destination = path.join(target, `${stem}-${counter}${ext}`);
      counter += 1;
    }
  }
  fs.renameSync(fullPath, destination);
  return destination;
}

/** Find a prompt by exact filename or by partial match, within given stages. */
export function findPrompt(query, stages = STAGES) {
  const candidates = stages.flatMap(listPrompts);
  const exact = candidates.filter((p) => p.file === query);
  if (exact.length === 1) return exact[0];

  const partial = candidates.filter((p) =>
    p.file.toLowerCase().includes(String(query).toLowerCase())
  );
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    const list = partial.map((p) => `  - ${p.stage}/${p.file}`).join('\n');
    throw new Error(`"${query}" matches several prompts:\n${list}`);
  }
  throw new Error(`No prompt matching "${query}" found in: ${stages.join(', ')}`);
}
