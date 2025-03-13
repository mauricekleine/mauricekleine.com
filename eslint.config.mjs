import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginSort from "eslint-plugin-sort";
import pluginUnicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  pluginSort.configs["flat/recommended"],
  pluginUnicorn.configs["recommended"],
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "internal",
              pattern: "~/**",
              position: "before",
            },
          ],
        },
      ],
      "lines-around-directive": ["error", "always"],
      "newline-before-return": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
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
      "react/jsx-newline": [
        "warn",
        {
          prevent: false,
        },
      ],
      "react/jsx-sort-props": [
        "warn",
        {
          ignoreCase: true,
        },
      ],
      "sort/import-members": "off",
      "sort/imports": "off",
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
      "unicorn/consistent-function-scoping": "off",
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
      "unicorn/no-await-expression-member": "warn",
      "unicorn/no-keyword-prefix": "off",
      "unicorn/no-null": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prevent-abbreviations": "off",
      "unused-imports/no-unused-imports": "error",
    },
  },
];

export default eslintConfig;
