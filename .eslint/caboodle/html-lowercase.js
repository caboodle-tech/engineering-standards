import Html from '@html-eslint/eslint-plugin';

const Lowercase = Html.rules.lowercase;

export default {
    create(context) {
        const visitors = Lowercase.create(context);

        delete visitors.Doctype;

        return visitors;
    },
    meta: {
        ...Lowercase.meta,
        docs: {
            description: 'enforce lowercase tag and attribute names, allowing <!DOCTYPE html>'
        }
    }
};
