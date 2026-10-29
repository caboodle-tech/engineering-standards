# Engineering Standards

Caboodle Tech's shared engineering standards: how we write, lint, style, and organize code, written for both people and AI assistants. Copy them into a project so every person and AI working on it follows the same rules.

These are Caboodle Tech's opinionated views and the rules our organization follows, such as favoring native HTML and CSS over JavaScript. This repository is maintained by Caboodle Tech only, and we do not accept outside changes to it. Other teams are welcome to adapt anything here in their own projects.

## What's Inside

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Rules for every task, plus a list of which topic file to read for which kind of work. Codex reads it directly. |
| `CLAUDE.md` | Points Claude Code to `AGENTS.md`. |
| `standards/` | Topic standards for CSS, UI and writing, JavaScript, and handoffs between AI sessions. AI reads these only when a task calls for them. |
| `standards/README.md` | How to maintain the standards while keeping them short enough for AI to read cheaply. |
| `eslint.config.js`, `.eslint/` | ESLint configuration for JavaScript, JSON, HTML, and CSS. `.eslint/README.md` explains the reasoning behind rule decisions. |
| `.gitattributes`, `.vscode/` | Line endings and editor settings that match the standards. |

## How the Standards Stay Small

AI assistants load `AGENTS.md` at the start of every session, so it holds only the rules that apply to nearly every task. Everything else lives in topic files that are read only when needed. A CSS change reads `standards/css.md`, while a Python fix reads none of them.

## Using These in a Project

1. Copy `AGENTS.md`, `CLAUDE.md`, `standards/`, `.eslint/`, `eslint.config.js`, `.gitattributes`, and optionally `.vscode/` into the project.
2. Add the `devDependencies` and `lint` scripts from `package.json`, then run `pnpm install`.
3. Fill in the **Project Notes** section at the bottom of `AGENTS.md` with facts about that project, such as token file locations and breakpoints.

Once copied, the files belong to your project. Keep, change, or drop whatever you like.

## License

[MIT](LICENSE) © Caboodle Tech Inc.
