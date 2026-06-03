# Octolabs Agent Collaboration

This folder is the shared operating room for parallel AI work on Octolabs.

## Working Model

- `main` stays the source of truth.
- Codex works in `../octolabs-codex` on branch `codex/octolabs-polish`.
- Claude works in `../octolabs-claude` on branch `claude/octolabs-brand-review`.
- Each agent should read `PRODUCT_BRIEF.md` and `TASK_BOARD.md` before making changes.
- Each agent should leave a short handoff using `HANDOFF_TEMPLATE.md` before stopping.

## Rules

- Keep the homepage calm, polished, and worth lingering on.
- Avoid language that sounds like a money-making scheme.
- Mention origin lightly; do not repeat location as the core message.
- Preserve links to ArtisanMU, AniCal, and OctoQuiz.
- Do not overwrite another agent's branch or worktree.
- Use small commits with clear messages.

## Review Loop

1. Agent works on its branch.
2. Agent records what changed and what needs review.
3. Other agent reviews the branch or pasted diff.
4. Best changes are merged back into `main`.
