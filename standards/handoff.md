# Handoff Standards

A handoff lets another session or AI continue multi-step work without the user restating context. It holds only what Git cannot show: intent, recent pivots, and what comes next. Settled decisions belong in the docs or specs they affect, not here.

## The File

- **Use one file per branch** at `.handoff/<branch>.md`, replacing `/` in branch names with `-`. Commit it with the branch.
- **Keep it under about 2 KB.** Leave out anything Git already shows, such as finished work, changed files, and diffs.
- **Record the commit** it was written against so a reader can tell whether it is current.

```markdown
# Handoff: feature-dark-mode

Updated: 2026-10-29 · Commit: a15b60d

## Goal
Replace the seed-and-factor color system with light-dark() tokens.

## Next
- Convert alert colors in tokens/colors.css.

## Recent Decisions and Pivots
- Breakpoints use px; not yet recorded in Project Notes.

## Open Questions
- Should the sidebar keep its own dark palette?
```

Leave out empty sections.

## When to Write

Write only when something Git cannot show would otherwise be lost:

- **A pivot or decision** that is not yet recorded in the docs it affects.
- **The end of a session** with work still remaining, as part of the final reply.
- **The user asks.**

Do not update it after routine steps. Edit only the sections that changed rather than rewriting the file.

## Offering a Handoff

Users may not remember handoffs exist. When multi-step work ends unfinished and no handoff file exists, close the final reply with one short offer, such as: "Want me to write a handoff so another session can pick this up?"

- **Offer at most once per session,** and not again after the user declines.
- **Skip the offer** for finished work, quick tasks, or when a handoff already exists.

## Reading and Closing

- **On resume:** Compare the recorded commit with the current one. If they differ, read `git log` for that range before trusting the handoff.
- **When a decision settles:** Move it into the doc it belongs in and remove it from the handoff.
- **Before merging:** Move any remaining decisions into their docs, then delete the handoff file.
