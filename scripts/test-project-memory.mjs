import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import test from 'node:test';
import { requiredDocuments, validateProjectMemory } from './check-project-memory.mjs';

const journalName = 'docs/journal/2026-10-06-1200Z-bootstrap.md';
const journal = '# Work record\n\n## Request\nRecord the request.\n\n## Changes\nDescribe changes.\n\n## Decisions and rationale\nRecord concise reasons.\n\n## Verification\nList actual evidence.\n\n## Next steps\nName remaining work.\n';

function fixture(t, { history = false } = {}) {
  const temporaryParent = resolve(tmpdir());
  const root = mkdtempSync(resolve(temporaryParent, 'aqai-memory-test-'));
  const write = (file, content) => {
    const path = resolve(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  for (const file of requiredDocuments) write(file, `# ${file}\n\nCurrent project information.\n`);
  write(journalName, journal);
  t.after(() => {
    // Resolve/check the generated path before recursive cleanup on Windows too.
    assert.ok(resolve(root).startsWith(`${temporaryParent}${sep}aqai-memory-test-`));
    rmSync(root, { recursive: true, force: true });
  });
  if (history) {
    git('init', '--initial-branch=main');
    git('add', '--all');
    git('-c', 'user.name=Continuity Test', '-c', 'user.email=continuity@example.invalid',
      'commit', '--no-gpg-sign', '-m', 'Initial fixture');
  }
  const updateState = () => write('docs/PROJECT-STATE.md', '# Current state\n\nNew verified milestone.\n');
  const addJournal = () => write('docs/journal/2026-10-06-1300Z-follow-up.md', journal);
  return { root, write, git, updateState, addJournal };
}

test('structure works before Git bootstrap and accepts portable links/anchors', (t) => {
  const { root, write } = fixture(t);
  write('docs/README.md', '# Docs\n[State](PROJECT-STATE.md#current)\n[Decision][decision]\n\n[decision]: DECISIONS.md "Decision log"\n[External](https://example.invalid/a)\n[Mail](mailto:owner@example.invalid)\n[Anchor](#missing-anchor-is-intentionally-ignored)\n');
  const result = validateProjectMemory({ root });
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
});

test('required documents cannot be missing or empty', (t) => {
  const { root, write } = fixture(t);
  rmSync(resolve(root, 'AGENTS.md'));
  write('docs/PROJECT-STATE.md', ' \n');
  const result = validateProjectMemory({ root });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.startsWith('AGENTS.md: required')));
  assert.ok(result.issues.some((issue) => issue.startsWith('docs/PROJECT-STATE.md: required')));
});

test('checks inline, image, and reference relative links', (t) => {
  const { root, write } = fixture(t);
  write('docs/README.md', '# Docs\n[Missing](not-here.md#anchor)\n![Missing image](missing.png)\n[Source][source]\n\n[source]: <other-missing.md>\n');
  const result = validateProjectMemory({ root });
  assert.equal(result.issues.filter((issue) => issue.includes('broken relative link')).length, 3);
});

test('supports filenames with spaces, encoded characters, and balanced parentheses', (t) => {
  const { root, write } = fixture(t);
  write('docs/a note (draft).txt', 'reference');
  write('docs/note(draft).txt', 'reference');
  write('docs/README.md', '# Docs\n[Space](<a note (draft).txt>)\n[Encoded](a%20note%20%28draft%29.txt#x)\n[Balanced](note(draft).txt)\n');
  assert.deepEqual(validateProjectMemory({ root }).issues, []);
});

test('rejects local-machine links on Linux and Windows', (t) => {
  const { root, write } = fixture(t);
  write('docs/README.md', '# Docs\n[Windows](C:/Users/owner/private.md)\n[POSIX](/home/owner/private.md)\n[File](file:///C:/owner/private.md)\n[Encoded](C%3A%2FUsers%2Fowner%2Fprivate.md)\n');
  assert.equal(validateProjectMemory({ root }).issues.filter((issue) => issue.includes('absolute local-machine link')).length, 4);
});

test('ignores examples in inline code and fenced blocks', (t) => {
  const { root, write } = fixture(t);
  write('docs/README.md', '# Docs\n`[example](missing.md)`\n\n```md\n[local](C:/example.md)\n[missing](other.md)\n```\n\n~~~md\n[missing](elsewhere.md)\n~~~\n');
  assert.deepEqual(validateProjectMemory({ root }).issues, []);
});

