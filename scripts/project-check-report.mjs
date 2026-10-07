// Local-first project inventory and offline check runner. No live service calls.
import {execFileSync, spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cleanEnvironment} from './cloud-check.mjs';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const checkBudgetMs = 10 * 60 * 1000;
export const outputLimit = 4000;

// Static inventory complements the live outcomes below; it never implies that
// checks passed or that a human/model reviewed the underlying content.
export const deterministicWorkflows = [
  {
    id: 'report-regressions',
    command: 'node --test scripts/test-project-check-report.mjs',
    purpose: 'Report argument parsing, accurate status aggregation, timeouts and offline child environment',
    input: 'temporary local Git and process fixtures',
    network: 'none',
    llm: 'not needed',
  },
  {
    id: 'offline-project-suite',
    command: 'node scripts/cloud-check.mjs',
    purpose: 'TypeScript, frontend/backend/Python regressions, production build and loopback auth smoke',
    input: 'checked-out source plus local fixtures',
    network: 'blocked by the existing offline check harness',
    llm: 'not needed',
  },
  {
    id: 'continuity-regressions',
    command: 'node --test scripts/test-project-memory.mjs',
    purpose: 'Project-memory structure, relative links, journal names and change-record guardrails',
    input: 'local repository files and temporary Git fixtures',
    network: 'none',
    llm: 'not needed',
  },
  {
    id: 'project-memory-diff',
    command: 'node scripts/check-project-memory.mjs --base <starting-commit>',
    purpose: 'Required documents, local links, journal structure and state/journal updates against the task base',
    input: 'local repository and Git diff only',
    network: 'none',
    llm: 'not needed for validation; the factual project update still needs an author',
  },
  {
    id: 'news-provenance',
    command: 'node --test scripts/test-news-provenance.mjs',
    purpose: 'AQ-032 deterministic provenance normalization and display fixtures',
    input: 'reviewed fixture records',
    network: 'none',
    llm: 'not needed for normalization; supplied facts still need review',
  },
  {
    id: 'technology-source-scope',
    command: 'node --test scripts/test-technology-scope.mjs',
    purpose: 'AQ-033 fixture rubric for technology, source role/access/rights and story eligibility',
    input: 'explicit evidence annotations and synthetic cases',
    network: 'none',
    llm: 'not needed for the rule checks; semantic annotations remain human/model judgment',
  },
  {
    id: 'candidate-reuse-replay',
    command: 'node --test scripts/test-candidate-reuse.mjs',
    purpose: 'AQ-035 bounded offline reuse, saved-result recovery and changed-content replay',
    input: 'saved metadata and synthetic response states',
    network: 'none',
    llm: 'not needed for replay; real story usefulness remains judgment',
  },
];

const executionPlan = [
  {
    id: 'report-regressions',
    display: 'node --test scripts/test-project-check-report.mjs',
    args: () => ['--test', 'scripts/test-project-check-report.mjs'],
  },
  {
    id: 'offline-project-suite',
    display: 'node scripts/cloud-check.mjs',
    args: root => [resolve(root, 'scripts/cloud-check.mjs')],
  },
  {
    id: 'continuity-regressions',
    display: 'node --test scripts/test-project-memory.mjs',
    args: () => ['--test', 'scripts/test-project-memory.mjs'],
  },
  {
    id: 'project-memory-diff',
    display: 'node scripts/check-project-memory.mjs --base <starting-commit>',
    args: (_root, base) => ['scripts/check-project-memory.mjs', '--base', base],
  },
];

export function parseArgs(args) {
  let base;
  let format = 'json';
  let mode;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') return {help: true};
    if (arg === '--base') {
      if (base !== undefined) throw new Error('Provide --base only once.');
      const value = args[index + 1];
      if (!value || value.startsWith('-')) throw new Error('--base requires a Git commit or ref.');
      base = value;
      index += 1;
    } else if (arg === '--format') {
      const value = args[index + 1];
      if (!['json', 'text'].includes(value)) throw new Error('--format must be json or text.');
      format = value;
      index += 1;
    } else if (arg === '--inventory' || arg === '--run-checks') {
      const next = arg === '--inventory' ? 'inventory' : 'checks';
      if (mode && mode !== next) throw new Error('Choose either --inventory or --run-checks, not both.');
      if (mode === next) throw new Error(`Provide ${arg} only once.`);
      mode = next;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (base === undefined) throw new Error('--base <starting-commit> is required.');
  return {help: false, base, format, mode: mode ?? 'inventory'};
}

function git(root, args) {
  return execFileSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 2 * 1024 * 1024,
  }).trim();
}

