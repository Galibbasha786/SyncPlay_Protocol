# Initial Bootstrap Server System Design

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `initial_system_design_bootstrap_server_media_sync.pdf`



---

## Source PDF page 1

Initial System Design - Bootstrap Server | Distributed Media Synchronization
Page 1
Initial System Design: Bootstrap Server
Project: Decentralized, Leaderless Protocol and SDK for Real-Time Media Synchronization
Document status: Initial architecture / Phase 1 design. This is intentionally not the final system design. The architecture
will evolve as the distributed synchronization protocol and its edge cases are investigated.
1. Purpose of the Bootstrap Server
The proposed media synchronization system is intended to become server-minimized and leaderless. However,
browsers cannot reliably discover and establish peer-to-peer connections completely by themselves. Therefore, the initial
system includes a small bootstrap/signaling server.
The bootstrap server is not the synchronization authority. Its purpose is limited to helping users find/join a session and
exchange the information required to establish peer connections. Once peers are connected, the future synchronization
protocol will move synchronization traffic and state management to the peers.
This creates the intended separation:
Bootstrap Server → discovery / signaling / initial coordination
Peers ↔ Peers → media synchronization / playback state / clock information / synchronization decisions
2. Initial Architecture
The initial architecture contains three logical components: the client SDK, the bootstrap server, and peer-to-peer
connections between browsers.
Bootstrap / Signaling Server
I
IIIIIIIIIIIIIIIIIIIII
I discovery/signalingI
IIIIIIIIIIIIIIIIIIIII
I
IIIIIIIIIIIIIIIIIIIII
↓ ↓
Browser / Peer A Browser / Peer B
¤ ¤
IIIIIIIIIIII↔IIIIIIIII
P2P Sync
Important: the diagram represents the initial stage. The final architecture may contain a mesh, partial mesh, gossip
mechanism, or another peer topology depending on scalability and convergence experiments.
3. Responsibilities of the Bootstrap Server
Responsibility
Description
Required after bootstrap?
Session creation
Create or register a synchronization room/session identifier.
No
Session discovery
Allow a client to locate or join an existing session.
No
Peer identification
Assign or register temporary peer/session identifiers.
Normally no
Signaling
Exchange WebRTC offer/answer and ICE candidate information.
Only while
establishing/reconnecting
Membership notification
Inform current participants that a new peer is joining, if needed during
bootstrap.
No, peer protocol can handle
membership later
Authentication (optional)
Validate access to a room or issue short-lived credentials.
No
Synchronization state
Must not be maintained by the bootstrap server in the target
architecture.
No
Media streaming
The bootstrap server does not host or stream the movie/audio content.
No
4. What the Bootstrap Server Does NOT Do
The following responsibilities are intentionally excluded from the bootstrap server:


---

## Source PDF page 2

Initial System Design - Bootstrap Server | Distributed Media Synchronization
Page 2
• It does not decide the group's current playback position.
• It does not act as a permanent leader/master.
• It does not receive every PLAY/PAUSE/SEEK operation and redistribute it forever.
• It does not calculate the final group clock.
• It does not continuously calculate drift for every participant.
• It does not store the authoritative synchronization state.
• It does not stream the movie/audio content.
This distinction is central to the research goal: the server helps establish the network, while the peers perform the
synchronization.
5. Initial Bootstrap Flow
The first implementation will use the following flow:
1. User A opens the application.
2. Client requests creation of a synchronization room.
3. Bootstrap server returns a room/session ID and a temporary peer ID.
4. User B opens the application and joins using the room ID.
5. Bootstrap server registers B as another participant.
6. A and B exchange WebRTC signaling information through the bootstrap server.
7. WebRTC establishes the peer-to-peer connection.
8. Synchronization messages begin flowing directly between peers.
9. The bootstrap server is no longer part of normal synchronization traffic.
Initial message flow:
A → Bootstrap: CREATE_ROOM
Bootstrap → A: ROOM_ID + PEER_ID
B → Bootstrap: JOIN_ROOM(ROOM_ID)
Bootstrap → A/B: signaling information
A ↔ B: WebRTC connection establishment
A ↔ B: SYNC_PROTOCOL messages
6. Proposed Server API
The first implementation should keep the API deliberately small. The exact framework may change, but the logical API
can be:
POST /rooms
→ creates a room
POST /rooms/{roomId}/join
→ joins a room and returns peer/session information
WebSocket /rooms/{roomId}/signal
→ temporary signaling channel for WebRTC offer/answer/ICE exchange
DELETE /rooms/{roomId}/peers/{peerId}
→ optional explicit departure notification
The server can initially use an in-memory room registry for development. Persistent storage is not necessary for the first
prototype unless authentication, recovery or multi-instance deployment requires it.
7. Initial Room Data Model
A minimal room record could contain:
{
roomId: "abc123",
peers: [
{ peerId: "peerA", joinedAt: ... },
{ peerId: "peerB", joinedAt: ... }
],
expiresAt: ...
}
Important: playback position, PLAY/PAUSE/SEEK state, clock offset, drift and synchronization decisions should not be
stored as authoritative room state in this server.


