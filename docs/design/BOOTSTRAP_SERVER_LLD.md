# Bootstrap Server Lld

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `SyncPlay_Bootstrap_Server_LLD.pdf`



---

## Source PDF page 1

SYNCPLAY PROTOCOL
Bootstrap Server LLD
Low-Level Design • Version 0.1 • Proposed implementation baseline
COORDINATE ROOMS, MEMBERSHIP AND WEBRTC SIGNALING
NEVER OWN PLAYBACK STATE OR CONSENSUS
Aligned with SyncPlay Master HLD v0.1
Design baseline for implementation and review; provisional values are identified.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
01


---

## Source PDF page 2

1. Purpose, Scope and Non-Goals
First implementation: a single-process coordination and signaling service.
IN SCOPE
• Room create / lookup / join / leave / expiry
• Membership and presence
• Targeted SDP / ICE relay
• Validation, authorization, rate limits
• Reconnect and stale-message handling
OUT OF SCOPE
• Playback state or timeline authority
• Leader election / consensus decisions
• Continuous sync-event routing
• Persistent room storage in v1
• Multi-instance horizontal scaling
• Invariant: server knows who belongs to a room and relays connection-establishment data; it does not decide which playback operation wins.
• Existing DataChannels may continue if signaling goes down, but new joins and reconnections may require the server.
• “Serverless synchronization” means synchronization is not dependent on a permanent central authority.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
02


---

## Source PDF page 3

2. Technology and Internal Architecture
Choices are intentionally simple for the capstone MVP.
HTTP: Express + TypeScript
Signaling: Socket.IO
Validation: Zod
Room Service
Membership Service
Signaling Service
Room Store
InMemoryRoomStore implements a RoomStore interface; replace storage without rewriting business rules.
• Node.js + TypeScript; Express HTTP routes; Socket.IO for room/presence/signaling events.
• In-memory Map for v1; process restart loses rooms, and separate server instances do not share membership.
• Tests: Vitest + Socket.IO client; final end-to-end proof uses two real browser instances.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
03


---

## Source PDF page 4

3. Data Model and Identity Semantics
Room, membership and live transport connection are distinct.
Entity
Fields
Rules / notes
Room
roomId, createdAt, expiresAt, maxPeers, status, peers
ACTIVE / CLOSING; no playback fields
Membership
peerId, role, joinedAt, presence, generation, tokenHash
Stable logical participant during reconnect
Live binding
socketId, peerId, roomId, lastSeenAt
Socket ID is transient
Negotiation
negotiationId, peer pair, generations, createdAt
Used to reject stale signaling
• roomId is an identifier, not a credential.
• peerId identifies a room membership; socketId identifies a current connection.
• membershipToken is a high-entropy secret scoped to one membership; never log it.
• generation increments on rebind and is freshness control, not authentication.
• Do not store currentTime, isPlaying, playbackLeader or consensus decisions in the room model.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
04


---

## Source PDF page 5

4. Room and Membership Lifecycle
Make transitions explicit and perform membership mutation through one service path.
CREATE
ACTIVE
EMPTY GRACE
CLOSING
DELETE
• Create: validate limits; generate room ID, owner peer ID and scoped credential.
• Join: validate room, credential, status and capacity; reserve membership atomically; bind socket; return snapshot.
• Leave: remove membership and notify peers; clean socket and negotiation mappings.
• Unexpected disconnect: mark DISCONNECTED; start grace timer rather than immediate permanent removal.
• Reconnect: validate credential, bind new socket, increment generation and return a fresh peer snapshot.
• Empty room: start configurable grace timer; expiry marks CLOSING, rejects new operations, clears timers and deletes state.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
05


---

## Source PDF page 6

5. HTTP API Contract
Base path: /api/v1. Canonical join flow uses Socket.IO, avoiding two join implementations.
Method / path
Purpose / response
Failures
POST /rooms
Create room; 201 with roomId, peerId, membershipToken, expiresAt, maxPeers
400, 429
GET /rooms/:roomId
Safe room metadata: status, peerCount, maxPeers
404
GET /health
Liveness/readiness response; no secrets
503 if not ready
CREATE RESPONSE
roomId, peerId, membershipToken,
expiresAt, maxPeers
SAFE ROOM RESPONSE
roomId, status, peerCount, maxPeers
Never expose token or socketId
• POST /rooms accepts optional maxPeers, bounded by server configuration.
• Use a consistent error body: { error: { code, message, requestId } }.
• Suggested codes: INVALID_REQUEST, INVALID_CREDENTIALS, FORBIDDEN, ROOM_NOT_FOUND, ROOM_FULL, ROOM_CLOSING, RATE_LIMITED, INTERNAL_ERROR.
• HTTP status: 400 malformed, 401 unauthenticated, 403 denied, 404 unavailable room, 409 state conflict, 429 throttled.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
06


