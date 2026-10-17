# SyncPlay — Combined AI Context Pack


---

# FILE: 00_MASTER_PROJECT_CONTEXT.md


# SyncPlay — Master Project Context

## 1. Project summary
SyncPlay is a browser-based, reusable media synchronization protocol and SDK for synchronizing video/audio playback among multiple peers without a permanent centralized playback authority or permanent leader.

The intended deliverable is not merely a watch-party application. It is a reusable SDK developers can integrate into their own applications, eventually distributed through npm.

### Proposed short description
SyncPlay is a reusable, browser-based media synchronization protocol and SDK for synchronizing video and audio playback between multiple users without a permanent centralized server or leader. A lightweight bootstrap server handles peer discovery and initial connection setup. After that, peers communicate directly and maintain synchronization. The SDK can be integrated into applications through npm.

## 2. Core architecture principle
**Design the protocol around stable interfaces first, and keep the synchronization/consensus algorithm replaceable.**

## 3. Meaning of “serverless”
Use precise wording: **server-minimized, leaderless synchronization with a lightweight bootstrap/signaling server**.
- Bootstrap server manages session creation, membership, peer discovery, and WebRTC signaling.
- It is not the permanent source of truth for playback state.
- Peers exchange ongoing control and state messages over WebRTC DataChannels after connections are established.
- Bootstrap may still be needed for new joins, rejoin, and fresh signaling.
- Do not claim the system has no server at all.

## 4. What WebRTC does and does not do
WebRTC provides peer-to-peer transport and connectivity mechanisms. It does **not** automatically solve application-level consensus, concurrent playback operations, clock synchronization, or state convergence.

## 5. MVP scope
Build and validate the smallest vertical slice first:
1. Shared protocol package and versioned message envelope.
2. Bootstrap server: room creation, membership lifecycle, signaling relay.
3. Two browser clients establish a WebRTC DataChannel through the bootstrap/signaling path.
4. Exchange one validated message.
5. Peer Mesh state and RTT measurement.
6. Control events: PLAY, PAUSE, SEEK, RATE_CHANGE.
7. A baseline replaceable SyncEngine.
8. Basic disconnect/reconnect and state-recovery flow.
9. HTML5 audio/video adapter.
10. Demo app, tests, documentation, npm package.

Keep full-mesh rooms small for the MVP. YouTube integration and larger-scale topologies are later extensions.

## 6. Proposed technology baseline
- TypeScript for shared protocol and browser SDK code.
- Node.js + TypeScript for bootstrap server.
- Express for HTTP endpoints if needed.
- Socket.IO for room membership and SDP/ICE signaling events.
- WebRTC `RTCPeerConnection` and `RTCDataChannel` for peer communication.
- Zod or an equivalent runtime schema validator for message validation.
- Vitest (or one agreed test framework) for unit/integration tests.
- React demo app is optional for the initial transport proof; a minimal browser demo is sufficient.
- In-memory room registry for the single-process prototype.
- Do not introduce Redis, databases, message brokers, Kubernetes, or extra infrastructure unless a specific MVP requirement justifies them.

## 7. Main modules and ownership
### Bootstrap Server
Owns room/session registry, membership, room capacity/expiry, signaling relay, join/rejoin validation, and connection-generation freshness. Does not own playback state or decide conflicts.

### Peer Mesh / Transport
Owns per-peer WebRTC connections, DataChannels, connection state, message transport, and cleanup. It does not decide playback semantics.

### RTT Service
Owns PING/PONG sampling, RTT estimates, sample freshness and bounded metrics. RTT is not one-way latency and does not alone reveal clock offset.

### Control Events Layer
Creates/validates typed control events, validates inbound envelopes, handles bounded deduplication, dispatches to SyncEngine, and reports transport/publish outcomes. It does not choose conflict winners.

### Fault Manager
Interprets transport signals as healthy/degraded/suspected/reconnecting/recovered, manages bounded recovery/backoff, coordinates rejoin and state exchange. A timeout is suspicion, not proof of permanent peer failure.

### SyncEngine
Owns shared logical playback state, event semantics, ordering/conflict policy, recovery-state interpretation, and convergence behavior. It must be replaceable behind a stable interface.

### Media Adapter
Reads/applies local HTMLMediaElement state based on explicit SyncEngine decisions. Actual media state can lag, buffer, clamp seeks, or drift from logical state.

### SDK / Demo
Provides the public application API and proves integration from a fresh app.

## 8. Core architecture invariants
- Bootstrap never becomes playback authority.
- No module except SyncEngine chooses how concurrent playback operations change shared logical playback state.
- Transport does not treat JSON validity as semantic validity.
- Separate membership state from transport state and playback state.
- Separate `messageId` (one transmitted message) from `logicalEventId` (one user operation across retries).
- `peerId` is a logical participant identity; `socketId` is a transient signaling connection identity.
- Use a connection generation/epoch to reject stale signaling from an older connection.
- Wall-clock timestamps are not a globally reliable operation order.
- Bounded queues, caches, logs, timers, retries, payloads and room capacity.
- A reconnect restores communication, not necessarily converged playback state.
- A deterministic tie-break is not automatically a consensus protocol.
- Full mesh is only for small MVP rooms: connection count is N(N-1)/2.
- Version protocol envelopes and payload schemas explicitly.

