# Konfigurasi AI (Gemini / 9Router) — PT. Texora Visi Prima

Panduan lengkap: **di mana** konfigurasi AI disimpan, **kenapa** 401 muncul, dan
**bagaimana** memakai API key OpenCode untuk fitur terjemahan.

---

## 1. Ringkasan masalah yang pernah terjadi

| Gejala di log | Penyebab | Solusi |
|---|---|---|
| `9Router error (401): Invalid API key` | `.env` memakai key **9Router cloud** (`AQ.Ab...`) tapi aplikasi memanggil **9Router lokal** (`localhost:20128`) yang punya **client token sendiri** (`sk-...`) | Isi `NINEROUTER_API_KEY` dengan **client token** 9Router lokal, bukan key provider |
| `404: This model models/gemini-2.5-flash is no longer available to new users` | Google **menolak** `gemini-2.5-flash` untuk akun baru | Pakai `gemini-3.5-flash-lite` (override via `GEMINI_MODEL`) |
| `503: This model is currently experiencing high demand` | Beban model sedang tinggi (sementara) | Retry otomatis + fallback ke model Lite |
| `Bad control character in string literal in JSON` | Model menulis newline mentah di dalam string JSON (isi artikel HTML panjang) | Parser AI sudah diperbaiki: escape control char + retry per item |
| Panel admin menampilkan "idle" padahal job jalan | Folder `backups/` memicu hot-reload dev → state in-memory ke-reset | Status job disimpan ke DB + folder `backups/` diabaikan watcher |

---

## 2. Di mana konfigurasi disimpan

### 2.1 Sisi aplikasi (project Texora)
| File | Isi |
|---|---|
| `.env` | Konfigurasi utama (dipakai kalau `.env.local` tidak ada) |
| `.env.local` | **Prioritas lebih tinggi** — dipakai Next.js untuk override |
| `.env.example` | Template + dokumentasi setiap variabel (tanpa nilai rahasia) |

Variabel yang relevan:

```env
# --- Google AI Studio (langsung ke Google) ---
GEMINI_API_KEY="AIza..."          # key dari https://aistudio.google.com/apikey
GEMINI_MODEL="gemini-3.5-flash-lite"
GEMINI_MIN_CALL_GAP_MS="5000"     # jeda antar panggilan (kuota free tier)

# --- 9Router lokal (alternatif / fallback) ---
NINEROUTER_API_KEY="sk-..."       # CLIENT TOKEN 9Router, bukan key provider
NINEROUTER_BASE_URL="http://localhost:20128/v1"   # tanpa /chat/completions
NINEROUTER_MODEL="myCombos1"
```

> ⚠️ Kalau `NINEROUTER_API_KEY` diisi, aplikasi **memprioritaskan 9Router**
> dibanding Google SDK. Kalau mau Gemini langsung, kosongkan variabel itu.

### 2.2 Sisi gateway (9Router lokal)
| Yang | Lokasi |
|---|---|
| Dashboard web | **http://localhost:20128/dashboard** |
| Daftar model | http://localhost:20128/v1/models |
| Data (SQLite, token & provider) | `C:\Users\parwa\AppData\Roaming\9router\db\data.sqlite` |
| Client token & secret | `C:\Users\parwa\AppData\Roaming\9router\auth\`, `jwt-secret` |
| Log | `C:\Users\parwa\AppData\Roaming\9router\logs\` |
| Konfigurasi OpenCode (client token yg sama) | `C:\Users\parwa\.config\opencode\opencode.json` → `provider.9router.options.apiKey` |

Isi 9Router saat ini:
- **Client token** (diterima untuk inbound request): `apiKeys` table → `myApiKey`, `myApiKey2`
- **Provider**: `gemini` ("AI Studio", nonaktif → 400), `commandcode` ("CommandCode", aktif)
- **Combo model**: `myCombos1`, `myCombo3Pro`, `myComboFree`

### 2.3 Sisi OpenCode & CommandCode
| Yang | Lokasi |
|---|---|
| Auth per provider (OpenCode) | `C:\Users\parwa\.local\share\opencode\auth.json` |
| Auth resmi CommandCode (CLI) | `C:\Users\parwa\.commandcode\auth.json` → `apiKey` |
| Base URL per provider | `C:\Users\parwa\.config\opencode\opencode.json` |
| Model & endpoint | `http://localhost:20128/v1/models` |
| Endpoint CommandCode | `https://api.commandcode.ai/provider/v1` (OpenAI-compatible) |
| Dokumentasi CommandCode | https://commandcode.ai/docs |

