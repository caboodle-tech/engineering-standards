# JavaScript Standards

- **Use ECMAScript modules.** Use `import` and `export`, not `require` and `module.exports`, unless compatibility requires otherwise.
- **Prefer arrow functions.** Always use parentheses around parameters and braces around bodies; no implicit returns such as `x => x` or `() => value`.
- **Write meaningful JSDoc.** Document classes, exported functions, and significant APIs when it clarifies purpose, parameters, return values, side effects, or contracts. Skip documentation that restates the code.
- **Order declarations predictably.** Place file-level constants and shared state before functions. In classes, place properties before the constructor, following the ESLint ordering rules. Keep local values in the smallest practical scope.
- **Centralize regular expressions.** Define every pattern in a file-level `REGEX` object with descriptive names, even when used once. Share patterns across files only when their meaning is identical.

```js
const REGEX = {
    trailingSlash: /\/$/,
    whitespaceRun: /\s+/g
};

const normalizePath = (path) => {
    return path.replace(REGEX.trailingSlash, '');
};
```