## 9. MVP exclusions / claims to avoid
Do not promise:
- perfect frame-level synchronization,
- zero server dependency for all lifecycle operations,
- internet-scale full-mesh rooms,
- production-grade fault tolerance,
- Byzantine fault tolerance,
- mathematically proven consensus,
- absolute novelty or patentability.
Use measured results and clearly stated assumptions.

## 10. Definition of first milestone
Two browser instances can:
1. join the same room,
2. discover each other,
3. complete SDP/ICE signaling,
4. open a WebRTC DataChannel,
5. exchange a schema-validated message,
6. handle a clean disconnect without leaked resources.

Only after this milestone should playback-control behavior be layered on.


---

# FILE: DECISIONS.md


# SyncPlay Decision Register

Status values: **FIXED** = architecture constraint; **PROPOSED** = needs team approval; **PROVISIONAL** = MVP starting point to test; **OPEN** = research decision not yet selected.

| ID | Decision | Status | Notes |
|---|---|---|---|
| D1 | Bootstrap is not playback authority | FIXED | It manages membership/signaling, not playback state. |
| D2 | Synchronization algorithm is replaceable behind SyncEngine | FIXED | Stable interface first. |
| D3 | WebRTC DataChannel is initial peer transport | PROVISIONAL | Validate browser/network behavior. |
| D4 | Full mesh for small MVP rooms | PROVISIONAL | Connections = N(N-1)/2; do not scale claim. |
| D5 | In-memory room registry | PROVISIONAL | Single process only; restart loses rooms. |
| D6 | HTML5 media adapter first | PROVISIONAL | YouTube adapter later. |
| D7 | Versioned shared envelope and payload schemas | PROPOSED | Approve before implementation. |
| D8 | `messageId` differs from `logicalEventId` | PROPOSED | Message transmission vs logical operation. |
| D9 | `peerId` differs from `socketId` | PROPOSED | Stable logical identity vs transient socket. |
| D10 | Connection generation guards stale signaling | PROPOSED | Increment on rebind/reconnect. |
| D11 | Control Events does not resolve conflicts | FIXED | SyncEngine owns state semantics. |
| D12 | Fault Manager detects suspicion, not certainty | FIXED | Timeouts do not prove permanent failure. |
| D13 | Lamport counter + deterministic tie-break baseline | EXPERIMENT | Not a selected final consensus protocol. |
| D14 | Strong consensus/CRDT strategy | OPEN | Research and compare. |
| D15 | Accuracy and room-size targets | OPEN | Measure baseline before setting targets. |
| D16 | Authentication/token policy | OPEN | Define minimal safe room access model. |
| D17 | TURN policy | OPEN | Test direct connectivity first; document limitations. |
| D18 | Protocol compatibility policy | OPEN | Decide supported versions and unknown message handling. |

## Required rule
If code, prompt, or another design document contradicts a FIXED decision, stop and ask for a resolution. Do not silently edit the decision register.


---

# FILE: INTERFACE_CONTRACTS.md


# SyncPlay Shared Interface Contracts — Draft v0.1

These are conceptual contracts to align before detailed implementation. Adapt names to the existing repository after inspection. Do not duplicate schemas in multiple packages.

## 1. Shared envelope
```ts
export interface ProtocolMessage<TPayload = unknown> {
  protocolVersion: number;
  messageType: string;
  sessionId: string;
  senderPeerId: string;
  messageId: string;       // unique message/transmission
  logicalEventId?: string; // stable identity for a logical operation/retry
  payload: TPayload;
}
```
Optional timestamps must have explicitly documented clock semantics. Never use wall-clock time as a globally reliable ordering key.

## 2. Peer Mesh
```ts
interface PeerMesh {
  connect(peer: PeerDescriptor): Promise<void>;
  disconnect(peerId: string, reason?: string): void;
  send(peerId: string, message: ProtocolMessage): SendResult;
  getPeerStatus(peerId: string): PeerStatus | undefined;
  listPeers(): PeerStatus[];
  onMessage(handler: (message: InboundMessage) => void): Unsubscribe;
  onPeerStatus(handler: (status: PeerStatus) => void): Unsubscribe;
  dispose(): Promise<void>;
}
```
Transport owns `RTCPeerConnection`, `RTCDataChannel`, SDP/ICE mechanics and transport status. Do not expose raw browser objects to SyncEngine.

