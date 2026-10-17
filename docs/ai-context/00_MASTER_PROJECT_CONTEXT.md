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
