import Stylistic from '@stylistic/eslint-plugin';

const MultilineCommentStyle = Stylistic.rules['multiline-comment-style'];

/**
 * The @stylistic rule, except `/*!` comments (licenses and other text meant to be kept as written) are never
 * reported or rewritten. Its 'starred-block' style has no option for that, so reports that start on a `/*!`
 * comment are dropped before they reach ESLint.
 */
export default {
    create(context) {
        const { sourceCode } = context;

        // True when a report starts anywhere inside a `/*!` comment (the rule reports from inside, such as after `/*`).
        const isExclamationAt = (loc) => {
            return sourceCode.getAllComments().some((comment) => {
                const { end, start } = comment.loc;
                const afterStart = loc.start.line > start.line
                    || (loc.start.line === start.line && loc.start.column >= start.column);
                const beforeEnd = loc.start.line < end.line
                    || (loc.start.line === end.line && loc.start.column <= end.column);

                return comment.type === 'Block' && comment.value.startsWith('!') && afterStart && beforeEnd;
            });
        };

        const filtered = Object.create(context, {
            report: {
                value: (descriptor) => {
                    const loc = descriptor.loc ?? descriptor.node?.loc;

                    if (!loc || !isExclamationAt(loc)) {
                        context.report(descriptor);
                    }
                }
            }
        });

        return MultilineCommentStyle.create(filtered);
    },
    meta: {
        ...MultilineCommentStyle.meta,
        docs: {
            description: 'enforce a style for multi-line comments, leaving /*! comments as written'
        }
    }
};
