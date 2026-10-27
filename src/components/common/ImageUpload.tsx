"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { shrinkImageForUpload, uploadImageFile } from "@/lib/upload-client";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onError?: (msg: string) => void;
}

export function ImageUpload({ value, onChange, label, onError }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Kompres dulu di browser kalau besar — menghindari 413 dari Nginx/proxy.
      const upload = await shrinkImageForUpload(file);
      const outcome = await uploadImageFile(upload);
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

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-slate-300 font-semibold mb-1 text-xs">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? "Mengunggah..." : "Upload Gambar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400"
            title="Hapus gambar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="atau tempel URL gambar (https://...)"
        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
      />
      {value && (
        <img
          src={value}
          alt="Preview"
          className="h-24 w-auto max-w-full object-contain rounded-lg border border-slate-700 bg-slate-950"
        />
      )}
    </div>
  );
}
