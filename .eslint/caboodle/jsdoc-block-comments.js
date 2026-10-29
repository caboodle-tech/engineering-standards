const DIRECTIVE = /^\s*(?:eslint|global|globals|exported)\b/u;

export default {
    create(context) {
        const { sourceCode } = context;

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    if (comment.type !== 'Block' || comment.loc.start.line === comment.loc.end.line) {
                        continue;
                    }

                    if (comment.value.startsWith('*') || comment.value.startsWith('!') || DIRECTIVE.test(comment.value)) {
                        continue;
                    }

                    context.report({
                        fix: (fixer) => {
                            return fixer.insertTextAfterRange([comment.range[0], comment.range[0] + 2], '*');
                        },
                        loc: comment.loc,
                        messageId: 'jsdoc'
                    });
                }
            }
        };
    },
    meta: {
        docs: {
            description: 'require multi-line block comments to use JSDoc-style /** openings'
        },
        fixable: 'code',
        messages: {
            jsdoc: 'Start multi-line block comments with /** instead of /*.'
        },
        schema: [],
        type: 'layout'
    }
};
