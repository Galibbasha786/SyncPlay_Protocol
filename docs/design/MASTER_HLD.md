# Master Hld

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Master_HLD.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Master System Design
High-Level Design (HLD) • Architecture Proposal v0.1
DESIGN THE ENTIRE PROTOCOL AROUND STABLE INTERFACES FIRST
KEEP THE SYNCHRONIZATION / CONSENSUS ALGORITHM REPLACEABLE
Server-minimized • Peer-to-peer transport • Leaderless synchronization target
Working design document for the SyncPlay team and supervisor
SYNCPLAY • MASTER HLD • v0.1
01


---

## Source PDF page 2

1. What We Are Building
A reusable protocol + SDK + demo application — not just a watch-party application.
SYNCPLAY PROTOCOL
Message contracts
Events • state exchange
SYNCPLAY SDK
Peer lifecycle
Transport • engine interface
DEMO APPLICATION
HTML5 media
Observable results
MVP TARGET
• Small-room peer mesh
• Bootstrap for discovery/signaling
• PLAY / PAUSE / SEEK event path
• Basic reconnect and recovery
• Versioned, extensible protocol
NOT CLAIMING YET
• Perfect consensus
• Frame-perfect synchronization
• Unlimited peer scale
• Guaranteed direct connectivity
• Production-grade fault tolerance
SYNCPLAY • MASTER HLD • v0.1
02


---

## Source PDF page 3

2. Architectural Principles
Decisions that protect the system as implementation and research evolve.
SYNCPLAY • MASTER HLD • v0.1
03


---

## Source PDF page 4

3. System Context
Bootstrap/signaling is separate from peer-to-peer synchronization.
Developer Application / Demo
SyncPlay SDK API
BROWSER A
Sync Core + Media
BROWSER B
Sync Core + Media
BROWSER C
Sync Core + Media
Bootstrap / Signaling
Rooms • Discovery • SDP/ICE
STUN Service
Connectivity discovery
Optional TURN Relay
Relay when required
Existing peer connections may continue if signaling is unavailable; new joins/reconnections may not.
TURN can relay packets but does not decide playback state.
SYNCPLAY • MASTER HLD • v0.1
04


---

## Source PDF page 5

4. Logical Component Architecture
Modules may share a process initially; their responsibilities remain separate.
Application / Demo
Public SDK API
Session Client
Peer Manager
Control Events
Fault Manager
Transport Abstraction
Protocol Schemas
SyncEngine API
Media Adapter → HTML5 Video / Audio
Bootstrap Service
SYNCPLAY • MASTER HLD • v0.1
05


---

## Source PDF page 6

5. Component Responsibilities
Clear ownership prevents accidental coupling.
Public API
Developer-facing methods and callbacks
No consensus implementation
Session Client
Join/leave requests and signaling lifecycle
No playback-state authority
Room Registry
Room and current membership metadata
No synchronization state
Signaling Gateway
Validated SDP/ICE relay
No continuous playback-event relay
Peer Manager
Connection lifecycle and peer status
No conflict-resolution algorithm
Transport
Send/receive protocol messages
No PLAY/PAUSE interpretation
Control Events
Create, validate and dispatch events
No ownership of consensus policy
Sync Engine
Synchronization decisions and state rules
No socket/WebRTC management
Fault Manager
Failure detection and recovery triggers
No global-leader authority
Media Adapter
Read/apply media state
No signaling/network protocol
SYNCPLAY • MASTER HLD • v0.1
06


---

## Source PDF page 7

6. Infrastructure vs Research
Two parallel tracks meet at stable interfaces and versioned contracts.
TRACK A — ENGINEERING INFRASTRUCTURE
TRACK B — SYNCHRONIZATION RESEARCH
Session formation
Peer discovery + signaling
WebRTC mesh / DataChannels
Packet transport + validation
Control event pipeline
Basic reconnect / HTML5 adapter
SDK packaging + demo
Shared media-state model
Time / ordering model
Concurrent operations
Conflict resolution
State convergence
Network partition behavior
Evaluate candidate engine
STABLE INTERFACES + VERSIONED CONTRACTS
SYNCPLAY • MASTER HLD • v0.1
07


---

## Source PDF page 8

7. Session and Connection Lifecycle
Room membership is not the same as an active connection or synchronized state.
NO SESSION
CREATE / JOIN
DISCOVER PEERS
SIGNALING
CONNECTING
CONNECTED
RECONNECTING
Retry / renegotiate
LEAVING / CLOSED
Cleanup resources
Track room membership, peer connection, DataChannel readiness and SyncEngine readiness separately.
SYNCPLAY • MASTER HLD • v0.1
08


---

## Source PDF page 9

8. Bootstrap / Signaling Service Boundary
The server supports session formation; it is not the playback authority.
SERVER OWNS
• Room creation / expiry
• Membership metadata
• Peer discovery
• Validated SDP / ICE relay
• Session-level access checks
SERVER DOES NOT OWN
• Playback position
• Play / Pause / Seek authority
• Clock synchronization
• Conflict resolution
• Continuous sync-event routing
Signaling may be unavailable while established peer connections continue.
New joins and reconnections may still require the signaling service.
SYNCPLAY • MASTER HLD • v0.1
09


