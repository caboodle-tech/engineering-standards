import Complexity from './complexity.js';
import HtmlLowercase from './html-lowercase.js';
import ImportComments from './import-comments.js';
import JsdocBlockComments from './jsdoc-block-comments.js';
import MaxStatements from './max-statements.js';
import MultilineCommentStyle from './multiline-comment-style.js';
import NamedCaptureReads from './named-capture-reads.js';
import SingleLineBlockComments from './single-line-block-comments.js';

export default {
    rules: {
        complexity: Complexity,
        'html-lowercase': HtmlLowercase,
        'import-comments': ImportComments,
        'jsdoc-block-comments': JsdocBlockComments,
        'max-statements': MaxStatements,
        'multiline-comment-style': MultilineCommentStyle,
        'named-capture-reads': NamedCaptureReads,
        'single-line-block-comments': SingleLineBlockComments
    }
};