---

## Source PDF page 7

6. Socket.IO Event Contract
Every client command is validated and acknowledged; notifications can be missed during disconnect.
Direction
Event
Behavior
C → S
session:join
Validate token; bind membership; return snapshot
C → S
session:leave
Explicitly leave; clean resources
C → S
signal:offer
Targeted SDP offer relay
C → S
signal:answer
Targeted SDP answer relay
C → S
signal:ice-candidate
Candidate / end-of-candidates relay
S → C
session:joined
Join acknowledgement + peer snapshot
S → C
session:peer-joined
New peer presence notification
S → C
session:peer-left
Explicit departure
S → C
session:peer-disconnected
Temporary transport loss
S → C
signal:*
Forward with server-derived fromPeerId
S → C
session:error
Structured error
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
07


---

## Source PDF page 8

7. Signaling Envelope and Authorization
Relay WebRTC setup data only after verifying sender, target, room and payload.
CLIENT: roomId • targetPeerId
negotiationId • payload
SERVER: roomId • fromPeerId (derived)
negotiationId • payload
Type
Payload
Checks
offer / answer
RTCSessionDescriptionInit
Allowed type; SDP string size bound
ICE candidate
RTCIceCandidateInit or explicit end marker
Shape and size bounded
common rules
roomId, targetPeerId, negotiationId
Sender bound to socket; target in same room
• Never trust a client-supplied fromPeerId; derive it from the live socket binding.
• Never broadcast targeted SDP/ICE to all members.
• Validate room membership and current generation; reject stale negotiation messages when identifiable.
• Treat SDP/ICE as signaling payload, not as playback commands; do not parse it for media state.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
08


---

## Source PDF page 9

8. WebRTC Setup Sequence
The server helps establish connectivity; synchronization messages later travel directly over DataChannels.
PEER A
BOOTSTRAP
PEER B
Join with credential
Return snapshot / notify
Offer via signaling
Forward offer
Answer via signaling
Forward answer
ICE candidates
Forward ICE
ICE candidates
Forward ICE
DATA CHANNEL OPEN → DIRECT PEER MESSAGES; BOOTSTRAP IS NOT IN THE NORMAL SYNC DATA PATH
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
09


---

## Source PDF page 10

9. Negotiation and ICE Edge Cases
Server and browser SDK have separate responsibilities.
SERVER
• Validate sender/target membership
• Bound payload size
• Derive sender identity
• Reject invalid/stale contexts
• Relay only
SDK / PEER MANAGER
• Deterministic first offer initiator
• Handle negotiation glare
• Queue early ICE candidates
• Ignore stale negotiation IDs
• Retry / renegotiate after failure
• For small-room full mesh, use a documented peer-ID ordering so only one peer initiates the initial connection for each pair.
• This does not remove all renegotiation races; the SDK must still handle WebRTC negotiation state.
• ICE may arrive before remote description: relay valid candidate; SDK queues it until setRemoteDescription succeeds.
• Every join command has an acknowledgement timeout. A missing notification is recovered through a fresh membership snapshot.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
10


---

## Source PDF page 11

10. Disconnect, Reconnect and Failure Handling
A timeout means suspected unavailability, not proof of permanent crash.
Scenario
Server behavior
SDK behavior
Normal leave
Remove membership; notify remaining peers
Close peer connection
Unexpected disconnect
Mark DISCONNECTED; start grace timer
Retry/wait; manage stale connection
Valid reconnect
Rebind socket; increment generation; snapshot
Reconcile peers; renegotiate if needed
Server outage
No new joins/relays during outage
Existing DataChannel may continue
Room full / expiry
Reject with stable error; clean state
Display error or create/rejoin
Stale offer/answer
Reject if generation/context is obsolete
Create fresh negotiation
Early ICE
Relay if valid
Queue until remote description ready
Duplicate join
Idempotent result or explicit conflict
Do not create duplicate membership
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
11