---

## Source PDF page 10

9. WebRTC Signaling Sequence
Signaling establishes connectivity; SyncPlay messages travel over peer transport afterward.
PEER A
SIGNALING
PEER B
Join room
Join room
Notify peer discovered
Create offer / send SDP
Forward offer
Create answer / send SDP
Forward answer
ICE candidates
Forward ICE
ICE candidates
Forward ICE
DATA CHANNEL OPEN → PEER-TO-PEER SYNCPLAY MESSAGES
SYNCPLAY • MASTER HLD • v0.1
10


---

## Source PDF page 11

10. Peer Mesh and Transport
Full mesh is an MVP choice for small rooms, not unlimited scalability.
PEER A
PEER B
PEER C
PEER D
Connections = N × (N − 1) / 2
Quadratic growth: start small.
Transport interface hides WebRTC details.
SyncEngine must not call dataChannel.send().
SYNCPLAY • MASTER HLD • v0.1
11


---

## Source PDF page 12

11. Packet Envelope and Versioning
Keep the envelope stable; version message payloads and synchronization metadata explicitly.
SYNCPLAY PROTOCOL MESSAGE
protocolVersion
messageType
sessionId
senderPeerId
messageId
metadata
payload
STABLE / SLOW-CHANGING
Envelope • identity • validation
Versioning • error rules
MAY EVOLVE BY MESSAGE VERSION
Clock / causality metadata
State versions • conflict details
Message ID identifies a transmission; event ID identifies the logical operation.
SYNCPLAY • MASTER HLD • v0.1
12


---

## Source PDF page 13

12. Control Event Pipeline
The pipeline is stable; the exact decision policy belongs to the Sync Engine.
User action
SDK / Media Adapter
Create event
Validate schema
SyncEngine
Apply decision
Remote engine
Remote validate
Transport
Serialize
Local optimistic application versus engine-approved application must be an explicit policy decision.
SYNCPLAY • MASTER HLD • v0.1
13


---

## Source PDF page 14

13. Fault Tolerance and Recovery
Failure detection, peer membership and state reconciliation are distinct responsibilities.
Connection failure detected
Peer Manager updates state
Fault Manager classifies
Retry / renegotiate
Mark unavailable
Validate generation / rejoin
Exchange recovery state → SyncEngine reconciles → Media Adapter applies
SYNCPLAY • MASTER HLD • v0.1
14


---

## Source PDF page 15

14. Sync Engine — Research Core
Clock alignment, event ordering, consensus and playback correction are related but distinct.
STABLE SyncEngine CONTRACT
Local events
Remote events
Timing / network data
Synchronized media state
Clock synchronization alone does not solve consensus; consensus alone does not guarantee frame-perfect playback.
SYNCPLAY • MASTER HLD • v0.1
15


---

## Source PDF page 16

15. Replacing Engine V1 with V2
Change the implementation behind the contract—not unrelated components.
STABLE SyncEngine CONTRACT
ENGINE V1
MVP baseline strategy
ENGINE V2
Improved research strategy
UNCHANGED WHERE CONTRACTS PERMIT
Bootstrap • WebRTC • Peer Manager • Transport • Control API • Media Adapter
New metadata may require explicit schema/version changes; replaceability does not mean the wire format can never evolve.
SYNCPLAY • MASTER HLD • v0.1
16


---

## Source PDF page 17

16. HLD Decision Register
Record which decisions are fixed, provisional, or still open.
HLD-01
No permanent centralized sync authority
FIXED
HLD-02
Bootstrap owns sessions, discovery, signaling
FIXED
HLD-03
WebRTC as initial transport
MVP
HLD-04
Full mesh for small rooms
MVP
HLD-05
SyncEngine accessed via stable interface
FIXED
HLD-06
Versioned / extensible payload schemas
FIXED
HLD-07
HTML5 audio/video first
MVP
HLD-08
In-memory rooms for first prototype
MVP
HLD-09
Final leaderless consensus algorithm
RESEARCH
HLD-10
Synchronization accuracy target
OPEN
HLD-11
Room capacity / scaling strategy
OPEN
HLD-12
Authentication / access policy
LLD
SYNCPLAY • MASTER HLD • v0.1
17


---

## Source PDF page 18

17. Development Sequence
Build in dependency order; synchronization research can run in parallel.
PHASE 1
Master HLD — boundaries, data flows, contracts
PHASE 2
Bootstrap LLD — room model, APIs, signaling
PHASE 3
Two-browser WebRTC proof of connection
PHASE 4
Packet schemas + control-event pipeline
PHASE 5
Small peer mesh + fault/recovery tests
PHASE 6
SyncEngine V1 + research-driven V2
PHASE 7
SDK packaging, HTML5 demo, evaluation
NEXT: BOOTSTRAP SERVER LLD
Room lifecycle • membership model • HTTP/WebSocket contracts • SDP/ICE rules • failure handling
SYNCPLAY • MASTER HLD • v0.1
18
