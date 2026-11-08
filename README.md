# Apokolips Office

Apokolips Office is starting as a free, browser-based workspace with two tools:

- **Notepad** — write, edit, open, and download plain-text notes.
- **HTML Editor** — edit HTML with syntax highlighting, live preview, and HTML file import/export.

## Pages

- Dashboard: /
- Notepad: /notepad/
- HTML Editor: /html-editor/

## Features in this first release

- React + Vite application.
- Monaco Editor for HTML editing.
- Live preview inside a sandboxed iframe.
- Automatic draft saving to the current browser's localStorage.
- Open and download TXT and HTML files.
- Responsive layout for desktop and mobile screens.
- No account, subscription, API server, or paid editor engine required.

## Important storage note

Drafts are saved in the browser on the device being used. They are not uploaded to a cloud account and will not automatically sync to another browser or device. Clearing browser site data may remove local drafts. Download important work as a file for a separate backup.

## Run locally

1. Install Node.js 22 or newer.
2. Run npm install.
3. Run npm run dev.
4. Open the local Vite address shown in the terminal.

To create a production build, run npm run build. The output is written to the dist directory.

## GitHub Pages

The project is configured for a root-domain deployment such as office.apokolips.xyz. In the repository's Pages settings, select GitHub Actions as the deployment source when the domain and DNS are ready. The production build has separate static entry pages for the dashboard, Notepad, and HTML Editor so their URLs can be opened directly.

The GitHub Actions Pages workflow deploys the project to `https://lakindusathsara44-bit.github.io/webbuilder/`. It uses `/webbuilder/` as the asset base path for this repository URL. When moving to the custom domain `office.apokolips.xyz`, set the Pages build variable `VITE_BASE_PATH` to `/` and configure the custom domain in repository Pages settings.

## Privacy and preview security

- Notes and code are stored in browser localStorage. They are not encrypted by this app.
- Do not use a shared/public device for confidential notes.
- HTML preview runs in an iframe with the allow-scripts sandbox permission but without same-origin access to the parent application.
- User-authored code can still make network requests from the preview frame. Only run code you trust.

## Planned future work

Cloud sync, sign-in, document folders, Writer, Sheets, Slides, collaboration, and paid plans are not included in this free first milestone.
