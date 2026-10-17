# Fault Tolerance Lld

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Fault_Tolerance_LLD.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Fault Tolerance
Low-Level Design
Version 0.1 • Proposed implementation specification
RESPONSIBILITY
Detect suspected failures, coordinate recovery and support state reconciliation — without becoming a playback leader.
Aligned with SyncPlay Master HLD, Bootstrap, Peer Mesh and Control Events LLDs
Failure detection is probabilistic in an asynchronous network; timeouts are suspicion, not proof.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
01


---

## Source PDF page 2

1. Purpose and Responsibility Boundaries
Fault tolerance coordinates lifecycle and recovery; it does not choose the winning playback operation.
IN SCOPE
• Suspected peer failure detection
• Disconnect / reconnect lifecycle
• Rejoin and membership refresh
• State recovery handshake
• Backoff, retry limits and cleanup
OUT OF SCOPE
• Perfect crash detection
• Guaranteeing network availability
• Leader election for playback
• Resolving concurrent operations
• Persistent global history in MVP
• Peer Mesh reports transport facts: DataChannel/ICE state changes, send failures and RTT probe timeouts.
• Fault Manager interprets observations as healthy, degraded, suspected, reconnecting or recovered.
• Bootstrap Server remains responsible for authoritative room membership and signaling; a local timeout must not silently delete a peer from the room.
• SyncEngine owns state reconciliation semantics and determines what playback state should be applied after rejoin.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
02


---

## Source PDF page 3

2. Architecture and Event Flow
Keep transport observation, failure policy, membership and playback recovery distinct.
Peer Mesh
transport facts
Fault Manager
policy + timers
Bootstrap Client
rejoin / signaling
Peer Mesh
reconnect
SyncEngine
reconcile state
• The Fault Manager consumes status events and schedules bounded actions; it does not own RTCPeerConnection directly.
• Rejoin requests the current membership snapshot and fresh signaling context from Bootstrap Server.
• Once a connection is re-established, SyncEngine exchanges state summaries/snapshots and runs its recovery policy.
• Existing connected peers may continue exchanging events if the Bootstrap Server is temporarily unavailable; new joins and renegotiation may be impaired.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
03


---

## Source PDF page 4

3. Peer Health State Machine
Treat transient disconnects differently from terminal closure.
HEALTHY
DEGRADED
SUSPECTED
RECONNECTING
RECOVERED
LEFT / EXPIRED
MANUAL RETRY
• HEALTHY: DataChannel open and recent valid traffic or probe response.
• DEGRADED: rising RTT, probe loss, or transient ICE disconnected state.
• SUSPECTED: failure threshold crossed; peer may still be alive or partitioned.
• RECONNECTING: bounded attempts in progress; preserve logical peer identity where membership allows.
• RECOVERED: transport restored; run state reconciliation before declaring playback fully synchronized.
• LEFT/EXPIRED: Bootstrap confirms room departure or membership expiry; close resources and remove peer state.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
04


---

## Source PDF page 5

4. Failure Signals and Detection Policy
No single signal should be treated as definitive proof of peer death.
Signal
Interpretation
Suggested response
DataChannel closed
Transport unusable
Mark degraded; wait for connection-state context
ICE disconnected
Potentially transient path loss
Grace period before restart/rejoin
ICE failed
Current ICE path failed
Bounded ICE restart or recreate connection
Repeated PING timeouts
No probe responses in window
Mark suspected; inspect other signals
No control traffic
May simply be idle
Do not infer failure from silence alone
Bootstrap membership removal
Server confirmed leave/expiry
Close peer connection and clean membership
Browser tab closes
May appear as abrupt transport loss
Timeout and cleanup; no graceful leave assumed
Use a configurable grace window and combine signals. The numeric thresholds must be measured in testing.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
05


---

## Source PDF page 6

5. Reconnection and Rejoin Flow
Reconnect restores transport; it does not automatically restore converged playback state.
1
Detect transient loss; mark peer suspected
2
Keep logical peerId; stop stale timers and close unusable transport as policy requires
3
Request rejoin using valid membership credential and current room context
4
Bootstrap validates membership, increments connection generation and returns fresh peer snapshot
5
Re-establish SDP/ICE; ignore signaling for stale generations
6
Open DataChannel and restart RTT sampling
7
Exchange state digest / snapshot; SyncEngine reconciles
8
Mark recovered only after transport + reconciliation criteria pass
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
06


---

## Source PDF page 7