## 3. RTT Service
```ts
interface RttService {
  start(peerId: string): void;
  stop(peerId: string): void;
  getEstimate(peerId: string): RttEstimate | undefined;
  onSample(handler: (sample: RttSample) => void): Unsubscribe;
}
```
Use a monotonic local clock for elapsed RTT. Keep sample windows bounded; track sample age. RTT alone does not determine one-way latency or clock offset.

## 4. Control Events
```ts
interface ControlEventService {
  createLocalEvent(input: ControlIntent): Result<SyncEvent, ValidationError>;
  receive(message: InboundMessage): void;
  publish(event: SyncEvent): Promise<PublishResult>;
  onEventResult(handler: (result: EventResult) => void): Unsubscribe;
  dispose(): void;
}
```
Candidate control intents: PLAY, PAUSE, SEEK, RATE_CHANGE. Schema validity is not the same as semantic validity.

## 5. Fault Manager
```ts
interface FaultManager {
  onPeerStatus(status: PeerStatus): void;
  onProbeResult(result: ProbeResult): void;
  onMembershipChanged(change: MembershipChange): void;
  getHealth(peerId: string): PeerHealth | undefined;
  requestRecovery(peerId: string, reason: string): Promise<void>;
  dispose(): void;
}
```
Fault Manager coordinates bounded retry/rejoin/recovery. It does not mutate shared playback state.

## 6. SyncEngine
```ts
interface SyncEngine {
  initialize(context: SyncContext): void;
  propose(intent: ControlIntent): EngineResult;
  receive(event: SyncEvent): EngineResult;
  getState(): Readonly<SyncState>;
  getStatus(): EngineStatus;
  onDecision(handler: (decision: SyncDecision) => void): Unsubscribe;
  onStateChange(handler: (state: Readonly<SyncState>) => void): Unsubscribe;
  exportRecoveryState(): RecoverySnapshot;
  importRecoveryState(snapshot: RecoverySnapshot): EngineResult;
  dispose(): void;
}
```
SyncEngine owns shared logical playback state, operation semantics, conflict policy, and state reconciliation. Its API must be testable without WebRTC or HTML media.

## 7. Media Adapter
```ts
interface MediaAdapter {
  readState(): MediaState;
  applyState(state: MediaState): Promise<MediaApplyResult>;
  onLocalChange(handler: (change: LocalMediaChange) => void): Unsubscribe;
  dispose(): void;
}
```
The adapter reports actual media outcomes. It must not decide which distributed event wins.

## 8. Identity semantics
- `sessionId`: identifies a session, not a secret.
- `peerId`: stable logical participant identity within a session/rejoin policy.
- `socketId`: transient signaling socket connection.
- `connectionGeneration`: incremented when signaling binding changes; reject stale callbacks/messages from older generations.
- `messageId`: one message transmission.
- `logicalEventId`: one logical operation across retries.

## 9. Lifecycle boundaries
- Room membership is not the same as transport-connected status.
- DataChannel open is not the same as state convergence.
- Reconnect is not the same as successful state recovery.
- Sending to a peer is not proof every peer received or committed an operation.
- Bootstrap validates membership/signaling; SyncEngine determines playback state.


---

# FILE: MODULE_RESPONSIBILITIES.md


# SyncPlay Module Responsibility and Data-Flow Map

```text
                    +----------------------------+
                    | Demo / Integrating App     |
                    +-------------+--------------+
                                  |
                    Public SyncPlay SDK API
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
  +-------v--------+      +-------v---------+     +-------v--------+
  | Control Events |----->|   SyncEngine    |---->| Media Adapter  |
  | validate/route |      | shared state    |     | HTML5 effects  |
  +-------+--------+      | conflict policy |     +----------------+
          |               +-------+---------+
          |                       ^
  +-------v--------+              |
  | Peer Mesh      |--------------+
  | WebRTC channel |     RTT + state/recovery messages
  +-------+--------+
          ^
          |
  +-------+---------+      signaling/session lifecycle
  | Bootstrap Client|<------------------------------------+
  +-----------------+                                     |
                                                          |
                                                +---------v--------+
                                                | Bootstrap Server |
                                                | room + signaling |
                                                | NO playback truth|
                                                +------------------+

Fault Manager observes peer/membership status and coordinates bounded
recovery/rejoin. It does not directly choose playback state.
```

## Separation of concerns
- Bootstrap Server: rooms, membership, signaling authorization/relay.
- Bootstrap Client: connects SDK to bootstrap endpoints and socket events.
- Peer Mesh: WebRTC peer connections and DataChannels.
- RTT Service: ping/pong measurements, estimates and freshness.
- Control Events: schema validation, event factory, dedupe and dispatch.
- Fault Manager: suspicion, retry/backoff, rejoin and recovery orchestration.
- SyncEngine: logical state, operation semantics, conflict policy and convergence.
- Media Adapter: reads/applies local media state.
- SDK: public developer-facing API, lifecycle and package exports.


---

# FILE: IMPLEMENTATION_PLAN.md


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


---

# FILE: AGENTS.md


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
