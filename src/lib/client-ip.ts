/**
 * Ambil IP klien yang bisa dipercaya di belakang Cloudflare + Nginx.
 *
 * PENTING: jangan memakai entri PERTAMA `x-forwarded-for`. Entri itu berasal
 * dari klien dan bisa dipalsukan — attacker bisa mengganti header tiap request
 * untuk melewati rate limit login (5 percobaan / 15 menit).
 *
 * Urutan prioritas:
 *  1. `cf-connecting-ip` — di-set Cloudflare di edge, tidak bisa dipalsukan
 *     selama trafik masuk lewat Cloudflare.
 *  2. `x-real-ip` — di-set Nginx dari `$remote_addr`.
 *  3. Entri TERAKHIR `x-forwarded-for` — IP yang ditambahkan proxy terdekat
 *     (bukan yang dikirim klien).
 *
 * Menerima `Request` biasa maupun `NextRequest` (keduanya punya `.headers`).
 */
export function getClientIp(req: Pick<Request, "headers">): string {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
}
