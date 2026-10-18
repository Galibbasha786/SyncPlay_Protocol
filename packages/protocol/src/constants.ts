/**
 * Protocol constants.
 *
 * Size limits are provisional starting values for the MVP.
 * They must be configurable in production and measured against
 * actual SDP/ICE and control-message sizes.
 */

/** Current protocol version. Reject messages with a different version. */
export const PROTOCOL_VERSION = 1;

/**
 * Maximum total serialized message size in bytes (64 KB).
 * Applied before JSON parsing at the network boundary.
 */
export const MAX_MESSAGE_BYTES = 65_536;

/**
 * Maximum payload size in bytes (32 KB).
 * Leaves headroom for envelope fields and serialization overhead.
 */
export const MAX_PAYLOAD_BYTES = 32_768;
