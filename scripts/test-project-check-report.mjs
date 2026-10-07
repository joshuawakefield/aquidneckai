import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import test from 'node:test';
import {
  checkBudgetMs, createReport, deterministicWorkflows, executeCheck, exitCodeForReport,
  parseArgs, readRepositorySnapshot, renderText, terminateProcessTree,
} from './project-check-report.mjs';

function gitFixture(t) {
  const parent = resolve(tmpdir());
  const root = mkdtempSync(join(parent, 'aqai-check-report-'));
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const write = (path, content) => {
    const destination = resolve(root, path);
    mkdirSync(dirname(destination), {recursive: true});
    writeFileSync(destination, content);
  };
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Report fixture');
  git('config', 'user.email', 'report-fixture@example.invalid');
  write('README.md', 'Snapshot baseline\n');
  git('add', '--all');
  git('commit', '--no-gpg-sign', '-m', 'Fixture baseline');
  const base = git('rev-parse', 'HEAD');
  t.after(() => {
    assert.ok(root.startsWith(join(parent, 'aqai-check-report-')));
    rmSync(root, {recursive: true, force: true});
  });
  return {root, base, git, write};
}

const passingRun = (step, {base}) => ({
  id: step.id, command: step.display.replace('<starting-commit>', base),
  status: 'passed', exitCode: 0, durationMs: 2,
  stdoutTail: `completed ${step.id}`, stderrTail: '', error: null,
});

test('CLI requires an exact base and has cheap inventory mode by default', () => {
  assert.throws(() => parseArgs([]), /--base .*required/);
  assert.deepEqual(parseArgs(['--base', 'a'.repeat(40)]), {
    help: false, base: 'a'.repeat(40), format: 'json', mode: 'inventory',
  });
  assert.throws(() => parseArgs(['--base', 'HEAD', '--inventory', '--run-checks']), /either/);
  assert.throws(() => parseArgs(['--base', '-bad']), /requires a Git commit/);
  assert.throws(() => parseArgs(['--base', 'HEAD', '--format', 'yaml']), /json or text/);
});

test('repository snapshot reports actual base, branch and tracked/untracked changes', (t) => {
  const {root, base, write} = gitFixture(t);
  write('README.md', 'Changed tracked file\n');
  write('docs/new.md', 'Untracked file\n');
  const snapshot = readRepositorySnapshot(root, base);
  assert.equal(snapshot.base, base);
  assert.equal(snapshot.branch, 'main');
  assert.equal(snapshot.head, base);
  assert.deepEqual(snapshot.changedFiles, ['README.md', 'docs/new.md']);
});

test('inventory mode reports available deterministic work without inventing check outcomes', (t) => {
  const {root, base} = gitFixture(t);
  let ran = false;
  const report = createReport({root, base, now: () => Date.parse('2026-10-07T00:00:00Z'),
    run: () => { ran = true; }});
  assert.equal(ran, false);
  assert.equal(report.status, 'inventory_only');
  assert.equal(report.mode, 'inventory');
  assert.ok(report.inventory.some(item => item.id === 'candidate-reuse-replay'));
  assert.equal(report.checks.length, 4);
  assert.ok(report.checks.every(check => check.status === 'not_run'));
  assert.equal(report.checks[3].command, `node scripts/check-project-memory.mjs --base ${base}`);
  assert.equal(exitCodeForReport(report), 0);
  assert.match(renderText(report), /inventory\/status snapshot only/);
  assert.doesNotMatch(renderText(report), /checks passed/i);
  assert.ok(deterministicWorkflows.every(item => item.llm));
});

test('full-check mode refuses non-Node-22 runtimes without starting child commands', (t) => {
  const {root, base} = gitFixture(t);
  let runCount = 0;
  const report = createReport({root, base, mode: 'checks', nodeVersion: '24.19.0',
    run: () => { runCount += 1; }});
  assert.equal(runCount, 0);
  assert.equal(report.status, 'blocked');
  assert.match(report.message, /require Node\.js 22/);
  assert.ok(report.checks.every(check => check.status === 'not_run'));
  assert.equal(exitCodeForReport(report), 2);
});

test('full-check report records every actual outcome and uses the supplied base', (t) => {
  const {root, base} = gitFixture(t);
  const report = createReport({root, base, mode: 'checks', nodeVersion: '22.23.3', run: passingRun});
  assert.equal(report.status, 'passed');
  assert.equal(report.checks.length, 4);
  assert.ok(report.checks.every(check => check.status === 'passed' && check.exitCode === 0));
  assert.equal(report.checks[3].command, `node scripts/check-project-memory.mjs --base ${base}`);
  assert.equal(exitCodeForReport(report), 0);
});

test('a failed command remains failed and does not become a pass', (t) => {
  const {root, base} = gitFixture(t);
  let call = 0;
  const report = createReport({root, base, mode: 'checks', nodeVersion: '22.1.0',
    run: (step, context) => {
      call += 1;
      return call === 1
        ? {...passingRun(step, context), status: 'failed', exitCode: 1, stderrTail: 'fixture failure'}
        : passingRun(step, context);
    }});
  assert.equal(report.status, 'failed');
  assert.equal(report.checks[0].status, 'failed');
  assert.equal(report.checks[0].stderrTail, 'fixture failure');
  assert.equal(exitCodeForReport(report), 1);
});

