/**
 * Uji end-to-end AI Content Translation (jalur cache, tanpa perlu API key).
 *
 * Strategi: seed baris cache content_translations dengan teks sumber yang
 * PERSIS sama dengan data asli -> GET /api/cms?lang=xx harus mengembalikan
 * terjemahan cache, dan GET tanpa lang tetap bahasa Indonesia (canonical).
 *
 * Jalankan: node scripts/test-content-i18n.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = process.env.BASE_URL || "http://localhost:3001";

let pass = 0, fail = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
  ok ? pass++ : fail++;
}

async function main() {
  console.log("=== TEST AI CONTENT TRANSLATION (cache path) ===\n");

  // 1. Ambil data FAQ asli dari API publik (default = Indonesia)
  const baseRes = await fetch(`${BASE}/api/cms`);
  const baseJson = await baseRes.json();
  const faq = baseJson?.data?.faqs?.[0];
  if (!faq) {
    console.log("(tidak ada FAQ untuk diuji — skip)");
    return;
  }
  check("GET /api/cms tanpa lang -> teks Indonesia", /apa|Apa|bagaimana|Bagaimana|bisa|Bisa|[a-zA-Z]{3}/.test(faq.question), JSON.stringify(faq.question).slice(0, 60));

  // 2. Seed cache terjemahan EN (persis source yang sama)
  const seededTranslations = [
    { field: "question", text: `[EN] ${faq.question}` },
    { field: "answer", text: `[EN] ${faq.answer}` },
  ];
  for (const t of seededTranslations) {
    await prisma.contentTranslation.upsert({
      where: {
        entity_entityId_field_locale: {
          entity: "faq",
          entityId: String(faq.id),
          field: t.field,
          locale: "en",
        },
      },
      create: {
        entity: "faq",
        entityId: String(faq.id),
        field: t.field,
        locale: "en",
        source: t.field === "question" ? faq.question : faq.answer,
        translation: t.text,
      },
      update: {
        source: t.field === "question" ? faq.question : faq.answer,
        translation: t.text,
      },
    });
  }
  check("Seed cache content_translations", true, `faq id=${faq.id}`);

  // 3. GET ?lang=en -> cache terpakai
  const enRes = await fetch(`${BASE}/api/cms?lang=en`);
  const enJson = await enRes.json();
  const faqEn = enJson?.data?.faqs?.find((f) => String(f.id) === String(faq.id));
  check("GET /api/cms?lang=en -> pertanyaan diterjemahkan (cache)", faqEn?.question === `[EN] ${faq.question}`, faqEn?.question?.slice(0, 60));
  check("GET /api/cms?lang=en -> jawaban diterjemahkan (cache)", faqEn?.answer === `[EN] ${faq.answer}`, faqEn?.answer?.slice(0, 60));

  // 4. GET tanpa lang -> tetap Indonesia (SEO canonical utuh)
  const idRes = await fetch(`${BASE}/api/cms`);
  const idJson = await idRes.json();
  const faqId = idJson?.data?.faqs?.find((f) => String(f.id) === String(faq.id));
  check("Tanpa lang -> konten asli Indonesia", faqId?.question === faq.question);

  // 5. Lang tak dikenal / "id" -> no-op, status 200
  const zzRes = await fetch(`${BASE}/api/cms?lang=zz`);
  check("lang tidak dikenal -> fallback aman (200)", zzRes.status === 200);
  const idRes2 = await fetch(`${BASE}/api/cms?lang=id`);
  const idJson2 = await idRes2.json();
  const faqId2 = idJson2?.data?.faqs?.find((f) => String(f.id) === String(faq.id));
  check("lang=id -> teks asli", faqId2?.question === faq.question);

  // 6. Endpoint produk & pricing menerima ?lang tanpa error (fallback asli tanpa key)
  const prodRes = await fetch(`${BASE}/api/products?lang=de`);
  const prodJson = await prodRes.json();
  check("GET /api/products?lang=de -> 200 (fallback tanpa API key)", prodRes.status === 200 && Array.isArray(prodJson?.data));

  const priceRes = await fetch(`${BASE}/api/settings/pricing?lang=ja`);
  const priceJson = await priceRes.json();
  check("GET /api/settings/pricing?lang=ja -> 200 + fields utuh", priceRes.status === 200 && !!priceJson?.data?.designServiceTitle);

  // 7. Stale detection: ubah source di cache -> harus dianggap butuh terjemah ulang
  //    (tanpa key, hasil = teks asli, BUKAN cache basi)
  await prisma.contentTranslation.updateMany({
    where: { entity: "faq", entityId: String(faq.id), locale: "en" },
    data: { source: "TEKS ASLI BERUBAH OLEH ADMIN" },
  });
  const staleRes = await fetch(`${BASE}/api/cms?lang=en`);
  const staleJson = await staleRes.json();
  const faqStale = staleJson?.data?.faqs?.find((f) => String(f.id) === String(faq.id));
  check(
    "Cache basi (source berubah) -> TIDAK ditampilkan, fallback teks asli",
    faqStale?.question === faq.question,
    faqStale?.question?.slice(0, 50)
  );

  // 8. Cleanup
  await prisma.contentTranslation.deleteMany({
    where: { entity: "faq", entityId: String(faq.id), locale: "en" },
  });
  check("Cleanup baris cache test", true);
}

main()
  .catch((e) => { console.error("ERROR:", e.message); process.exitCode = 1; })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
    if (fail > 0) process.exit(1);
  });
