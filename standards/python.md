# Python Standards

- **Use the newest stable Python installed.** Do not create virtual environments with `venv`, `virtualenv`, or similar tools unless asked.
- **Let Ruff enforce style.** It formats code, sorts imports, and checks naming and mutable default arguments using `pyproject.toml`. Ruff runs from the `charliermarsh.ruff` VS Code extension on save, so a `ruff` command may not exist; if it does not, say fixes are pending a save instead of claiming they ran.
- **Disable a Ruff rule only where it makes the code worse.** Use `# noqa: <code>  # <reason>` on the affected line, never a file-wide or project-wide exception.
- **Annotate public functions, methods, and attributes.** Use built-in generics and union syntax, such as `list[str]` and `User | None`, instead of `typing.List` or `Optional`.
- **Write meaningful Google-style docstrings.** Document public modules, classes, and functions when it clarifies purpose, side effects, raised exceptions, or parameter constraints. Skip docstrings that restate the code.
- **Test with pytest.** Run tests with `python -m pytest`.
