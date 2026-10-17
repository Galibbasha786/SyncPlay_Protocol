# Peer Mesh Rtt Engine Lld

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Peer_Mesh_RTT_Engine_LLD.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Peer Mesh & RTT Engine
Low-Level Design
Version 0.1 • Proposed implementation specification
RESPONSIBILITY
Manage peer connections and measure network timing — do not decide playback consensus.
Aligned with SyncPlay Master HLD and Bootstrap Server LLD
Proposed design baseline. Timing estimates are measurements, not guarantees.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
01


---

## Source PDF page 2

1. Purpose and Boundaries
This module connects session membership to direct peer communication and exposes timing observations.
IN SCOPE
• Peer connection lifecycle
• RTCPeerConnection / DataChannel management
• Full-mesh topology for small rooms
• RTT probe/response measurements
• Peer status and connection diagnostics
OUT OF SCOPE
• Room ownership / credential validation
• SDP/ICE signaling server implementation
• Playback authority or consensus
• Guaranteed clock synchronization
• Guaranteed frame-perfect playback
• Bootstrap Server provides peer membership and relays SDP/ICE. Peer Mesh consumes those events and creates direct WebRTC connections.
• RTT is an observed round-trip duration. It is not one-way latency and does not, by itself, reveal clock offset.
• The Sync Engine consumes timing samples; it chooses synchronization policy and handles concurrent playback operations.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
02


---

## Source PDF page 3

2. Module Architecture and Data Flow
Use interfaces so the transport and timing strategy can evolve independently.
Bootstrap Client
session + signaling
Peer Manager
WebRTC Transport
DataChannel
RTT Probe Scheduler
Peer Metrics Store
SyncEngine Interface
• Peer Manager owns connection lifecycle and peer state, not room membership truth.
• WebRTC Transport hides RTCPeerConnection and DataChannel details from the Sync Engine.
• RTT Scheduler samples DataChannel round trips; Metrics Store keeps bounded recent samples and quality indicators.
• SyncEngine receives peer status and timing estimates through events/read-only snapshots.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
03


---

## Source PDF page 4

3. Topology and Scaling
Full mesh is a deliberately limited MVP topology for small rooms.
PEER A
PEER B
PEER C
PEER D
Connection count = N × (N − 1) / 2
4 peers → 6 pairwise connections
Use small rooms for MVP.
Larger rooms need topology redesign (e.g. SFU/relay architecture).
• Each browser maintains one RTCPeerConnection per remote peer in the room.
• Only the designated initiator creates the initial offer for each peer pair.
• Every peer has its own independent connection and DataChannel state; a peer may be connected to A but disconnected from B.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
04


---

## Source PDF page 5

4. Peer Connection State Machine
Do not collapse signaling, ICE, DataChannel and SyncEngine readiness into one connected flag.
NEW
SIGNALING
CONNECTING
CONNECTED
DISCONNECTED
FAILED
CLOSED
• Use RTCPeerConnection.connectionState, iceConnectionState and DataChannel.readyState as separate signals.
• CONNECTED means the peer transport is usable; SyncEngine may still be initializing or recovering.
• DISCONNECTED may be transient. Apply a configurable grace period before restarting negotiation.
• FAILED triggers bounded recovery; CLOSED is terminal for that connection object.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
05


---

## Source PDF page 6

5. Core Interfaces
Keep public contracts transport-agnostic and avoid exposing browser objects outside the transport adapter.
interface PeerMesh {
  connect(peer: PeerDescriptor): Promise<void>;
  disconnect(peerId: string, reason?: string): void;
  send(peerId: string, message: ProtocolMessage): SendResult;
  getPeerStatus(peerId: string): PeerStatus | undefined;
  listPeers(): PeerStatus[];
  onMessage(handler: (m: InboundMessage) => void): Unsubscribe;
  onPeerStatus(handler: (s: PeerStatus) => void): Unsubscribe;
  dispose(): Promise<void>;
}
interface RttService {
  start(peerId: string): void;
  stop(peerId: string): void;
  getEstimate(peerId: string): RttEstimate | undefined;
  onSample(handler: (s: RttSample) => void): Unsubscribe;
}
SyncEngine consumes
PeerStatus + RttEstimate
and protocol messages.
It never calls WebRTC APIs.
Transport adapter owns
RTCPeerConnection,
DataChannel, SDP/ICE.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
06


---

## Source PDF page 7

6. Message Types and Separation of Concerns
Use the shared versioned protocol envelope from the Master HLD.
Category
Examples
Handling
Transport / diagnostics
PING, PONG, PEER_STATUS
Peer Mesh / RTT module
Media control
PLAY, PAUSE, SEEK, RATE_CHANGE
Validate and deliver to SyncEngine
State exchange
STATE_REQUEST, STATE_SNAPSHOT, STATE_DIGEST
SyncEngine decides semantics
Recovery
REJOIN, RECOVERY_HINT
Fault Manager + SyncEngine
Do not let the transport layer interpret PLAY/PAUSE/SEEK. It transports typed messages; the SyncEngine owns state decisions.
• Message envelope should include protocolVersion, messageType, sessionId, senderPeerId, messageId and payload.
• Use a distinct logical event ID for deduplicating operations; messageId alone may change on retransmission.
• Apply payload schemas and size limits before delivering messages to the SDK core.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
07


---

## Source PDF page 8

