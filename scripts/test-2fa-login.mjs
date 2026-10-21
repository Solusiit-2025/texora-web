/**
 * Uji alur login 2FA lengkap: setup -> enable -> logout -> login (challenge) ->
 * verify dengan TOTP -> sesi penuh. Jalankan: node scripts/test-2fa-login.mjs
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
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status: res.status, body };
}
function log(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
}
const crypto = await import("crypto");
function totp(secret) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = secret.toUpperCase().replace(/=+$/, "");
  let bits = 0, value = 0; const out = [];
  for (const ch of clean) {
    const i = A.indexOf(ch); if (i === -1) continue;
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  const key = Buffer.from(out);
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const h = crypto.createHmac("sha1", key).update(buf).digest();
  const o = h[h.length - 1] & 0x0f;
  const b = ((h[o] & 0x7f) << 24) | ((h[o+1] & 0xff) << 16) | ((h[o+2] & 0xff) << 8) | (h[o+3] & 0xff);
  return String(b % 1000000).padStart(6, "0");
}

(async () => {
  console.log("=== TEST LOGIN 2FA ===\n");

  // 0. Login dulu agar punya sesi
  const first = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  if (first.body?.requires2FA) {
    console.log("2FA sudah aktif dari test sebelumnya - skipping (gunakan cleanup manual).");
    return;
  }
  log("Login awal", first.body?.success === true, first.body?.error || "");

  // 1. Setup + enable
  const setup = await api("/api/auth/2fa", { method: "POST", body: JSON.stringify({ action: "setup" }) });
  const secret = setup.body?.data?.secret;
  log("Setup 2FA", !!secret, setup.body?.error || "");
  if (!secret) return;

  const enable = await api("/api/auth/2fa", { method: "POST", body: JSON.stringify({ action: "enable", code: totp(secret) }) });
  log("Enable 2FA", enable.body?.success === true, enable.body?.error || "");
  const backupCodes = enable.body?.data?.backupCodes || [];

  // 2. Logout (hapus cookie)
  cookies = "";
  const logout = await api("/api/auth/logout", { method: "POST" });
  log("Logout", logout.status === 200);

  // 3. Login -> harus dapat challenge
  const login = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const challenged = login.body?.requires2FA === true && !!login.body?.challengeToken;
  log("Login -> 2FA challenge", challenged, `requires2FA=${!!login.body?.requires2FA}`);
  if (!challenged) { console.log("  ", JSON.stringify(login.body).slice(0, 200)); return; }

  // 4. Verify dengan kode TOTP
  const verify = await api("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ challengeToken: login.body.challengeToken, code: totp(secret) }),
  });
  log("Verify TOTP -> sesi penuh", verify.body?.success === true, verify.body?.error || "");

  // 5. Cek session valid
  const me = await api("/api/auth/me");
  log("Session valid (/api/auth/me)", me.body?.authenticated === true, `role=${me.body?.user?.role}`);

  // 6. Kode salah harus ditolak
  cookies = "";
  const login2 = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const bad = await api("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ challengeToken: login2.body?.challengeToken, code: "000000" }),
  });
  log("Kode TOTP salah ditolak", bad.status === 401, `status=${bad.status}`);

  // 7. Kode cadangan bisa dipakai
  if (backupCodes.length) {
    const login3 = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
    const bc = await api("/api/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken: login3.body?.challengeToken, code: backupCodes[0], useBackupCode: true }),
    });
    log("Kode cadangan dipakai", bc.body?.success === true, bc.body?.error || "");

    // 8. Kode cadangan yang sama tidak bisa dipakai ulang
    const login4 = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
    const reuse = await api("/api/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken: login4.body?.challengeToken, code: backupCodes[0], useBackupCode: true }),
    });
    log("Kode cadangan tidak bisa dipakai ulang", reuse.status === 401, `status=${reuse.status}`);
  }

  // 9. Cleanup: nonaktifkan 2FA lagi
  cookies = "";
  await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const ch = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const v = await api("/api/auth/2fa/verify", { method: "POST", body: JSON.stringify({ challengeToken: ch.body?.challengeToken, code: totp(secret) }) });
  if (v.body?.success) {
    const dis = await api("/api/auth/2fa", { method: "POST", body: JSON.stringify({ action: "disable", code: totp(secret), password: PASSWORD }) });
    log("Cleanup: 2FA dinonaktifkan", dis.body?.success === true, dis.body?.error || "");
  }

  console.log("\n=== SELESAI ===");
})();
