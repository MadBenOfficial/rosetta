# Rosetta

Two people describe the same thing and never quite use the same words. Rosetta puts both descriptions on one stone and lets a Mediator decide whether they actually mean the same thing.

This is not a diff of one author's edits, and it is not a vote. It is cross-author reconciliation: party A writes their version, party B writes theirs blind, and an on-chain Mediator weaves a single reconciled specification while marking, point by point, where the two genuinely diverge. The settlement that lands on chain is that reconciled text plus a plain count of the real disagreements, a count GenLayer validators must converge on before anything is written.

## The thing it actually does

A brief moves through three states on the stone.

`open_brief(party_a_text)` posts side A and the brief sits as `AWAITING_B`. The author's address is recorded as `a_addr`.

`respond(brief_id, party_b_text)` seats side B. It must come from a different account than side A, so the two readings are genuinely independent. The brief becomes `OPEN`.

`reconcile(brief_id)` is the one call that needs consensus. A Mediator reads both descriptions at once and returns a single reconciled specification, a list of divergence points, and an integer count of them. The contract then derives the categorical state deterministically: zero divergences reads as `ALIGNED`, anything above as `DIVERGENT`. The brief closes as `RECONCILED`.

## Where GenLayer earns its place

The hard part is agreement. An LLM asked to reconcile two paragraphs will phrase the merge a dozen ways and count borderline disagreements differently each run, so the wording can never be the anchor. Rosetta anchors consensus on one stable quantity only: the divergence count.

Each validator independently re-runs the same reading and compares its own count against the leader's. They agree when the two counts fall within a tolerance band, `abs(a - b) <= max(2, max(a, b) // 5)`, which absorbs the noise of a borderline call without letting a runaway count through. The reconciled text and the divergence list are the lead mediator's wording, kept as flavour, never compared byte for byte. A deterministic backstop then clamps the count, derives `ALIGNED` or `DIVERGENT` from it in code rather than trusting the prompt, truncates the stored fields, and commits. Both descriptions are treated as untrusted input and the prompt is hardened so neither side can talk the Mediator into ignoring the other.

The count is a count, not a rating. Nothing in Rosetta scores a submission.

## Contract surface

`open_brief(party_a_text) -> str` deterministic, returns the new `brief-<n>` id.

`respond(brief_id, party_b_text)` deterministic, seats a distinct second author.

`reconcile(brief_id)` the AI consensus write.

`get_briefs(start)` newest-first page of up to twenty briefs.

`get_brief(brief_id)` one full brief record.

`get_stats()` returns the brief and reconciled totals for client-side display.

## Frontend

Next.js 14 App Router exported statically for GitHub Pages, talking straight to Bradbury through `genlayer-js`. There is no backend; the contract is the backend. The interface is built as a two-tablet reconciliation room rather than a card grid: party A on the left of the stone, party B on the right, a pale-gold seam down the middle where the reconciled specification forms, and a margin that fills with each real divergence. Reads are batched into the paged view, polling is slow and pauses while a transaction is in flight, and the consensus write is staged as theatre, with the leader's draft reconciliation peeked from the in-flight receipt while validators settle the count.

Transactions carry the full lifecycle: a confirm step, a wallet prompt, the submitted hash with an explorer link, an honest walk through the live network statuses including leader rotation, and a sealed result that flashes into the board. Errors map to plain language, including the fee-reserve case that points at the faucet.

Design direction: a bilingual basalt tablet, dark stone with party A in ochre and party B in slate-cyan meeting at a unified pale gold. Type is Petrona over Albert Sans with JetBrains Mono for addresses and figures. Built following the design skills `design-taste-frontend`, `high-end-visual-design`, and `minimalist-ui`, in the style families High-Contrast Monochromatic, Spatial Design, and Haptic Microinteractions.

## Running it locally

```bash
# contract: lint then prove consensus on StudioNet before any deploy
genvm-lint lint contracts/contract.py
gltest tests/integration/ -v -s --network studionet

# frontend
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # static export into out/
```

The deployer key is read from the working-directory root `.env` by variable name only and never committed. See `.env.example`.

## Coordinates

| What | Where |
| --- | --- |
| Live dApp | https://madbenofficial.github.io/rosetta/ |
| Contract | recorded in `frontend/src/lib/contract.ts` after deploy, on the Bradbury explorer |
| Explorer | https://explorer-bradbury.genlayer.com |
| Faucet | https://testnet-faucet.genlayer.foundation/ |
