# CSS Standards

## Native CSS First

- **Do in CSS what once required JavaScript.** Reach for modern native features before scripting: `:has()` for state-driven styling (including theme toggles built from radio inputs), container queries, `<details>`, `<dialog>`, the popover API, `@starting-style`, and `transition-behavior: allow-discrete` for animating elements in and out.
- **Reserve JavaScript for real behavior.** Use it for application logic, persistence, and interactions CSS cannot reasonably provide.
- **Check Baseline status** before relying on a newer feature, and make sure the page still works where it is unsupported.

## Architecture

- **Use cascade layers.** Declare `@layer tokens, base, layout, components, utilities;` in `main.css`, which is the only file that imports the others. Each layer has a matching folder, and page-specific styles go in the `components` layer.
- **Fix styles at their source.** Avoid stacking increasingly specific selectors or competing declarations, and remove obsolete rules when replacing functionality.

## Nesting and Naming

- **Use native nesting.** Nest pseudo-classes, modifiers, children, and conditional rules under their owning selector without creating deep or overly specific selectors.
- **Use short kebab-case class names** that describe the element, role, or behavior. Never use BEM (`block__element`, `block--modifier`) or redundant prefixes; nest short child names under the parent instead.
- **Separate state from identity.** Express states and variants with separate classes or attributes, not new component names.
- **Prefer semantic elements** over wrapper elements and classes.

## Design Tokens

- **Use tokens for every design value:** Colors, typography, spacing, sizing, radii, shadows, and transitions. Define them in the `tokens` layer only.
- **Name tokens in kebab-case by category:** `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`. No camelCase, no component-specific aliases that duplicate an existing token, and no leftover aliases kept for old references.
- **Choose units intentionally.** Use `rem` for typography and values that should scale with text, and `px` for fixed dimensions and layout constraints.

## Color and Theming

- **Theme with `light-dark()` only.** Define each theme-aware color once in the token files. A theme switch, whether from the operating system or a user toggle, sets only `color-scheme`; never repeat token values in dark-mode media queries or `:has()` theme selectors.
- **Keep the palette small and role-based.** Name colors for their job, such as `paper`, `surface`, `ink`, `muted`, `line`, `brand`, and `on-brand` for text on a brand fill, not for a component.
- **Derive variations with `color-mix()`.** Build tints, hovers, and subtle borders from palette colors instead of adding tokens. Mix toward `transparent` or a surface color. Prefer `oklab`; `srgb` is acceptable.
- **Pick dark values directly.** Choose them by hand or with a simple `color-mix()`. Use relative-color math such as `oklch(from …)` only when the design truly needs it.
- **Theme non-color values through a color token.** `light-dark()` accepts only colors, so give shadows and similar values a themed color token rather than redefining them per theme.
- **Keep literal colors in token files.** Components reference tokens and never contain hex values, `rgb()`, or theme checks.
- **Meet WCAG AA contrast** in both themes.

```css
:root {
    color-scheme: light dark;
    --color-paper: light-dark(#fdfaf4, #19222f);
    --color-ink: light-dark(#1d252d, #d9dfe5);
    --color-link: light-dark(#0069b6, #5c9fe1);
    --shadow-color: light-dark(rgb(10 20 35 / 0.14), rgb(0 0 0 / 0.45));

    &:has(input[name="theme"][value="light"]:checked) {
        color-scheme: light;
    }

    &:has(input[name="theme"][value="dark"]:checked) {
        color-scheme: dark;
    }
}

.card .icon {
    background: color-mix(in oklab, var(--color-link) 12%, transparent);
    color: var(--color-link);
}
```

## Responsive Design

- **Design mobile-first.** Start with the small-viewport layout and enhance upward with `min-width` queries only, written in range syntax such as `@media (width >= 768px)`.
- **Use `px` for breakpoints** and the project's breakpoint list from Project Notes. Custom properties cannot be used inside media queries, so do not define breakpoint tokens.
- **Let content drive layout.** Prefer grid, flexbox, `clamp()`, and container queries over fixed dimensions, and keep text and controls usable at every size.
