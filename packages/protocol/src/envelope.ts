/**
 * Protocol message envelope.
 *
 * This is the canonical shared envelope for all SyncPlay protocol messages.
 * Based on INTERFACE_CONTRACTS.md §1.
 *
 * v0.1 envelope is deliberately minimal:
 * - No `metadata` field (deferred — D19)
 * - No `createdAt` field (deferred — D20)
 * - `logicalEventId` in the envelope replaces `operationId` in payloads (D21)
 *
 * Zod validation strips unknown fields (forward-compatible).
 * Unknown protocolVersion and unknown messageType are rejected
 * at the validation layer, not here.
 */
import { z } from 'zod';
import type { PeerId, SessionId, MessageId, LogicalEventId } from './identity.js';

/**
 * The shared protocol message envelope.
 *
 * @typeParam TPayload - The payload type, validated per messageType.
 */
export interface ProtocolMessage<TPayload = unknown> {
  /** Protocol version. Must match PROTOCOL_VERSION for acceptance. */
  readonly protocolVersion: number;
  /** Message type from the MessageType registry. */
  readonly messageType: string;
  /** Room/session identifier. */
  readonly sessionId: SessionId;
  /** Logical participant identity of the sender. */
  readonly senderPeerId: PeerId;
  /** Unique identifier for this specific message transmission. */
  readonly messageId: MessageId;
  /**
   * Stable identity for the logical user operation.
   * Preserved across retries of the same operation.
   * Required for control events; optional for transport messages.
   */
  readonly logicalEventId?: LogicalEventId;
  /** Message payload, validated per messageType. */
  readonly payload: TPayload;
}

/**
 * Zod schema for the protocol message envelope.
 *
 * Validates structural correctness only. Version and messageType
 * semantic checks are performed by the validation layer.
 *
 * Uses default Zod behavior (strip unknown fields) for forward
 * compatibility with potential future envelope additions.
 */
export const ProtocolMessageSchema = z.object({
  protocolVersion: z.number().int().positive(),
  messageType: z.string().min(1).max(64),
  sessionId: z.string().min(1).max(128),
  senderPeerId: z.string().min(1).max(128),
  messageId: z.string().min(1).max(128),
  logicalEventId: z.string().min(1).max(128).optional(),
  payload: z.unknown(),
});
