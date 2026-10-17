# Control Events Layer Lld

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Control_Events_Layer_LLD.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Control Events Layer
Low-Level Design
Version 0.1 • Proposed implementation specification
RESPONSIBILITY
Validate, route and track playback-control events — do not hardcode consensus policy.
Aligned with SyncPlay Master HLD and Peer Mesh & RTT Engine LLD
Proposed design baseline. Event ordering and conflict resolution remain SyncEngine responsibilities.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
01


---

## Source PDF page 2

1. Purpose and Boundaries
This layer converts application controls into validated protocol events and delivers inbound events to the SyncEngine.
IN SCOPE
• PLAY / PAUSE / SEEK / RATE_CHANGE
• Shared versioned event envelope
• Schema and semantic pre-validation
• Deduplication window and dispatch
• Bounded outbound queues and errors
OUT OF SCOPE
• Choosing the authoritative operation
• Guaranteeing total order across peers
• Deciding conflict winners
• Estimating clock offset / drift
• Applying media changes directly
• The application calls a typed SDK API; the Control Events Layer creates a local command/event candidate.
• The SyncEngine decides how an event affects shared state and whether it should be applied, deferred, superseded or rejected.
• The Media Adapter applies a SyncEngine decision to HTMLMediaElement and reports observed media state.
• Transport is untrusted input: schema-valid does not automatically mean semantically valid or authorized.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
02


---

## Source PDF page 3

2. Event Pipeline
Keep API intent, protocol delivery, shared-state decision and media effect as separate steps.
Application API
play() / seek()
Event Factory
ID + envelope
Validator
schema + limits
Peer Mesh
send / receive
SyncEngine
state decision
Media Adapter
apply decision
Result / telemetry
accepted, rejected, error
• Outbound: public API → create candidate → validate → send to peers → local SyncEngine policy determines state application.
• Inbound: transport → envelope validation → deduplicate → SyncEngine.receive(event) → optional media decision.
• Do not blindly apply an outbound command locally before the SyncEngine has made the policy decision; otherwise peers may diverge.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
03


---

## Source PDF page 4

3. Shared Envelope and Event Identity
Use stable envelope fields and versioned payloads. This is a proposal to reconcile with the shared protocol types.
type ProtocolMessage = {
  protocolVersion: number;
  messageType: string;
  sessionId: string;
  senderPeerId: string;
  messageId: string;       // this transmission/message
  logicalEventId?: string; // same operation across retries
  createdAt?: number;      // wall-clock diagnostic only
  payload: unknown;
};
messageId
Unique per protocol message
logicalEventId
Stable identity of one operation
• A retry may have a new messageId but should preserve logicalEventId if it represents the same operation.
• Do not use wall-clock createdAt as the sole ordering key; device clocks can differ and drift.
• Avoid adding fields until their semantics and ownership are documented. Envelope changes require protocol-version compatibility rules.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
04


---

## Source PDF page 5

4. Proposed Control Payloads
Payloads describe user intent, not the final converged state.
Event
Proposed payload fields
Validation
PLAY
operationId; optional targetPositionMs
Position finite and >= 0 if present
PAUSE
operationId; optional observedPositionMs
Position finite and >= 0 if present
SEEK
operationId; targetPositionMs
Finite, >= 0, within media policy
RATE_CHANGE
operationId; playbackRate
Finite; allowed range configured by SDK
STATE_REQUEST
requestId; reason
Known reason enum; rate-limited
STATE_SNAPSHOT
snapshotId; state payload version
Size-limited; SyncEngine validates semantics
PING / PONG
probeId; sender timestamp fields as defined by RTT module
Matched probe; monotonic timestamps local to sender
All names and fields are provisional until the shared protocol schema is frozen.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
05


---

## Source PDF page 6

5. Event IDs, Deduplication and Retries
Transport delivery is not equivalent to exactly-once application.
• Generate a cryptographically strong or collision-resistant logicalEventId per user operation; use a unique messageId for each transmitted message.
• Maintain a bounded per-session/per-sender deduplication cache keyed by logicalEventId (or a documented composite key).
• On duplicate receipt, do not re-run side effects; optionally return an acknowledgement/diagnostic result.
• Cache entries expire by TTL and maximum count; do not grow without bound.
• Do not automatically retry every control event: PLAY/PAUSE may be superseded by newer state, while a retry of SEEK may be meaningful only under the
  chosen SyncEngine semantics.
• Retry policy belongs to the event type and SyncEngine decision; the Control Events Layer provides bounded transport support, not semantic
  guarantees.
Do not claim exactly-once delivery across a changing peer mesh. Design for duplicates, loss and reconnection.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
06


---

## Source PDF page 7

