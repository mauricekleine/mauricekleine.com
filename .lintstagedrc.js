// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,json,jsx,md,mdx,ts,tsx}": ["prettier --write"],
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
  "./package.json": ["sort-package-json"],
};
