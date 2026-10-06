import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runStages} from './cycle-runner.mjs';
// Collection, classification, and the separately gated publisher share one serial cycle.
// A POSIX process group lets shutdown reach the collector's Python children too.
process.exitCode=await runStages(script=>spawn(process.execPath,[fileURLToPath(new URL(script,import.meta.url))],
 {stdio:'inherit',windowsHide:true,detached:process.platform!=='win32'}));
