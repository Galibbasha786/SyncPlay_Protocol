# Syncengine Interface Research Spec

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_SyncEngine_Interface_Research_Spec.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
SyncEngine Interface
& Research Specification
Version 0.1 • Proposed implementation and evaluation baseline
CORE PRINCIPLE
Stable interface, replaceable algorithm. Transport and recovery modules must not become playback authority.
Aligned with SyncPlay Master HLD and supporting module LLDs
Research specification, not a claim of production-grade consensus or perfect synchronization.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
01


---

## Source PDF page 2

1. Research Goal and Scope
The research question is how peers converge on shared playback state without a permanent leader.
GOAL
Build a practical, replaceable SyncEngine that processes distributed control events and reaches a documented convergence behavior under stated assumptions.
NON-GOALS FOR MVP
• Perfect sync under all networks
• Strong consensus with no assumptions
• Byzantine fault tolerance
• Internet-scale full-mesh rooms
• Formal proof of global novelty
• WebRTC transports messages; it does not provide application-level consensus or resolve concurrent PLAY/PAUSE/SEEK operations.
• The engine should be tested under delay, loss, disconnection, reconnect and concurrent input.
• The MVP must state its guarantees and limits. A deterministic convergence rule is not automatically a consensus protocol with strong fault-tolerance
  guarantees.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
02


---

## Source PDF page 3

2. Responsibilities and Integration Boundary
SyncEngine decides shared-state semantics; other modules provide observations and delivery.
Control Events
validated events
SyncEngine
policy + state
Decision output
state / effects
Media Adapter
HTML5 apply
Peer Mesh
messages + RTT
• Input: validated local/remote events, peer membership changes, timing estimates, state digests and recovery snapshots.
• Output: accepted/rejected/deferred/superseded decision, target shared state, and optional effects to apply to local media.
• The engine must be deterministic for the same accepted input history and configuration wherever feasible; timing-dependent policies must be explicit.
• Engine instances are per session. Dispose must release listeners, buffers and timers.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
03


---

## Source PDF page 4

3. Proposed Stable Interface
Use typed contracts; avoid exposing transport internals or browser media objects.
interface SyncEngine {
  initialize(context: SyncContext): void;
  receive(event: SyncEvent): EngineResult;
  propose(intent: ControlIntent): EngineResult;
  getState(): Readonly<SyncState>;
  getStatus(): EngineStatus;
  onDecision(handler: (d: SyncDecision) => void): Unsubscribe;
  onStateChange(handler: (s: Readonly<SyncState>) => void): Unsubscribe;
  exportRecoveryState(): RecoverySnapshot;
  importRecoveryState(snapshot: RecoverySnapshot): EngineResult;
  dispose(): void;
}
Stable public contract
TypeScript types + tests
Replaceable implementation
Baseline → experiments
• receive() should validate semantic preconditions and be idempotent for duplicate logical event IDs.
• Use a typed EngineResult; do not throw for expected invalid/conflicting input. Reserve exceptions for unexpected internal faults.
• export/import recovery state must be versioned and size-bounded; never accept arbitrary unvalidated snapshots.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
04


---

## Source PDF page 5

4. State Model: Separate Playback State from Operation History
The minimum state model should be explicit and versionable.
Field
Meaning
Notes
mediaKey
Stable identity of the shared media
Do not rely only on a local URL
playbackStatus
playing / paused / buffering / ended
Buffering may be local or shared by policy
positionMs
Logical media position at reference time
Estimate current position using clock/timing model
playbackRate
Requested playback speed
Validate finite configured range
lastAppliedOperation
Operation identity/metadata
Do not treat wall-clock time as universal order
stateVersion
Engine-defined version / digest input
Meaning depends on chosen algorithm
history / causal metadata
Information needed for merge/recovery
Bounded retention; exact format algorithm-specific
• Keep local media observation separate from shared logical playback state: actual HTMLMediaElement position may lag or be clamped.
• Represent seek target and playback state independently enough to reason about concurrent SEEK and PAUSE.
• Clock offset/drift estimates are inputs to timing policy, not identifiers or conflict-resolution truth.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
05


---

## Source PDF page 6

5. Core Invariants to Test
These are target invariants for the MVP; each must be verified under a defined fault model.
I1
Deterministic replay
Same ordered accepted event history + same config → same logical state.
I2
Duplicate safety
Receiving one logical event multiple times has no repeated logical side effect.
I3
Validation safety
Invalid events/snapshots never mutate logical state.
I4
Bounded resources
History, deduplication, queues and recovery snapshots have limits.
I5
Eventual convergence (conditional)
If communication resumes, required events are exchanged, and inputs stop changing long enough, replicas converge under the selected algorithm.
I6
No false authority
No bootstrap/transport/fault module silently chooses playback state.
I5 is conditional. Network partitions and continuously conflicting inputs can prevent timely convergence.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
06


---

## Source PDF page 7

