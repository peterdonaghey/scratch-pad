## Role
Configures TypeScript compiler options for the application source code (`src/`), targeting ES2023 with React JSX transform and bundler‑style module resolution.

## Key exports
None – this is a configuration file.

## Dependencies
- `vite/client` (global type declarations)

## Notable
- Covers only files in the `src` directory.
- `verbatimModuleSyntax` and `erasableSyntaxOnly` enforce modern bundler‑compatible imports.
- `noEmit` is enabled – output is handled by Vite.
- Strict linting: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- Build info output stored in `node_modules/.tmp/tsconfig.app.tsbuildinfo`.