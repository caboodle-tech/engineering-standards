/**
 * Adapted from ESLint's complexity rule.
 * Copyright OpenJS Foundation and other contributors, <www.openjsf.org>. MIT License.
 */

const ACCESSOR_WORDS = new Map([['get', 'getter'], ['set', 'setter']]);

// `??=` is a fallback, so only these two logical assignments count as branches.
const BRANCHING_ASSIGNMENTS = new Set(['&&=', '||=']);

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
 * Cyclomatic complexity like the core rule's classic variant, except fallbacks do not count: `?.`, `??`, `??=`, and
 * default parameter values. A reader takes `usage?.runs ?? 0` as one safe read, not a decision to trace. `if`, `?:`,
 * loops, `case`, `catch`, `&&`, `||`, `&&=`, and `||=` still count. Only functions are reported.
 */
export default {
    create(context) {
        const { sourceCode } = context;
        const max = context.options[0]?.max ?? 20;
        // One count per code path: the program, each function, class field initializers, and static blocks.
        const complexities = [];

        const increase = () => {
            complexities[complexities.length - 1] += 1;
        };

        return {
            AssignmentExpression(node) {
                if (BRANCHING_ASSIGNMENTS.has(node.operator)) {
                    increase();
                }
            },
            CatchClause: increase,
            ConditionalExpression: increase,
            DoWhileStatement: increase,
            ForInStatement: increase,
            ForOfStatement: increase,
            ForStatement: increase,
            IfStatement: increase,
            LogicalExpression(node) {
                if (node.operator !== '??') {
                    increase();
                }
            },
            onCodePathEnd(codePath, node) {
                const complexity = complexities.pop();

                if (codePath.origin === 'function' && complexity > max) {
                    context.report({
                        data: { complexity, max, name: describeFunction(node) },
                        loc: headLocation(node, sourceCode),
                        messageId: 'complex',
                        node
                    });
                }
            },
            onCodePathStart() {
                complexities.push(1);
            },
            'SwitchCase[test]': increase,
            WhileStatement: increase
        };
    },
    meta: {
        docs: {
            description: 'enforce a maximum cyclomatic complexity, not counting ?., ??, ??=, or default values'
        },
        messages: {
            complex: '{{name}} has a complexity of {{complexity}}. Maximum allowed is {{max}}.'
        },
        schema: [
            {
                additionalProperties: false,
                properties: { max: { minimum: 0, type: 'integer' } },
                type: 'object'
            }
        ],
        type: 'suggestion'
    }
};
