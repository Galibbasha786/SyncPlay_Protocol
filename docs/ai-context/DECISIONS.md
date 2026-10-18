# SyncPlay Decision Register

Status values: **FIXED** = architecture constraint; **APPROVED** = reviewed and accepted; **PROPOSED** = needs team approval; **PROVISIONAL** = MVP starting point to test; **OPEN** = research decision not yet selected; **DEFERRED** = explicitly postponed; **EXPERIMENT** = research hypothesis to test.

| ID | Decision | Status | Notes |
|---|---|---|---|
| D1 | Bootstrap is not playback authority | FIXED | It manages membership/signaling, not playback state. |
| D2 | Synchronization algorithm is replaceable behind SyncEngine | FIXED | Stable interface first. |
| D3 | WebRTC DataChannel is initial peer transport | PROVISIONAL | Validate browser/network behavior. |
| D4 | Full mesh for small MVP rooms | PROVISIONAL | Connections = N(N-1)/2; do not scale claim. |
| D5 | In-memory room registry | PROVISIONAL | Single process only; restart loses rooms. |
| D6 | HTML5 media adapter first | PROVISIONAL | YouTube adapter later. |
| D7 | Versioned shared envelope and payload schemas | APPROVED | Implemented in `packages/protocol`. Protocol version 1. |
| D8 | `messageId` differs from `logicalEventId` | APPROVED | `messageId` = one transmission; `logicalEventId` = one logical operation across retries. Both in envelope. |
| D9 | `peerId` differs from `socketId` | APPROVED | `peerId` = stable logical identity; `socketId` = transient signaling connection. Types in `packages/protocol`. |
| D10 | Connection generation guards stale signaling | APPROVED | `ConnectionGeneration` type defined. Increment on rebind/reconnect; reject stale messages. |
| D11 | Control Events does not resolve conflicts | FIXED | SyncEngine owns state semantics. |
| D12 | Fault Manager detects suspicion, not certainty | FIXED | Timeouts do not prove permanent failure. |
| D13 | Lamport counter + deterministic tie-break baseline | EXPERIMENT | Not a selected final consensus protocol. |
| D14 | Strong consensus/CRDT strategy | OPEN | Research and compare. |
| D15 | Accuracy and room-size targets | OPEN | Measure baseline before setting targets. |
| D16 | Authentication/token policy | OPEN | Define minimal safe room access model. |
| D17 | TURN policy | OPEN | Test direct connectivity first; document limitations. |
| D18 | Protocol compatibility policy | PROVISIONAL | v0.1 policy: reject unknown `protocolVersion`, reject unknown `messageType`, strip unknown envelope fields. Full policy TBD. |
| D19 | No generic `metadata` field in v0.1 envelope | DEFERRED | ARCHITECTURE_STRATEGY and MASTER_HLD show `metadata` for evolvable sync data, but no concrete v0.1 need. Revisit when SyncEngine metadata requirements are known. |
| D20 | No `createdAt` field in v0.1 envelope | DEFERRED | CONTROL_EVENTS_LAYER_LLD §3 suggests optional wall-clock diagnostic. Omitted because wall-clock time must not be used for ordering (invariant). Revisit if diagnostic logging needs it. |
| D21 | `logicalEventId` in envelope replaces `operationId` in payloads | APPROVED | CONTROL_EVENTS_LAYER_LLD §4 listed `operationId` in control payloads, but INTERFACE_CONTRACTS §1 defines `logicalEventId` in the envelope for the same purpose. Payloads contain only operation-specific data. |

## Required rule
If code, prompt, or another design document contradicts a FIXED decision, stop and ask for a resolution. Do not silently edit the decision register.
