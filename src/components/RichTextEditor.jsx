import React, { useRef, useEffect } from "react";

/**
 * Basic rich text editor for job description: bullet points, bold, font style.
 * Value is stored as HTML string; pass value and onChange for controlled use.
 */
export default function RichTextEditor({ value = "", onChange, placeholder = "Enter text...", rows = 4, className = "" }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML || "");
    }
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${className}`}>
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-300">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className="px-3 py-1.5 text-sm font-bold bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Bullet list"
        >
          • List
        </button>
        <select
          onChange={(e) => {
            const v = e.target.value;
            if (v) execCmd("fontName", v);
            e.target.value = "";
          }}
          className="px-2 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Font style"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select
          onChange={(e) => {
            const v = e.target.value;
            if (v) execCmd("fontSize", v);
            e.target.value = "";
          }}
          className="px-2 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Font size"
        >
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
        </select>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[100px] px-4 py-3 text-gray-900 outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        style={{
          minHeight: typeof rows === "number" ? `${rows * 24}px` : undefined,
        }}
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; }
        [contenteditable] ul { margin: 0.5em 0; padding-left: 1.5em; }
        [contenteditable] li { margin: 0.25em 0; }
      `}</style>
    </div>
  );
}