test('rejects links escaping the repository and malformed URL encoding', (t) => {
  const { root, write } = fixture(t);
  write('docs/README.md', '# Docs\n[Escape](../../external.md)\n[Broken](%not-encoding.md)\n');
  const result = validateProjectMemory({ root });
  assert.ok(result.issues.some((issue) => issue.includes('escapes the repository')));
  assert.ok(result.issues.some((issue) => issue.includes('malformed percent encoding')));
});

test('journal/report names require date-first valid dates and UTC times', (t) => {
  const { root, write } = fixture(t);
  write('docs/reports/OPERATING-COSTS-OCT06.md', '# Cost audit');
  write('docs/reports/2026-02-30-invalid.md', '# Invalid date');
  write('docs/journal/2026-10-06-2460Z-invalid.md', journal);
  write('docs/reports/2026-10-06-operating-costs.md', '# Valid report');
  const result = validateProjectMemory({ root });
  assert.equal(result.issues.filter((issue) => issue.includes('use docs/')).length, 3);
});

test('journal must include real required headings, not fenced examples', (t) => {
  const { root, write } = fixture(t);
  write(journalName, '# Work\n## Request\nTest.\n```md\n## Verification\n```\n');
  const result = validateProjectMemory({ root });
  assert.equal(result.issues.filter((issue) => issue.includes('missing journal heading')).length, 4);
  assert.ok(result.issues.some((issue) => issue.includes('"Verification"')));
});

test('invalid base and unborn Git repository fail clearly without silently skipping', (t) => {
  const { root, git } = fixture(t);
  git('init', '--initial-branch=main');
  assert.ok(validateProjectMemory({ root, base: 'HEAD' }).issues.some((issue) => issue.startsWith('Cannot check --base')));
  git('add', '--all');
  git('-c', 'user.name=Continuity Test', '-c', 'user.email=continuity@example.invalid', 'commit', '--no-gpg-sign', '-m', 'Initial');
  assert.ok(validateProjectMemory({ root, base: 'does-not-exist' }).issues.some((issue) => issue.startsWith('Cannot check --base')));
});

test('an unchanged old journal cannot satisfy a new code change', (t) => {
  const { root, write, updateState } = fixture(t, { history: true });
  write('src/change.mjs', 'export const changed = true;\n');
  updateState();
  const result = validateProjectMemory({ root, base: 'HEAD' });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes('unchanged historical entry does not count')));
});

test('new untracked code requires both state update and changed journal', (t) => {
  const { root, write, updateState, addJournal } = fixture(t, { history: true });
  write('src/change.mjs', 'export const changed = true;\n');
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).issues.length, 2);
  addJournal();
  assert.ok(validateProjectMemory({ root, base: 'HEAD' }).issues.some((issue) => issue.includes('updated docs/PROJECT-STATE.md')));
  updateState();
  assert.deepEqual(validateProjectMemory({ root, base: 'HEAD' }).issues, []);
});

test('committed and staged changes are checked against the selected base', (t) => {
  const { root, write, git, updateState, addJournal } = fixture(t, { history: true });
  const base = git('rev-parse', 'HEAD');
  write('scripts/change.mjs', '// New behavior\n');
  updateState();
  addJournal();
  git('add', '--all');
  assert.equal(validateProjectMemory({ root, base }).ok, true);
  git('-c', 'user.name=Continuity Test', '-c', 'user.email=continuity@example.invalid', 'commit', '--no-gpg-sign', '-m', 'Verified change');
  assert.equal(validateProjectMemory({ root, base }).ok, true);
});

test('deleted journal is not an audit record for new changes', (t) => {
  const { root, write, updateState } = fixture(t, { history: true });
  rmSync(resolve(root, journalName));
  write('src/change.mjs', '// Change\n');
  updateState();
  assert.ok(validateProjectMemory({ root, base: 'HEAD' }).issues.some((issue) => issue.includes('new or updated dated')));
});

test('a documentation-only report also needs state and journal updates', (t) => {
  const { root, write, updateState, addJournal } = fixture(t, { history: true });
  write('docs/reports/2026-10-06-cost-review.md', '# Checked cost\nA report.\n');
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).issues.length, 2);
  updateState();
  addJournal();
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).ok, true);
});

test('unchanged replay and isolated journal updates do not invent missing work', (t) => {
  const { root, write } = fixture(t, { history: true });
  write(journalName, readFileSync(resolve(root, journalName), 'utf8'));
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).ok, true);
  write(journalName, `${journal}\nClarified the historical test command.\n`);
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).ok, true);
  write('data/local-snapshot.json', '{"diagnostic":true}\n');
  assert.equal(validateProjectMemory({ root, base: 'HEAD' }).ok, true);
});
