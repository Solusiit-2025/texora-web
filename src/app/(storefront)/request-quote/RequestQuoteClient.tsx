"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  X,
  Send,
  Package,
} from "lucide-react";
import { useI18n, useLocalePath } from "@/lib/i18n/LanguageContext";
import { QUOTE_COPY, type QuoteCopy } from "@/lib/i18n/quote-dictionary";

interface ProductOption {
  id: string;
  name: string;
  category: string;
  gsm?: number;
}

export default function RequestQuoteClient({
  products,
  source = "website",
  presetProduct,
}: {
  products: ProductOption[];
  source?: string;
  presetProduct?: string;
}) {
  const { locale } = useI18n();
  const localePath = useLocalePath();
  const router = useRouter();

  const copy: QuoteCopy = useMemo(() => QUOTE_COPY[locale] ?? QUOTE_COPY.id, [locale]);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    meters: "",
    message: "",
    needsSample: false,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    presetProduct ? [presetProduct] : []
  );
  const [file, setFile] = useState<{ dataUrl: string; name: string; size: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError(copy.fileTooBig);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError(copy.fileType);
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
    setFile({ dataUrl, name: f.name, size: f.size });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError(copy.validation);
      return;
    }

    setSubmitting(true);
    try {
      const productNames = products
        .filter((p) => selectedProducts.includes(p.id))
        .map((p) => p.name);

      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          meters: form.meters ? Number(form.meters) : null,
          productIds: selectedProducts,
          productsText: productNames.join(", "),
          needsSample: form.needsSample,
          fileDataUrl: file?.dataUrl || null,
          fileName: file?.name || null,
          locale,
          source,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || copy.genericError);
        setSubmitting(false);
        return;
      }

      setDone(true);
      setSubmitting(false);
    } catch {
      setError(copy.genericError);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-5 py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">{copy.successTitle}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{copy.successBody}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={localePath("/catalog")}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
          >
            {copy.backToCatalog}
          </a>
          <a
            href={localePath("/")}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            {copy.backToHome}
          </a>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors";
  const labelCls = "block text-slate-300 font-semibold mb-1.5 text-xs";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{copy.name} *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
            placeholder={copy.namePlaceholder}
          />
        </div>
        <div>
          <label className={labelCls}>{copy.company}</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            className={inputCls}
            placeholder={copy.companyPlaceholder}
          />
        </div>
        <div>
          <label className={labelCls}>{copy.email} *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
            placeholder="name@company.com"
          />
        </div>
        <div>
          <label className={labelCls}>{copy.phone}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
            placeholder="+62 8xx xxxx xxxx"
          />
        </div>
        <div>
          <label className={labelCls}>{copy.country}</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className={inputCls}
            placeholder={copy.countryPlaceholder}
          />
        </div>
        <div>
          <label className={labelCls}>{copy.meters}</label>
          <input
            type="number"
            min={1}
            value={form.meters}
            onChange={(e) => set("meters", e.target.value)}
            className={inputCls}
            placeholder="500"
          />
        </div>
      </div>

      {/* Pilih produk */}
      {products.length > 0 && (
        <div>
          <label className={labelCls}>{copy.products}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {products.map((p) => {
              const active = selectedProducts.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-start text-[11px] transition-colors ${
                    active
                      ? "border-brand-500 bg-brand-500/10 text-white"
                      : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      active ? "bg-brand-500 border-brand-500" : "border-slate-600"
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold truncate">{p.name}</span>
                    <span className="block text-[10px] text-slate-500">
                      {p.category}
                      {p.gsm ? ` • ${p.gsm} GSM` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pesan */}
      <div>
        <label className={labelCls}>{copy.message}</label>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-y leading-relaxed`}
          placeholder={copy.messagePlaceholder}
        />
      </div>

      {/* File referensi */}
      <div>
        <label className={labelCls}>{copy.file}</label>
        {file ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-700">
            <FileText className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="text-[11px] text-slate-300 truncate flex-1">
              {file.name}
              <span className="text-slate-500 ml-2">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
              title={copy.removeFile}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-700 hover:border-brand-500/60 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] text-slate-500">
              {copy.fileHint}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Sample gratis */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.needsSample}
          onChange={(e) => set("needsSample", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
        />
        <span className="text-xs text-slate-300">
          {copy.sample}
          <span className="block text-[11px] text-slate-500 mt-0.5">{copy.sampleHint}</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{copy.sending}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{copy.submit}</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        {copy.privacy}
      </p>
    </form>
  );
}
