/**
 * Diagnostik langsung ke Gemini: cek batas kuota (per menit / per hari)
 * & bentuk respons JSON yang sebenarnya.
 * Jalankan: node scripts/gemini-probe.mjs
 */
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.log("GEMINI_API_KEY kosong");
  process.exit(0);
}

const { GoogleGenAI } = await import("@google/genai");
const ai = new GoogleGenAI({ apiKey: key });

async function probe(label, contents, config) {
  const t0 = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config,
    });
    const text = res.text ?? "";
    console.log(`\n[${label}] OK (${Date.now() - t0}ms)`);
    console.log("RAW:", text.slice(0, 400));
    return text;
  } catch (e) {
    console.log(`\n[${label}] ERROR (${Date.now() - t0}ms)`);
    console.log("message:", String(e?.message || e).slice(0, 500));
    console.log("status:", e?.status, "code:", e?.code);
    const body = e?.error?.details || e?.response?.data;
    if (body) console.log("details:", JSON.stringify(body).slice(0, 600));
    return null;
  }
}

// 1. Bentuk respons JSON (2 item)
await probe(
  "json-2-items",
  `Translate to English. Reply ONLY JSON array [{"i":0,"t":"..."},{"i":1,"t":"..."}].
INPUT: ["Halo dunia","Kain rajut"]`,
  { temperature: 0.2, responseMimeType: "application/json" }
);

// 2. Bentuk respons JSON (1 item)
await probe(
  "json-1-item",
  `Translate to English. Reply ONLY JSON array [{"i":0,"t":"..."}].
INPUT: ["Halo dunia"]`,
  { temperature: 0.2, responseMimeType: "application/json" }
);

// 3. Bentuk respons JSON (5 item)
await probe(
  "json-5-items",
  `Translate to English. Reply ONLY JSON array [{"i":0,"t":"..."}].
INPUT: ["a","b","c","d","e"]`,
  { temperature: 0.2, responseMimeType: "application/json" }
);
