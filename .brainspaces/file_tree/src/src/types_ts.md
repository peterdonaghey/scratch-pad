## Role  
Defines types, default values, and static data for the Scratch Pad markdown editor's prose styling, state shape, storage keys, and font selection options.

## Key exports  
- `ProseConfig` (interface)  
- `DEFAULT_PROSE` (constant)  
- `ScratchPadState` (interface)  
- `STORAGE_KEY` (constant)  
- `CONTENT_CLASS` (constant)  
- `WELCOME_MARKDOWN` (constant)  
- `FONT_FAMILIES` (constant array)  
- `MONO_FONTS` (constant array)  

Reference this file via a relative import such as `'./config'` or `'./constants'` (exact module name depends on the project's file naming).

## Dependencies  
None.

## Notable  
- `DEFAULT_PROSE` provides sensible fallback values for font families, colors, sizes, and line height.  
- `STORAGE_KEY` is the localStorage key used to persist the scratch pad state.  
- `CONTENT_CLASS` is the CSS class name applied to the preview container.  
- `WELCOME_MARKDOWN` is the initial content shown to new users and includes usage instructions.  
- `FONT_FAMILIES` and `MONO_FONTS` are static lists of label/value pairs for a font picker UI.  
- `ScratchPadState` includes an optional `savedAt` timestamp for tracking the last save time.  
- No external dependencies or side effects – purely declarative constants and types.