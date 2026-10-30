/**
 * Adapted from ESLint's max-statements rule.
 * Copyright OpenJS Foundation and other contributors, <www.openjsf.org>. MIT License.
 */

const FUNCTION_TYPES = new Set(['ArrowFunctionExpression', 'FunctionExpression']);
const ACCESSOR_WORDS = new Map([['get', 'getter'], ['set', 'setter']]);

// `const helper = () => { ... };` only names a step; the helper's own statements are counted on their own.
const isHelperDefinition = (statement) => {
    return statement.type === 'VariableDeclaration' && statement.declarations.every((declarator) => {
        return FUNCTION_TYPES.has(declarator.init?.type);
    });
};

// A function written as an object or class member is reported by its key, as a method.
const MEMBER_PARENTS = new Set(['MethodDefinition', 'Property', 'PropertyDefinition']);

const isMethod = (node) => {
    return MEMBER_PARENTS.has(node.parent.type);
};

/** "Async arrow function", "Function 'save'", "Method 'render'": the core rule's wording for the functions here. */
const describeFunction = (node) => {
    if (isMethod(node) && node.parent.kind === 'constructor') {
        return 'Constructor';
    }
    const words = [];

    if (node.async) {
        words.push('async');
    }
    if (node.generator) {
        words.push('generator');
    }
    if (isMethod(node)) {
        words.push(ACCESSOR_WORDS.get(node.parent.kind) ?? 'method');
    } else {
        words.push(node.type === 'ArrowFunctionExpression' ? 'arrow function' : 'function');
    }
    const name = isMethod(node) ? node.parent.key.name ?? node.parent.key.value : node.id?.name;

    if (name) {
        words.push(`'${name}'`);
    }
    const text = words.join(' ');

    return `${text[0].toUpperCase()}${text.slice(1)}`;
};

const isOpenParen = (token) => {
    return token.value === '(' && token.type === 'Punctuator';
};

/** Where the parameters start: their `(`, or the lone parameter of an arrow function written without one. */
const paramsStart = (node, sourceCode) => {
    if (node.type === 'ArrowFunctionExpression' && node.params.length === 1) {
        const param = sourceCode.getFirstToken(node.params[0]);
        const before = sourceCode.getTokenBefore(param);

        return isOpenParen(before) && node.range[0] <= before.range[0] ? before : param;
    }

    return node.id ? sourceCode.getTokenAfter(node.id, isOpenParen) : sourceCode.getFirstToken(node, isOpenParen);
};

/** Underlines a member from its key, an arrow function's `=>`, or a function's head up to its parameters. */
const headLocation = (node, sourceCode) => {
    if (isMethod(node)) {
        return { end: paramsStart(node, sourceCode).loc.start, start: node.parent.loc.start };
    }
    if (node.type === 'ArrowFunctionExpression') {
        return sourceCode.getTokenBefore(node.body, (token) => {
            return token.value === '=>';
        }).loc;
    }

    return { end: paramsStart(node, sourceCode).loc.start, start: node.loc.start };
};

/**
 * Like the core rule, a function's statements include those in its nested blocks but not in nested functions.
 * Unlike it, a statement that only defines a helper function is not counted, so a setup function made of small
 * named steps is not flagged for the style that keeps it readable.
 */
export default {
    create(context) {
        const { sourceCode } = context;
        const max = context.options[0] ?? 10;
        const counts = [];

        const startFunction = () => {
            counts.push(0);
        };

        const endFunction = (node) => {
            const count = counts.pop();

            // Class static blocks are tracked only so their statements do not count toward the enclosing function.
            if (node.type !== 'StaticBlock' && count > max) {
                context.report({
                    data: { count, max, name: describeFunction(node) },
                    loc: headLocation(node, sourceCode),
                    messageId: 'exceed',
                    node
                });
            }
        };

        return {
            ArrowFunctionExpression: startFunction,
            'ArrowFunctionExpression:exit': endFunction,
            BlockStatement(node) {
                if (counts.length) {
                    counts[counts.length - 1] += node.body.filter((statement) => {
                        return !isHelperDefinition(statement);
                    }).length;
                }
            },
            FunctionDeclaration: startFunction,
            'FunctionDeclaration:exit': endFunction,
            FunctionExpression: startFunction,
            'FunctionExpression:exit': endFunction,
            StaticBlock: startFunction,
            'StaticBlock:exit': endFunction
        };
    },
    meta: {
        docs: {
            description: 'enforce a maximum number of statements in a function, not counting helper definitions'
        },
        messages: {
            exceed: '{{name}} has too many statements ({{count}}). Maximum allowed is {{max}}.'
        },
        schema: [{ minimum: 0, type: 'integer' }],
        type: 'suggestion'
    }
};
