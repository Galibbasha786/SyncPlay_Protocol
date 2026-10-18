/**
 * Tests for individual payload schemas.
 *
 * Each message type's payload is tested for valid input,
 * missing required fields, and invalid values.
 */
import { describe, it, expect } from 'vitest';
import {
  PingPayloadSchema,
  PongPayloadSchema,
} from '../payloads/ping-pong.js';
import {
  PlayPayloadSchema,
  PausePayloadSchema,
  SeekPayloadSchema,
  RateChangePayloadSchema,
} from '../payloads/control.js';
import {
  StateRequestPayloadSchema,
  StateSnapshotPayloadSchema,
  StateDigestPayloadSchema,
} from '../payloads/state.js';

// ── PING ─────────────────────────────────────────────────────

describe('PingPayloadSchema', () => {
  it('should accept a valid PING payload', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: 'probe-1',
      senderTimestamp: 1234.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.probeId).toBe('probe-1');
      expect(result.data.senderTimestamp).toBe(1234.5);
    }
  });

  it('should accept zero timestamp', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: 'probe-1',
      senderTimestamp: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing probeId', () => {
    const result = PingPayloadSchema.safeParse({ senderTimestamp: 100 });
    expect(result.success).toBe(false);
  });

  it('should reject missing senderTimestamp', () => {
    const result = PingPayloadSchema.safeParse({ probeId: 'probe-1' });
    expect(result.success).toBe(false);
  });

  it('should reject empty probeId', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: '',
      senderTimestamp: 100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative senderTimestamp', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: 'probe-1',
      senderTimestamp: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject NaN senderTimestamp', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: 'probe-1',
      senderTimestamp: NaN,
    });
    expect(result.success).toBe(false);
  });

  it('should reject Infinity senderTimestamp', () => {
    const result = PingPayloadSchema.safeParse({
      probeId: 'probe-1',
      senderTimestamp: Infinity,
    });
    expect(result.success).toBe(false);
  });
});

// ── PONG ─────────────────────────────────────────────────────