6. Candidate Strategies to Compare
Select an MVP by implementation cost, behavior under concurrency and ease of evaluation.
Candidate
Idea
Advantages
Risks / limits
A. Deterministic LWW
Order by logical counter + peer-ID tie-break
Simple; easy to reproduce
May discard valid user intent; not strong consensus
B. Lamport ordering
Logical timestamps plus deterministic tie-break
Captures causal progression better than wall clock
Concurrent ops still need policy; delivery/history matter
C. Operation-based CRDT-style
Define mergeable operation/state semantics
Can converge under designed algebraic rules
Media controls are not trivially commutative; design complexity
D. Leader/consensus protocol
Explicit agreement protocol
Stronger defined ordering under assumptions
More complexity; partition availability trade-offs; not default MVP
• Recommendation: implement a baseline deterministic rule first, then compare at least one improved candidate experimentally.
• Do not call a deterministic tie-break “consensus” unless the algorithm and guarantees justify that term.
• Choose the rule after defining expected user semantics for concurrent SEEK/PAUSE/PLAY.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
07


---

## Source PDF page 8

7. Recommended MVP Baseline (Provisional)
A deliberately modest baseline for an initial working prototype; replace after measurement.
• Represent each control as an immutable operation with logicalEventId, senderPeerId, operation type and validated payload.
• Use a logical Lamport counter per peer and increment on local operation and on receipt (counter = max(local, received) + 1).
• Define deterministic ordering key: (lamportCounter, senderPeerId, logicalEventId) — lexical tie-break rules must be fixed in code/spec.
• Keep a bounded set of seen logicalEventIds and a bounded operation log for replay/recovery.
• When a new operation arrives, apply the documented reducer in deterministic order. A simple total-order replay is easier to test than ad hoc arrival-
  time handling.
• State explicitly that this baseline is deterministic event ordering, not a full consensus protocol and not proof of causal delivery or Byzantine
  resilience.
• Experiment with per-operation semantics: SEEK sets position; PLAY/PAUSE changes status; RATE_CHANGE changes rate. Evaluate whether a total-order
  reducer matches desired UX.
Important: total-order replay requires peers to obtain the same relevant operation set and stable ordering metadata.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
08


---

## Source PDF page 9

8. Clock and Media Timing Model
Distributed state agreement and synchronized media rendering are related but separate problems.
STATE CONVERGENCE
Peers agree on logical status, target position,
rate and operation history.
MEDIA SYNCHRONIZATION
Peers estimate timing and apply corrections
to local media elements.
• RTT service provides round-trip measurements; offset estimation requires timestamp exchange and assumptions about path asymmetry.
• For playing state, estimate target position from a reference timestamp/clock model and playback rate, then compare with local media position.
• Use bounded correction: small rate adjustment for modest error, seek/re-align for larger error, with thresholds measured experimentally.
• HTML media can buffer, clamp seeks, or drift due to decode/render differences; protocol convergence does not guarantee identical frames.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
09


---

## Source PDF page 10

9. Research Experiments and Metrics
Evaluate correctness and behavior under controlled network impairment, not only a happy-path demo.
Experiment
Vary
Measure
Concurrent controls
simultaneous SEEK/PAUSE/PLAY
Final state agreement; intent loss
Latency / jitter
RTT, jitter and asymmetry
Convergence time; position error
Packet loss
loss and duplicate rate
Missing events; duplicate effects
Peer churn
join/leave/rejoin frequency
Recovery time; state divergence
Partition
duration and operations on both sides
Merge behavior; convergence after heal
Scale (small room)
2, 3, 4+ peers
CPU, messages/sec, connection stability
Algorithm comparison
baseline vs candidate
correctness, complexity, convergence latency
• Record configuration and seeds for repeatability; report median and tail behavior, not only averages.
• Separate logical state divergence from media position error (milliseconds).
• Set measurable MVP targets after baseline measurements rather than inventing precision guarantees.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
10


---

## Source PDF page 11

10. Open Decisions and Implementation Sequence
Do not freeze algorithm-specific wire fields until the candidate behavior is tested.
Decision
Current status
Next action
Event ordering algorithm
OPEN
Implement baseline and compare candidates
Conflict semantics for SEEK vs PAUSE
OPEN
Write expected outcomes for scenarios
History / tombstone retention
OPEN
Set bounded recovery requirements
Clock-offset estimation
OPEN
Choose timestamp exchange and evaluate asymmetry
Accuracy target
OPEN
Measure prototype before setting target
Fault model
PROVISIONAL
Assume crash/omission faults; no Byzantine guarantee
Room size
PROVISIONAL
Small full-mesh rooms only
• Implementation sequence: freeze interface → build deterministic baseline → test duplicates/reordering → add recovery → run concurrent-operation experiments →
  compare alternative engine.
• Keep SyncEngine implementations behind one contract so experiments do not require rewiring Bootstrap, Peer Mesh or the SDK API.
SYNCPLAY • SYNC ENGINE RESEARCH SPEC • v0.1 — PROPOSED
11
