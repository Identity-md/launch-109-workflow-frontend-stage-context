import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { requireThat, validateRows } from '../src/integrity';

const handoff = JSON.parse(await readFile('data/handoff.json', 'utf8'));
const url = `https://api.imd.fun/launches/${encodeURIComponent(handoff.launchId)}`;
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
requireThat(response.ok, `Launch service HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const launch = JSON.parse(bytes.toString());
requireThat(launch.id === handoff.launchId && launch.chainId === handoff.chainId
  && launch.sourceCommit === handoff.sourceCommit && launch.attestationHash === handoff.attestationHash, 'Launch/handoff mismatch');
validateRows(launch.allocations);
const selected = Object.fromEntries(['id','chainId','sourceCommit','attestationHash','status','policyVersion','artifacts','allocations'].map(k => [k,launch[k]]));
selected.rewardSnapshot = Object.fromEntries(Object.entries(launch.rewardSnapshot).filter(([k]) => k !== 'work'));
selected.merkleRoot = launch.merkleRoot ?? null;
selected.provenance = { url, fetchedAt: new Date().toISOString(), responseSha256: createHash('sha256').update(bytes).digest('hex'),
  selection: `All allocations and reward breakdown preserved; unrelated work/job metadata omitted. merkleRoot ${launch.merkleRoot ? 'present' : 'absent'} in response.` };
await writeFile('data/launch.json', JSON.stringify(selected, null, 2) + '\n');
console.log(`Saved ${launch.allocations.length} allocations. Service root ${selected.merkleRoot ?? 'missing; claims remain disabled'}. Run build and verify:live before delivering a new export.`);