6. State Recovery Contract
The recovery handshake is a contract; the actual conflict/convergence algorithm remains replaceable.
Peer A rejoins
STATE_DIGEST
Compare summaries
STATE_REQUEST /
missing context
STATE_SNAPSHOT /
versioned state
• Digest fields must be defined by SyncEngine; possible examples include state version, known event IDs or compact playback state hash.
• A snapshot is untrusted input and must be size-limited and semantically validated.
• Do not assume a newer wall-clock timestamp means a more correct state.
• If peers disagree, SyncEngine applies the selected conflict-resolution and convergence policy; Fault Manager only coordinates the exchange.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
07


---

## Source PDF page 8

7. Retry, Backoff and Resource Management
Prevent reconnect storms and unbounded timer/queue growth.
Concern
Proposed v1 policy
Retry strategy
Exponential backoff with jitter; bounded attempt count per recovery cycle
Retry reset
Reset backoff only after stable connection interval
ICE restart
Use only when supported and appropriate; avoid concurrent uncontrolled restarts
Generation check
Ignore stale signaling/events from previous connection generation
Timers
One owned timer per scheduled action; cancel on recovery/dispose
Queueing
Bound queued outbound messages; stale transient controls may be superseded per SyncEngine policy
Membership expiry
Ask Bootstrap Server; do not locally invent authoritative room membership
Circuit breaking
After repeated failures, report unavailable and wait for explicit/new retry trigger
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
08


---

## Source PDF page 9

8. Module Interfaces
Fault Manager coordinates events; Peer Mesh and Bootstrap Client own their respective operations.
interface FaultManager {
  onPeerStatus(status: PeerStatus): void;
  onProbeResult(result: ProbeResult): void;
  onMembershipChanged(change: MembershipChange): void;
  getHealth(peerId: string): PeerHealth | undefined;
  requestRecovery(peerId: string, reason: string): Promise<void>;
  dispose(): void;
}
interface RecoveryCoordinator {
  rejoin(): Promise<MembershipSnapshot>;
  restartConnection(peerId: string): Promise<void>;
  requestStateSync(peerId: string): Promise<void>;
}
Peer Mesh
transport lifecycle
SyncEngine
state reconciliation
• FaultManager should not directly mutate playback state or own consensus rules.
• RecoveryCoordinator is an orchestration abstraction; implementations call the Bootstrap Client, Peer Mesh and SyncEngine interfaces.
• All methods should return typed outcomes or emit typed failure events; avoid swallowing errors.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
09


---

## Source PDF page 10

9. Security and Partition Semantics
A network partition can make both sides believe the other side failed.
• A peer timeout indicates lack of observed response, not permanent failure; peers may be partitioned or suspended by the browser.
• Do not elect a permanent playback leader as an automatic recovery shortcut; that would change the project architecture.
• During a partition, peers may independently accept operations. The SyncEngine must define how these operations converge after reconnection.
• Rejoin tokens must be scoped to a room and handled securely; do not log credentials.
• Validate room membership changes and connection generations; stale signaling from old sockets must not overwrite current state.
• Apply limits to rejoin attempts and recovery message size/rate to prevent resource exhaustion.
Core invariant: recovery must restore communication and trigger reconciliation, not silently declare one peer's state universally correct.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
10


---

## Source PDF page 11

10. Test Plan and Acceptance Criteria
Exercise failure paths deliberately, including loss without graceful leave.
Test
Expected result
Peer disappears abruptly
Suspected state after policy threshold; resources eventually cleaned
Temporary network interruption
Grace period avoids unnecessary full room removal
Bootstrap temporarily unavailable
Existing peer channels can continue where intact; rejoin/new signaling may fail
Reconnect with new generation
Old signaling is ignored; fresh connection is established
Rejoin with divergent playback state
State exchange occurs; SyncEngine owns reconciliation
Repeated reconnect failure
Backoff and retry limits prevent storm
Dispose during retry
Timers/listeners cleared; no late callbacks
Partition and merge
Conflicting operations surfaced to SyncEngine; no false global-order claim
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
11


---

## Source PDF page 12

11. Implementation Order and Open Decisions
Implement basic recovery only after peer state and protocol message contracts are stable.
1
Agree PeerStatus / MembershipSnapshot / connection-generation semantics
2
Implement FaultManager state transitions with fake transport tests
3
Add grace timers, backoff with jitter and cleanup
4
Integrate Bootstrap rejoin and stale-generation checks
5
Add state digest/snapshot orchestration through SyncEngine
6
Test abrupt loss, reconnect, partition and divergent state
7
Measure and tune thresholds; document limitations
NEXT: SyncEngine interface + research specification — the central research component of SyncPlay.
SYNCPLAY • FAULT TOLERANCE LLD • v0.1 — PROPOSED
12
