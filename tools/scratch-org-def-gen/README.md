<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Scratch Org Generator

A zero-build, static visual builder for Salesforce `project-scratch-def.json`.
Covers **315 scratch-org features** and **140 Metadata API setting types (~1,700 fields)**
extracted from the official Salesforce documentation.

- **No build step. No dev server. Just open `index.html` in your browser.**
- Features are the primary concept. Selecting a feature auto-populates the settings that belong to it.
- Multi-row category tabs (18 categories, all visible at once) plus a dedicated "All Settings" tab for power users.
- A **baseline** (configurable) is preselected on first load so the JSON is valid out of the box.
- `admin.html` — GUI editor. Edit features, attach/detach settings to features, mark fields as smart-default or required, tweak the baseline. Download the updated `.js` file and drop it into `data/`.

## Files

```
index.html          ← main generator (open this)
admin.html          ← editor for features, settings, baseline
data/
  categories.js     ← 18 category definitions
  features.js       ← 315 features, each with an embedded `settings` array
  settings.js       ← 140 Metadata API setting types (for the All Settings tab)
  baseline.js       ← default scratch-org config preselected on first load
extract-data.mjs    ← one-time Node script that regenerates data/*.js from Salesforce docs
Scratch org features and Settings/   ← source .txt and .json from Salesforce docs
```

## How features link to settings

Each feature in `data/features.js` may carry a `settings: [...]` array:

```js
{
  id: "einstein-1-ai-platform",
  featureName: "Einstein1AIPlatform",
  label: "Einstein 1 AI Platform",
  category: "einstein-ai",
  description: "Agentforce, Copilot, and Generative AI settings.",
  settings: [
    {
      typeName: "EinsteinGptSettings",
      required: true,                // Salesforce docs say "you must also include..."
      fields: [
        { name: "enableEinsteinGptPlatform", type: "boolean", smartDefault: true, required: true, defaultValue: true },
        { name: "enableAIModelBeta",         type: "boolean", smartDefault: true,                  defaultValue: false },
        ...
      ]
    },
    { typeName: "AgentPlatformSettings", fields: [...] }
  ]
}
```

When a user selects that feature in `index.html`:
- All fields where `smartDefault: true` or `required: true` are pre-included with their `defaultValue`.
- Fields where `required: true` cannot be unchecked.
- Unchecking the feature removes all its setting contributions from the output JSON (and drops any user tweaks — clean slate next time).

### Where the mapping comes from (in priority order)

1. **Manual curation** (`MANUAL_FEATURE_SETTINGS` in `extract-data.mjs`) — 31 features we hand-picked. This is your source of truth for the common cases.
2. **Docs JSON examples** — 36 features have a `### Scratch Org Definition File` example in the Salesforce docs. The extractor parses those examples verbatim, so `CoreCpq` for example auto-inherits the 13 setting groups Salesforce themselves bundle with it.
3. **"you must also include" sentences** — the extractor parses phrases like *"you must also include einsteinGptSettings > enableEinsteinGptPlatform"* and marks those fields `required: true`.
4. Everything else has no pre-attached settings. You attach them via `admin.html` as needed.

## Baseline

`data/baseline.js` is what's preselected when the user first loads `index.html`:

```js
window.BASELINE = {
  featureIds: ["EnableSetPasswordInApi"],
  settings: {
    "LightningExperienceSettings": { "enableS1DesktopEnabled": true },
    "MobileSettings":              { "enableS1EncryptedStoragePref2": false }
  }
};
```

User can uncheck it. Edit it via **admin.html → Baseline** tab.

## How to use

### View the app
Double-click `index.html`. Opens in your browser. First load ~1-2s while Babel Standalone transpiles the JSX.

### Edit feature/setting mappings
1. Open `admin.html`.
2. Pick a feature (left pane). Edit label/description/category. **Attach Settings** section at the bottom lets you add/remove setting groups and fields.
3. Click **Save (browser)** — persists to `localStorage` so you can iterate.
4. Click **Download features.js** (or settings.js / baseline.js).
5. Move the downloaded file into `data/`, overwriting the old one.
6. Commit and push.
7. (Optional) Click **Revert to defaults** in admin to clear localStorage and reload from the committed `data/` files.

### Regenerate from Salesforce docs
If Salesforce updates their docs, replace the files in `Scratch org features and Settings/` and run:

```bash
node extract-data.mjs
```

Needs Node.js. This is the only time you ever need it.

## Deploy to GitHub Pages

Everything is static — drop this folder (or just the files: `index.html`, `admin.html`, `data/`) into your Pages repo at any path. Commit, push. That's it.

No `base` path tweaking, no build command, no workflows needed.
