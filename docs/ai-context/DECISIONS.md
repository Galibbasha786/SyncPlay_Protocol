# SyncPlay Decision Register

Status values: **FIXED** = architecture constraint; **PROPOSED** = needs team approval; **PROVISIONAL** = MVP starting point to test; **OPEN** = research decision not yet selected.

| ID | Decision | Status | Notes |
|---|---|---|---|
| D1 | Bootstrap is not playback authority | FIXED | It manages membership/signaling, not playback state. |
| D2 | Synchronization algorithm is replaceable behind SyncEngine | FIXED | Stable interface first. |
| D3 | WebRTC DataChannel is initial peer transport | PROVISIONAL | Validate browser/network behavior. |
| D4 | Full mesh for small MVP rooms | PROVISIONAL | Connections = N(N-1)/2; do not scale claim. |
| D5 | In-memory room registry | PROVISIONAL | Single process only; restart loses rooms. |
| D6 | HTML5 media adapter first | PROVISIONAL | YouTube adapter later. |
| D7 | Versioned shared envelope and payload schemas | PROPOSED | Approve before implementation. |
| D8 | `messageId` differs from `logicalEventId` | PROPOSED | Message transmission vs logical operation. |
| D9 | `peerId` differs from `socketId` | PROPOSED | Stable logical identity vs transient socket. |
| D10 | Connection generation guards stale signaling | PROPOSED | Increment on rebind/reconnect. |
| D11 | Control Events does not resolve conflicts | FIXED | SyncEngine owns state semantics. |
| D12 | Fault Manager detects suspicion, not certainty | FIXED | Timeouts do not prove permanent failure. |
| D13 | Lamport counter + deterministic tie-break baseline | EXPERIMENT | Not a selected final consensus protocol. |
| D14 | Strong consensus/CRDT strategy | OPEN | Research and compare. |
| D15 | Accuracy and room-size targets | OPEN | Measure baseline before setting targets. |
| D16 | Authentication/token policy | OPEN | Define minimal safe room access model. |
| D17 | TURN policy | OPEN | Test direct connectivity first; document limitations. |
| D18 | Protocol compatibility policy | OPEN | Decide supported versions and unknown message handling. |

## Required rule
If code, prompt, or another design document contradicts a FIXED decision, stop and ask for a resolution. Do not silently edit the decision register.
