# Instructions for AI Coding Agents — SyncPlay

## Before editing
- Read `docs/ai-context/00_MASTER_PROJECT_CONTEXT.md`, `DECISIONS.md`, `INTERFACE_CONTRACTS.md`, `IMPLEMENTATION_PLAN.md`, and relevant module notes.
- Inspect the existing repository and report its current structure, package manager, scripts, tests, and implementation status before proposing edits.
- Do not assume files or dependencies exist; inspect them.
- Do not make broad changes until the user approves the plan.

## Development method
- Work in small, reviewable increments. One milestone or cohesive task per change.
- First state: objective, files expected to change, design choices, risks, and tests.
- Then implement only the approved scope.
- Run relevant tests, type checks, lint, and build commands. Report exact commands and outcomes; never claim a command passed if it was not run.
- Summarize changed files, decisions, test results, known limitations, and the next smallest task.
- Preserve existing working code unless a change is necessary and explained.
- Prefer TypeScript strictness, small modules, explicit types, runtime validation at network boundaries, and dependency injection for replaceable algorithms.
- Keep tests near the package they test or in the agreed test layout.
- Avoid speculative abstractions, premature optimization, and unnecessary dependencies.

## Architecture guardrails
- Bootstrap Server owns room membership and signaling only, never playback truth or conflict resolution.
- WebRTC is transport, not consensus.
- Peer Mesh owns connection lifecycle and DataChannels.
- RTT Service owns measurements; it does not infer clock offset from RTT alone.
- Control Events validates/routes operations but does not choose winners.
- Fault Manager coordinates recovery but does not mutate playback state directly.
- SyncEngine owns shared playback semantics and must remain replaceable.
- Media Adapter applies explicit decisions; it does not invent shared-state policy.
- Use a shared `packages/protocol` package as the only source for message schemas and protocol types.
- Keep `messageId` and `logicalEventId` distinct.
- Distinguish `peerId`, `socketId`, and connection generation.
- Reject stale-generation signaling, malformed/oversized messages, and unauthorized membership actions.
- Do not use wall-clock timestamps as a globally reliable ordering source.
- Bound timers, queues, retry attempts, caches, room size, and payload size.

## Do not do these things
- Do not generate the entire project in one giant response.
- Do not silently change an approved architecture decision.
- Do not invent APIs, package scripts, file paths, test results, or runtime guarantees.
- Do not call a deterministic LWW/Lamport tie-break a full consensus algorithm without justified guarantees.
- Do not claim perfect synchronization, production readiness, formal proof, or novelty without evidence.
- Do not add databases, Redis, TURN infrastructure, authentication systems, or deployment complexity unless requested or required by an agreed milestone.
- Do not commit secrets or log membership tokens, full SDP, or ICE details unnecessarily.
- Do not install dependencies or run destructive commands without explaining why; ask before destructive operations.

## Required response format for each task
1. **Plan** — smallest useful implementation slice.
2. **Files** — files to create/change.
3. **Risks / decisions** — only material ones.
4. **Implementation** — proceed after plan is approved, unless the user explicitly asked to implement immediately.
5. **Verification** — exact commands and results.
6. **Status** — done / blocked / partial, limitations, next task.

## When instructions conflict
Stop and report the conflict with references to the relevant project docs. Propose options; do not choose silently.
