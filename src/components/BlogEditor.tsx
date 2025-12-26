import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

   quillRef.current = new Quill(editorRef.current, {
  theme: "snow",
  modules: {
    toolbar: [
      // Headings
      [{ header: [1, 2, 3, 4, false] }],

      // Text formatting
      ["bold", "italic", "underline", "strike"],

      // Text color & background
      [{ color: [] }, { background: [] }],

      // Alignment
      [{ align: [] }],

      // Lists
      [{ list: "ordered" }, { list: "bullet" }],

      // Indentation
      [{ indent: "-1" }, { indent: "+1" }],

      // Blocks
      ["blockquote", "code-block"],

      // Media & links
      ["link"],

      // Superscript / Subscript
      [{ script: "sub" }, { script: "super" }],

      // Direction (RTL support)
      [{ direction: "rtl" }],

      // Remove formatting
      ["clean"],
    ],
  },
});

    quillRef.current.on("text-change", () => {
      onChange(quillRef.current!.root.innerHTML);
    });
  }, [onChange]);

  // sync value (edit mode)
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-lg">
      <div ref={editorRef} className="min-h-[300px]" />
    </div>
  );
}
