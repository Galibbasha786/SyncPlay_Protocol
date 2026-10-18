/**
 * Identity types for SyncPlay.
 *
 * These are type aliases that document semantic intent.
 * They do NOT prevent accidental misuse at the type level
 * (no branding). Runtime validation is handled by Zod schemas
 * at network boundaries.
 *
 * See INTERFACE_CONTRACTS.md §8 for identity semantics:
 * - sessionId:  identifies a room/session, not a secret.
 * - peerId:     stable logical participant identity within a session.
 * - socketId:   transient signaling socket connection.
 * - connectionGeneration: incremented on signaling rebind; rejects stale messages.
 * - messageId:  one message transmission.
 * - logicalEventId: one logical operation across retries.
 */

/** Stable logical participant identity within a session. */
export type PeerId = string;

/** Room or session identifier. Not a secret or credential. */
export type SessionId = string;

/** Transient signaling socket connection identifier. */
export type SocketId = string;

/** Unique identifier for one message transmission. */
export type MessageId = string;

/** Stable identity for one logical user operation across retries. */
export type LogicalEventId = string;

/**
 * Connection generation counter.
 * Incremented when a peer's signaling binding is replaced.
 * Used to reject stale signaling from older connections.
 */
export type ConnectionGeneration = number;