6. Ordering and Concurrent Operations
The Control Events Layer preserves observed arrival metadata; it does not invent a global order.
Peer A emits SEEK(120 s)
Peer B emits PAUSE
Different network delays
can reverse arrival order
SyncEngine applies a documented conflict policy
and produces a convergent decision
• Arrival order is local to each receiver and is not a reliable global ordering rule.
• A Lamport-style logical timestamp, deterministic tie-breaker, sequence scheme or CRDT-like approach may be researched; none is selected by this document.
• Do not compare unrelated peers' wall-clock timestamps as if they were synchronized.
• Control layer should expose event identity, sender, received time (local monotonic diagnostic) and payload to SyncEngine.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
07


---

## Source PDF page 8

7. Public SDK API and Internal Contracts
Keep application APIs small while preserving an event-level interface for tests and advanced integrations.
interface SyncPlayControls {
  play(): Promise<CommandResult>;
  pause(): Promise<CommandResult>;
  seek(positionMs: number): Promise<CommandResult>;
  setPlaybackRate(rate: number): Promise<CommandResult>;
}
interface ControlEventService {
  createLocalEvent(input: ControlIntent): Result<SyncEvent, ValidationError>;
  receive(message: InboundMessage): void;
  publish(event: SyncEvent): Promise<PublishResult>;
  onEventResult(handler: (r: EventResult) => void): Unsubscribe;
  dispose(): void;
}
Public API
Intent-oriented
Internal API
Event-oriented
• CommandResult should distinguish accepted-for-processing from applied-to-media.
• Return typed failures such as invalid input, session unavailable, peer send failure, unsupported protocol version and disposed client.
• Avoid exposing RTCPeerConnection or raw Socket.IO events to application consumers.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
08


---

## Source PDF page 9

8. Validation, Errors and Resource Bounds
Reject malformed input before state processing; let SyncEngine handle semantic conflicts.
Condition
Control layer response
Unknown protocol version/type
Reject; emit structured compatibility error
Invalid seek/rate payload
Reject locally or inbound; no dispatch
Duplicate logicalEventId
Suppress duplicate side effects; record duplicate metric
Session/peer mismatch
Reject; do not forward
Peer send unavailable
Return partial/failed publish result; do not claim delivery
Queue full
Bound queue; reject or drop only documented low-priority traffic
SyncEngine unavailable/disposed
Reject dispatch and release resources
Snapshot too large
Reject before parsing/deep processing; enforce size ceiling
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
09


---

## Source PDF page 10

9. Security and Trust Model
Valid JSON is not necessarily safe or authorized.
• Validate payload schema and size at every boundary; never trust client-supplied senderPeerId without transport/session binding.
• Check session membership and message-type permissions before dispatch.
• Rate-limit control events and diagnostic messages; protect against event floods and memory exhaustion.
• Treat media URLs and external metadata as untrusted input; this layer should not fetch arbitrary URLs.
• Avoid logging sensitive payloads. Log event IDs, type, decision category and timings where useful.
• SyncEngine must check semantic transitions, such as whether a seek target is valid for the current media and whether an event is stale.
Security invariant: no invalid or unauthorized event may mutate shared playback state.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
10


---

## Source PDF page 11

10. Test Plan and Acceptance Criteria
Unit-test the control layer independently from WebRTC, then add multi-peer integration tests.
Test group
Examples
Acceptance criterion
Schema
Unknown type, missing fields, NaN/negative values
Invalid payload never reaches SyncEngine
Identity
Same event retried with new messageId
Duplicate side effect suppressed
Ordering
Out-of-order delivery; concurrent SEEK/PAUSE
Events delivered with metadata; policy delegated
Delivery
Peer disconnected; partial mesh
Result reports uncertainty/failure honestly
Bounds
Oversized payload; queue flood; dedup cache full
Memory/queues remain bounded
Lifecycle
Dispose during in-flight event
No leaked handlers/timers or late side effects
Integration
Two/three peers and HTML5 adapter
Controls flow through SyncEngine decision path
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
11


---

## Source PDF page 12

11. Implementation Order and Open Decisions
Freeze interfaces before implementation; preserve algorithm replaceability.
1
Agree envelope, protocolVersion and message type registry across all modules
2
Define typed payload schemas for PLAY, PAUSE, SEEK, RATE_CHANGE and PING/PONG
3
Implement validation and event factory with unit tests
4
Implement bounded deduplication and dispatch to SyncEngine
5
Wire public controls to event creation and Peer Mesh publish
6
Add result/error model and observability hooks
7
Test duplicates, reordering, disconnects and multi-peer scenarios
NEXT: Fault Tolerance LLD — failure detection, reconnect, rejoin and state recovery contracts.
SYNCPLAY • CONTROL EVENTS LAYER LLD • v0.1 — PROPOSED
12
