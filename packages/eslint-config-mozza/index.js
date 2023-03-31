/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "plugin:unicorn/all", "turbo", "prettier"],
  overrides: [
    {
      files: ["./src/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "unicorn/prefer-module": "error",
      },
    },
    {
      extends: ["plugin:storybook/recommended"],
      files: ["./**/*.stories.{js,jsx,ts,tsx}"],
    },
    {
      extends: ["plugin:testing-library/react"],
      files: ["./**/*.test.{js,jsx,ts,tsx}"],
    },
  ],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  plugins: ["sort", "unused-imports"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
        groups: ["builtin", "external", "parent", "sibling", "index"],
        "newlines-between": "always",
        pathGroups: [
          {
            group: "external",
            pattern: "~/**",
            position: "after",
          },
        ],
      },
    ],
    "no-restricted-imports": [
      "warn",
      {
        patterns: [
          {
            group: ["../*"],
            message:
              "Imports are only allowed as siblings ('./') or as absolute imports",
          },
        ],
      },
    ],
    "react/jsx-newline": ["warn", { prevent: false }],
    "react/jsx-sort-props": [
      "warn",
      {
        ignoreCase: true,
      },
    ],
    "sort/destructuring-properties": "error",
    "sort/object-properties": "error",
    "sort/type-properties": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],
    "unicorn/no-keyword-prefix": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prevent-abbreviations": "off",
    "unused-imports/no-unused-imports": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
