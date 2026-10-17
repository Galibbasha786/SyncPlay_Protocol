# Weekly Distributed Media Sync Reading Guide

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `weekly_reading_CN_DS_media_sync.pdf`



---

## Source PDF page 1

Weekly Technical Reading - Distributed Media Synchronization
Page 1
Weekly Technical Reading: Computer Networks &
Distributed Systems
Project: Serverless/leaderless protocol and SDK for real-time distributed media synchronization.
Purpose: This document records foundational Computer Networks (CN) and Distributed Systems (DS) topics studied this
week and explains their direct relevance to the proposed media-synchronization system.
1. Why CN + Distributed Systems?
The project involves multiple independent browsers that communicate over an unreliable network while trying to maintain a
closely synchronized media timeline. CN explains how peers communicate and the uncertainty introduced by the network.
DS explains how independent machines coordinate when there is no shared memory, perfect clock, or single source of
truth.
Browser A <---- network ----> Browser B local clock local clock local media local media \ / distributed
state
2. Network Communication Basics
IP address and port: an IP identifies a network endpoint and a port identifies an application endpoint. Peer
communication ultimately requires a reachable path between participants.
TCP: reliable and ordered byte-stream delivery. Retransmission can increase delay. UDP: datagrams without TCP's
delivery guarantees. Real-time systems may prefer timely information over receiving every old packet.
WebRTC: browser technology for peer communication. RTCDataChannel can carry synchronization messages; ICE,
STUN and TURN help establish connectivity.
Project relevance: the synchronization algorithm should be independent of the transport. WebRTC can be the first
transport adapter rather than the synchronization protocol itself.
3. Latency, RTT and Jitter
Latency is communication delay. RTT is approximately the round-trip time between two peers. Jitter is variation in packet
delay. A synchronization engine should not trust one timing measurement; it should maintain samples and estimate
uncertainty.
Clock probe: A sends t1 → B receives t2 → B replies t3 → A receives t4. These timestamps can be used
to estimate delay and clock offset.
Project relevance: RTT and jitter become inputs to clock-offset estimation, confidence scoring and latency compensation.
4. Packet Loss, Reordering and Duplication
Distributed messages can be lost, delayed, reordered or duplicated. Synchronization operations should therefore have
stable identities and deterministic processing rules.
SEEK(120) [operation 51] If operation 51 arrives twice, the second copy should be recognized as a
duplicate rather than treated as a new seek.
Useful mechanisms: operation IDs, sequence numbers, revisions, timestamps, stale-message rejection and idempotent
operations.
5. NAT Traversal and Peer Discovery
Browsers are commonly behind NATs and firewalls. Direct peer connectivity cannot be assumed. WebRTC's ICE
framework gathers and tests connectivity candidates; STUN can assist with public address discovery and TURN can relay
traffic when direct connectivity fails.
Architecture implication: a bootstrap/signaling service can establish identity and exchange connection information. After
peers connect, synchronization messages can travel directly between participants.
6. Distributed Systems Fundamentals
A distributed system consists of independent computers that communicate through messages. No peer has instantaneous
knowledge of the complete system. At a given moment, peer A may know about an operation that peer B has not received.


---

## Source PDF page 2