---

## Source PDF page 12

11. Security, Limits and Observability
Treat every request and signaling event as untrusted input.
Control
Requirement
Transport
HTTPS/WSS in deployed environment; explicit allowed-origin list
Credentials
High-entropy scoped token; hash if stored; never log raw value
Authorization
Only current room members signal current room members
Validation
Zod schemas for HTTP and every Socket.IO event
Limits
Room cap, payload bytes, room-creation/join rate, per-peer signaling rate
Privacy
Avoid logging full SDP, ICE candidates and session secrets
Cleanup
Clear timers and remove socket/peer/negotiation mappings
Monitoring
Structured logs with requestId; count joins, rejects, disconnects, relay errors
Abuse
Throttle or disconnect repeated invalid relay attempts
WebRTC can expose network-address information to peers depending on ICE configuration; document the privacy tradeoff.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
12


---

## Source PDF page 13

12. Configuration and Provisional Defaults
These are starting values for testing, not measured performance guarantees.
Setting
Suggested starting point
Status
DEFAULT_MAX_PEERS
4
Provisional; test mesh behavior
ROOM_TTL
Configurable; e.g. 2 hours
Provisional
EMPTY_ROOM_GRACE
Configurable; e.g. 60 seconds
Provisional
DISCONNECTED_GRACE
Configurable; e.g. 30 seconds
Provisional
MAX_SIGNALING_BYTES
Bounded conservative limit
Measure against actual SDP/ICE
JOIN_RATE_LIMIT
Per IP + room/credential
Tune for deployment
ALLOWED_ORIGINS
Explicit local + deployed origins
Required
MULTI_INSTANCE
Disabled in v1
Future work
• Capacity and timeout values must be configurable and covered by tests.
• In-memory storage is intentionally ephemeral; do not imply persistence or high availability.
• A multi-instance version would need shared membership state and coordinated Socket.IO delivery.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
13


---

## Source PDF page 14

13. Proposed Code Layout
Organize by domain; shared schemas belong in a protocol package.
apps/bootstrap-server/src/
  app.ts                         Express app + middleware
  server.ts                      HTTP + Socket.IO startup
  config/env.ts                  validated environment config
  modules/rooms/
    room.model.ts
    room.service.ts
    room.routes.ts
    room.schemas.ts
  modules/membership/
    membership.service.ts
    membership.auth.ts
  modules/signaling/
    signaling.gateway.ts
    signaling.service.ts
    signaling.schemas.ts
  infrastructure/
    room-store.interface.ts
    in-memory-room-store.ts
  middleware/
    error-handler.ts
    rate-limit.ts
packages/protocol/src/
  common.ts
  signaling.ts
Routes / Gateway
Parse, validate, delegate
Services + Store Interface
Policy, lifecycle, persistence boundary
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
14


---

## Source PDF page 15

14. Test Plan and Acceptance Criteria
The first end-to-end milestone is a direct DataChannel message between two browsers.
Test group
Cases
Pass condition
Room service
Create, lookup, expiry, empty grace
No leaked or stale state
Membership
Join, duplicate join, capacity race, bad token
Capacity never exceeded; identity bound
Signaling auth
Wrong room, nonmember target, spoofed sender
No unauthorized relay
WebRTC
Offer/answer, ICE, early ICE, stale generation
DataChannel opens in test setup
Reconnect
Drop socket, grace, rejoin
No duplicate membership/connection
Security
Malformed/oversized payload, rate abuse
Safe rejection; process remains healthy
End-to-end
Two browsers join and exchange test message
Message travels on DataChannel, not server
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
15


---

## Source PDF page 16

15. Implementation Order and Decisions to Freeze
Build in small increments; keep the synchronization engine outside the server.
1
Shared TypeScript types + Zod schemas
2
RoomStore interface + in-memory implementation + unit tests
3
HTTP create / safe lookup / health
4
Socket.IO join / leave / membership snapshot
5
Targeted offer / answer / ICE relay
6
Two-browser WebRTC DataChannel proof
7
Disconnect grace, generation checks, expiry
8
Rate limits, security tests, deployment docs
NEXT CODING TASK: RoomStore + room lifecycle service + unit tests.
SYNCPLAY • BOOTSTRAP SERVER LLD • v0.1 — PROPOSED
16