---

## 3. Apakah API key OpenCode bisa dipakai? ✅ BISA — dengan syarat

Key OpenCode (`auth.json` → `9router`/`commandcode`/`deepseek`) **sudah
terdaftar di 9Router** sebagai provider. Tapi statusnya saat ini:

| Model via 9Router | Status | Error |
|---|---|---|
| `cmc/*` (CommandCode: MiniMax, Ling, Laguna, Kimi, GLM, Qwen…) | ❌ | `400: You have insufficient credits` → key CommandCode punya **saldo 0** |
| `oc/gemini-3.7-flash` | ❌ | `401: Missing API key` → provider "opencode" di 9Router belum punya key |
| `oc/big-pickle` | ✅ | JSON valid, ~4 detik → **siap dipakai** |
| `oc/nemotron-3-ultra-free` | ⚠️ | Jalan tapi JSON-nya malformed (ada `{` dobel) |
| `gemini/*` (AI Studio) | ❌ | Provider nonaktif di 9Router (404 model lama) |

### 3 Opsi pakai key OpenCode

**Opsi A — lewat 9Router (tanpa ubah kode)** ✅ **SEDANG DIPAKAI sebagai cadangan**
```env
NINEROUTER_API_KEY="sk-99ac41cef6b5264e-dcgt97-58401359"   # client token 9Router lokal
NINEROUTER_BASE_URL="http://localhost:20128/v1"
NINEROUTER_MODEL="oc/big-pickle"                            # model yang terbukti jalan 3/3
```
> Client token bisa diambil dari dashboard 9Router (menu **Endpoints / API Keys**)
> atau dari `~/.config/opencode/opencode.json` → `provider.9router.options.apiKey`.

**Opsi B — CommandCode langsung (BUTUH TOP-UP KREDIT)**
```env
NINEROUTER_BASE_URL="https://api.commandcode.ai/provider/v1"   # OpenAI-compatible
NINEROUTER_API_KEY="<key dari ~/.commandcode/auth.json>"
NINEROUTER_MODEL="minimax/minimax-m3.1-flash:free"            # atau model berbayar lain
```
> ⚠️ saat ini **belum bisa dipakai**: CommandCode membalas
> `400: You have insufficient credits` untuk **semua** model (termasuk `:free`).
> Auth-nya sendiri valid (96 model terdaftar, `/models` → 200). Perlu top-up
> kredit di dashboard CommandCode. Docs: https://commandcode.ai/docs
>
> Key CommandCode ada di **dua** tempat (harus sama):
> - `C:\Users\parwa\.commandcode\auth.json` → `apiKey` (key CLI resmi)
> - `C:\Users\parwa\.local\share\opencode\auth.json` → `commandcode.key` (key buat OpenCode)
>
> Saat ini kedua file **berbeda** → sinkronkan dulu kalau mau dipakai di OpenCode.

**Opsi C — Google AI Studio langsung (PRIMARY, SEDANG BERJALAN ✅)**
```env
GEMINI_API_KEY="AIza..."          # https://aistudio.google.com/apikey
GEMINI_MODEL="gemini-3.5-flash-lite"
AI_PROVIDER_ORDER="google,9router"
```
Kualitas terbaik untuk terjemahan (Gemini 3.5), kuota free tier ±15 request/menit.

**Opsi D — OpenCode Zen langsung (PALING SEDERHANA — butuh kredit Zen)**
```env
OPENCODE_API_KEY="<API key dari https://opencode.ai/auth>"
OPENCODE_BASE_URL="https://opencode.ai/zen/v1"
OPENCODE_MODEL="deepseek-v4.1-flash"
AI_PROVIDER_ORDER="opencode,google,9router"
```
- Endpoint OpenAI-compatible: `POST https://opencode.ai/zen/v1/chat/completions`
- Auth: `Authorization: Bearer <OPENCODE_API_KEY>`
- Model murah/cepat yang cocok untuk terjemahan: `deepseek-v4.1-flash`,
  `deepseek-v4-flash`, `glm-5.3-flash`, `kimi-k3`, `minimax-m2.5`, `big-pickle`.
