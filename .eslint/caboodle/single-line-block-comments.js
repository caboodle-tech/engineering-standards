const DIRECTIVE = /^\s*(?:eslint|global|globals|exported)\b/u;
// A section divider starts and ends with three or more of the same -, =, _, or ~, such as `/* ----- Save ----- */`.
const DIVIDER = /^(?<mark>[-=_~])\k<mark>{2,}(?:.*(?:-{3}|={3}|_{3}|~{3}))?$/u;

// Fits the words of a comment into lines no wider than `width`; a word longer than that gets its own line.
const wrapWords = (text, width) => {
    const lines = [];
    let line = '';

    for (const word of text.split(/\s+/u)) {
        if (line && line.length + 1 + word.length > width) {
            lines.push(line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }
    lines.push(line);

    return lines;
};

/**
 * A one-line `/* ... *\/` comment becomes `// ...` when it fits within the line length, or a wrapped `/** ... *\/`
 * block when it does not. A comment at the end of a code line stays there as `//` when it fits; otherwise it moves
 * above that line. Left alone: JSDoc (`/** ... *\/`), `/*!` comments, eslint and global directives, section dividers,
 * and comments with code after them on the same line, where `//` would comment out the code.
 */
export default {
    create(context) {
        const { sourceCode } = context;
        const max = context.options[0]?.max ?? 120;

        // The comment as it should read on its own line at `indent`: `// text` if it fits, else a wrapped block.
        const ownLineText = (text, indent) => {
            if (indent.length + 3 + text.length <= max) {
                return { kind: 'line', text: `// ${text}` };
            }
            const lines = wrapWords(text, max - indent.length - 3).map((line) => {
                return `${indent} * ${line}`;
            });

            return { kind: 'block', text: `/**\n${lines.join('\n')}\n${indent} */` };
        };

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    const text = comment.value.trim();

                    if (comment.type !== 'Block' || comment.loc.start.line !== comment.loc.end.line || !text) {
                        continue;
                    }
                    if (comment.value.startsWith('*') || comment.value.startsWith('!') || DIRECTIVE.test(comment.value)
                        || DIVIDER.test(text)) {
                        continue;
                    }
                    const after = sourceCode.getTokenAfter(comment, { includeComments: true });

                    if (after && after.loc.start.line === comment.loc.end.line) {
                        continue;
                    }
                    const before = sourceCode.getTokenBefore(comment, { includeComments: true });
                    const lineText = sourceCode.lines[comment.loc.start.line - 1];
                    const indent = lineText.match(/^\s*/u)[0];
                    const lineStart = comment.range[0] - comment.loc.start.column;

                    if (!before || before.loc.end.line < comment.loc.start.line) {
                        const replacement = ownLineText(text, indent);

                        context.report({
                            fix: (fixer) => {
                                return fixer.replaceText(comment, replacement.text);
                            },
                            loc: comment.loc,
                            messageId: replacement.kind
                        });
                        continue;
                    }
                    const trailing = `${lineText.slice(0, before.loc.end.column)} // ${text}`;

                    if (trailing.length <= max) {
                        context.report({
                            fix: (fixer) => {
                                return fixer.replaceTextRange([before.range[1], comment.range[1]], ` // ${text}`);
                            },
                            loc: comment.loc,
                            messageId: 'line'
                        });
                        continue;
                    }
                    const above = ownLineText(text, indent);

                    context.report({
                        fix: (fixer) => {
                            return [
                                fixer.insertTextBeforeRange([lineStart, lineStart], `${indent}${above.text}\n`),
                                fixer.removeRange([before.range[1], comment.range[1]])
                            ];
                        },
                        loc: comment.loc,
                        messageId: 'moved'
                    });
                }
            }
        };
    },
    meta: {
        docs: {
            description: 'write one-line comments with //, and long ones as a wrapped /** */ block'
        },
        fixable: 'code',
        messages: {
            block: 'This comment is too long for one line; write it as a /** */ block.',
            line: 'Use // for a one-line comment.',
            moved: 'This comment makes the line too long; move it above the line.'
        },
        schema: [
            {
                additionalProperties: false,
                properties: { max: { minimum: 1, type: 'integer' } },
                type: 'object'
            }
        ],
        type: 'layout'
    }
};
