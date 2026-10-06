import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const requiredDocuments = [
  'AGENTS.md',
  'docs/README.md',
  'docs/PROJECT-STATE.md',
  'docs/PROJECT-CHARTER.md',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docs/BACKLOG.md',
  'docs/AGENT-WORKFLOW.md',
  'docs/CLOUD-HANDOFF.md',
];

const journalSections = [
  'Request', 'Changes', 'Decisions and rationale', 'Verification', 'Next steps',
];

const normalized = (path) => path.split(sep).join('/');

function markdownFiles(root) {
  const files = ['AGENTS.md', 'README.md', '.github/pull_request_template.md']
    .filter((file) => existsSync(resolve(root, file)));
  function walk(directory) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      // Do not follow symlinks out of the documentation tree.
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(normalized(relative(root, path)));
      }
    }
  }
  walk(resolve(root, 'docs'));
  return files.sort();
}

function proseOnly(markdown) {
  let fence;
  return markdown.split(/\r?\n/).map((line) => {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined;
      return '';
    }
    return fence ? '' : line.replace(/(`+).*?\1/g, '');
  }).join('\n');
}

function linkTargets(markdown) {
  const text = proseOnly(markdown);
  const targets = [];
  // Inline links/images, including escaped or balanced parentheses in filenames.
  for (let index = 0; index < text.length - 1; index += 1) {
    if (text[index] !== ']' || text[index + 1] !== '(') continue;
    let cursor = index + 2;
    while (/\s/.test(text[cursor] ?? '') && cursor < text.length) cursor += 1;
    if (text[cursor] === '<') {
      const end = text.indexOf('>', cursor + 1);
      if (end !== -1) targets.push(text.slice(cursor + 1, end));
      continue;
    }
    let target = '';
    let depth = 0;
    while (cursor < text.length) {
      const char = text[cursor];
      if (char === '\\' && /[()\s]/.test(text[cursor + 1] ?? '')) {
        target += text[cursor + 1];
        cursor += 2;
        continue;
      }
      if (char === ')' && depth === 0) break;
      if (/\s/.test(char) && depth === 0) break;
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;
      target += char;
      cursor += 1;
    }
    if (target) targets.push(target);
  }
  for (const match of text.matchAll(/^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm)) {
    targets.push(match[1] ?? match[2]);
  }
  return targets;
}

function isCalendarDate(date) {
  const instant = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(instant.valueOf()) && instant.toISOString().slice(0, 10) === date;
}

function checkDatedName(file, issues) {
  let match;
  if (file.startsWith('docs/journal/')) {
    match = /^docs\/journal\/(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})Z-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.exec(file);
    if (!match || !isCalendarDate(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59) {
      issues.push(`${file}: use docs/journal/YYYY-MM-DD-HHMMZ-slug.md with a valid UTC date/time.`);
    }
  } else if (file.startsWith('docs/reports/')) {
    match = /^docs\/reports\/(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.exec(file);
    if (!match || !isCalendarDate(match[1])) {
      issues.push(`${file}: use docs/reports/YYYY-MM-DD-slug.md with a valid date.`);
    }
  }
}

function checkLinks(root, file, text, issues) {
  for (const target of linkTargets(text)) {
    let decoded;
    try {
      decoded = decodeURIComponent(target.split(/[?#]/)[0]);
    } catch {
      issues.push(`${file}: malformed percent encoding in link: ${target}`);
      continue;
    }
    if (!decoded) continue; // Anchors are intentionally not checked.
    if (/^file:/i.test(decoded) || /^[a-z]:[\\/]/i.test(decoded)
      || /^[/\\]/.test(decoded) || /^~[\\/]/.test(decoded)) {
      // Protocol-relative web URLs are portable, unlike local absolute paths.
      if (decoded.startsWith('//') && !decoded.startsWith('///')) continue;
      issues.push(`${file}: replace absolute local-machine link with a repository-relative link: ${target}`);
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(decoded)) continue;
    const destination = resolve(root, dirname(file), decoded.replaceAll('\\', '/'));
    const within = relative(root, destination);
    if (within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within)) {
      issues.push(`${file}: relative link escapes the repository: ${target}`);
    } else if (!existsSync(destination)) {
      issues.push(`${file}: broken relative link: ${target}`);
    }
  }
}

function git(root, args) {
  return execFileSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024,
  }).trim();
}

function substantive(file) {
  if (file === 'docs/PROJECT-STATE.md' || file.startsWith('docs/journal/')) return false;
  return /^(?:src|public|scripts|supabase|docs|\.github)\//.test(file)
    || /^(?:AGENTS\.md|README\.md|Dockerfile(?:\..*)?|docker-compose\.[^/]+|compose\.[^/]+|package(?:-lock)?\.json|[^/]+\.(?:[cm]?js|[cm]?ts|json|ya?ml|toml|html)|\.(?:dockerignore|gitignore|nvmrc|node-version|npmrc))$/.test(file);
}

function checkChangeRecord(root, base, issues) {
  let changed;
  try {
    const top = resolve(git(root, ['rev-parse', '--show-toplevel']));
    if (top !== root) throw new Error('not the repository root');
    const commit = git(root, ['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]);
    // Compare the base commit to the current working tree, including staged edits.
    const diff = git(root, ['diff', '--name-only', '-z', commit, '--']);
    const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '-z']);
    changed = [...new Set(`${diff}\0${untracked}`.split('\0').filter(Boolean))];
  } catch (error) {
    const detail = error.message === 'not the repository root' ? error.message : 'Git base is unavailable or not a commit';
    issues.push(`Cannot check --base ${base}: ${detail}. Fetch the base ref; do not omit this check to bypass a failed comparison.`);
    return;
  }
  if (!changed.some(substantive)) return;
  if (!changed.includes('docs/PROJECT-STATE.md') || !existsSync(resolve(root, 'docs/PROJECT-STATE.md'))) {
    issues.push('Substantive changes require an updated docs/PROJECT-STATE.md compared with the base.');
  }
  const hasJournal = changed.some((file) => /^docs\/journal\/\d{4}-\d{2}-\d{2}-\d{4}Z-[a-z0-9-]+\.md$/.test(file)
    && existsSync(resolve(root, file)));
  if (!hasJournal) {
    issues.push('Substantive changes require a new or updated dated docs/journal entry compared with the base; an unchanged historical entry does not count.');
  }
}

export function validateProjectMemory({ root, base } = {}) {
  root = resolve(root ?? fileURLToPath(new URL('..', import.meta.url)));
  const issues = [];
  for (const file of requiredDocuments) {
    const path = resolve(root, file);
    if (!existsSync(path) || !statSync(path).isFile() || !readFileSync(path, 'utf8').trim()) {
      issues.push(`${file}: required document is missing or empty.`);
    }
  }
  const files = markdownFiles(root);
  for (const file of files) {
    const text = readFileSync(resolve(root, file), 'utf8');
    checkDatedName(file, issues);
    checkLinks(root, file, text, issues);
    if (file.startsWith('docs/journal/')) {
      const headings = new Set([...proseOnly(text).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) => match[1].toLowerCase()));
      for (const section of journalSections) {
        if (!headings.has(section.toLowerCase())) issues.push(`${file}: missing journal heading "${section}".`);
      }
    }
  }
  if (base !== undefined) checkChangeRecord(root, base, issues);
  return { ok: issues.length === 0, checkedMarkdownFiles: files.length, issues };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--base' || !args[1] || args[1].startsWith('-'))) {
    console.error('Usage: node scripts/check-project-memory.mjs [--base <git-ref>]');
    process.exitCode = 2;
  } else {
    const result = validateProjectMemory({ base: args[1] });
    if (result.ok) console.log(`Project memory checks passed (${result.checkedMarkdownFiles} Markdown files${args[1] ? `; base ${args[1]}` : '; structure only'}).`);
    else {
      console.error(`Project memory checks failed:\n${result.issues.map((issue) => `- ${issue}`).join('\n')}`);
      process.exitCode = 1;
    }
  }
}
