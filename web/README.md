# Proof Of Work claim page

Plain React/Vite/TypeScript, wagmi/viem and stock RainbowKit. There is no application CSS. Only `claim(0, connectedWallet, allocationAmount, proof)` is offered, with zero ETH value. Gas requires Sepolia ETH. There is no approval, token transfer, swap, owner or sweep control.

## Current delivery status

Source, frozen allocations, all 63 proofs, compiled ABIs and the relative static export are delivered. The snapshot totals **100,000,000 WORK** and its root matches the live distributor's round 0. Both token and distributor code exist, the token binding matches the handoff, and a second public RPC confirmed the verification block hash.

Files are in the working tree. Staging/committing was denied because `.git` is read-only in this worker. Include all `web/`, `dist/` and `docs/frontend/` deliverables when the publisher stages the contribution; dependencies and scratch outputs are excluded.

**Production Claim deliberately remains disabled.** The actual launch API response omitted the required `launch.merkleRoot`. The saved service root is `null`, not an invented value or a copy of the on-chain root. Runtime still displays successfully read balances and unlock time. See [validation evidence](../docs/frontend/validation.md). A read failure always displays unknown values, never zero balance or ineligibility.

Real-browser execution was attempted with installed Chrome and Playwright Chromium Headless Shell. The worker sandbox refused Chromium's Mach process registration before any page opened. DOM interaction tests pass, but browser layout, screenshots and the real-browser suite remain unverified. No worker transaction was signed or broadcast.

## Install, build and serve

Use Node 22.12+ or Node 24 and npm. Run from `web/`:

```sh
npm ci
npm run typecheck
npm run build
npm run preview
```

The build recompiles the implementation ABIs from the pinned Git source, validates their content, checks the token's canonical Keccak hash against the deployment handoff, regenerates proofs and static data, runs Vite with `base: './'`, then writes **root `dist/imd-deployment.json` last**. It inventories every other final file by SHA-256. No network is needed for the build after dependencies are installed; retain the handoff's source commit in Git history. The public protocol GitHub URL returned 404, so its exact pinned source archive already committed in `docs/protocol/` is used and every source digest checked before compilation.

`npm run dev` serves Vite's development app using the last built manifest. Build once first, and rebuild after changing saved deployment data. `node scripts/serve.mjs` serves only the production export at `http://127.0.0.1:4173/ipfs/work/` without a history fallback. The publisher must upload all files under `dist/`, including JSON, and use HTTPS. Web Crypto integrity checks and injected wallets need a secure context (localhost works). Double-clicking `index.html` with a `file:` URL is not supported.

## Configuration and provenance

- `data/handoff.json` is the supplied deployment handoff. It is the build input, not a second runtime address map. The browser loads `imd-deployment.json` for the actual chain, token address and token ABI path, and loads that ABI as JSON. Its attested contract list contains only `ProofOfWorkToken`.
- `data/network.json` is the sole editable public RPC/name/explorer configuration. The generated, inventoried `claim-config.json` combines this with the protocol distributor discovered from the launch's `artifacts` entry. It contains the distributor ABI path/hash, deployment block, round, snapshot paths and service root. The distributor is not added to the attested manifest contract list.
- `data/launch.json` preserves every service allocation and reward breakdown, launch identity, deployment artifacts, fetch URL/time and SHA-256 of the original response. Unrelated job/work/device history is omitted. No allocations were computed from policy or invented.
- `dist/allocation-snapshot.json`, `dist/claims.json` and `dist/merkle-tree.json` retain the complete allocations, exact decimal amounts, proofs and OpenZeppelin tree dump. A wallet subset cannot replace the full snapshot.
- `public/` contains deterministic generated data inputs to Vite. The final runtime deployment manifest exists in `dist/`; the app never imports the handoff into its JavaScript bundle.

Runtime checks SHA-256 for loaded data assets, canonical ABI hashes, snapshot identity, uniqueness and amounts, the independently rebuilt full root and every proof. Related chain reads use one block number and recheck its block hash. It verifies RPC chain ID, both code addresses, `token()`, round root/funding/accounting, token decimals, claimed status, balance, unlock time, distributor balance and sweep logs. It scans logs in bounded windows and shrinks failed windows. Public endpoints are tried in order; the connected wallet's provider is a final read fallback, with a chain check. Transaction signing uses only the connected wallet.

The pinned distributor has no `swept` flag. A positive sweep plus insufficient remaining balance is unavailable. Full funding restored after a sweep can qualify, subject to simulation. The earliest sweep time is not an expiry. Its shared balance across rounds cannot reserve funds for this round; the UI conservatively requires enough for this round's entire remaining allocation. A later sweep or competing transaction can still revert a pending claim.

Reads refresh every 20 seconds, on account/network changes, on demand, immediately before signing and after a successful receipt. Unlock is based on block timestamp. Signing rechecks wallet identity/network, and stale component responses are discarded. Unknown receipt status blocks duplicate submissions and offers a receipt retry. A successful replacement/cancellation receipt without `claimed(0,wallet)` does not report a successful claim.

Only the injected browser connector is configured. RainbowKit's connector-list API receives an empty project ID; no WalletConnect connector is constructed. No operator credentials are needed. WalletConnect is optional future work requiring an actual public project ID and an explicitly configured connector; no placeholder ID is used.

## Completing the missing service-root check

Once the launch service exposes the frozen `merkleRoot`, run:

```sh
npm run refresh:launch
npm run build
npm run verify:live
npm run typecheck
npm test
npm run test:interaction
npm run test:browser
npm run verify:export
```

The fetch script preserves all allocations and validates launch/handoff identity. Build rejects a root that differs from the rebuilt full snapshot. Live verification must also agree. Do not manually populate the missing service root from the derived tree or chain read; that would bypass the independent comparison. Deliver source and the complete regenerated export together.

## Validation

```sh
npm test                   # proof, amount, ABI, path and eligibility checks
npm run test:interaction   # jsdom interactions and real connector bootstrap with mock RPC
npm run verify:live        # read-only public RPC verification; writes evidence
npm run verify:export      # complete inventory and byte-limit checks
```

For real-browser tests on a worker that permits browser execution:

```sh
PLAYWRIGHT_BROWSERS_PATH=../test/scratch/browsers npm exec -- playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=../test/scratch/browsers npm run test:browser
```

Alternatively set `CHROME_PATH` to a Chromium executable. The 17 Playwright cases serve the real export under `/ipfs/work/` and intercept external requests with wallet/RPC fixtures; no real funds are used. The successful-claim fixture supplies the missing service root only through test interception and rehashes those fixture assets. The actual-export case preserves the missing root and expects Claim to stay disabled. Screenshot/overflow checks target 1280×900 and 375×812. These cases are shipped but did not execute here due to the browser launch restriction.

All package versions are pinned in `package-lock.json`. Patched `tmp` and `ws` overrides remove the detected high-severity advisories without changing the pinned Solidity compiler. npm still reports moderate dependency advisories; see validation notes. Dependencies, package caches and browser binaries are not submitted. `web/.gitignore` is explicitly in this assignment's path budget and ignores generated dependency/test directories at every nesting level. No other ignore file or root build configuration was changed.
