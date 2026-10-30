const REGEX = {
    directive: /^\s*(?:eslint|global|globals|exported)\b/u,
    notesHeading: /^\s*\*\s*Import notes:/mu,
    starPrefix: /^\s*\*?\s?/u,
    trailingEmptyLines: /(?:\n\s*\*\s*)+$/u
};

const NOTES_HEADING = 'Import notes:';
const NOTE_LABEL = /\[(?<label>[A-Z]+)\]/gu;

// The nodes a moved comment can describe; each one keeps its marker when perfectionist sorts it.
const MARKED_TYPES = new Set([
    'ImportAttribute',
    'ImportDeclaration',
    'ImportDefaultSpecifier',
    'ImportNamespaceSpecifier',
    'ImportSpecifier'
]);

const FIRST_LETTER = 'A'.codePointAt(0);
const LETTER_COUNT = 26;

// A, B, ... Z, then AA, AB, ...
const toLabel = (index) => {
    const letter = String.fromCodePoint(FIRST_LETTER + (index % LETTER_COUNT));

    if (index < LETTER_COUNT) {
        return letter;
    }

    return `${toLabel(Math.floor(index / LETTER_COUNT) - 1)}${letter}`;
};

// The comment's text without its markers, with leading and trailing empty lines dropped.
const toNoteLines = (comment) => {
    if (comment.type === 'Line') {
        return [comment.value.trim()];
    }

    const lines = comment.value.split('\n').map((line) => {
        return line.replace(REGEX.starPrefix, '').trimEnd();
    });
    const first = lines.findIndex(Boolean);
    const last = lines.findLastIndex(Boolean);

    return lines.slice(first, last + 1);
};

const formatNote = (label, lines) => {
    const indent = ' '.repeat(label.length + 3);

    return lines.map((line, index) => {
        if (index === 0) {
            return ` * [${label}] ${line}`;
        }

        return line ? ` * ${indent}${line}` : ' *';
    }).join('\n');
};

/**
 * The perfectionist/sort-imports rule moves a comment with the import below it, and
 * @stylistic/lines-around-comment then wants a blank line above it that the sort removes again, so fixing never
 * settles. This rule leaves no comment on its own line between imports: each one moves into the file header's
 * "Import notes:" list, and a `// [A]` marker at the end of the import it described travels with that import when it
 * is sorted. sort-imports uses partitionByComment so the header, the only comment left above the imports, is never
 * moved.
 */
