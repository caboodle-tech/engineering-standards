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

## Adding a Topic File

1. **Read the tool configs first,** such as `eslint.config.js` or `pyproject.toml`, and list what they already enforce. Those rules stay out.
2. **Read `AGENTS.md` and the existing topic files.** Drop anything they already say, such as indentation, naming, or control flow.
3. **Match the shape of `standards/javascript.md`:** A flat list of a handful of bold rules. A first draft over about 2 KB usually still holds general advice.
4. **Put shared tool setup in the topic file,** such as how a formatter runs. Project Notes are only for facts about one project, and `AGENTS.md` loads in every session.
5. **Write rules an AI can act on.** Avoid hedges like "use judgment" and steps only a person can do, such as pressing a key; say what the AI should do or report instead.
6. **Add the trigger line to Read Before You Work** in `AGENTS.md`, then check file sizes with `wc -c`.

## How to Write It

- **Start with a bold rule, then add one or two sentences.** Explain why only when the reason prevents misapplying the rule.
- **Add a code example only when the pattern is not obvious,** and keep it short. One example teaches more than a paragraph.
- **Follow the writing rules in `standards/ui.md`,** including title case for headings and a capital letter after colons.
- **Keep everything in these files.** Do not move rules into tool-specific folders, and do not add `@` imports to `CLAUDE.md`, because imports load every file up front.
