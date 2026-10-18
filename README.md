# SyncPlay Protocol

A reusable, browser-based media synchronization protocol and SDK for synchronizing video and audio playback between multiple users without a permanent centralized server or leader.

## Architecture

A lightweight bootstrap server handles peer discovery and initial connection setup. After peers are connected via WebRTC DataChannels, they communicate directly and maintain synchronization. The synchronization algorithm is replaceable behind a stable SyncEngine interface.

See `docs/design/` for architecture documents and `docs/ai-context/` for implementation context.

## Repository Structure

```
packages/
  protocol/       — shared message schemas, envelope, types, and validation
services/
  bootstrap-server/ — room management, membership, and signaling relay (future)
apps/
  demo/           — browser demo application (future)
docs/
  ai-context/     — implementation context and decision register
  design/         — architecture strategy, HLD, and module LLDs
```

## Technology

- **TypeScript** (strict mode) for all packages
- **Node.js 24 LTS** runtime
- **npm workspaces** monorepo
- **Zod** for runtime schema validation
- **Vitest** for testing
- **Socket.IO** for signaling (future)
- **WebRTC DataChannel** for peer transport (future)

## Development

```bash
# Install dependencies
npm install

# Type check all packages
npm run typecheck

# Run all tests
npm run test

# Build all packages
npm run build
```

## Status

Phase 1: Protocol package — in progress.

See [IMPLEMENTATION_PLAN.md](docs/ai-context/IMPLEMENTATION_PLAN.md) for the full roadmap and [DECISIONS.md](docs/ai-context/DECISIONS.md) for the decision register.

## Non-goals (MVP)

This is a research prototype. It does not claim perfect synchronization, production-grade fault tolerance, Byzantine fault tolerance, internet-scale rooms, or formal consensus guarantees.
