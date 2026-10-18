/**
 * Media control payload schemas.
 *
 * Based on CONTROL_EVENTS_LAYER_LLD §4.
 *
 * Payloads describe user intent, not the final converged state.
 * The SyncEngine decides how an event affects shared playback state.
 *
 * Operation identity is carried in the envelope's `logicalEventId`,
 * NOT duplicated as `operationId` in payloads (decision D21).
 * Payloads contain only operation-specific data.
 */
import { z } from 'zod';

export const PlayPayloadSchema = z.object({
  /**
   * Optional target position in milliseconds to resume from.
   * If omitted, resume from current logical position.
   */
  targetPositionMs: z.number().finite().nonnegative().optional(),
});

export type PlayPayload = z.infer<typeof PlayPayloadSchema>;

export const PausePayloadSchema = z.object({
  /**
   * Optional observed local media position when pause was triggered.
   * Diagnostic/informational — not authoritative for shared state.
   */
  observedPositionMs: z.number().finite().nonnegative().optional(),
});

export type PausePayload = z.infer<typeof PausePayloadSchema>;

export const SeekPayloadSchema = z.object({
  /** Target seek position in milliseconds. Required. */
  targetPositionMs: z.number().finite().nonnegative(),
});

export type SeekPayload = z.infer<typeof SeekPayloadSchema>;

export const RateChangePayloadSchema = z.object({
  /**
   * Requested playback rate. Must be finite and positive.
   * Further range constraints (e.g. 0.25–4.0) are applied
   * by the SDK, not the protocol schema.
   */
  playbackRate: z.number().finite().positive(),
});

export type RateChangePayload = z.infer<typeof RateChangePayloadSchema>;