describe('PongPayloadSchema', () => {
  it('should accept a valid PONG payload', () => {
    const result = PongPayloadSchema.safeParse({ probeId: 'probe-1' });
    expect(result.success).toBe(true);
  });

  it('should reject empty probeId', () => {
    const result = PongPayloadSchema.safeParse({ probeId: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing probeId', () => {
    const result = PongPayloadSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ── PLAY ─────────────────────────────────────────────────────

describe('PlayPayloadSchema', () => {
  it('should accept PLAY with targetPositionMs', () => {
    const result = PlayPayloadSchema.safeParse({ targetPositionMs: 5000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetPositionMs).toBe(5000);
    }
  });

  it('should accept PLAY without targetPositionMs', () => {
    const result = PlayPayloadSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetPositionMs).toBeUndefined();
    }
  });

  it('should accept PLAY with zero position', () => {
    const result = PlayPayloadSchema.safeParse({ targetPositionMs: 0 });
    expect(result.success).toBe(true);
  });

  it('should reject negative targetPositionMs', () => {
    const result = PlayPayloadSchema.safeParse({ targetPositionMs: -100 });
    expect(result.success).toBe(false);
  });

  it('should reject NaN targetPositionMs', () => {
    const result = PlayPayloadSchema.safeParse({ targetPositionMs: NaN });
    expect(result.success).toBe(false);
  });

  it('should reject Infinity targetPositionMs', () => {
    const result = PlayPayloadSchema.safeParse({ targetPositionMs: Infinity });
    expect(result.success).toBe(false);
  });
});

// ── PAUSE ────────────────────────────────────────────────────

describe('PausePayloadSchema', () => {
  it('should accept PAUSE with observedPositionMs', () => {
    const result = PausePayloadSchema.safeParse({
      observedPositionMs: 12000,
    });
    expect(result.success).toBe(true);
  });

  it('should accept PAUSE without observedPositionMs', () => {
    const result = PausePayloadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject negative observedPositionMs', () => {
    const result = PausePayloadSchema.safeParse({
      observedPositionMs: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ── SEEK ─────────────────────────────────────────────────────

describe('SeekPayloadSchema', () => {
  it('should accept valid SEEK payload', () => {
    const result = SeekPayloadSchema.safeParse({ targetPositionMs: 30000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetPositionMs).toBe(30000);
    }
  });

  it('should accept SEEK to position zero', () => {
    const result = SeekPayloadSchema.safeParse({ targetPositionMs: 0 });
    expect(result.success).toBe(true);
  });

  it('should reject SEEK without targetPositionMs', () => {
    const result = SeekPayloadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject negative targetPositionMs', () => {
    const result = SeekPayloadSchema.safeParse({ targetPositionMs: -500 });
    expect(result.success).toBe(false);
  });

  it('should reject NaN targetPositionMs', () => {
    const result = SeekPayloadSchema.safeParse({ targetPositionMs: NaN });
    expect(result.success).toBe(false);
  });
});

// ── RATE_CHANGE ──────────────────────────────────────────────

describe('RateChangePayloadSchema', () => {
  it('should accept valid playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: 1.5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.playbackRate).toBe(1.5);
    }
  });

  it('should accept normal speed (1.0)', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: 1.0 });
    expect(result.success).toBe(true);
  });

  it('should accept slow playback (0.25)', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: 0.25 });
    expect(result.success).toBe(true);
  });

  it('should reject zero playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject negative playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject NaN playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({ playbackRate: NaN });
    expect(result.success).toBe(false);
  });

  it('should reject Infinity playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({
      playbackRate: Infinity,
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing playbackRate', () => {
    const result = RateChangePayloadSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ── STATE_REQUEST ────────────────────────────────────────────

describe('StateRequestPayloadSchema', () => {
  it('should accept valid STATE_REQUEST with INITIAL_SYNC', () => {
    const result = StateRequestPayloadSchema.safeParse({
      requestId: 'req-001',
      reason: 'INITIAL_SYNC',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid STATE_REQUEST with REJOIN', () => {
    const result = StateRequestPayloadSchema.safeParse({
      requestId: 'req-002',
      reason: 'REJOIN',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid STATE_REQUEST with DIVERGENCE_SUSPECTED', () => {
    const result = StateRequestPayloadSchema.safeParse({
      requestId: 'req-003',
      reason: 'DIVERGENCE_SUSPECTED',
    });
    expect(result.success).toBe(true);
  });

  it('should reject unknown reason', () => {
    const result = StateRequestPayloadSchema.safeParse({
      requestId: 'req-001',
      reason: 'UNKNOWN_REASON',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing requestId', () => {
    const result = StateRequestPayloadSchema.safeParse({
      reason: 'REJOIN',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing reason', () => {
    const result = StateRequestPayloadSchema.safeParse({
      requestId: 'req-001',
    });
    expect(result.success).toBe(false);
  });
});

// ── STATE_SNAPSHOT ────────────────────────────────────────────

describe('StateSnapshotPayloadSchema', () => {
  it('should accept valid STATE_SNAPSHOT', () => {
    const result = StateSnapshotPayloadSchema.safeParse({
      snapshotId: 'snap-001',
      stateVersion: 5,
      state: { playbackStatus: 'paused', positionMs: 12000 },
    });
    expect(result.success).toBe(true);
  });

  it('should accept STATE_SNAPSHOT with null state', () => {
    const result = StateSnapshotPayloadSchema.safeParse({
      snapshotId: 'snap-001',
      stateVersion: 0,
      state: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative stateVersion', () => {
    const result = StateSnapshotPayloadSchema.safeParse({
      snapshotId: 'snap-001',
      stateVersion: -1,
      state: {},
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer stateVersion', () => {
    const result = StateSnapshotPayloadSchema.safeParse({
      snapshotId: 'snap-001',
      stateVersion: 1.5,
      state: {},
    });
    expect(result.success).toBe(false);
  });
});

// ── STATE_DIGEST ─────────────────────────────────────────────

describe('StateDigestPayloadSchema', () => {
  it('should accept valid STATE_DIGEST', () => {
    const result = StateDigestPayloadSchema.safeParse({
      digestId: 'digest-001',
      stateVersion: 3,
      digest: 'sha256:abc123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty digest string', () => {
    const result = StateDigestPayloadSchema.safeParse({
      digestId: 'digest-001',
      stateVersion: 3,
      digest: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject digest exceeding max length', () => {
    const result = StateDigestPayloadSchema.safeParse({
      digestId: 'digest-001',
      stateVersion: 3,
      digest: 'X'.repeat(4097),
    });
    expect(result.success).toBe(false);
  });

  it('should accept digest at max length', () => {
    const result = StateDigestPayloadSchema.safeParse({
      digestId: 'digest-001',
      stateVersion: 3,
      digest: 'X'.repeat(4096),
    });
    expect(result.success).toBe(true);
  });
});
