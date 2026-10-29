# Maintaining the Standards

AI assistants read these files constantly, so every line costs attention in every session that loads it. Keep the standards complete but lean.

## Where a Rule Goes

- **`AGENTS.md`:** Only rules that apply to nearly every task. It loads in every session, so keep it under about 5 KB.
- **A topic file in `standards/`:** Rules for one kind of work. Each file is read only when its trigger in **Read Before You Work** matches the task. Keep each under about 5 KB and split it by task when it grows past that.
- **A new topic file:** Only for a distinct kind of task, and always with a new trigger line in `AGENTS.md`.
- **`.eslint/README.md`:** Reasoning behind ESLint rule decisions, never the rules themselves.
- **Project Notes in a project's `AGENTS.md`:** Facts about one project, such as file paths, breakpoints, and approved exceptions. Never put these in the shared standards.

## What Earns a Line

- **Ask whether an AI would act differently without it.** Include organization-specific choices and fixes for mistakes AI actually makes. Leave out general good practice that AI already follows.
- **Skip what tools enforce.** If ESLint, editor settings, or `.gitattributes` catch it, the standards only need to say to run the check.
- **Give each rule one home.** Never repeat a rule across files; if two topics share it, move it to `AGENTS.md`.
- **Remove rules when they become obsolete,** such as when a linter starts enforcing them or the practice changes.

## How to Write It

- **Start with a bold rule, then add one or two sentences.** Explain why only when the reason prevents misapplying the rule.
- **Add a code example only when the pattern is not obvious,** and keep it short. One example teaches more than a paragraph.
- **Follow the writing rules in `standards/ui.md`,** including title case for headings and a capital letter after colons.
- **Keep everything in these files.** Do not move rules into tool-specific folders, and do not add `@` imports to `CLAUDE.md`, because imports load every file up front.
