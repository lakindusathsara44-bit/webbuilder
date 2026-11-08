import { useEffect, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";

const NOTEPAD_KEY = "apokolips-office:notepad:v1";
const HTML_KEY = "apokolips-office:html-editor:v1";

const STARTER_HTML = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '  <meta charset="UTF-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  "  <title>My first page</title>",
  "  <style>",
  "    body {",
  '      font-family: Arial, sans-serif;',
  "      max-width: 760px;",
  "      margin: 70px auto;",
  "      padding: 0 24px;",
  "      color: #172033;",
  "      line-height: 1.6;",
  "    }",
  "    h1 { color: #075985; }",
  "    .card {",
  "      padding: 24px;",
  "      border: 1px solid #dbeafe;",
  "      border-radius: 16px;",
  "      background: #f8fbff;",
  "    }",
  "  </style>",
  "</head>",
  "<body>",
  '  <main class="card">',
  "    <h1>Hello, Apokolips!</h1>",
  "    <p>Start editing this HTML to build your own page.</p>",
  '    <button id="helloButton">Try it</button>',
  "  </main>",
  "  <script>",
  '    document.getElementById("helloButton").addEventListener("click", () => {',
  '      alert("Your HTML, CSS and JavaScript are working!");',
  "    });",
  "  </script>",
  "</body>",
  "</html>"
].join("\n");

