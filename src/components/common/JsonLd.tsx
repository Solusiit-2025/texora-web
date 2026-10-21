import { combineSchemas } from "@/lib/seo-metadata";

interface JsonLdProps {
  /** Satu atau beberapa schema.org object. */
  schema:
    | Record<string, unknown>
    | Array<Record<string, unknown> | null | undefined>
    | null
    | undefined;
  /** ID unik untuk script tag. */
  id?: string;
}

/**
 * Menyuntik JSON-LD (schema.org) secara statis ke dalam HTML.
 *
 * PENTING: komponen ini harus dipakai di SERVER component (tidak boleh
 * "use client"). Script di-render sebagai bagian dari HTML awal sehingga
 * Google Rich Results parser dan AI crawler membacanya tanpa menjalankan JS.
 */
export function JsonLd({ schema, id = "jsonld" }: JsonLdProps) {
  if (!schema) return null;

  const payload = Array.isArray(schema) ? schema : [schema];
  const valid = payload.filter(Boolean);
  if (valid.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: combineSchemas(...valid) }}
    />
  );
}