---

## Source PDF page 3

Initial System Design - Bootstrap Server | Distributed Media Synchronization
Page 3
8. Technology Choice for the Initial Prototype
Client: JavaScript/TypeScript running in the browser.
Peer communication: WebRTC RTCDataChannel.
Bootstrap/signaling transport: HTTP + WebSocket.
Server: a lightweight Node.js/TypeScript service is a practical first implementation choice.
Media: HTML5 HTMLMediaElement for the first experiment.
The technology choices are not final. The synchronization engine should remain independent of the server framework
and transport so that WebRTC can later be replaced or complemented by another transport.
9. Bootstrap Server Lifecycle
The server should have a short-lived role in the target architecture:
START APPLICATION
↓
CREATE/JOIN ROOM
↓
DISCOVER PEERS
↓
EXCHANGE WEBRTC SIGNALING
↓
ESTABLISH P2P CONNECTION
↓
BOOTSTRAP ROLE COMPLETE
↓
PEER-TO-PEER SYNCHRONIZATION
If a peer disconnects, the first implementation may temporarily use the bootstrap server again for reconnection signaling.
This does not make the server the synchronization authority.
10. Security Considerations for the Initial Design
Even a minimal bootstrap service should consider:
• unguessable room IDs or authenticated room access;
• short-lived peer/session identifiers;
• validation of signaling messages;
• room expiration and cleanup;
• rate limiting and connection limits;
• protection against arbitrary users injecting signaling data.
Later versions of the protocol will need stronger peer authentication and protection against malicious peers because a
leaderless system cannot assume every participant is honest.
11. Why This Is Only the Initial Design
At this stage, the bootstrap server is intentionally simple. The difficult research work begins after the peer connection is
established.
The next design layers are expected to include:
1. Peer identity and membership protocol
2. Clock-offset estimation
3. RTT/jitter measurement
4. Distributed media timeline representation
5. PLAY/PAUSE/SEEK/RATE event protocol
6. Deterministic event ordering
7. Leaderless state aggregation
8. Drift detection and correction
9. Peer failure/reconnection handling
10. Network partition and merge behavior
11. Faulty/malicious peer handling
12. Convergence and synchronization-quality measurement


---

## Source PDF page 4

Initial System Design - Bootstrap Server | Distributed Media Synchronization
Page 4
12. Initial Success Criteria
The bootstrap-server phase will be considered successful when:
• multiple browser clients can create/join the same room;
• peers receive unique session/peer identities;
• WebRTC signaling succeeds;
• browsers establish direct peer connections where possible;
• synchronization messages can be exchanged through the peer connection;
• the bootstrap server is not required for ordinary PLAY/PAUSE/SEEK synchronization traffic.
13. Planned Evolution to the Final Architecture
Initial:
Bootstrap Server → WebRTC → Peer A ↔ Peer B
Intermediate:
Bootstrap Server → WebRTC → Peer Mesh → distributed clock + distributed state
Target:
Minimal Bootstrap → Peer Network → Leaderless Synchronization → Convergent Media Timeline
The final topology is deliberately left open at this stage. Experiments will determine whether full mesh, partial mesh,
gossip-based dissemination, or another topology gives the best balance between synchronization accuracy, bandwidth,
scalability and fault tolerance.
14. Summary
The bootstrap server is an initial infrastructure component, not the synchronization system itself. Its purpose is to
solve the practical browser networking problem of discovering participants and establishing peer connections. Once
peers are connected, the project moves the important logic—clock estimation, media timeline synchronization, event
ordering, drift correction, state convergence and failure handling—to the distributed peer layer.
This separation allows the project to begin with a practical working system while preserving the central research
objective: minimize server dependency and investigate reliable leaderless media synchronization.