function readDraft(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function useAutoSave(key, value) {
  const [status, setStatus] = useState("Saved on this device");

  useEffect(() => {
    setStatus("Saving…");
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        setStatus("Saved on this device");
      } catch {
        setStatus("Browser storage is unavailable or full");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [key, value]);

  return status;
}

function safeFileName(name, extension) {
  const cleaned = (name || "").trim().replace(/[\\/:*?"<>|]+/g, "-");
  const base = cleaned || ("untitled" + extension);
  return /\.[a-z0-9]{1,8}$/i.test(base) ? base : base + extension;
}

function downloadText(content, name, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Brand({ compact = false }) {
  return (
    <a className={"brand-lockup" + (compact ? " brand-compact" : "")} href="/" aria-label="Apokolips Office home">
      <span className="brand-mark">A</span>
      <span className="brand-wordmark">
        <strong>APOKOLIPS</strong>
        <small>OFFICE</small>
      </span>
    </a>
  );
}

function MainWebsiteLink() {
  return (
    <a className="main-website-link" href="https://www.apokolips.xyz" target="_blank" rel="noreferrer">
      Main website <span aria-hidden="true">↗</span>
    </a>
  );
}

function ToolCard({ href, number, icon, title, description, features, label }) {
  return (
    <article className="tool-card">
      <div className="tool-card-top">
        <span className="tool-icon" aria-hidden="true">{icon}</span>
        <span className="tool-number">{number}</span>
      </div>
      <div className="tool-card-copy">
        <div className="tool-title-line">
          <h3>{title}</h3>
          <span className="free-pill">FREE</span>
        </div>
        <p>{description}</p>
      </div>
      <ul className="feature-list">
        {features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}
      </ul>
      <a className="launch-button" href={href}>
        Open {label} <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="site-header">
        <Brand />
        <div className="header-actions">
          <span className="edition-pill"><span /> FREE EDITION</span>
          <MainWebsiteLink />
        </div>
      </header>

      <main className="dashboard-main">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> YOUR SIMPLE DIGITAL WORKSPACE</span>
            <h1>Make space for<br /><span>your ideas.</span></h1>
            <p>Write notes, create HTML pages, and experiment with code in one clean workspace. No account or subscription required.</p>
            <a className="hero-cta" href="#free-tools">Explore free tools <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-glow" />
            <div className="art-window art-window-back">
              <div className="art-window-bar"><i /><i /><i /></div>
              <div className="art-code-lines"><b /><b /><b /><b /><b /></div>
            </div>
            <div className="art-window art-window-front">
              <div className="art-window-bar"><i /><i /><i /><span>Untitled note</span></div>
              <div className="art-paper">
                <strong>Your next idea<br />starts here.</strong>
                <span /><span /><span />
              </div>
            </div>
            <div className="art-caption">CREATE · WRITE · BUILD</div>
          </div>
        </section>

        <section className="tools-section" id="free-tools">
          <div className="section-heading">
            <div>
              <span className="eyebrow">START HERE</span>
              <h2>Your free tools</h2>
            </div>
            <p>Two lightweight tools. One place to create.</p>
          </div>
          <div className="tool-grid">
            <ToolCard
              href="/notepad/"
              number="01"
              icon="Aa"
              title="Notepad"
              label="Notepad"
              description="A distraction-free space for quick notes, drafts, lists and plain text."
              features={["Write and edit text", "Open and download text files", "Automatic local saving"]}
            />
            <ToolCard
              href="/html-editor/"
              number="02"
              icon="</>"
              title="HTML Editor"
              label="HTML Editor"
              description="Write HTML, CSS and JavaScript, then see your page update in a live preview."
              features={["Code editor with syntax highlighting", "Live preview in a safe frame", "Open and download HTML files"]}
            />
          </div>
        </section>

        <section className="privacy-note">
          <span className="privacy-icon" aria-hidden="true">⌂</span>
          <div>
            <strong>Your work stays in this browser for now.</strong>
            <p>Drafts are automatically saved on this device. Cloud sync and account features are not part of this free first release.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>APOKOLIPS OFFICE <i>·</i> FREE TOOLS</span>
        <span>IDEAS BECOME SOMETHING REAL.</span>
      </footer>
    </div>
  );
}

function EditorHeader({ title, subtitle, status }) {
  return (
    <header className="editor-header">
      <div className="editor-brand-area">
        <Brand compact />
        <span className="header-divider" />
        <div className="editor-heading">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
      </div>
      <div className="editor-header-right">
        <span className="save-status"><i />{status}</span>
        <MainWebsiteLink />
      </div>
    </header>
  );
}

function Notepad() {
  const [draft, setDraft] = useState(() => readDraft(NOTEPAD_KEY, { name: "Untitled.txt", text: "" }));
  const fileInput = useRef(null);
  const textArea = useRef(null);
  const status = useAutoSave(NOTEPAD_KEY, draft);

  const words = draft.text.trim() ? draft.text.trim().split(/\s+/).length : 0;
  const lines = draft.text ? draft.text.split("\n").length : 1;

  function handleOpen(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    file.text()
      .then((text) => setDraft({ name: file.name, text }))
      .catch(() => window.alert("This file could not be opened."));
  }

  function handleDownload() {
    downloadText(draft.text, safeFileName(draft.name, ".txt"), "text/plain;charset=utf-8");
  }

  function handleClear() {
    if (draft.text && !window.confirm("Clear this note? The saved draft will also be replaced.")) return;
    setDraft({ name: "Untitled.txt", text: "" });
    textArea.current?.focus();
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleDownload();
    }
  }

  return (
    <div className="editor-page">
      <EditorHeader title="Notepad" subtitle="Simple writing space" status={status} />
      <main className="notepad-main">
        <div className="editor-toolbar">
          <div className="document-name-wrap">
            <span className="document-type-icon">TXT</span>
            <input
              aria-label="Note file name"
              className="document-name-input"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              maxLength={90}
            />
          </div>
          <div className="toolbar-actions">
            <input ref={fileInput} className="visually-hidden" type="file" accept=".txt,.text,.md,.csv,.json,text/plain" onChange={handleOpen} />
            <button className="toolbar-button" onClick={() => fileInput.current?.click()}><span>↥</span> Open</button>
            <button className="toolbar-button toolbar-primary" onClick={handleDownload}><span>↓</span> Download TXT</button>
            <button className="toolbar-button toolbar-danger" onClick={handleClear}>Clear</button>
          </div>
        </div>

        <section className="notepad-sheet">
          <div className="paper-label"><span>YOUR NOTE</span><span>PLAIN TEXT</span></div>
          <textarea
            ref={textArea}
            className="notepad-textarea"
            value={draft.text}
            onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your thoughts here…"
            spellCheck="true"
            aria-label="Notepad text editor"
          />
          <div className="notepad-sheet-footer">
            <span>Autosaved locally</span>
            <span>{words} words <i>·</i> {draft.text.length} characters <i>·</i> {lines} lines</span>
          </div>
        </section>
      </main>
      <footer className="editor-footer"><a href="/">← Back to Office</a><span>Tip: use Ctrl + S to download your note.</span></footer>
    </div>
  );
}

function HtmlEditor() {
  const [draft, setDraft] = useState(() => readDraft(HTML_KEY, { name: "index.html", code: STARTER_HTML }));
  const [previewVersion, setPreviewVersion] = useState(0);
  const fileInput = useRef(null);
  const editorRef = useRef(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const status = useAutoSave(HTML_KEY, draft);

  function handleOpen(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    file.text()
      .then((code) => setDraft({ name: file.name, code }))
      .catch(() => window.alert("This HTML file could not be opened."));
  }

  function handleDownload() {
    downloadText(draftRef.current.code, safeFileName(draftRef.current.name, ".html"), "text/html;charset=utf-8");
  }

  function handleReset() {
    if (!window.confirm("Restore the starter HTML? Your current code will be replaced.")) return;
    setDraft({ name: "index.html", code: STARTER_HTML });
    setPreviewVersion((current) => current + 1);
  }

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handleDownload());
  }

  return (
    <div className="editor-page html-editor-page">
      <EditorHeader title="HTML Editor" subtitle="HTML · CSS · JavaScript" status={status} />
      <main className="html-editor-main">
        <div className="editor-toolbar html-toolbar">
          <div className="document-name-wrap">
            <span className="document-type-icon html-type-icon">HTML</span>
            <input
              aria-label="HTML file name"
              className="document-name-input"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              maxLength={90}
            />
          </div>
          <div className="toolbar-actions">
            <input ref={fileInput} className="visually-hidden" type="file" accept=".html,.htm,text/html" onChange={handleOpen} />
            <button className="toolbar-button" onClick={() => fileInput.current?.click()}><span>↥</span> Open</button>
            <button className="toolbar-button toolbar-primary" onClick={handleDownload}><span>↓</span> Download HTML</button>
            <button className="toolbar-button" onClick={() => setPreviewVersion((current) => current + 1)}>↻ Refresh</button>
            <button className="toolbar-button toolbar-danger" onClick={handleReset}>Reset</button>
          </div>
        </div>

        <div className="html-editor-layout">
          <section className="editor-panel code-panel">
            <div className="panel-heading">
              <span><i className="panel-dot code-dot" /> CODE EDITOR</span>
              <small>HTML</small>
            </div>
            <div className="monaco-wrap">
              <MonacoEditor
                height="100%"
                language="html"
                theme="vs-dark"
                value={draft.code}
                onChange={(value) => setDraft((current) => ({ ...current, code: value ?? "" }))}
                onMount={handleEditorMount}
                options={{
                  automaticLayout: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "line",
                  bracketPairColorization: { enabled: true },
                  suggestOnTriggerCharacters: true
                }}
              />
            </div>
            <div className="panel-footer"><span>{draft.code.split("\n").length} lines</span><span>Ctrl + S · Download HTML</span></div>
          </section>

          <section className="editor-panel preview-panel">
            <div className="panel-heading">
              <span><i className="panel-dot preview-dot" /> LIVE PREVIEW</span>
              <small>SAFE FRAME</small>
            </div>
            <div className="preview-browser-bar"><span /><span /><span /><div>Local preview</div></div>
            <iframe
              key={previewVersion}
              className="preview-frame"
              title="HTML live preview"
              srcDoc={draft.code}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
            />
            <div className="panel-footer"><span>Changes update automatically</span><span>Scripts run in an isolated frame</span></div>
          </section>
        </div>
      </main>
      <footer className="editor-footer"><a href="/">← Back to Office</a><span>Drafts are saved in this browser only.</span></footer>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/notepad" || path.endsWith("/notepad")) return <Notepad />;
  if (path === "/html-editor" || path.endsWith("/html-editor")) return <HtmlEditor />;
  return <Dashboard />;
}
