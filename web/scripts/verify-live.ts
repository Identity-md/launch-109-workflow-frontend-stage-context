import { readFile, writeFile } from 'node:fs/promises';
import { createPublicClient, http, zeroAddress } from 'viem';
import { readState, readWithFallback } from '../src/chain';
import type { Runtime } from '../src/model';

const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const h = await read('data/handoff.json');
const runtime: Runtime = { deployment: h, config: await read('public/claim-config.json'),
  claims: await read('public/claims.json'), token: h.contracts[0].address,
  tokenAbi: await read('public/abi/ProofOfWorkToken.json'), distributorAbi: await read('public/abi/MerkleDistributor.json') };
const live = await readWithFallback(runtime, (client, rpc) => readState(client, runtime, zeroAddress, rpc));
const crossChecks = [];
for (const url of runtime.config.rpcUrls.filter(url => url !== live.rpc)) {
  try {
    const client = createPublicClient({ transport: http(url, { timeout: 12000, retryCount: 0 }) });
    const chainId = await client.getChainId();
    const block = await client.getBlock({ blockNumber: live.block });
    crossChecks.push({ url, chainId, blockHash: block.hash, matches: chainId === h.chainId && block.hash === live.blockHash });
    if (crossChecks.at(-1)?.matches) break;
  } catch (error) { crossChecks.push({ url, error: error instanceof Error ? error.message.slice(0, 250) : 'RPC failure' }); }
}
const report = { checkedAt: new Date().toISOString(), readsOnly: true, walletRead: zeroAddress,
  live, crossChecks, limitation: runtime.config.serviceRoot === null ? 'API omits launch.merkleRoot. Rebuilt snapshot agrees with on-chain root, but service-root comparison is unresolved; production claims disabled.' : null };
await writeFile('../docs/frontend/live-verification.json', JSON.stringify(report, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
console.log(JSON.stringify(report, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
