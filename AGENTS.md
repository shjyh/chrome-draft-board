# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Draft Board** is a Chrome Extension (Manifest V3) that provides a transparent, floating canvas overlay for drawing annotations on any webpage. The extension uses Shadow DOM for style isolation and supports bilingual UI (English/Chinese).

## Architecture

### Core Components

1. **content.js** - Main application injected into web pages
   - `DraftBoardApp`: Root application class managing state and components
   - `FloatingButton`: Draggable logo button that toggles the draft board
   - `BottomToolbar`: Main control panel with drawing tools and settings (replaces old SettingsPanel)
   - `CanvasManager`: Handles dual-canvas drawing system (main + temporary layer)

2. **popup.js/popup.html** - Browser action popup for per-site enable/disable toggle and language selection

3. **style.css** - Shadow DOM styles (loaded via chrome.runtime.getURL)

### Key Technical Patterns

**Shadow DOM Architecture**: The extension uses Shadow DOM (`mode: 'open'`) attached to `#draft-board-root` to prevent style conflicts with host pages. Styles are loaded asynchronously from `style.css` with FOUC prevention.

**Dual-Canvas Drawing System**:
- **Main Canvas** (`this.canvas`): Persistent drawing content
- **Temp Canvas** (`this.tempCanvas`): Current stroke being drawn
- On stroke completion, temp canvas content is composited to main canvas
- This prevents alpha accumulation artifacts during continuous drawing

**State Management**: Centralized state in `DraftBoardApp.state` with `updateState()` method that:
- Updates all child components
- Persists settings to `chrome.storage.local` per hostname
- Key format: `settings:${hostname}`

**Per-Site Enablement**:
- Storage key: `site:${hostname}` (boolean)
- App only initializes if site is enabled
- Popup controls this setting and sends `toggle_extension` messages

**I18n**: Inline I18N objects in both content.js and popup.js with auto-detection based on `navigator.language` (falls back to English).

### Drawing Implementation

**Brush Tool**:
- Draws colored strokes with opacity on temp canvas
- Uses `globalCompositeOperation: 'source-over'` with `globalAlpha`
- Path smoothing via continuous `lineTo()` between pointer events
- Single dots handled with `arc()` + `fill()`

**Eraser Tool**:
- Uses `globalCompositeOperation: 'destination-out'`
- Direct drawing to main canvas (not temp) to support immediate clearing
- Size is 2x the brush size for UX

**Cursor Follower**: Custom DOM cursor (`.cursor-follower`) that follows pointer, styled based on tool/color/size.

## Development Commands

### Loading the Extension

1. **Chrome/Edge**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this project directory

2. **Testing**:
   - Open any webpage
   - Click extension icon in toolbar
   - Toggle switch to enable for current site
   - Click floating logo to activate draft board

### Debugging

- **Content Script**: Open DevTools on the target page → Console/Sources
- **Popup**: Right-click extension icon → "Inspect popup"
- **Background**: N/A (this extension has no service worker)

### File Modifications

- Changes to `content.js`, `popup.js`, or `style.css` require extension reload in `chrome://extensions/`
- Changes to `manifest.json` require full extension reload
- After reload, refresh target pages to inject updated content script

## Important Constraints

### Database Files
**CRITICAL**: This project may contain `*.db` database files with developer test data that are not version-controlled. **NEVER delete these files** unless explicitly instructed, as they contain important development state.

### Z-Index Strategy
- Base z-index: `2147483640` (near max safe value)
- Toolbar: `2147483647` (highest)
- Canvas: Base - 1
- All values use CSS custom property `--z-index-base`

### Storage Keys
- Per-site enablement: `site:${hostname}`
- Per-site settings: `settings:${hostname}` (object with tool, color, size, brushOpacity, bgOpacity)
- Global language: `appLanguage` ('en' | 'zh')

### Canvas Resize Logic
- Canvas resizes to cover entire scrollable document area: `Math.max(document.documentElement.scrollWidth, window.innerWidth)` × height
- Content preservation during resize via backup canvas pattern (content.js:525-541)
- Resize is debounced by checking if dimensions actually changed

## Common Modifications

### Adding New Drawing Tools
1. Add tool state to `DraftBoardApp.state.tool`
2. Update `BottomToolbar.render()` to include new tool button
3. Implement drawing logic in `CanvasManager.attachEvents()` (pointerdown/move/up)
4. Update cursor styling in `CanvasManager.updateCursor()`

### Adding UI Controls
1. Add state property to `DraftBoardApp.state`
2. Render control in `BottomToolbar.render()`
3. Attach event handler in `BottomToolbar.attachEvents()`
4. Add to `saveSettings()` persistence logic

### Internationalization
1. Add translation keys to both `I18N` objects (content.js:7-34, popup.js:9-24)
2. Use pattern: `I18N[state.lang].keyName`
3. Language auto-detects on init, can be changed in popup

## File Structure

```
chrome-draft-board/
├── manifest.json       # Extension manifest (MV3)
├── content.js          # Main app (812 lines, 4 classes)
├── popup.html/js       # Extension popup UI
├── style.css           # Shadow DOM styles
├── logo.svg            # Extension logo
└── icons/              # Extension icons (16/48/128)
```
