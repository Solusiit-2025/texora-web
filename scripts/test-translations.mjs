/**
 * Uji Tahap 3 — Manajemen Terjemahan (panel admin).
 *
 * Verifikasi (tanpa API key, deterministic):
 *  - GET    : stats + daftar + status AI (disabled)
 *  - PUT    : override manual teks terjemahan
 *  - GET?locale : filter bahasa
 *  - DELETE : hapus cache
 *  - POST translate-all : ditolak ramah saat AI nonaktif
 *
 * Jalankan: node scripts/test-translations.mjs
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
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      ...(cookies ? { Cookie: cookies } : {}),
    },
  });
  saveCookies(res);
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

let pass = 0, fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

const TEST_ENTITY = "test";
const TEST_ID = "translation-test-" + Date.now();

(async () => {
  console.log("=== TEST MANAJEMEN TERJEMAHAN (Tahap 3) ===\n");

  // login
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!login.body?.success) {
    console.log("Login gagal. Jalankan: node scripts/test-user.cjs create");
    process.exit(1);
  }
  check("Login admin", true);

  // GET stats
  const get1 = await api("/api/i18n/translations");
  check("GET translations -> success", get1.body?.success === true);
  check("status AI terlaporkan", typeof get1.body?.aiEnabled === "boolean", `aiEnabled=${get1.body?.aiEnabled}`);
  check("ada field byLocale & total", typeof get1.body?.data?.byLocale === "object" && typeof get1.body?.data?.total === "number");

  // PUT override
  const put = await api("/api/i18n/translations", {
    method: "PUT",
    body: JSON.stringify({
      entity: TEST_ENTITY,
      entityId: TEST_ID,
      field: "test",
      locale: "en",
      source: "Halo dunia",
      translation: "Hello world (manual override)",
    }),
  });
  check("PUT override -> success", put.body?.success === true, put.body?.error || "");

  // GET filter locale=en -> baris kita ada
  const get2 = await api("/api/i18n/translations?locale=en");
  const found = get2.body?.data?.rows?.some(
    (r) => r.entity === TEST_ENTITY && r.entityId === TEST_ID
  );
  check("GET ?locale=en -> baris override tampil", found === true);

  // DELETE
  const rowId = get2.body?.data?.rows?.find(
    (r) => r.entity === TEST_ENTITY && r.entityId === TEST_ID
  )?.id;
  const del = await api(`/api/i18n/translations?id=${encodeURIComponent(rowId || "")}`, {
    method: "DELETE",
  });
  check("DELETE cache -> success", del.body?.success === true);

  // POST translate-all:
  //  - AI aktif  -> 200 + ringkasan jumlah cache per bahasa
  //  - AI nonaktif -> 400 + pesan ramah (riwayat: key Gemini belum diisi)
  const ta = await api("/api/i18n/translations", {
    method: "POST",
    body: JSON.stringify({ action: "translate-all" }),
  });
  if (get1.body?.aiEnabled) {
    check(
      "POST translate-all (AI aktif) -> 202 job background",
      ta.status === 202 && !!ta.body?.data?.job,
      `status=${ta.status} running=${ta.body?.data?.job?.running}`
    );
  } else {
    check(
      "POST translate-all (AI nonaktif) -> pesan ramah",
      ta.status === 400 && /GEMINI_API_KEY/.test(ta.body?.error || ""),
      `status=${ta.status}`
    );
  }

  // Status job harus bisa dipantau
  const jobRes = await api("/api/i18n/translations?job=1");
  check(
    "GET ?job=1 -> status job tersedia",
    typeof jobRes.body?.data?.job?.running === "boolean",
    `running=${jobRes.body?.data?.job?.running} phase=${jobRes.body?.data?.job?.phase}`
  );

  console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
  if (fail > 0) process.exit(1);
})();
