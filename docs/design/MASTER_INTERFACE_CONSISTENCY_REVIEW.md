# Master Interface Consistency Review

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Master_Interface_Consistency_Review.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Master Interface
Consistency Review & Build Plan
Version 0.1 • Cross-module integration baseline
GOAL
Resolve cross-module contract mismatches before implementation; freeze only what the modules truly share.
Covers Bootstrap • Peer Mesh & RTT • Control Events • Fault Tolerance • SyncEngine
Proposed baseline for team review. Algorithm-specific details remain replaceable.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
01


---

## Source PDF page 2

1. Review Outcome: What Is Stable vs Still Open
Do not treat provisional LLD details as frozen protocol decisions.
Area
Stable decision
Still open / to validate
Architecture
Bootstrap does not own playback truth; SyncEngine is replaceable
Final consensus/convergence algorithm
Transport
WebRTC DataChannel; full mesh for small MVP rooms
Peer limits; TURN/network test matrix
Identity
peerId is logical; socketId is transient; connection generation guards stale signaling
Token format/expiry; identity creation owner
Messages
Versioned envelope; schema validation; bounded messages
Final event registry and compatibility policy
Control events
PLAY / PAUSE / SEEK / RATE_CHANGE intent events
Exact payload fields and conflict semantics
RTT
Monotonic local elapsed-time measurement; bounded sample window
Probe cadence, timeout and metric thresholds
Recovery
Rejoin plus state exchange; fault detection is suspicion
Snapshot schema; recovery trigger/threshold
Storage
In-memory room registry for single-process MVP
Persistence/multi-instance are out of scope unless required
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
02


---

## Source PDF page 3

2. Canonical Responsibility Map
Each concept has one owner; other modules consume its contract.
Concept
Owner
Other modules may
Room membership and signaling authorization
Bootstrap Server
Request/join/leave; consume peer snapshots
Peer connections and DataChannels
Peer Mesh / Transport
Request connect/send/close; observe status
RTT samples and peer timing metrics
RTT Service
Read estimates; consume sample events
Event schema validation / dispatch
Control Events Layer
Submit intents; receive validated events/results
Failure suspicion / retry orchestration
Fault Manager
Consume status; request bounded recovery
Shared playback state / conflict resolution
SyncEngine
Submit events; query state/decisions
Local HTML media effects
Media Adapter
Read actual media state; apply explicit decisions
No module except SyncEngine decides how concurrent playback operations alter shared logical state.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
03


---

## Source PDF page 4

3. Canonical Protocol Envelope (Proposed)
Freeze this envelope only after the team agrees on naming, IDs and versioning semantics.
type ProtocolMessage<TPayload = unknown> = {
  protocolVersion: number;
  messageType: string;
  sessionId: string;
  senderPeerId: string;
  messageId: string;          // unique transmission/message ID
  logicalEventId?: string;    // stable identity for a user operation
  payload: TPayload;
};
messageId
Deduplicate transport message if needed
logicalEventId
Deduplicate logical operation
• Do not use a single ID for both transmission and logical operation: a retransmission may create a new message but preserve the same operation ID.
• Keep local receive timestamps and sender monotonic timestamps outside the globally ordered operation key unless a defined algorithm explicitly needs them.
• All inbound messages require size, schema, version and session checks.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
04


---

## Source PDF page 5

4. Shared TypeScript Contract Draft
This is a starter contract, not final implementation code. Keep modules behind these interfaces.
type PeerId = string;
type SessionId = string;
type Unsubscribe = () => void;
interface PeerMesh {
  connect(peer: PeerDescriptor): Promise<void>;
  disconnect(peerId: PeerId, reason?: string): void;
  send(peerId: PeerId, message: ProtocolMessage): SendResult;
  getPeerStatus(peerId: PeerId): PeerStatus | undefined;
  onMessage(fn: (m: InboundMessage) => void): Unsubscribe;
  onPeerStatus(fn: (s: PeerStatus) => void): Unsubscribe;
  dispose(): Promise<void>;
}
interface SyncEngine {
  initialize(ctx: SyncContext): void;
  propose(intent: ControlIntent): EngineResult;
  receive(event: SyncEvent): EngineResult;
  getState(): Readonly<SyncState>;
  onDecision(fn: (d: SyncDecision) => void): Unsubscribe;
  exportRecoveryState(): RecoverySnapshot;
  importRecoveryState(s: RecoverySnapshot): EngineResult;
  dispose(): void;
}
Peer Mesh
transport contract
SyncEngine
state contract
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
05


---

## Source PDF page 6

5. Identity, Ordering and Connection Generations
These rules prevent stale sockets or retries from corrupting current state.
• sessionId identifies the room/session; it is not a secret or authorization credential.
• peerId identifies a logical participant across reconnects within the session; define whether it is client-generated or server-issued and keep it stable
  during a rejoin.
• socketId identifies one transient signaling connection and must never be treated as peer identity.
• connectionGeneration increments when a peer's signaling binding is replaced. Ignore stale signaling and connection callbacks from older generations.
• messageId identifies one transmitted message; logicalEventId identifies one logical operation across retries.
• Arrival order is receiver-local. Wall-clock createdAt must not be treated as a globally reliable operation order.
• If the baseline engine uses Lamport ordering, define counter update rules and a deterministic tie-breaker in one shared spec.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
06


---

## Source PDF page 7

