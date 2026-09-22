# Frontend validation

The useful frontend deliverable is present, but the service-root comparison and real-browser execution remain unresolved. Git staging is also blocked by the read-only repository metadata. This is worker evidence, not independent certification or publication verification.

## Deployment and allocation evidence

Fetched `https://api.imd.fun/launches/ee1f32a2-7f0e-48f1-88c2-1c591e0bdc66`. The saved selection includes all **63** allocations and the full frozen reward breakdown. Total: **100000000000000000000000000** minor units (100,000,000 WORK). The launch's IDs, chain, source and attestation match the supplied handoff.

The independently rebuilt root and all OpenZeppelin proofs agree:

```text
0xb2bfb078148d698e3f24ee75fdacfd7b067112bd2b8e14121b6cc9bae73aa32e
```

The response contains no `merkleRoot` field. The frontend stores `serviceRoot: null` and does not enable claims. A service response containing the actual frozen root is required; an on-chain root cannot stand in for that missing comparison. This gap was reported during the assignment. The raw response's SHA-256 and selected-field provenance are in `web/data/launch.json`; unrelated work history was excluded to keep the submission small.

`live-verification.json` records successful Sepolia reads: token/distributor deployed code, token binding, matching round-0 root and funding, 18 decimals, no positive sweep logs, full distributor funding, unlock timestamp and chain block. PublicNode and Tatum agree on the verification block hash. These are actual read-only RPC results, not mocked chain evidence. The zero address was used solely for a balance/claimed read, not as an allocation recipient. No signing or transaction broadcast occurred.

Token address: `0xee85b80543c4f301b33505de4d9d0217ce26d8dd`. Protocol distributor, discovered from the actual launch artifact: `0xc3d6cec8cc8be44024c5dc60386099acbb0c1817`. Both originated in the handoff launch transaction at block 11755410.

The build reads ABI JSON and token sources directly from Git commit `f6b17dac020709c2fa2c20d169aa7d3a16cc0a37`. It recompiles both implementations using solc 0.8.26 and compares complete ABI entries. The distributor archive pins platform commit `a94632d6ea40fbd2d1bcd8a0aafe53a1619956c6`; all archived source SHA-256 digests pass. Its public GitHub URL returned 404, so no fresh upstream fetch is claimed.

| ABI | Canonical Keccak-256 |
| --- | --- |
| ProofOfWorkToken | `38880b8e56d42ce900f744a7908c7139632a49f1c3f33385c64ceaed29d37bee` |
| MerkleDistributor | `706b029ebc8f6212022d2591216914eccc03ebc6afda53a016c1a58bf10528d7` |

The token ABI hash matches the actual handoff. The distributor is an additional inventoried asset, not an invented member of the attested contract set.

## Local checks

- Production Vite build and strict TypeScript check pass. The static base is `./`; no server routing or backend is required.
- Six Node tests pass: all frozen proofs, sums, duplicate/malformed/overflow rejection, tampered proofs, complete-tree reconstruction (including one and odd leaf counts), canonical ABI hashing, path traversal rejection and eligibility guards.
- Seventeen jsdom interaction tests pass: disconnected, wrong-chain switch rejection, absent, locked, claimed, missing service root, swept/underfunded, RPC retry, eligible claim arguments/value, pending/receipt refresh, rejected signature, reverted receipt, simulation failure, unknown-receipt retry, account change while simulating, replacement/cancellation without claim, and immediate pre-signing reread. The provider bootstrap test loads the actual exported deployment data, connects the installed RainbowKit injected connector and performs decoded/encoded mock-RPC reads using the real viem client. `interaction-results.json` contains results.
- `verify:export` independently recomputes the manifest inventory. `submission-check.json` records final file counts, byte budgets and path checks.

The DOM tests deliberately simulate missing API root availability for successful-claim scenarios. They never modify the production snapshot/configuration to make claims pass. Their results do not establish real browser rendering or live transaction behavior.

## Browser restriction and remaining checks

Both installed Chrome and downloaded Chromium Headless Shell failed before opening a page. The latter reported:

```text
bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer: Permission denied (1100)
```

`browser-results.json` records the final attempt, stopped after the first launcher failure; 16 cases were not run in that attempt. The initial installed-Chrome attempt failed all 17 at launch. No browser interactions, screenshots, responsive overflow or browser console/resource checks are claimed as passed. The runnable 17-case suite is at `web/tests/claim.spec.ts`; rerun on a worker permitted to start Chromium. It includes missing-wallet, wrong-chain/switch, successful claims, root/binding/code/log failures, RPC failures, asset tampering, reverted receipts and mobile/desktop checks.

Live funded claims, real wallet rejection dialogs, gas estimation/transaction inclusion, reorgs in flight, restored funding after a real sweep, and named/IPFS site reachability remain untested. The publisher owns hosting and publication checks. No publication, contract redeployment or privileged distributor operation was attempted.

## Dependencies and packaging

Normal pinned npm dependencies are used. The final dependency audit has no high or critical findings after patched `tmp`/`ws` overrides; moderate transitive advisories remain (including optional wallet packages), so this is not a claim of a clean audit. Vite warns about a large JavaScript chunk and third-party annotation placement; its production build succeeds. All runtime chunks remain in the export rather than being deleted to reduce size.

Only `web/**`, `dist/**` and this new `docs/frontend/**` evidence are changed. The explicitly permitted `web/.gitignore` excludes `node_modules/` and generated test/cache outputs at every nesting level. Root ignore/configuration, contracts, libraries and deployment source are preserved. The final byte check counts the existing tracked repository plus all new deliverable files; cache/browser downloads in disposable `test/scratch/` are excluded from submission.

`git add -- web dist docs/frontend` was attempted and denied while creating `.git/index.lock` (`Operation not permitted`). Therefore these files are present in the working tree but **not staged or committed** by this worker. The publisher must include all allowed deliverables. The size report uses a conservative bound on the prospective submission, not a claim that a new Git bundle or commit was produced.
