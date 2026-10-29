# Project Rules

Organization-wide engineering standards for people and AI assistants. Codex reads this file directly; Claude Code reads it through `CLAUDE.md`. Keep rules in these files, not in tool-specific folders.

## Read Before You Work

This file holds the rules for every task. Topic standards are read only when the task calls for them:

- **Handoffs:** If `.handoff/<branch>.md` exists, read it first. Read `standards/handoff.md` before writing or closing one, or when multi-step work may continue in another session. If none exists and multi-step work is ending unfinished, offer once to write one.
- **CSS:** Read `standards/css.md` before writing or changing styles.
- **UI and user-facing text:** Read `standards/ui.md` before building or changing interfaces, HTML, or anything users read.
- **JavaScript:** Read `standards/javascript.md` before writing or changing JavaScript.
- **ESLint rules:** Read `.eslint/README.md` before adding, removing, changing, or disabling a rule.
- **These standards:** Read `standards/README.md` before editing this file or anything in `standards/`.

## Tooling

- **Use pnpm**, never npm. Use `pnpm dlx` instead of `npx` unless compatibility requires `npx`.
- **Validate proportionally.** Run the lint checks and tests that cover what changed; run full validation after significant changes. Ask when the scope or cost of validation is unclear.
- **Keep test output minimal.** Report failures and actionable details, not data dumps or verbose logs.
- **Never claim checks passed** without running them.

## Code Style

- **Let ESLint enforce style** for JavaScript, JSON, HTML, and CSS, and run `pnpm lint` on changed files.
- **Indent with 4 spaces and use LF line endings** in every file, including ones ESLint does not check.
- **Prefer modern, established standards.** Use features with strong Baseline support. Avoid experimental or deprecated approaches unless justified.
- **Prefer the platform.** Use native HTML and CSS before JavaScript, and built-in browser or runtime APIs before dependencies.

## ESLint

- **Respect existing decisions.** Do not enable omitted rules or change configured rules without asking first. Record the reasoning for any approved change in `.eslint/README.md`.
- **Honor LOL vs. SOL.** When following a rule tagged LOL vs. SOL would make the code worse, disable it only for the affected code, never a whole file or project, and give the reason:
    - One line: `// eslint-disable-next-line <rule> -- <reason>`
    - Multiple lines: `/* eslint-disable <rule> -- <reason> */` before and `/* eslint-enable <rule> */` after.

## Maintainable Code

- **Write code that reads like a book.** Favor straightforward logic and a natural flow over cleverness or brevity.
- **Use descriptive names.** Familiar abbreviations such as `ctx`, `i`, `x`, and `y` are fine; arbitrary single letters and obscure abbreviations are not.
- **Comment intent, not mechanics.** Explain non-obvious decisions, invariants, and constraints. Do not narrate self-explanatory code, and keep comments accurate as code changes.

## Project Structure

- **Work within the existing architecture.** Follow established patterns, naming, and directories. Propose significant restructuring or new design patterns instead of making them without approval.
- **Reuse before creating.** Inspect existing code, components, and styles first. Share genuinely reusable code, but avoid premature abstraction.
- **Organize by responsibility.** Keep related code together with clear boundaries, consistent names, and no catch-all directories or unnecessary nesting.
- **Keep changes focused and cohesive.** Implement what was asked without unrelated changes. When moving files, update every import, reference, and configuration, and delete obsolete files only after verifying nothing uses them.

## Communication

- **Use plain, everyday language.** Avoid jargon when a simple word works, and briefly explain a technical term the first time it is needed.
- **Keep updates direct and easy to scan.** Say what changed and what remains, without assuming the reader knows package-management or implementation terminology.

## Project Notes

When this file is copied into a project, record project-specific facts here: token file locations, chosen breakpoints, build commands, and any approved exceptions to these standards.