- **Penting:** langganan OpenCode (CLI/TUI) ≠ kredit Zen. Zen bersifat
  pay-per-request, jadi pastikan saldo/kredit di dashboard OpenCode sudah diisi.
- Tidak perlu Gemini/9Router. Kalau `OPENCODE_API_KEY` kosong, provider ini
  otomatis dilewati dan chain lanjut ke Google/9Router.

---

## 3.5 Fallback chain antar provider

Sistem sekarang mencoba **berurutan** sesuai `AI_PROVIDER_ORDER`:

```
opencode (OPENCODE_API_KEY + OPENCODE_MODEL)  ← utama bila key tersedia
   ↓ gagal (401/402/429/503)
google  (GEMINI_API_KEY + GEMINI_MODEL)
   ↓ gagal (503 high demand / 404 model / 401)
9router (NINEROUTER_*)
   ↓ gagal
teks asli (fallback, website tetap normal)
```

- Log saat provider berganti: `[i18n] Provider google gagal, coba provider berikutnya: ...`
- `getAiProviderInfo()` (tampil di panel admin → tab Terjemahan) menampilkan chain lengkap.
- Terbukti jalan: dengan `GEMINI_MODEL` sengaja dikesallah, 5 bahasa tetap
  ter-terjemah dalam ~12 detik lewat 9Router.

---

## 4. Model Gemini yang dipakai & statusnya (tes 21 Okt 2026)

| Model | Hasil | Catatan |
|---|---|---|
| `gemini-2.5-flash` | ❌ 404 | "no longer available to new users" — **jangan dipakai** |
| `gemini-3.5-flash` | ⚠️ 1/3 | sering 503 "high demand" |
| **`gemini-3.5-flash-lite`** | ✅ 3/3 | rata-rata ~1 detik → **default sekarang** |
| `gemini-3.8-flash` | ⚠️ 503 | "high demand" (bisa dicoba) |
| `gemini-flash-latest` | ⚠️ 503 | "high demand" |
| `gemini-2.5-flash-lite` / `gemini-2.0-flash` | ❌ 404 | tidak tersedia |

Ganti model kapan saja: `GEMINI_MODEL` di `.env` (restart server).

---

## 5. Cara cek cepat (copy-paste)

```bash
# 1. Cek key Google masih valid?
node -e "fetch('https://generativelanguage.googleapis.com/v1beta/models?key='+process.env.GEMINI_API_KEY).then(r=>r.status).then(console.log))"
# 200 = valid

# 2. Cek 9Router lokal hidup?
curl http://localhost:20128/v1/models

# 3. Cek model apa saja yang tersedia
curl http://localhost:20128/v1/models | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.map(m=>m.id).join('\n')))"

# 4. Cek status provider AI dari aplikasi (panel admin -> tab Terjemahan)
curl http://localhost:3000/api/i18n/translations
```

---

## 6. Panel Admin → Tab "Terjemahan"

- Statistik cakupan per bahasa ( berapa baris cache per locale)
- **Terjemahkan Semua** → job background: en → zh → ja → de → ar
- Progress tersimpan di DB (`SystemSetting` key `i18n.translation_job`) → tetap tampil
  walaupun server restart
- Manual: buka satu teks → klik "Terjemahkan AI" (per field)
- Override manual: isi sendiri → status jadi `manual` (tidak ditimpa AI)

> Halaman website **tidak pernah** memanggil AI saat pengunjung membuka. Semua
> bahasa lain dibaca dari cache DB. Kuota hanya terpakai saat admin menekan
> tombol terjemahan.

---

## 7. Timetable yang recommended

| Kondisi | Setting |
|---|---|
| Harian (produksi) | `GEMINI_API_KEY` + `GEMINI_MODEL="gemini-3.5-flash-lite"` (opsyon A) |
| Kalau Gemini 503 terus | `GEMINI_MODEL="gemini-flash-lite-latest"` atau pindah ke 9Router (`oc/big-pickle`) |
| Offline / kuota habis | Tidak ada yang berubah di website — fallback ke Bahasa Indonesia, multi-bahasa jadi terlambat saja |
