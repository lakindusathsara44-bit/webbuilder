import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { saveSite } from "../lib/sites.js";
import { DEFAULT_DOCUMENT } from "../lib/siteTemplate.js";
import VisualEditor from "./VisualEditor.jsx";

function makePreview(document) {
  return "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>" +
    document.css + "</style></head><body>" + document.html +
    (document.js ? "<script>" + document.js.replace(/<\/script/gi, "<\\/script") + "<\/script>" : "") +
    "</body></html>";
}

export default function WebsiteEditor({ site, token, userId, onBack, onSaved }) {
  const [document, setDocument] = useState(site.document || { ...DEFAULT_DOCUMENT });
  const [mode, setMode] = useState("visual");
  const [codeTab, setCodeTab] = useState("html");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [error, setError] = useState("");
  const dirtyRef = useRef(false);
  const firstRenderRef = useRef(true);
  const documentRef = useRef(document);
  const onSavedRef = useRef(onSaved);
  const versionRef = useRef(0);
  const savedVersionRef = useRef(0);
  documentRef.current = document;
  onSavedRef.current = onSaved;

  useEffect(() => {
    const initial = site.document || { ...DEFAULT_DOCUMENT };
    setDocument(initial);
    documentRef.current = initial;
    dirtyRef.current = false;
    firstRenderRef.current = true;
    versionRef.current = 0;
    savedVersionRef.current = 0;
    setSaveStatus("saved");
  }, [site.id]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return undefined;
    }
    if (!dirtyRef.current) return undefined;
    const version = versionRef.current;
    const snapshot = document;
    setSaveStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        const updated = await saveSite(site.id, snapshot, userId, token);
        savedVersionRef.current = Math.max(savedVersionRef.current, version);
        if (version === versionRef.current) {
          dirtyRef.current = false;
          setSaveStatus("saved");
          setError("");
        }
        onSavedRef.current?.({ ...site, ...updated, document: snapshot });
      } catch (err) {
        if (version === versionRef.current) {
          setSaveStatus("error");
          setError(err.message || "Autosave failed. Your changes remain in this editor.");
        }
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [document, site.id, token, userId]);

  function updateDocument(next) {
    versionRef.current += 1;
    dirtyRef.current = true;
    setDocument((current) => {
      const updated = { ...current, ...next };
      documentRef.current = updated;
      return updated;
    });
  }

  async function handleBack() {
    if (savedVersionRef.current < versionRef.current) {
      const version = versionRef.current;
      const snapshot = documentRef.current;
      setSaveStatus("saving");
      try {
        const updated = await saveSite(site.id, snapshot, userId, token);
        savedVersionRef.current = version;
        if (version === versionRef.current) {
          dirtyRef.current = false;
          setSaveStatus("saved");
          setError("");
        }
        onSavedRef.current?.({ ...site, ...updated, document: snapshot });
      } catch (err) {
        setSaveStatus("error");
        setError(err.message || "Could not save your latest changes. Stay here and retry.");
        return;
      }
    }
    onBack();
  }

  const editorLanguage = codeTab === "html" ? "html" : codeTab === "css" ? "css" : "javascript";

  return (
    <main className="website-editor-shell">
      <header className="editor-topbar">
        <button className="editor-back" onClick={handleBack} title="Back to websites">← <span>Websites</span></button>
        <div className="editor-site-heading"><b>{site.name}</b><span>{site.subdomain}.sites.apokolips.xyz</span></div>
        <div className={"save-indicator " + saveStatus}><i />{saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : "All changes saved"}</div>
        <span className="editor-draft">DRAFT</span>
      </header>

      <nav className="editor-toolbar">
        <div className="editor-mode-tabs">
          <button className={mode === "visual" ? "active" : ""} onClick={() => setMode("visual")}>▧ Visual editor</button>
          <button className={mode === "code" ? "active" : ""} onClick={() => setMode("code")}>{"</>"} Code editor</button>
          <button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>◉ Preview</button>
        </div>
        {mode === "code" && <div className="code-file-tabs">
          {["html", "css", "js"].map((tab) => <button key={tab} className={codeTab === tab ? "selected" : ""} onClick={() => setCodeTab(tab)}>{tab === "js" ? "script.js" : "index." + tab}</button>)}
        </div>}
        {mode === "preview" && <div className="preview-controls">
          <button className={previewDevice === "desktop" ? "selected" : ""} onClick={() => setPreviewDevice("desktop")}>Desktop</button>
          <button className={previewDevice === "tablet" ? "selected" : ""} onClick={() => setPreviewDevice("tablet")}>Tablet</button>
          <button className={previewDevice === "mobile" ? "selected" : ""} onClick={() => setPreviewDevice("mobile")}>Mobile</button>
        </div>}
      </nav>

      {error && <div className="editor-error" role="alert">{error} <button onClick={() => updateDocument({})}>Retry save</button></div>}

      <section className="editor-workspace">
        {mode === "visual" && <VisualEditor key={site.id + "-visual"} document={document} onChange={updateDocument} />}
        {mode === "code" && <div className="monaco-wrap"><div className="monaco-header"><span>{codeTab === "js" ? "script.js" : "index." + codeTab}</span><span>MONACO EDITOR</span></div><Editor height="100%" language={editorLanguage} theme="vs-dark" value={document[codeTab]} onChange={(value) => updateDocument({ [codeTab]: value ?? "", ...((codeTab === "html" || codeTab === "css") ? { project: null } : {}) })} options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, wordWrap: "on", scrollBeyondLastLine: false, tabSize: 2, padding: { top: 18 } }} /></div>}
        {mode === "preview" && <div className="preview-stage"><div className={"preview-frame " + previewDevice}><iframe title="Website preview" sandbox="allow-scripts allow-forms allow-modals" srcDoc={makePreview(document)} /></div></div>}
      </section>
      <footer className="editor-footer"><span>APOKOLIPS BUILDER · MILESTONE 02</span><span>Autosave enabled · Draft not published</span></footer>
    </main>
  );
}
