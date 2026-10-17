# SyncPlay Shared Interface Contracts — Draft v0.1

These are conceptual contracts to align before detailed implementation. Adapt names to the existing repository after inspection. Do not duplicate schemas in multiple packages.

## 1. Shared envelope
```ts
export interface ProtocolMessage<TPayload = unknown> {
  protocolVersion: number;
  messageType: string;
  sessionId: string;
  senderPeerId: string;
  messageId: string;       // unique message/transmission
  logicalEventId?: string; // stable identity for a logical operation/retry
  payload: TPayload;
}
```
Optional timestamps must have explicitly documented clock semantics. Never use wall-clock time as a globally reliable ordering key.

## 2. Peer Mesh
```ts
interface PeerMesh {
  connect(peer: PeerDescriptor): Promise<void>;
  disconnect(peerId: string, reason?: string): void;
  send(peerId: string, message: ProtocolMessage): SendResult;
  getPeerStatus(peerId: string): PeerStatus | undefined;
  listPeers(): PeerStatus[];
  onMessage(handler: (message: InboundMessage) => void): Unsubscribe;
  onPeerStatus(handler: (status: PeerStatus) => void): Unsubscribe;
  dispose(): Promise<void>;
}
```
Transport owns `RTCPeerConnection`, `RTCDataChannel`, SDP/ICE mechanics and transport status. Do not expose raw browser objects to SyncEngine.

## 3. RTT Service
```ts
interface RttService {
  start(peerId: string): void;
  stop(peerId: string): void;
  getEstimate(peerId: string): RttEstimate | undefined;
  onSample(handler: (sample: RttSample) => void): Unsubscribe;
}
```
Use a monotonic local clock for elapsed RTT. Keep sample windows bounded; track sample age. RTT alone does not determine one-way latency or clock offset.

## 4. Control Events
```ts
interface ControlEventService {
  createLocalEvent(input: ControlIntent): Result<SyncEvent, ValidationError>;
  receive(message: InboundMessage): void;
  publish(event: SyncEvent): Promise<PublishResult>;
  onEventResult(handler: (result: EventResult) => void): Unsubscribe;
  dispose(): void;
}
```
Candidate control intents: PLAY, PAUSE, SEEK, RATE_CHANGE. Schema validity is not the same as semantic validity.

## 5. Fault Manager
```ts
interface FaultManager {
  onPeerStatus(status: PeerStatus): void;
  onProbeResult(result: ProbeResult): void;
  onMembershipChanged(change: MembershipChange): void;
  getHealth(peerId: string): PeerHealth | undefined;
  requestRecovery(peerId: string, reason: string): Promise<void>;
  dispose(): void;
}
```
Fault Manager coordinates bounded retry/rejoin/recovery. It does not mutate shared playback state.

## 6. SyncEngine
```ts
interface SyncEngine {
  initialize(context: SyncContext): void;
  propose(intent: ControlIntent): EngineResult;
  receive(event: SyncEvent): EngineResult;
  getState(): Readonly<SyncState>;
  getStatus(): EngineStatus;
  onDecision(handler: (decision: SyncDecision) => void): Unsubscribe;
  onStateChange(handler: (state: Readonly<SyncState>) => void): Unsubscribe;
  exportRecoveryState(): RecoverySnapshot;
  importRecoveryState(snapshot: RecoverySnapshot): EngineResult;
  dispose(): void;
}
```
SyncEngine owns shared logical playback state, operation semantics, conflict policy, and state reconciliation. Its API must be testable without WebRTC or HTML media.

## 7. Media Adapter
```ts
interface MediaAdapter {
  readState(): MediaState;
  applyState(state: MediaState): Promise<MediaApplyResult>;
  onLocalChange(handler: (change: LocalMediaChange) => void): Unsubscribe;
  dispose(): void;
}
```
The adapter reports actual media outcomes. It must not decide which distributed event wins.

## 8. Identity semantics
- `sessionId`: identifies a session, not a secret.
- `peerId`: stable logical participant identity within a session/rejoin policy.
- `socketId`: transient signaling socket connection.
- `connectionGeneration`: incremented when signaling binding changes; reject stale callbacks/messages from older generations.
- `messageId`: one message transmission.
- `logicalEventId`: one logical operation across retries.

## 9. Lifecycle boundaries
- Room membership is not the same as transport-connected status.
- DataChannel open is not the same as state convergence.
- Reconnect is not the same as successful state recovery.
- Sending to a peer is not proof every peer received or committed an operation.
- Bootstrap validates membership/signaling; SyncEngine determines playback state.
