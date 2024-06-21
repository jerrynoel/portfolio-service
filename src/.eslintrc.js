module.exports = {
    extends: [
        'plugin:@typescript-eslint/recommended', // recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'eslint-plugin-prettier',
        'simple-import-sort',
        'sort-keys-fix',
        'sort-class-members',
        'typescript-sort-keys',
    ],
    rules: {
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        quotes: [2, 'single', { avoidEscape: true }],
        semi: [2, 'always', { omitLastInOneLineBlock: true }],
        'simple-import-sort/sort': [
            'error',
            {
                groups: [
                    // Side effect imports.
                    ['^\\u0000'],
                    // Packages.
                    // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
                    ['^@?\\w'],
                    ['^@apps'],
                    // Absolute imports and other imports such as Vue-style `@/foo`.
                    // Anything not matched in another group.
                    ['^'],
                    // Relative imports.
                    // Anything that starts with a dot.
                    ['^\\.'],
                ],
            },
        ],
        'sort-class-members/sort-class-members': [
            2,
            {
                accessorPairPositioning: 'getThenSet',
                order: [
                    '[static-properties]',
                    '[static-methods]',
                    '[properties]',
                    '[conventional-private-properties]',
                    'constructor',
                    '[conventional-private-methods]',
                    '[methods]',
                ],
            },
        ],
        'sort-imports': 0,
        'sort-keys-fix/sort-keys-fix': 'error',
        'sort-vars': ['error'],
        'typescript-sort-keys/interface': 'error',
        'typescript-sort-keys/string-enum': 'error',
    },
};