export function readRepositorySnapshot(root, base) {
  root = resolve(root);
  try {
    const top = resolve(git(root, ['rev-parse', '--show-toplevel']));
    if (top !== root) throw new Error('not repository root');
    const head = git(root, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}']);
    const baseSha = git(root, ['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]);
    const branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const tracked = git(root, ['diff', '--name-only', '-z', '--no-renames', baseSha, '--']);
    const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '-z']);
    const changedFiles = [...new Set(`${tracked}\0${untracked}`.split('\0').filter(Boolean))].sort();
    return {root, branch, head, baseInput: base, base: baseSha, changedFiles};
  } catch (error) {
    const detail = error.message === 'not repository root' ? 'not the repository root' : 'Git base is unavailable or not a commit';
    throw new Error(`Cannot inspect repository/base ${base}: ${detail}.`);
  }
}

function tail(value) {
  let text = String(value ?? '').replaceAll('\r\n', '\n');
  text = text
    .replace(/https?:\/\/[^/\s:@]+:[^@\s/]+@/gi, '[redacted]@')
    .replace(/\b(?:sk|key|token|secret|password)[-_][A-Za-z0-9_-]{12,}\b/gi, '[redacted]')
    .replace(/(authorization|api[_ -]?key|token|secret|password)\s*([:=])\s*[^\s,;]+/gi, '$1$2[redacted]');
  if (text.length > outputLimit) text = `[truncated to last ${outputLimit} characters]\n${text.slice(-outputLimit)}`;
  return text;
}

function childEnvironment() {
  const env = cleanEnvironment();
  // This is an explicitly documented safe local tool override, not a credential.
  // Keep the normal PATH for Node/Python while dropping service keys and proxies.
  if (process.env.AQAI_CLOUD_PYTHON) env.AQAI_CLOUD_PYTHON = process.env.AQAI_CLOUD_PYTHON;
  return env;
}

export function executeCheck(step, {root, base, timeoutMs}) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, step.args(root, base), {
    cwd: root,
    env: childEnvironment(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
    timeout: timeoutMs,
    detached: process.platform !== 'win32',
    windowsHide: true,
  });
  const timedOut = result.error?.code === 'ETIMEDOUT';
  const errored = Boolean(result.error);
  const cleanup = result.error
    ? result.pid ? terminateProcessTree(result.pid) : {method: 'unavailable', status: 'not_attempted', error: 'No child PID was returned.'}
    : null;
  const status = timedOut ? 'timed_out' : errored || result.status !== 0 ? 'failed' : 'passed';
  return {
    id: step.id,
    command: step.display.replace('<starting-commit>', base),
    status,
    exitCode: result.status ?? null,
    durationMs: Date.now() - startedAt,
    stdoutTail: tail(result.stdout),
    stderrTail: tail(result.stderr),
    error: result.error ? tail(result.error.message) : null,
    cleanup,
  };
}

export function terminateProcessTree(pid, {platform = process.platform, kill = process.kill, spawn = spawnSync} = {}) {
  if (platform === 'win32') {
    const result = spawn('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
      env: cleanEnvironment(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 1000, windowsHide: true,
    });
    return {
      method: 'taskkill-tree',
      status: !result.error && result.status === 0 ? 'terminated' : 'cleanup_failed',
      error: result.error ? tail(result.error.message) : result.status === 0 ? null : tail(result.stderr),
    };
  }
  try {
    // All descendants inherit the detached checker's process group unless they
    // deliberately create a new one; kill the group, not only its Node parent.
    kill(-pid, 'SIGKILL');
    return {method: 'process-group', status: 'terminated', error: null};
  } catch (error) {
    if (error.code === 'ESRCH') return {method: 'process-group', status: 'already_exited', error: null};
    return {method: 'process-group', status: 'cleanup_failed', error: tail(error.message)};
  }
}

const notRun = (step, reason, base) => ({
  id: step.id, command: step.display.replace('<starting-commit>', base), status: 'not_run', exitCode: null,
  durationMs: 0, stdoutTail: '', stderrTail: '', error: reason, cleanup: null,
});

export function exitCodeForReport(report) {
  if (report.status === 'passed' || report.status === 'inventory_only') return 0;
  if (report.status === 'failed') return 1;
  return 2;
}

