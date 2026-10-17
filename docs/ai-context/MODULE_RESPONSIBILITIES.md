# SyncPlay Module Responsibility and Data-Flow Map

```text
                    +----------------------------+
                    | Demo / Integrating App     |
                    +-------------+--------------+
                                  |
                    Public SyncPlay SDK API
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
  +-------v--------+      +-------v---------+     +-------v--------+
  | Control Events |----->|   SyncEngine    |---->| Media Adapter  |
  | validate/route |      | shared state    |     | HTML5 effects  |
  +-------+--------+      | conflict policy |     +----------------+
          |               +-------+---------+
          |                       ^
  +-------v--------+              |
  | Peer Mesh      |--------------+
  | WebRTC channel |     RTT + state/recovery messages
  +-------+--------+
          ^
          |
  +-------+---------+      signaling/session lifecycle
  | Bootstrap Client|<------------------------------------+
  +-----------------+                                     |
                                                          |
                                                +---------v--------+
                                                | Bootstrap Server |
                                                | room + signaling |
                                                | NO playback truth|
                                                +------------------+

Fault Manager observes peer/membership status and coordinates bounded
recovery/rejoin. It does not directly choose playback state.
```

## Separation of concerns
- Bootstrap Server: rooms, membership, signaling authorization/relay.
- Bootstrap Client: connects SDK to bootstrap endpoints and socket events.
- Peer Mesh: WebRTC peer connections and DataChannels.
- RTT Service: ping/pong measurements, estimates and freshness.
- Control Events: schema validation, event factory, dedupe and dispatch.
- Fault Manager: suspicion, retry/backoff, rejoin and recovery orchestration.
- SyncEngine: logical state, operation semantics, conflict policy and convergence.
- Media Adapter: reads/applies local media state.
- SDK: public developer-facing API, lifecycle and package exports.
