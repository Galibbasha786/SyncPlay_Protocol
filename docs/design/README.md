# Design Documents Index

| Document | Use it for |
|---|---|
| `MASTER_HLD.md` | Overall architecture, component responsibilities, data/control flow. |
| `BOOTSTRAP_SERVER_LLD.md` | Room lifecycle, membership, signaling, validation, rejoin. |
| `PEER_MESH_RTT_ENGINE_LLD.md` | WebRTC peer connections, DataChannels, connection lifecycle, RTT measurement. |
| `CONTROL_EVENTS_LAYER_LLD.md` | Typed playback events, validation, deduplication, dispatch. |
| `FAULT_TOLERANCE_LLD.md` | Failure suspicion, retries, reconnection, recovery orchestration. |
| `SYNCENGINE_INTERFACE_RESEARCH_SPEC.md` | Replaceable SyncEngine interface, state semantics and research questions. |
| `MASTER_INTERFACE_CONSISTENCY_REVIEW.md` | Cross-module contract review and integration sequence. |
| `ARCHITECTURE_STRATEGY.md` | Architecture principles before implementation. |
| `INITIAL_BOOTSTRAP_SERVER_SYSTEM_DESIGN.md` | Early bootstrap design background. |
| `PATENT_AND_PRIOR_ART_RESEARCH_GUIDE.md` | Research approach and prior-art/patent review. |
| `WEEKLY_DISTRIBUTED_MEDIA_SYNC_READING_GUIDE.md` | Reading plan and technical learning. |

Use the consistency review and interface contracts as cross-module references; module LLDs provide task-specific detail.
