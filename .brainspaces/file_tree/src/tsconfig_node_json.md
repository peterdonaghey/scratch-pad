## Role
This TypeScript configuration file sets compiler options for the Vite configuration file (`vite.config.ts`) in a Node environment, targeting ES2023 with bundler module resolution and strict linting.

## Notable
- Only includes `vite.config.ts`; this file is not used for the application source code.
- `tsBuildInfoFile` is stored in `./node_modules/.tmp/` for incremental builds; clearing `node_modules` will remove this cache.
- `verbatimModuleSyntax` requires explicit `import type` for type-only imports; omitting `type` may cause runtime errors.
- `erasableSyntaxOnly` disables TypeScript features that emit runtime code (e.g., enums, namespaces, parameter properties). If you rely on enums or similar constructs in `vite.config.ts`, they must be replaced with other patterns.
- `noUnusedLocals` and `noUnusedParameters` will fail the build if any unused variables exist in `vite.config.ts`.
- `moduleResolution: "bundler"` expects imports to follow bundler rules (e.g., no extension-less imports for non-JS/TS files unless configured). Resolves the same way as Vite.
- `noEmit` prevents output; this config is for type-checking only, not compilation.