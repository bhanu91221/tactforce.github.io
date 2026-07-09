# Web → Markdown

A single-file tool that turns **any** web page into clean Markdown (`.md`).
**No install, no server, no terminal** — just double-click `web-to-md.html`.

## Use it
1. Double-click **web-to-md.html** (opens in your browser).
2. Paste a link → click **Convert**.
3. **Copy** the Markdown or **Download .md**. A live **Preview** tab shows how it renders.

## Fetches any URL — including JavaScript apps
Most tools that fetch a URL only see raw HTML, so JavaScript-built pages
(Salesforce, Notion, LinkedIn, docs portals…) come back as an empty shell.
This tool sends the URL to a **rendering reader** (Jina AI Reader) that actually
runs the page's JavaScript and returns the finished content — so those pages work too.

- Works with no setup. For heavy use you can add a free **Reader API key**
  (Advanced options → Reader API key) for higher rate limits — get one at https://jina.ai/reader.
- If the reader is ever unavailable, it automatically falls back to raw proxies.
- **Login- or CAPTCHA-gated pages** (some Salesforce/intranet pages) can't be fetched by
  any outside service. For those, use **Paste HTML** (below) — it always works.

## Paste HTML (100% offline, always works)
Switch to the **Paste HTML** tab and paste a page's HTML. Nothing leaves your computer.
For a JavaScript-heavy page, copy the *rendered* HTML: right-click the loaded page →
**Inspect** → in the Elements panel right-click the top **`<html>`** tag →
**Copy → Copy outerHTML**, then paste.

## Advanced options
- **Extraction mode** — *Smart* (main article only, best default), *Full page* (everything, cleaned),
  or *Selector* (extract one element by CSS selector, e.g. `article`, `#content`, `main .post`).
  When Smart mode can't find a clean article, it automatically shows the full page instead.
- **Strip from page** — remove header, navigation/menus, footer, sidebars, ads/cookie/sign-up bars.
- **Markdown output** — add title as H1, YAML front-matter, keep/drop images, keep/drop links, reference-style links.
- **Formatting & fetch** — heading style, bullet character, **Fetch route** (Auto / reader-only /
  raw-proxy-only / direct), and an optional **Reader API key**.

## How it works
- Conversion runs locally with **Mozilla Readability** + **Turndown** (GitHub-flavored: tables, code,
  strikethrough), both bundled inside the file — nothing is downloaded to run it.
- URL fetching uses the public rendering reader (and proxy fallbacks); **Paste HTML** is fully offline.
- Relative links and images are rewritten to absolute URLs automatically.
