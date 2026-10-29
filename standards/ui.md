# UI and Writing Standards

## Interface Design

- **Reuse existing UI patterns.** Before creating a component or style, inspect the project's components and design system. Similar actions, controls, tables, and dialogs should look and behave the same everywhere.
- **Prefer native HTML.** Use semantic elements and built-in browser behavior before custom components or JavaScript-driven alternatives.
- **Design for the content.** Size fields, buttons, dialogs, and layouts for their purpose; avoid stretched controls and wasted space.
- **Respect visual hierarchy.** Group related elements, keep spacing consistent, and place controls near what they affect.
- **Keep data presentation consistent.** Use consistent labels, formatting, sorting, filtering, and empty states. Make dense information scannable without hiding essentials.
- **Cover every state.** Consider empty, single-item, multiple-item, error, and boundary states.

## Accessibility and Validation

- **Design for accessibility.** Provide readable text, meaningful labels, keyboard navigation, visible focus states, sufficient contrast, and layouts that work at every screen size.
- **Validate without surprising users.** Check related inputs and business constraints, give actionable errors, and never silently change submitted values to make them valid.
- **Verify the experience.** Check affected layouts, interactions, responsiveness, and accessibility when practical, and report what was and was not verified.

## User-Facing Writing

- **Use modified Chicago-style title case** for page titles, headings, and named UI sections. Capitalize the first and last words and all major words; lowercase only articles, coordinating conjunctions, and short prepositions in the middle. When in doubt, capitalize.
- **Capitalize after colons** in all user-facing text, including titles, labels, and prose.
- **Use sentence case for prose.** Write clear, complete, human sentences, not fragments or robotic phrasing.
- **Preserve established capitalization** for proper nouns, product names, brands, and acronyms.
- **Exclude literal syntax.** These rules do not apply to code, identifiers, URLs, or other text where capitalization has technical meaning.
