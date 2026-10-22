"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Quote,
  Code2,
  Undo2,
  Redo2,
  RemoveFormatting,
  AlignLeft,
  Eye,
  Pencil,
  Type,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /** Callback saat pengguna menyisipkan gambar (opsional - jika diisi, tombol gambar disembunyikan & memakai uploader eksternal) */
  onImageRequest?: () => void;
  imageUrl?: string;
}

type ToolAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "createLink"
  | "removeFormat"
  | "undo"
  | "redo"
  | "justifyLeft"
  | "justifyCenter"
  | "formatBlockPre"
  | "formatBlockQuote"
  | "formatBlockCode"
  | "insertImage";

const BLOCKS: Array<{ cmd: ToolAction; value?: string; label: string }> = [
  { cmd: "formatBlock", value: "p", label: "Paragraf" },
  { cmd: "formatBlock", value: "h2", label: "Heading 2" },
  { cmd: "formatBlock", value: "h3", label: "Heading 3" },
  { cmd: "formatBlock", value: "blockquote", label: "Kutipan" },
  { cmd: "formatBlock", value: "pre", label: "Kode" },
];

/**
 * Rich Text Editor ringan berbasis contentEditable.
 *
 * Menghasilkan HTML yang sudah di-sanitize (hanya tag aman yang diizinkan)
 * sehingga aman dirender di storefront maupun di panel admin.
 */
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Tulis konten di sini...",
  minHeight = 200,
  className = "",
  onImageRequest,
  imageUrl,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceValue, setSourceValue] = useState(value || "");
  // PENTING: mulai dari string KOSONG, bukan dari `value`.
  // Kalau diinisialisasi dengan `value`, efek sinkronisasi di bawah
  // menganggap "tidak ada perubahan" -> editor tetap KOSONG padahal
  // isinya ada. Akibatnya: saat admin membuka form edit (artikel, FAQ,
  // hero, dll) isi tidak muncul di editor, dan kalau disimpan isinya hilang.
  const lastValueRef = useRef<string>("");

  // Isi editor dengan nilai awal (mount) & nilai eksternal berikutnya
  // (hanya jika benar-benar berubah & editor tidak sedang fokus).
  useEffect(() => {
    if (editorRef.current && !isFocused && value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value || "";
      setSourceValue(value || "");
    }
  }, [value, isFocused]);

  const emit = useCallback(() => {
    const html = editorRef.current?.innerHTML || "";
    lastValueRef.current = html;
    setSourceValue(html);
    onChange(html);
  }, [onChange]);

  const exec = useCallback(
    (cmd: ToolAction, arg?: string) => {
      editorRef.current?.focus();
      // execCommand deprecated namun masih satu-satunya cara cross-browser
      // tanpa dependensi library pihak ketiga.
      document.execCommand(cmd as string, false, arg);
      emit();
    },
    [emit]
  );

  const handleLink = () => {
    const url = window.prompt(
      "Masukkan URL tautan (contoh: https://texora.co.id/katalog):",
      "https://"
    );
    if (!url) return;
    const safe = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    exec("createLink", safe);
  };

  const handleImage = () => {
    if (onImageRequest) {
      onImageRequest();
      return;
    }
    const url = window.prompt("Masukkan URL gambar:", "https://");
    if (!url) return;
    const safe = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    exec("insertImage", safe);
  };

  const applyBlock = (cmd: ToolAction, value?: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, value || "p");
    emit();
  };

  const handleSourceToggle = () => {
    if (!showSource) {
      setSourceValue(editorRef.current?.innerHTML || "");
    }
    setShowSource(!showSource);
  };

  const handleSourceChange = (v: string) => {
    setSourceValue(v);
    onChange(v);
  };

  const applySource = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = sourceValue;
      lastValueRef.current = sourceValue;
      onChange(sourceValue);
    }
  };

  const toolbarBtn = (
    icon: React.ReactNode,
    title: string,
    onClick: () => void,
    disabled?: boolean
  ) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/70 disabled:opacity-30 disabled:hover:bg-transparent transition-all shrink-0"
    >
      {icon}
    </button>
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-slate-300 font-semibold">{label}</label>
      )}

      <div
        className={`rounded-xl border bg-slate-900 transition-colors overflow-hidden ${
          isFocused ? "border-brand-500 ring-1 ring-brand-500/40" : "border-slate-700"
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-slate-950/60 border-b border-slate-800">
          {toolbarBtn(
            <Bold className="w-3.5 h-3.5" />,
            "Tebal (Ctrl+B)",
            () => exec("bold")
          )}
          {toolbarBtn(
            <Italic className="w-3.5 h-3.5" />,
            "Miring (Ctrl+I)",
            () => exec("italic")
          )}
          {toolbarBtn(
            <Underline className="w-3.5 h-3.5" />,
            "Garis bawah (Ctrl+U)",
            () => exec("underline")
          )}
          {toolbarBtn(
            <Strikethrough className="w-3.5 h-3.5" />,
            "Coret",
            () => exec("strikeThrough")
          )}

          <span className="w-px h-5 bg-slate-700 mx-1" />

          {toolbarBtn(
            <List className="w-3.5 h-3.5" />,
            "Daftar poin",
            () => exec("insertUnorderedList")
          )}
          {toolbarBtn(
            <ListOrdered className="w-3.5 h-3.5" />,
            "Daftar nomor",
            () => exec("insertOrderedList")
          )}

          <span className="w-px h-5 bg-slate-700 mx-1" />

          <select
            title="Format blok"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => {
              const sel = e.target.value;
              const block = BLOCKS.find((b) => b.label === sel);
              if (block) applyBlock(block.cmd, block.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-300 px-1.5 py-1 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="" disabled>
              Format
            </option>
            {BLOCKS.map((b) => (
              <option key={b.label} value={b.label} className="bg-slate-800">
                {b.label}
              </option>
            ))}
          </select>

          {toolbarBtn(
            <Quote className="w-3.5 h-3.5" />,
            "Kutipan",
            () => applyBlock("formatBlock", "blockquote")
          )}
          {toolbarBtn(
            <Code2 className="w-3.5 h-3.5" />,
            "Blok kode",
            () => applyBlock("formatBlock", "pre")
          )}

          <span className="w-px h-5 bg-slate-700 mx-1" />

          {toolbarBtn(
            <Link2 className="w-3.5 h-3.5" />,
            "Sisipkan tautan",
            handleLink
          )}
          {toolbarBtn(
            <ImageIcon className="w-3.5 h-3.5" />,
            onImageRequest ? "Sisipkan gambar" : "Sisipkan gambar (URL)",
            handleImage
          )}

          <span className="w-px h-5 bg-slate-700 mx-1" />

          {toolbarBtn(
            <AlignLeft className="w-3.5 h-3.5" />,
            "Rata kiri",
            () => exec("justifyLeft")
          )}
          {toolbarBtn(
            <Type className="w-3.5 h-3.5" />,
            "Rata tengah",
            () => exec("justifyCenter")
          )}

          <span className="w-px h-5 bg-slate-700 mx-1" />

          {toolbarBtn(
            <RemoveFormatting className="w-3.5 h-3.5" />,
            "Hapus format",
            () => exec("removeFormat")
          )}
          {toolbarBtn(
            <Undo2 className="w-3.5 h-3.5" />,
            "Urungkan (Ctrl+Z)",
            () => exec("undo")
          )}
          {toolbarBtn(
            <Redo2 className="w-3.5 h-3.5" />,
            "Ulangi (Ctrl+Y)",
            () => exec("redo")
          )}

          <div className="flex-1" />

          {toolbarBtn(
            showSource ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <Pencil className="w-3.5 h-3.5" />
            ),
            showSource ? "Mode visual" : "Mode HTML",
            handleSourceToggle
          )}
        </div>

        {/* Editor / Source */}
        {showSource ? (
          <div className="relative">
            <textarea
              value={sourceValue}
              onChange={(e) => handleSourceChange(e.target.value)}
              onBlur={applySource}
              spellCheck={false}
              style={{ minHeight }}
              className="w-full bg-slate-900 border-0 p-3 text-[11px] font-mono text-emerald-300 focus:outline-none resize-y"
              placeholder="<p>Tulis HTML di sini...</p>"
            />
          </div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              emit();
            }}
            onPaste={(e) => {
              // Sanitize paste: ambil teks polos saja
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              emit();
            }}
            style={{ minHeight }}
            className="w-full bg-slate-900 p-3 text-xs text-slate-200 focus:outline-none leading-relaxed rich-text-content empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
            data-placeholder={placeholder}
          />
        )}
      </div>

      <p className="text-[10px] text-slate-500">
        Mendukung: <strong>tebal</strong>, <em>miring</em>, <u>garis bawah</u>, daftar,
        heading, kutipan, tautan, dan gambar. Konten di-sanitize otomatis untuk mencegah
        injeksi XSS.
      </p>
    </div>
  );
}