export default {
    create(context) {
        const { sourceCode } = context;

        const isOwnLine = (comment) => {
            const before = sourceCode.getTokenBefore(comment, { includeComments: true });

            return !before || before.loc.end.line < comment.loc.start.line;
        };

        const findDescribedNode = (comment) => {
            const next = sourceCode.getTokenAfter(comment);
            let node = next && sourceCode.getNodeByRangeIndex(next.range[0]);

            while (node && !MARKED_TYPES.has(node.type)) {
                node = node.parent;
            }

            return node;
        };

        // The marker goes at the end of a trailing `//` comment, or else right after the node and its comma.
        const findMarkerSpot = (node) => {
            let anchor = sourceCode.getLastToken(node);
            const comma = sourceCode.getTokenAfter(anchor);

            if (comma?.value === ',' && comma.loc.start.line === anchor.loc.end.line) {
                anchor = comma;
            }

            const after = sourceCode.getTokenAfter(anchor, { includeComments: true });
            const sameLine = after?.loc.start.line === anchor.loc.end.line;

            if (sameLine && after.type === 'Line') {
                return { offset: after.range[1], style: 'append' };
            }

            // A `//` marker would comment out the code that follows on the same line.
            return { offset: anchor.range[1], style: sameLine ? 'block' : 'line' };
        };

        const removalRange = (comment) => {
            const next = sourceCode.getTokenAfter(comment, { includeComments: true });

            if (next?.loc.start.line === comment.loc.end.line) {
                return [comment.range[0], next.range[0]];
            }

            const lineStart = comment.range[0] - comment.loc.start.column;
            const lineEnd = sourceCode.text.indexOf('\n', comment.range[1]);

            return [lineStart, lineEnd === -1 ? comment.range[1] : lineEnd + 1];
        };

        const buildHeader = (header, notes) => {
            if (header.loc.start.line === header.loc.end.line) {
                const summary = header.value.replace(REGEX.starPrefix, '').trim();

                return `/**\n * ${summary}\n *\n * ${NOTES_HEADING}\n${notes}\n */`;
            }

            const text = sourceCode.getText(header);
            const body = text.slice(0, text.lastIndexOf('*/')).trimEnd().replace(REGEX.trailingEmptyLines, '');

            if (REGEX.notesHeading.test(header.value)) {
                return `${body}\n${notes}\n */`;
            }

            return `${body}\n *\n * ${NOTES_HEADING}\n${notes}\n */`;
        };

        return {
            Program(program) {
                const imports = program.body.filter((node) => {
                    return node.type === 'ImportDeclaration';
                });

                if (imports.length === 0) {
                    return;
                }

                const firstImport = imports[0];
                const lastImport = imports.at(-1);

                const notes = sourceCode.getAllComments().filter((comment) => {
                    return comment.range[0] > firstImport.range[0]
                        && comment.range[1] < lastImport.range[1]
                        && !REGEX.directive.test(comment.value)
                        && isOwnLine(comment)
                        && findDescribedNode(comment);
                });

                if (notes.length === 0) {
                    return;
                }

                const header = sourceCode.getCommentsBefore(firstImport).at(-1);
                const hasHeader = header?.type === 'Block'
                    && !header.value.startsWith('!')
                    && !REGEX.directive.test(header.value);

                const fix = (fixer) => {
                    /**
                     * Without a header, add an empty one first. Its fix ends where the imports start, so ESLint applies
                     * it before any sort; the next pass then moves the notes in before the imports can be reordered.
                     */
                    if (!hasHeader) {
                        return fixer.insertTextBefore(firstImport, `/**\n * ${NOTES_HEADING}\n */\n`);
                    }

                    const usedLabels = new Set();

                    for (const comment of sourceCode.getAllComments()) {
                        for (const match of comment.value.matchAll(NOTE_LABEL)) {
                            usedLabels.add(match.groups.label);
                        }
                    }

                    let labelIndex = 0;

                    const nextLabel = () => {
                        while (usedLabels.has(toLabel(labelIndex))) {
                            labelIndex += 1;
                        }

                        usedLabels.add(toLabel(labelIndex));

                        return toLabel(labelIndex);
                    };

                    const markers = new Map();
                    const formattedNotes = [];
                    const fixes = [];

                    for (const comment of notes) {
                        const label = nextLabel();
                        const spot = findMarkerSpot(findDescribedNode(comment));
                        const marker = markers.get(spot.offset) ?? { ...spot, labels: [] };

                        marker.labels.push(`[${label}]`);
                        markers.set(spot.offset, marker);
                        formattedNotes.push(formatNote(label, toNoteLines(comment)));
                        fixes.push(fixer.removeRange(removalRange(comment)));
                    }

                    fixes.push(fixer.replaceText(header, buildHeader(header, formattedNotes.join('\n'))));

                    for (const { labels, offset, style } of markers.values()) {
                        const text = {
                            append: ` ${labels.join(' ')}`,
                            block: ` /* ${labels.join(' ')} */`,
                            line: ` // ${labels.join(' ')}`
                        }[style];

                        fixes.push(fixer.insertTextAfterRange([offset, offset], text));
                    }

                    return fixes;
                };

                // One fix moves every note, so it rides on the first report only.
                for (const [index, comment] of notes.entries()) {
                    context.report({
                        fix: index === 0 ? fix : null,
                        loc: comment.loc,
                        messageId: 'note'
                    });
                }
            }
        };
    },
    meta: {
        docs: {
            description: 'move comments between imports into the file header so sorting imports cannot move them'
        },
        fixable: 'code',
        messages: {
            note: 'Move this comment into the file header\'s import notes and mark its import with a // [A] label.'
        },
        schema: [],
        type: 'layout'
    }
};
