/**
 * PING / PONG payload schemas.
 *
 * Used by the RTT Service for round-trip time measurement.
 * See PEER_MESH_RTT_ENGINE_LLD §7.
 *
 * - PING: sent by the probing peer with a unique probeId and
 *   a local monotonic timestamp (performance.now()).
 * - PONG: echoes the probeId so the sender can match it to the
 *   pending probe and compute RTT = t_received - t_sent.
 *
 * senderTimestamp in PING is a local monotonic value, NOT a
 * wall-clock time. Do not use it for cross-peer ordering.
 */
import { z } from 'zod';

export const PingPayloadSchema = z.object({
  /** Unique probe identifier. Matched by PONG response. */
  probeId: z.string().min(1).max(128),
  /**
   * Local monotonic timestamp when the probe was sent.
   * From performance.now() or equivalent. Not a wall-clock value.
   */
  senderTimestamp: z.number().finite().nonnegative(),
});

export type PingPayload = z.infer<typeof PingPayloadSchema>;

export const PongPayloadSchema = z.object({
  /** Probe identifier echoed from the corresponding PING. */
  probeId: z.string().min(1).max(128),
});

export type PongPayload = z.infer<typeof PongPayloadSchema>;