6. Lifecycle Sequences to Align
All modules should agree on who initiates each transition and what constitutes success.
1. Join room
2. Exchange SDP/ICE
3. DataChannel open
4. Start RTT probes
5. Exchange controls
6. Reconcile after rejoin
• Joining is not complete merely because a room ID is returned; transport readiness is a separate state.
• DataChannel open does not imply state convergence. Start state exchange/recovery when required.
• A disconnect should not immediately delete room membership. Bootstrap grace and Fault Manager suspicion need aligned timers.
• Rejoin must refresh membership/connection generation before fresh signaling is accepted.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
07


---

## Source PDF page 8

7. Error Model and Observability
Use typed errors and event traces to debug distributed behavior across browsers.
Error category
Owner
Expected behavior
Invalid / unsupported message
Control Events
Reject before SyncEngine dispatch
Peer send unavailable
Peer Mesh
Return send status; do not claim delivery
Signaling authorization failure
Bootstrap
Reject event; do not relay SDP/ICE
Transient transport loss
Fault Manager + Peer Mesh
Mark degraded/suspected; bounded recovery
Recovery snapshot invalid
SyncEngine
Reject snapshot; preserve valid local state
Sync conflict / stale event
SyncEngine
Return deterministic decision or defer
Media apply failure
Media Adapter
Report actual local result; logical state remains explicit
• Include sessionId, peerId, messageId/logicalEventId, message type, generation, state transition and monotonic local duration where useful.
• Never log membership credentials, full SDP/ICE or unnecessarily detailed user data.
• Add correlation IDs across Bootstrap logs and client logs without treating logs as a protocol dependency.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
08


---

## Source PDF page 9

8. Cross-Module Risks to Resolve Before Coding
The most likely integration defects are semantic mismatches rather than syntax errors.
Risk
Why it matters
Required resolution
Join vs connected
Room member may not have a usable channel
Separate membership and transport state
Disconnect timing
Conflicting grace periods cause duplicate removal/rejoin
Set ownership and provisional timer defaults
ID semantics
Retries mistaken for new operations or duplicates
Document messageId vs logicalEventId
Stale signaling
Old socket's ICE candidates overwrite fresh session
Generation checks end-to-end
Event ordering
Peers reduce events in different order
Shared baseline ordering/replay spec
Recovery snapshot
Modules disagree on what snapshot means
SyncEngine owns schema and validation
Partial send
App assumes all peers received event
Represent send result as local transport outcome, not global commit
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
09


---

## Source PDF page 10

9. Proposed Repository Layout
Monorepo is suitable for a student team; use workspace packages to share protocol types.
syncplay/
  apps/
    demo/
  services/
    bootstrap-server/
  packages/
    protocol/          # schemas, envelope, event registry
    peer-mesh/         # WebRTC, DataChannels, peer state
    rtt-engine/        # probes and timing metrics
    control-events/    # intent validation, dispatch, dedupe
    fault-manager/     # suspicion, retry, rejoin orchestration
    sync-engine/       # interface + baseline implementation
    media-adapter/     # HTML5 adapter
    sdk/               # public API and package exports
  tests/
    integration/
    network-scenarios/
  docs/
• Keep protocol schemas in one package imported by every
  module; do not copy type definitions across folders.
• Use TypeScript project references/workspaces if helpful;
  add unit tests per package and a small end-to-end demo.
• Publish only the public SDK package(s); internal
  packages can remain private or be bundled initially.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
10


---

## Source PDF page 11

10. Team Build Plan and Definition of Done
Build thin vertical slices rather than finishing each module in isolation.
Phase
Deliverable
Definition of done
A. Contract freeze
protocol types + interface tests
All module owners agree; compile-time types shared
B. Bootstrap
room lifecycle + signaling
Two clients discover and signal each other
C. Peer mesh
DataChannel + status
Two browsers exchange typed messages
D. Control path
play/pause/seek event flow
Events validate and reach SyncEngine
E. Baseline engine
deterministic reducer + dedupe
Repeatable tests for concurrent/reordered inputs
F. Fault recovery
rejoin + state exchange
Disconnect/reconnect does not leak resources
G. Evaluation
network scenarios + report
Metrics and limits documented
H. SDK demo
HTML5 adapter + package
Fresh project can integrate the SDK
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
11


---

## Source PDF page 12

11. Decisions Register and Immediate Next Actions
Treat these as review items for the team, not assumptions hidden in code.
ID
Decision / action
Status
D1
Bootstrap is not playback authority
FIXED
D2
WebRTC full mesh for small MVP rooms
PROVISIONAL
D3
Shared protocol package and versioned envelope
PROPOSED — APPROVE
D4
Stable peerId + transient socketId + generation
PROPOSED — APPROVE
D5
Separate messageId and logicalEventId
PROPOSED — APPROVE
D6
SyncEngine owns conflict semantics and state merge
FIXED
D7
Lamport + deterministic tie-break baseline
EXPERIMENT
D8
In-memory Bootstrap room registry
MVP LIMIT
D9
Reconnect and snapshot thresholds
MEASURE / TUNE
• Immediate task 1: review and approve D3–D6 as shared contracts.
• Immediate task 2: create packages/protocol and write schemas/tests before implementing module internals.
• Immediate task 3: implement Bootstrap RoomStore and the two-browser WebRTC smoke test in parallel.
• Do not implement final conflict-resolution semantics until the baseline test cases are written.
SYNCPLAY • MASTER INTERFACE CONSISTENCY REVIEW • v0.1
12
