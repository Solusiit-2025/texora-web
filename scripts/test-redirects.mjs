/**
 * Test end-to-end Redirect Manager.
 * Jalankan: node scripts/test-redirects.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3001";
const EMAIL = process.env.TEST_EMAIL || "smoketest-admin@texora.local";
const PASSWORD = process.env.TEST_PASSWORD || "SmokeTest@2026!";

let cookies = "";
function saveCookies(res) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const pair = c.split(";")[0];
    const name = pair.split("=")[0];
    cookies = [
      ...cookies.split("; ").filter((x) => x && !x.startsWith(`${name}=`)),
      pair,
    ].join("; ");
  }
}
async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      ...(cookies ? { Cookie: cookies } : {}),
    },
  });
  saveCookies(res);
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body, location: res.headers.get("location") };
}

let pass = 0, fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

(async () => {
  console.log("=== TEST REDIRECT MANAGER ===\n");

  // Login
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!login.body?.success) {
    if (login.status === 429) {
      console.log(
        "\n[!] Rate limit login aktif (429).\n" +
          "    Tunggu jendela waktu berlalu, atau restart dev server, atau naikkan\n" +
          "    LOGIN_RATE_LIMIT_MAX di .env lalu restart server.\n"
      );
    } else {
      console.log(
        "Login gagal. Jalankan: node scripts/test-user.cjs create"
      );
    }
    process.exit(1);
  }
  check("Login admin", true);

  // Public endpoint (dipakai middleware)
  const pub = await api("/api/seo/redirects?public=1");
  check("Endpoint publik redirect tersedia", pub.status === 200, `rules=${pub.body?.data?.length}`);

  // Tambah rule
  const from = "/kain/lama-sekali";
  const to = "/catalog";
  const created = await api("/api/seo/redirects", {
    method: "POST",
    body: JSON.stringify({ from, to, type: "301", note: "test otomatis" }),
  });
  check("Buat rule redirect", created.body?.success === true, created.body?.error || "");

  // Duplikat harus ditolak
  const dup = await api("/api/seo/redirects", {
    method: "POST",
    body: JSON.stringify({ from, to, type: "301" }),
  });
  check("Tolak duplikat", dup.status === 409, `status=${dup.status}`);

  // Rule invalid ditolak
  const invalid = await api("/api/seo/redirects", {
    method: "POST",
    body: JSON.stringify({ from: "/", to: "/x" }),
  });
  check("Tolak rule invalid", invalid.status === 400, `status=${invalid.status}`);

  // Tunggu cache middleware (TTL 5 menit) - paksa refresh via match API
  const match = await api(`/api/seo/redirects?match=${encodeURIComponent(from)}`);
  check("Preview matchredirect", match.body?.data?.matched === true, JSON.stringify(match.body?.data));

  // Hapus rule
  const deleted = await api(`/api/seo/redirects?from=${encodeURIComponent(from)}`, {
    method: "DELETE",
  });
  check("Hapus rule", deleted.body?.success === true, deleted.body?.error || "");

  console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
  if (fail > 0) process.exit(1);
})();