7. RTT Measurement Algorithm
Measure local elapsed time for a probe/response round trip using a monotonic clock.
Peer A sends PING(id, t0)
Peer B returns PONG(id)
Peer A receives PONG at t1
RTT = t1 − t0
• Use performance.now() (or another monotonic clock) for elapsed durations; do not use wall-clock Date.now() for RTT subtraction.
• Match PONG to a pending probe ID; ignore duplicates, unknown IDs and expired probes.
• Keep a bounded rolling window of samples; report median and a high percentile (e.g. p90) rather than trusting one sample.
• Track sample age, loss/timeout rate and jitter/variation; stale estimates should be marked stale.
• A timeout means a probe did not return in time; it does not prove the peer is dead.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
08


---

## Source PDF page 9

8. What RTT Can and Cannot Tell Us
RTT is useful for network quality and rough timing; it is not a complete clock synchronization algorithm.
RTT CAN HELP
• Estimate round-trip delay
• Compare connection quality
• Identify delay spikes / instability
• Inform scheduling and correction policies
RTT ALONE CANNOT
• Determine exact one-way delay
• Determine clock offset uniquely
• Eliminate clock drift
• Solve concurrent operation conflicts
• Guarantee frame-perfect sync
• One-way delay may be asymmetric; RTT/2 is only a rough approximation when paths are sufficiently symmetric.
• Clock offset estimation needs timestamp exchanges and explicit assumptions about path asymmetry and processing delay.
• Clock drift is a change in clock rate over time; estimate it from repeated observations, not one RTT sample.
• Keep raw timing samples separate from SyncEngine decisions so algorithms can change independently.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
09


---

## Source PDF page 10

9. Probe Scheduling, Timeouts and Backpressure
Probe conservatively so diagnostics do not interfere with control traffic.
Concern
Proposed v1 rule
Initial probe
After DataChannel opens and peer identity is bound
Probe interval
Configurable; start conservatively (e.g. 2–5 seconds)
Pending probes
Bounded per peer; one or a small fixed number outstanding
Timeout
Configurable; derive from measured RTT and clamp to safe bounds
Sample window
Bounded ring buffer; discard stale samples
Backpressure
Bound queue size; reject/drop low-priority diagnostics before control messages
Cleanup
Stop timers and clear pending probes on disconnect/dispose
These defaults are experimental starting points; tune using browser tests and real network variation.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
10


---

## Source PDF page 11

10. Failure Cases and Recovery
Peer connectivity and peer membership are separate; report suspicion rather than claiming certainty.
Failure
Peer Mesh behavior
SyncEngine / Fault Manager
DataChannel closes
Mark transport unavailable; stop probes
Trigger recovery / state exchange policy
ICE disconnected
Observe grace period; attempt bounded recovery
May mark peer suspected unavailable
ICE failed
Close/recreate connection as policy allows
Reconcile state after reconnect
Signaling unavailable
Existing channel may continue; no new negotiation
Degrade recovery capability
Malformed message
Reject before dispatch; count violation
No state mutation
RTT timeout
Mark sample missing; update quality metrics
Do not infer permanent crash from one timeout
Peer leaves room
Close connection and clear metrics
Update membership-dependent state
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
11


---

## Source PDF page 12

11. Security and Resource Limits
Peer-to-peer does not remove the need to validate every message.
• Only accept signaling events authorized by the Bootstrap Server's current room membership binding.
• Validate every inbound DataChannel message against protocol version, message type, schema and size limits.
• Apply per-peer message-rate limits and bounded queues; a peer can send malformed or excessive data.
• Never trust peer-supplied sender identity for authorization; bind identity to the established session/connection context.
• Avoid logging full media payloads, credentials, SDP or ICE candidates unnecessarily.
• Treat peers as potentially stale or malicious: data from a valid connection is not automatically a valid state transition.
• DataChannel encryption is provided by WebRTC's DTLS transport, but application-level authorization and validation are still required.
The SyncEngine must validate semantic validity of events; transport validation alone cannot prevent conflicting or malicious operations.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
12


---

## Source PDF page 13

12. Test Plan and Acceptance Criteria
Prove peer transport first; then validate RTT measurements under varied conditions.
Test group
Tests
Acceptance criterion
Peer lifecycle
Connect/disconnect/close; multiple peers
No duplicate PC or leaked listeners
Signaling integration
Offer/answer/ICE via Bootstrap
DataChannel opens in supported test network
RTT
Probe IDs, delayed PONG, duplicate PONG, timeout
Only valid matched samples accepted
Robustness
Reconnect, ICE failure, stale generation
State transitions and cleanup are bounded
Load
Small-room mesh and diagnostic traffic
Queues and memory remain bounded
Security
Malformed/oversized/rate-spam messages
Rejected before application dispatch
Browser matrix
Two tabs / two browsers / different networks
Known supported setup documented
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
13


---

## Source PDF page 14

13. Implementation Order and Integration Contract
Build after shared message envelope and Bootstrap signaling event names are agreed.
1
Define PeerDescriptor, PeerStatus, ProtocolMessage and RttEstimate types
2
Implement PeerManager state machine and deterministic initiator policy
3
Implement WebRTC transport adapter and DataChannel send/receive
4
Integrate with Bootstrap signaling events and generation checks
5
Add RTT PING/PONG scheduler and bounded sample window
6
Expose read-only peer status and RTT estimates to SyncEngine
7
Add fault/reconnect tests and two-/three-peer demo
NEXT: Freeze shared protocol types, then implement PeerManager + WebRTC transport behind the interface.
SYNCPLAY • PEER MESH & RTT ENGINE LLD • v0.1 — PROPOSED
14
