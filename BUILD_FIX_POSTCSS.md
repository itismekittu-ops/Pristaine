# Build fix: PostCSS configuration

The migration package originally used an ES-module `export default` in `postcss.config.js`, while this repository's `package.json` does not set `"type": "module"`. Next.js 15 was loading a wrapped configuration and reported that it could not find the required `plugins` key (and referenced an unsupported `__esModule` field).

The config has been changed to CommonJS:

```js
/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

After extracting this package, open a terminal in the `Pristaine-main` folder and run:

```bash
npm install
npm run typecheck
npm run build
```

`npm run lint` currently reports warnings about `react-refresh/only-export-components` and an unsupported TypeScript version in the installed ESLint parser, but the user-provided log showed no lint errors. The previous `npm install` reported 15 dependency vulnerabilities; review them separately using `npm audit` and do not use `npm audit fix --force` without checking for breaking changes.

A production build has not been independently confirmed in this environment because package installation timed out. If `next build` reports a new error after the PostCSS fix, address that next error separately.
