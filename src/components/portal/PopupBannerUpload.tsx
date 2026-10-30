"use client";

/**
 * Upload poster popup dengan drag & drop + pratinjau portrait.
 *
 * Gambar dikompres di browser (maks ~900 KB) lalu diunggah ke `/api/upload`
 * dan dikonversi ke WebP oleh server. Tampilan pratinjau memakai rasio 9:16
 * agar admin langsung melihat proporsi poster yang akan tayang.
 */

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { shrinkImageForUpload, uploadImageFile } from "@/lib/upload-client";

interface PopupBannerUploadProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
}

const MAX_HINT = "JPG/PNG/WebP · rasio 9:16 · disarankan 900×1600 px · maks 5 MB";

export function PopupBannerUpload({ value, onChange, onError }: PopupBannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError?.("File harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const compressed = await shrinkImageForUpload(file, 900 * 1024);
      const outcome = await uploadImageFile(compressed, { convertToWebp: true });
      if (outcome.success) {
        onChange(outcome.url);
      } else {
        onError?.(outcome.error);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-300">Poster Banner</label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setFileName("");
            }}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition-colors hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
            Hapus gambar
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
          dragging
            ? "border-brand-400 bg-brand-500/10"
            : "border-slate-700 bg-slate-950/70"
        }`}
      >
        {value ? (
          <div className="relative flex justify-center bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_60%)] p-3">
            <img
              src={value}
              alt="Pratinjau poster"
              className="max-h-[340px] w-auto max-w-full rounded-xl border border-slate-700 bg-slate-950 object-contain shadow-lg"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-950/85 px-3 py-2 text-[10px] font-semibold text-white shadow-lg backdrop-blur transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {uploading ? "Mengunggah..." : "Ganti gambar"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center gap-2 px-5 py-10 text-center transition-colors hover:bg-slate-900/60 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
                <UploadCloud className="h-6 w-6" />
              </span>
            )}
            <span className="text-xs font-bold text-white">
              {uploading ? "Mengunggah banner..." : "Tarik gambar ke sini atau klik untuk upload"}
            </span>
            <span className="text-[10px] leading-relaxed text-slate-500">{MAX_HINT}</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
          disabled={uploading}
        />
      </div>

      {fileName && (
        <p className="truncate text-[10px] text-slate-500">
          File: <span className="text-slate-300">{fileName}</span>
        </p>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <input
          type="text"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="atau tempel URL gambar (https://...)"
          className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
        />
      </div>
      {value.startsWith("data:") && (
        <p className="text-[10px] text-amber-400/90">
          Gambar tersimpan sebagai data URL (mode fallback serverless). Untuk produksi,
          gunakan penyimpanan file/objek agar ukuran database tetap ringan.
        </p>
      )}
    </div>
  );
}
