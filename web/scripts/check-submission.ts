import { execFileSync } from 'node:child_process';
import { lstat, writeFile } from 'node:fs/promises';
import { requireThat } from '../src/integrity';

const git = (args: string[]) => execFileSync('git', args, {cwd:'..',encoding:'utf8'}).split('\n').filter(Boolean);
const tracked = git(['ls-files']);
const extra = git(['ls-files','--others','--exclude-standard']).filter(p => !p.startsWith('test/scratch/') && !p.startsWith('.imd/'));
const changed = [...new Set([...git(['diff','--name-only','HEAD']),...extra])];
requireThat(changed.every(p => /^(web|dist|docs)\//.test(p)), 'Changed path outside assignment scope');
requireThat(changed.every(p => p === 'web/.gitignore' || !/(^|\/)\./.test(p)), 'Unbudgeted dotfile');
const paths = [...new Set([...tracked,...extra])];
requireThat(!paths.some(p => /(^|\/)(node_modules|\.cache|\.vite|playwright-report|test-results)\//.test(p) || /\.tgz$/.test(p)), 'Generated dependency/archive in submission');
requireThat(!git(['ls-files','-s']).some(line => line.startsWith('160000')), 'Submodule in submission');
let sourceAndExportBytes = 0;
for (const path of paths) {
  const stats = await lstat(`../${path}`);
  requireThat(stats.isFile(), `Non-regular submission file: ${path}`);
  sourceAndExportBytes += stats.size;
}
// Read-only Git history export for a conservative bundle size bound; never modifies .git.
execFileSync('git',['bundle','create','test/scratch/base.bundle','--all'],{cwd:'..'});
const historyBundleBytes = (await lstat('../test/scratch/base.bundle')).size;
const conservativeBundleBound = historyBundleBytes + sourceAndExportBytes + 4096 * paths.length + 65536;
requireThat(conservativeBundleBound <= 8388608, 'Submission may exceed 8 MiB');
const report = {checkedAt:new Date().toISOString(),changedFiles:changed.length,candidateFiles:paths.length,
  sourceAndExportBytes,historyBundleBytes,conservativeBundleBound,limitBytes:8388608,
  scopeCheck:'passed',submodules:0,dependencyArtifacts:0,
  gitCommitStatus:'Not committed: git add denied creating .git/index.lock (Operation not permitted).',
  boundMethod:'All candidate file bytes plus complete existing Git history bundle, 4096 bytes per file and 64 KiB reserve. This is a conservative size check, not a new committed bundle.'};
await writeFile('../docs/frontend/submission-check.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