test('the total budget makes later checks explicit not-run and marks the report incomplete', (t) => {
  const {root, base} = gitFixture(t);
  let clock = 0;
  let call = 0;
  const report = createReport({root, base, mode: 'checks', nodeVersion: '22.0.0',
    now: () => clock,
    run: (step, context) => {
      call += 1;
      clock = checkBudgetMs + 1;
      return passingRun(step, context);
    }});
  assert.equal(call, 1);
  assert.equal(report.checks[0].status, 'passed');
  assert.ok(report.checks.slice(1).every(check => check.status === 'not_run'));
  assert.equal(report.status, 'incomplete');
  assert.equal(exitCodeForReport(report), 2);
});

test('real child execution keeps the required tool path, drops service keys and blocks external fetches', (t) => {
  const {root, base} = gitFixture(t);
  const script = join(root, 'probe.mjs');
  writeFileSync(script, `
    let blocked = false;
    try { await fetch('https://example.invalid/should-not-connect'); }
    catch (error) { blocked = /block external network/i.test(error.message); }
    process.stdout.write(JSON.stringify({path: Boolean(process.env.PATH),
      secret: Boolean(process.env.AQAI_REPORT_TEST_SECRET),
      offline: process.env.AQAI_CLOUD_OFFLINE_TEST,
      customPython: process.env.AQAI_CLOUD_PYTHON, blocked}));
  `);
  const priorSecret = process.env.AQAI_REPORT_TEST_SECRET;
  const priorPython = process.env.AQAI_CLOUD_PYTHON;
  process.env.AQAI_REPORT_TEST_SECRET = 'test-only-secret-must-not-leak';
  process.env.AQAI_CLOUD_PYTHON = '/usr/bin/python3';
  t.after(() => {
    if (priorSecret === undefined) delete process.env.AQAI_REPORT_TEST_SECRET;
    else process.env.AQAI_REPORT_TEST_SECRET = priorSecret;
    if (priorPython === undefined) delete process.env.AQAI_CLOUD_PYTHON;
    else process.env.AQAI_CLOUD_PYTHON = priorPython;
  });
  const result = executeCheck({id: 'environment-guard', display: 'node probe.mjs', args: () => [script]},
    {root, base, timeoutMs: 5000});
  assert.equal(result.status, 'passed', result.stderrTail);
  const evidence = JSON.parse(result.stdoutTail);
  assert.equal(evidence.path, true);
  assert.equal(evidence.secret, false);
  assert.equal(evidence.offline, '1');
  assert.equal(evidence.customPython, '/usr/bin/python3');
  assert.equal(evidence.blocked, true);
  assert.doesNotMatch(result.stdoutTail, /must-not-leak/);
});

test('child diagnostics are bounded and redact credential-shaped values', (t) => {
  const {root, base} = gitFixture(t);
  const script = join(root, 'output.mjs');
  writeFileSync(script, "process.stdout.write('x'.repeat(9000) + ' api_key=secret-12345678901234567890');\n");
  const result = executeCheck({id: 'bounded-output', display: 'node output.mjs', args: () => [script]},
    {root, base, timeoutMs: 5000});
  assert.equal(result.status, 'passed');
  assert.ok(result.stdoutTail.length < 4200);
  assert.match(result.stdoutTail, /truncated to last 4000/);
  assert.match(result.stdoutTail, /api_key=\[redacted\]/);
  assert.doesNotMatch(result.stdoutTail, /secret-12345678901234567890/);
});

test('timeout kills the detached process group, including descendants', {skip: process.platform === 'win32'}, async (t) => {
  const {root, base} = gitFixture(t);
  const script = join(root, 'spawn-descendant.mjs');
  const pidFile = join(root, 'descendant.pid');
  writeFileSync(script, `
    import {spawn} from 'node:child_process';
    import {writeFileSync} from 'node:fs';
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {stdio: 'ignore'});
    writeFileSync(process.argv[2], String(child.pid));
    setInterval(() => {}, 1000);
  `);
  const result = executeCheck({id: 'timeout-tree', display: 'node spawn-descendant.mjs', args: () => [script, pidFile]},
    {root, base, timeoutMs: 800});
  assert.equal(result.status, 'timed_out');
  assert.ok(['terminated', 'already_exited'].includes(result.cleanup?.status));
  const childPid = Number(readFileSync(pidFile, 'utf8'));
  let alive = true;
  for (let attempt = 0; attempt < 20 && alive; attempt += 1) {
    try { process.kill(childPid, 0); }
    catch (error) { if (error.code === 'ESRCH') alive = false; else throw error; }
    if (alive) await new Promise(resolvePromise => setTimeout(resolvePromise, 25));
  }
  assert.equal(alive, false, 'the spawned child process must not outlive a timed-out check');
});

test('Windows timeout cleanup uses taskkill tree mode and reports its result', () => {
  let command;
  const success = terminateProcessTree(123, {platform: 'win32', spawn: (file, args, options) => {
    command = {file, args, options};
    return {status: 0, error: null, stderr: ''};
  }});
  assert.deepEqual(command.args, ['/PID', '123', '/T', '/F']);
  assert.equal(command.file, 'taskkill.exe');
  assert.equal(command.options.timeout, 1000);
  assert.equal(success.status, 'terminated');
  const failed = terminateProcessTree(123, {platform: 'win32', spawn: () => ({status: 1, error: null, stderr: 'denied'})});
  assert.equal(failed.status, 'cleanup_failed');
});

test('invalid Git bases fail closed with a bounded error', (t) => {
  const {root} = gitFixture(t);
  assert.throws(() => readRepositorySnapshot(root, 'missing-base'), /Git base is unavailable/);
});
