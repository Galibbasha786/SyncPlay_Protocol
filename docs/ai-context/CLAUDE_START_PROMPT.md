# Initial Prompt for Claude Opus in Antigravity

You are the senior implementation engineer for SyncPlay. First read the repository instructions in `AGENTS.md` and every file under `docs/ai-context/`. Treat those files as project context, not as permission to immediately generate the entire system.

## Your first task: reconnaissance only
Do not edit files or install dependencies yet.

1. Inspect the current repository tree, package manager/workspaces, package scripts, current code, tests and Git status.
2. Summarize what already exists and what is missing.
3. Map existing files to the intended SyncPlay modules.
4. Identify contradictions between current code and `docs/ai-context/`.
5. List the smallest required decisions before coding.
6. Propose Phase 0 and Phase 1 tasks, exact files likely to change, tests to add and verification commands.
7. Wait for my approval before implementing.

## Hard constraints
- Bootstrap is not playback authority.
- Keep SyncEngine replaceable behind stable interfaces.
- WebRTC is transport, not consensus.
- Shared schemas/types must live in one `packages/protocol` package (adapt only after inspecting the repo).
- Distinguish `messageId` and `logicalEventId`, `peerId` and `socketId`, membership and transport state.
- Never claim tests passed unless you ran them.
- Do not silently change fixed decisions.
- Do not implement every module in one turn.
- Do not add unnecessary infrastructure or dependencies.
- Report risks and unresolved assumptions before making decisions.

Use this response structure:
**Repository findings → Architecture mapping → Conflicts/open decisions → Proposed smallest milestone → Files/tests/commands → Wait for approval.**
