# SyncPlay Ordered Implementation Plan

## Workflow rule
Implement one thin, testable vertical slice at a time. After each slice, run checks, inspect the diff, and update docs. Avoid writing all modules in one large generation.

## Phase 0 — Repository reconnaissance and contract freeze
- Inspect repo, current branch, package manager, scripts, existing code and tests.
- Decide monorepo/workspace layout based on what already exists.
- Add `docs/ai-context/` and root `AGENTS.md`.
- Agree on `packages/protocol` schemas and ID semantics.
- Output: architecture map, contract checklist, unresolved decisions list.
- No broad code changes until this report is reviewed.

## Phase 1 — Protocol package
- Define envelope and initial message registry.
- Define runtime validation schemas and shared TypeScript types.
- Add tests for valid/invalid/unknown versions, unknown types, malformed payloads and size constraints.
- Ensure no module copies types locally.
- Output: protocol package builds and tests pass.

## Phase 2 — Bootstrap server core
1. RoomStore (in-memory Map) with isolated unit tests.
2. Room lifecycle service: create/join/leave, capacity, expiry, empty-room cleanup.
3. Identity and membership credentials; never log credentials.
4. HTTP endpoints: `POST /api/v1/rooms`, `GET /api/v1/rooms/:roomId`, `GET /api/v1/health`.
5. Socket.IO join/leave and membership snapshot.
6. SDP/ICE signaling relay with sender identity derived from socket, authorization and generation checks.
7. Unit/integration tests and clear limitations (single process; restart loses rooms).
- Output: two clients can join and see each other; signaling is validated.

## Phase 3 — WebRTC Peer Mesh vertical slice
1. Browser client obtains peer list from Bootstrap.
2. Negotiate RTCPeerConnection and relay SDP/ICE.
3. Create RTCDataChannel; queue ICE candidates until remote description is ready.
4. Enforce deterministic initial offerer policy and handle renegotiation glare.
5. Exchange one validated PING or test message.
6. Handle disconnect and cleanup.
- Output: two browser instances exchange a message directly through DataChannel.

## Phase 4 — RTT service
- PING/PONG with unique probe ID.
- Use `performance.now()` for local elapsed duration.
- Bound pending probes and sample ring buffer.
- Track median/p90, freshness, timeout count and jitter/variation.
- Do not infer exact one-way latency or clock offset from RTT alone.
- Output: reliable metrics and tests for duplicates/timeouts/stale samples.

## Phase 5 — Control Events Layer
- Typed PLAY/PAUSE/SEEK/RATE_CHANGE intents.
- Validate payloads, session, sender and message version.
- Separate messageId from logicalEventId.
- Bounded deduplication cache and event dispatch.
- Return typed result that distinguishes accepted, rejected, send failure and applied-to-media.
- Output: events reach SyncEngine with explicit outcomes.

## Phase 6 — Baseline SyncEngine
- Test engine without WebRTC.
- Define logical state and exact control reducer semantics.
- Create immutable events with stable operation IDs.
- Implement deterministic baseline ordering/replay only after test scenarios are agreed.
- Candidate experiment: Lamport counter plus deterministic peer-ID/event-ID tie-break.
- Do not call this a full consensus protocol.
- Output: repeatable tests for duplicate, reordered and concurrent operations.

## Phase 7 — Fault tolerance and recovery
- Peer health state machine, grace windows, bounded exponential backoff with jitter.
- Rejoin refreshes membership and increments generation.
- Reject stale signaling from previous generations.
- State digest/snapshot schema owned by SyncEngine; validate size and semantics.
- Output: reconnect and reconciliation tests.

## Phase 8 — HTML5 media adapter and demo
- Read/apply playback status, position and playback rate.
- Report media apply failures/buffering; do not assume requested seek succeeded exactly.
- Build two/three peer demo with visible status and timing diagnostics.
- Output: synchronized control demonstration and measured limitations.

## Phase 9 — Evaluation and packaging
- Scenarios: simultaneous controls, latency/jitter, packet loss, peer churn, partitions, 2/3/4 peers.
- Metrics: logical-state agreement, media position error in milliseconds, convergence time, recovery time, message rate and resource usage.
- Report median and tail values, not just averages.
- Package public SDK API and test installation in a fresh demo project.
- Publish to npm only when API and docs are stable; publishing is a separate deliberate action.

## Definition of done for every phase
- Unit tests pass.
- Relevant typecheck/lint/build passes.
- Integration smoke test passes where applicable.
- No unbounded timers/queues/caches.
- README and decision log updated.
- Exact verification commands/results reported.
- Known limitations stated honestly.
