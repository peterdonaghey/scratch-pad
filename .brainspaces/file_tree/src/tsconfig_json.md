## Role
This root `tsconfig.json` file configures TypeScript project references to delegate compilation to `tsconfig.app.json` and `tsconfig.node.json` sub‑projects, with no files directly included.

## Key exports
- **`references`**: lists `tsconfig.app.json` and `tsconfig.node.json` as referenced sub‑projects.
- **`files`**: empty array (no direct file includes).

## Dependencies
- `./tsconfig.app.json`
- `./tsconfig.node.json`

## Notable
- The empty `"files": []` combined with `"references"` means all TypeScript compilation is handled by the referenced projects. This is the standard TypeScript project references pattern used to split large codebases or separate environments (e.g., app vs. Node).
- This file is the entry point for TypeScript tooling (e.g., `tsc --build`); any developer adding new source files or changing compilation settings should modify the appropriate sub‑project’s tsconfig, not this root file.