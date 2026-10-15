
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    'assets-source',
    'supabase',
    'tests',
    '.eslintrc.cjs',
  ],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      // These files run in Node.js, not in the browser.
      files: [
        'postcss.config.js',
        'tailwind.config.js',
        'next.config.ts',
      ],
      env: { node: true },
    },
  ],
};
