const MATCH_METHODS = new Set(['exec', 'match']);

const unwrap = (node) => {
    return node?.type === 'ChainExpression' ? node.expression : node;
};

const isMethodCall = (node, methods) => {
    const call = unwrap(node);

    return call?.type === 'CallExpression'
        && call.callee.type === 'MemberExpression'
        && !call.callee.computed
        && methods.has(call.callee.property.name);
};

const isGroupIndex = (node) => {
    return node.type === 'MemberExpression'
        && node.computed
        && node.property.type === 'Literal'
        && Number.isInteger(node.property.value)
        && node.property.value > 0;
};

// `const [, first] = match` skips the whole match and takes groups by position.
const readsGroupsByPosition = (pattern) => {
    return pattern?.type === 'ArrayPattern' && pattern.elements.slice(1).some(Boolean);
};

/**
 * Reading a capture group by number (`match[2]`, `const [, a, b] = match`) makes the reader count parentheses in the
 * pattern, so those reads must use a named group and `.groups` instead. Numbered groups stay allowed where the code
 * already says what each one is: replace callbacks with named parameters, `$1` replacements, and backreferences.
 */
export default {
    create(context) {
        const { sourceCode } = context;
        const reported = new Set();

        const report = (node) => {
            if (!reported.has(node)) {
                reported.add(node);
                context.report({ messageId: 'named', node });
            }
        };

        const findVariable = (identifier) => {
            for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
                const variable = scope.set.get(identifier.name);

                if (variable) {
                    return variable;
                }
            }

            return null;
        };

        // Every later read of a variable that holds a match result.
        const checkMatchVariable = (identifier) => {
            const variable = findVariable(identifier);

            for (const reference of variable?.references ?? []) {
                const { parent } = reference.identifier;

                if (isGroupIndex(parent) && parent.object === reference.identifier) {
                    report(parent);
                }

                if (parent.type === 'VariableDeclarator' && parent.init === reference.identifier) {
                    if (readsGroupsByPosition(parent.id)) {
                        report(parent.id);
                    }
                }
            }
        };

        return {
            AssignmentExpression(node) {
                if (node.left.type === 'Identifier' && isMethodCall(node.right, MATCH_METHODS)) {
                    checkMatchVariable(node.left);
                }
            },
            ForOfStatement(node) {
                if (!isMethodCall(node.right, new Set(['matchAll'])) || node.left.type !== 'VariableDeclaration') {
                    return;
                }

                const [{ id }] = node.left.declarations;

                if (id.type === 'Identifier') {
                    checkMatchVariable(id);
                } else if (readsGroupsByPosition(id)) {
                    report(id);
                }
            },
            MemberExpression(node) {
                if (isGroupIndex(node) && isMethodCall(node.object, MATCH_METHODS)) {
                    report(node);
                }
            },
            VariableDeclarator(node) {
                if (!isMethodCall(node.init, MATCH_METHODS)) {
                    return;
                }

                if (node.id.type === 'Identifier') {
                    checkMatchVariable(node.id);
                } else if (readsGroupsByPosition(node.id)) {
                    report(node.id);
                }
            }
        };
    },
    meta: {
        docs: {
            description: 'require named capture groups when a match result is read by group number'
        },
        messages: {
            named: 'Name this capture group, such as (?<id>...), and read it from match.groups instead of by number.'
        },
        schema: [],
        type: 'suggestion'
    }
};
