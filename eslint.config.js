import Css from '@eslint/css';
import Json from '@eslint/json';
import Html from '@html-eslint/eslint-plugin';
import HtmlParser from '@html-eslint/parser';
import Stylistic from '@stylistic/eslint-plugin';
import Perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';

import CaboodlePlugin from './.eslint/caboodle/index.js';
import CssRules from './.eslint/css-rules.js';
import Globals from './.eslint/globals.min.json' with { type: 'json' };
import HtmlRules from './.eslint/html-rules.js';
import JsRules from './.eslint/js-rules.js';
import JsonRules from './.eslint/json-rules.js';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...Globals.browser,
                ...Globals.nodeBuiltin
            },
            sourceType: 'module'
        },
        plugins: {
            '@stylistic': Stylistic,
            caboodle: CaboodlePlugin,
            perfectionist: Perfectionist
        },
        rules: {
            ...JsRules,
            'caboodle/jsdoc-block-comments': 'error'
        }
    },
    {
        files: ['**/*.{json,jsonc}'],
        language: 'json/json',
        plugins: {
            json: Json
        },
        rules: JsonRules
    },
    {
        files: ['**/*.html'],
        languageOptions: {
            parser: HtmlParser
        },
        plugins: {
            '@html-eslint': Html,
            caboodle: CaboodlePlugin
        },
        rules: {
            ...HtmlRules,
            'caboodle/html-lowercase': 'error'
        }
    },
    {
        files: ['**/*.css'],
        language: 'css/css',
        plugins: {
            css: Css
        },
        rules: CssRules
    }
]);
