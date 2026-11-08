import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

const blocks = [
  { id: "section", label: "Section", category: "Layout", content: '<section style="padding:48px 24px"><h2>Section heading</h2><p>Add your content here.</p></section>' },
  { id: "heading", label: "Heading", category: "Text", content: "<h2>New heading</h2>" },
  { id: "paragraph", label: "Paragraph", category: "Text", content: "<p>Write something meaningful for your visitors.</p>" },
  { id: "button", label: "Button", category: "Basic", content: '<a href="#" style="display:inline-block;padding:12px 18px;background:#246fc5;color:white;text-decoration:none;border-radius:6px">Click here</a>' },
  { id: "image", label: "Image", category: "Basic", content: '<img src="https://placehold.co/900x500/102744/c5dcf8?text=Your+Image" alt="Replace with your image" style="max-width:100%"/>' },
  { id: "columns", label: "Two columns", category: "Layout", content: '<div style="display:flex;gap:20px;flex-wrap:wrap"><div style="flex:1;min-width:180px;padding:20px"><h3>Column one</h3><p>Your content</p></div><div style="flex:1;min-width:180px;padding:20px"><h3>Column two</h3><p>Your content</p></div></div>' }
];

export default function VisualEditor({ document, onChange }) {
  const mountRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const documentRef = useRef(document);
  onChangeRef.current = onChange;
  documentRef.current = document;

  useEffect(() => {
    if (!mountRef.current) return undefined;
    const editor = grapesjs.init({
      container: mountRef.current,
      height: "100%",
      width: "auto",
      fromElement: false,
      storageManager: false,
      components: documentRef.current.html,
      style: documentRef.current.css,
      blockManager: { blocks },
      selectorManager: { componentFirst: true },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Mobile", width: "375px", widthMedia: "480px" }
        ]
      }
    });

    let ready = false;
    editor.on("load", () => { ready = true; });
    editor.on("update", () => {
      if (!ready) return;
      onChangeRef.current({
        html: editor.getHtml(),
        css: editor.getCss(),
        project: editor.getProjectData()
      });
    });

    return () => editor.destroy();
  }, []);

  return <div className="grapes-editor"><div ref={mountRef} className="grapes-mount" /></div>;
}
