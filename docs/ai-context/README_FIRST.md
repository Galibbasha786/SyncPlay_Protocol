# SyncPlay — Antigravity Starter Pack

**Purpose:** Give Claude Opus in Antigravity a compact, editable, searchable source of truth for the SyncPlay project. PDFs are not required.

## How to use this pack
1. Extract this folder into your SyncPlay repository, preferably as `docs/ai-context/` (or keep it separate and copy the files into the repo).
2. Open the **repository root** in Antigravity, not an individual source file.
3. Add `AGENTS.md` from this pack to the repository root. If the repo already has an `AGENTS.md`, merge the rules rather than overwriting existing project-specific rules.
4. Add the files under `docs/ai-context/` to the workspace. Ask Claude to read them before making code changes.
5. Use `00_MASTER_PROJECT_CONTEXT.md` as the primary source of truth. Supporting files expand details.
6. Start in **planning/review mode**. Do not ask Claude to generate the whole codebase in one prompt.
7. After each phase, run tests and review the diff before proceeding.

## Source-of-truth priority
If documents disagree, use this order:
1. User-approved decisions recorded in `DECISIONS.md`
2. `00_MASTER_PROJECT_CONTEXT.md`
3. `INTERFACE_CONTRACTS.md`
4. Module-specific design notes
5. Existing code, unless the user explicitly approves changing a decision

Do not silently resolve contradictions. Report them and propose a decision.

## Important truth
This is a proposed student-project architecture and research prototype, not a proven production protocol. Do not claim perfect synchronization, production scale, Byzantine fault tolerance, formal consensus guarantees, novelty, or patentability unless later demonstrated with evidence.
