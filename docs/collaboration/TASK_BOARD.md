# Octolabs Task Board

Updated 17 October 2026.

## This delivery
- OctoPairs: solo/local duel memory game, three board sizes, daily board, challenge links, English/French and local records.
- Add fourth game to homepage and update stale product direction.
- Add memory-game and OctoHome model checks to existing CI.
- Local checks: existing OctoFlag and OctoHome models passed (15 tests); OctoPairs engine passed (4 tests, 3,000 generated boards).
- Browser preview: completed a two-player round, checked turn handover, scoring and English/French. Sharing now displays its URL immediately even if clipboard permission is pending. Physical phone/tablet validation remains pending.
- Deployment: see GitHub PR #7 and the Pages deployment status for release evidence.

## Next, in priority order
1. Letters & Numbers: inspect current private-repository implementation of save-while-playing; verify saved answer remains usable while editing a better one in both modes. Audit empty-room reconnection and timer recovery.
2. OctoHome: phone/tablet audit of task completion, Undo, recurrence, shopping lists and currency display. Cloud sync, background notifications and appliance control require implementation and must not be presented as working yet.
3. OctoQuiz: room join/reconnect and host disconnect tests before additional networked modes.
4. OctoPairs: user feedback, optional resumable local rounds, and daily streaks. Keep records casual; do not imply anti-cheat protection.
5. New game candidate: OctoSequence, a shared-device pattern-memory challenge. Validate the concept after the current release rather than adding unfinished homepage cards.

## Release discipline
- Read current source; earlier handoffs may be stale.
- Free tiers only; no paid-plan or billing changes.
- Test changed gameplay invariants, mobile layout, keyboard and full-round completion.
- Publish to existing Octolabs infrastructure and record release evidence.
- Never delete unrelated services, repositories or user data as cleanup.
