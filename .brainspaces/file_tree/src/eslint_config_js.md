## Role
Defines ESLint linting rules for a TypeScript React project built with Vite, using the flat config format.

## Key exports
- `default` (ESLint configuration array)

**How to reference this file:**  
Loaded automatically by ESLint when placed at the project root as `eslint.config.js`.

## Dependencies
- `@eslint/js`
- `globals`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `typescript-eslint`
- `eslint/config` (provides `defineConfig` and `globalIgnores`)

## Notable
- The `globalIgnores(['dist'])` call ignores the entire `dist/` directory, so no files inside it are linted.
- Configuration only applies to `**/*.{ts,tsx}` files; other file types (e.g., JS, JSON) are not linted.
- Uses the flat config system (`defineConfig`), which requires ESLint v9+.
- Extends multiple recommended presets: JavaScript, TypeScript, React Hooks, and React Refresh (Vite-specific).
- `languageOptions.globals` is set to `globals.browser`, meaning all browser global objects (e.g., `window`, `document`) are recognized without needing explicit declaration.
- No custom rules or overrides are added beyond the extended presets.