export function renderText(report) {
  const lines = [
    `Project report: ${report.status} (${report.mode})`,
    `Repository: ${report.repository.branch} @ ${report.repository.head}`,
    `Base: ${report.repository.base}`,
    `Changed files versus base: ${report.repository.changedFiles.length}`,
  ];
  for (const check of report.checks) {
    lines.push(`- ${check.id}: ${check.status}${check.exitCode === null ? '' : ` (exit ${check.exitCode})`} | ${check.command}`);
    if (check.error) lines.push(`  Detail: ${check.error}`);
    if (check.status !== 'passed' && check.stderrTail) lines.push(`  stderr: ${check.stderrTail}`);
    if (check.cleanup) lines.push(`  timeout cleanup: ${check.cleanup.status}`);
  }
  if (report.status === 'inventory_only') lines.push('No test command was run; this report is an inventory/status snapshot only.');
  if (report.status === 'blocked') lines.push(report.message);
  if (report.status === 'incomplete') lines.push(report.message);
  lines.push('No live source reads, database operations, inference or deployment are performed by this report.');
  return lines.join('\n');
}

export function createReport({
  root = repositoryRoot,
  base,
  mode = 'inventory',
  nodeVersion = process.versions.node,
  now = Date.now,
  run = executeCheck,
} = {}) {
  if (!base) throw new Error('--base <starting-commit> is required.');
  if (!['inventory', 'checks'].includes(mode)) throw new Error('mode must be inventory or checks.');
  const repository = readRepositorySnapshot(root, base);
  const createdAtMs = now();
  const report = {
    schemaVersion: 1,
    generatedAt: new Date(createdAtMs).toISOString(),
    repository: {
      owner: 'joshuawakefield', name: 'aquidneckai',
      branch: repository.branch, head: repository.head,
      baseInput: repository.baseInput, base: repository.base,
      changedFiles: repository.changedFiles,
    },
    runtime: {node: nodeVersion, requiredNodeMajor: 22},
    mode,
    status: null,
    message: null,
    inventory: deterministicWorkflows,
    checks: [],
    safety: {
      network: 'offline checks use the existing network guard and sanitized child environment',
      serviceCalls: 'none',
      reportOutput: 'stdout only; the wrapper writes no report file',
      localArtifacts: 'the existing build check may generate disposable local build output',
      timeoutCleanup: 'POSIX process-group kill; Windows taskkill /T; cleanup outcome is included per step',
      maximumCheckRunMs: checkBudgetMs,
    },
  };

  if (mode === 'inventory') {
    report.status = 'inventory_only';
    report.checks = executionPlan.map(step => notRun(step, 'Inventory mode does not execute commands.', repository.base));
    return report;
  }

  if (Number(nodeVersion.split('.')[0]) !== 22) {
    report.status = 'blocked';
    report.message = `Full checks require Node.js 22; current runtime is ${nodeVersion}. No check command was run.`;
    report.checks = executionPlan.map(step => notRun(step, 'Blocked before execution by the required Node.js 22 toolchain.', repository.base));
    return report;
  }

  const startedAt = createdAtMs;
  for (const step of executionPlan) {
    const remainingMs = checkBudgetMs - (now() - startedAt);
    if (remainingMs <= 0) {
      report.checks.push(notRun(step, 'The 10-minute total check budget expired before this command started.', repository.base));
      continue;
    }
    report.checks.push(run(step, {root: repository.root, base: repository.base, timeoutMs: remainingMs}));
  }

  const statuses = report.checks.map(check => check.status);
  if (statuses.every(status => status === 'passed')) report.status = 'passed';
  else if (statuses.some(status => status === 'timed_out' || status === 'not_run')) {
    report.status = 'incomplete';
    report.message = 'One or more checks timed out or were not run; do not treat this report as a pass.';
  } else report.status = 'failed';
  return report;
}

function usage() {
  return [
    'Usage: node scripts/project-check-report.mjs --base <starting-commit> [--inventory|--run-checks] [--format json|text]',
    'Default mode is --inventory: it reports the exact repository snapshot and available workflows without running tests.',
    '--run-checks runs the wrapper regressions, offline project suite, continuity tests and project-memory diff check, with a 10-minute total budget.',
  ].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const message = `${error.message}\n${usage()}`;
    console.error(message);
    process.exitCode = 2;
  }
  if (options?.help) {
    console.log(usage());
  } else if (options) {
    try {
      const report = createReport({base: options.base, mode: options.mode});
      console.log(options.format === 'text' ? renderText(report) : JSON.stringify(report, null, 2));
      process.exitCode = exitCodeForReport(report);
    } catch (error) {
      const failed = {schemaVersion: 1, generatedAt: new Date().toISOString(), mode: options.mode,
        status: 'failed', error: tail(error.message), checks: [], inventory: deterministicWorkflows};
      console.log(options.format === 'text' ? `Project report: failed\n${failed.error}` : JSON.stringify(failed, null, 2));
      process.exitCode = 2;
    }
  }
}