Weekly Technical Reading - Distributed Media Synchronization
Page 2
Therefore, there is no automatic global state. The protocol must define what state means and how independent peers
derive it.
7. Physical Clocks, Logical Clocks and Time
Physical clocks approximate real time but differ in offset and rate. Logical clocks represent ordering/causality rather
than wall-clock time.
Media synchronization needs both: physical-time estimation helps align playback; logical ordering helps determine the
order of PLAY, PAUSE, SEEK and RATE operations.
A clock = 10:00:00.100 B clock = 10:00:00.250 Raw timestamps alone do not tell us the causal order of
events.
8. Clock Offset and Clock Drift
Clock offset: difference between two clocks at a particular moment. Clock drift: difference in their rates over time. Two
peers can be aligned now and diverge later.
A useful conceptual estimate is: estimatedOffset = peerClock - localClock estimatedGroupTime = localTime
+ estimatedOffset
Important: these are estimates affected by network asymmetry, jitter and clock instability.
9. Event Ordering and Race Conditions
Consider two simultaneous user actions: Alice presses PAUSE while Bob presses SEEK. A centralized server can impose
an order. A leaderless system needs deterministic rules so peers that observe the same operations eventually reach the
same logical result.
Alice → PAUSE at logical event 100 Bob → SEEK(250) at logical event 101
Topics to study next: Lamport timestamps, vector clocks, causal ordering, total-order broadcast, deterministic
tie-breaking and CRDT concepts.
10. Consistency and Convergence
Consistency defines what different peers are allowed to observe. Convergence means that after communication
becomes sufficiently complete and no new conflicting operations occur, correct peers eventually reach the same state.
For this project, the realistic goal is not necessarily frame-perfect equality at every physical instant. The goal is
deterministic logical-state convergence plus a bounded and continuously corrected media-time difference.
11. Failure Models
Useful failure cases include peer crash, temporary disconnection, delayed messages, packet loss, stale messages,
network partition, partition recovery and a peer with an incorrect clock.
Core question: when a failure occurs, what state do the remaining honest peers converge to, and how quickly can a
recovering peer rejoin the group timeline?
12. Leaderless Coordination
Traditional distributed consensus systems often use a leader and quorum. This project intentionally investigates whether
media synchronization can operate without a permanent leader. Media synchronization has different requirements from
transactional databases: bounded timing error and practical convergence may be more important than absolute
consistency.
Research direction: every peer receives observations, applies the same deterministic algorithm, and independently
derives the group playback state.
13. Mapping CN/DS Topics to the Project
Topic
Use in MediaSync
Study / Implement
Peer discovery
Find and identify participants.
Signaling, peer IDs, ICE, membership.
RTT / jitter
Estimate network uncertainty.
Timestamp probes, samples, outlier rejection.
Clock offset
Map local clocks to group time.
NTP-style offset estimation, asymmetry.


---

## Source PDF page 3

Weekly Technical Reading - Distributed Media Synchronization
Page 3
Topic
Use in MediaSync
Study / Implement
Clock drift
Prevent long-term divergence.
Frequency estimation, rate correction.
Packet ordering
Handle delayed/reordered operations.
IDs, revisions, sequence metadata.
Logical clocks
Order concurrent actions.
Lamport/vector clocks, causal ordering.
Consistency
Define acceptable peer state.
Distributed state machine, convergence.
Failures
Recover after peer/network problems.
Timeouts, reconnect, partition/merge.
Leaderless design
Remove permanent authority.
Deterministic aggregation and conflict resolution.
14. Recommended Reading Sequence
1. CN basics: TCP/UDP, latency, RTT, jitter, packet loss and NAT.
2. WebRTC: ICE, STUN/TURN, RTCDataChannel and connection lifecycle.
3. DS basics: distributed clocks, ordering, consistency and failure models.
4. Time synchronization: NTP concepts, offset, delay, drift and frequency error.
5. Distributed state: operation IDs, revisions, causal ordering and conflict resolution.
6. Leaderless systems: gossip, eventual consistency, CRDTs, quorums and consensus limitations.
7. Media layer: HTMLMediaElement.currentTime, playbackRate, buffering, seeking and browser timing.
15. Weekly Practical Outcome
The reading establishes that the project sits at the intersection of computer networking, distributed systems, clock
synchronization and real-time media. The major engineering challenge is not merely transmitting PLAY/PAUSE messages;
it is estimating time under network uncertainty and maintaining a distributed state that converges despite independently
operating peers.
Next practical experiment: create a two-peer WebRTC DataChannel test. Exchange timestamp probes, calculate RTT
and clock-offset estimates, record the estimates over time, and then connect the result to a simple HTML5 video timeline.
This creates a measurable foundation for the later leaderless synchronization engine.
Suggested foundational references: Kurose & Ross, Computer Networking: A Top-Down Approach; Tanenbaum & Van Steen, Distributed Systems;
Lamport's work on logical clocks; RFC 5905 (NTP); RFC 7272 (Inter-Destination Media Synchronization); WebRTC specifications/documentation.
