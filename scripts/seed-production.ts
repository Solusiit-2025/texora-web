import { PrismaClient } from "@prisma/client";
import { MOCK_FABRICS } from "../src/lib/mock-data";

const prisma = new PrismaClient();

const HERO_SLIDES = [
  {
    order: 1,
    tag: "Mesin Cetak Sublim Digital",
    caption: "“Operator mengalibrasi profil warna ICC pada panel kontrol mesin cetak sublimasi digital.”",
    alt: "Proses cetak kertas transfer sublimasi digital skala industri",
    mainImage: "/images/hero/hero-printer.jpg",
    secondaryImage: "/images/hero/hero-printer-sub.jpg",
    isActive: true,
  },
  {
    order: 2,
    tag: "Hijab & Fashion Voal",
    caption: "“Kain Voal Ultrafine cetak motif kustom dengan tekstur lembut & tembus warna presisi.”",
    alt: "Kain Voal Ultrafine hasil cetak sublimasi motif batik & floral modern",
    mainImage: "/images/hero/hero-hijab.jpg",
    secondaryImage: "/images/hero/hero-hijab-sub.jpg",
    isActive: true,
  },
  {
    order: 3,
    tag: "Sportswear & Dryfit Milano",
    caption: "“Bahan Dryfit Milano & Poly Spandex anti-luntur untuk kostum tim, jersey, dan activewear.”",
    alt: "Bahan kain Dryfit Milano dengan cetak sublimasi warna neon vibrant",
    mainImage: "/images/hero/hero-sportswear.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
  {
    order: 4,
    tag: "Kalender Rotary Press 210°C",
    caption: "“Kalender rotary 210°C mengubah tinta dispersi menjadi gas yang mengunci sempurna di dalam serat benang.”",
    alt: "Mesin kalender rotary heat press sublimasi rol-ke-rol dengan silinder drum pemanas 210°C",
    mainImage: "/images/hero/hero-rotary.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
];

const TESTIMONIALS = [
  {
    name: "Budi Kurniawan",
    org: "Apex Athletic Apparel, Bandung",
    quote: "Warna neon Dryfit Milano konsisten antar-lot. Untuk order turnamen 3.000 meter, kami tidak perlu sortir ulang.",
    order: 1,
    isActive: true,
  },
  {
    name: "Nadira Al-Habsyi",
    org: "Zavira Signature Scarf, Jakarta",
    quote: "Voal-nya jatuh lembut dan tembusnya bagus. Tier harga membuat ongkos koleksi Raya kami lebih terkendali.",
    order: 2,
    isActive: true,
  },
  {
    name: "Rian Pramono",
    org: "CV. Rekanindo Event Kreasi",
    quote: "Proofing digital dan pelacakan SPK memudahkan tim pengadaan memantau 800 meter canvas tanpa telepon bolak-balik.",
    order: 3,
    isActive: true,
  },
];

const FAQS = [
  {
    question: "Berapa resolusi minimal file untuk sublimasi?",
    answer: "Kami menyarankan 150–300 DPI pada ukuran cetak sebenarnya. Visualizer akan memberi peringatan bila resolusi file di bawah ambang tersebut.",
    order: 1,
    isActive: true,
  },
  {
    question: "Bagaimana harga bertingkat dihitung?",
    answer: "Harga per meter turun sesuai total panjang pesanan per jenis kain. Tier yang berlaku langsung terlihat di kalkulator dan keranjang.",
    order: 2,
    isActive: true,
  },
  {
    question: "Apakah bisa proofing fisik sebelum produksi massal?",
    answer: "Bisa. Selain proofing digital, kami menyediakan cetak sampel 1 yard agar warna dapat dicek di bawah pencahayaan standar Anda.",
    order: 3,
    isActive: true,
  },
  {
    question: "Bagaimana pengiriman ke luar kota?",
    answer: "Melalui kargo spesialis roll (Dakota Cargo, JNE Trucking) atau armada sendiri untuk Bandung dan Jabodetabek. Gulungan dikemas plastik tebal dan karton pelindung.",
    order: 4,
    isActive: true,
  },
];

const SITE_CONTENT = [
  {
    key: "homepage.stats",
    group: "homepage",
    label: "Statistik Pabrik Homepage",
    value: JSON.stringify([
      { v: "10.000 m", k: "Kapasitas harian" },
      { v: "18 jenis", k: "Kain siap sublim" },
      { v: "400+", k: "Mitra garmen" },
    ]),
  },
  {
    key: "homepage.cta_b2b",
    group: "homepage",
    label: "CTA Kontrak B2B",
    value: JSON.stringify({
      title: "Butuh pasokan rutin di atas 5.000 meter per bulan?",
      description: "Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.",
      actionText: "Minta penawaran",
      actionLink: "/contact",
    }),
  },
  {
    key: "about.profile",
    group: "about",
    label: "Profil Singkat Perusahaan",
    value: "PT. Texora Visi Prima adalah manufaktur tekstil dan jasa cetak sublimasi industri rol-ke-rol terdepan berlokasi di Jakarta Utara.",
  },
];

async function seed() {
  console.log("🚀 Starting Production Database Seed with TypeScript...");

  // 1. Seed CMS Data
  console.log("\n📦 Seeding CMS Hero Slides...");
  for (const slide of HERO_SLIDES) {
    const existing = await prisma.heroSlide.findFirst({
      where: { tag: slide.tag },
    });
    if (!existing) {
      await prisma.heroSlide.create({ data: slide });
      console.log(`  + Created Hero Slide: ${slide.tag}`);
    } else {
      await prisma.heroSlide.update({
        where: { id: existing.id },
        data: slide,
      });
      console.log(`  * Updated Hero Slide: ${slide.tag}`);
    }
  }

  console.log("\n📦 Seeding CMS Testimonials...");
  for (const t of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: t.name },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
      console.log(`  + Created Testimonial: ${t.name}`);
    } else {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: t,
      });
      console.log(`  * Updated Testimonial: ${t.name}`);
    }
  }

  console.log("\n📦 Seeding CMS FAQs...");
  for (const f of FAQS) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: f.question },
    });
    if (!existing) {
      await prisma.faqItem.create({ data: f });
      console.log(`  + Created FAQ: ${f.question.slice(0, 30)}...`);
    } else {
      await prisma.faqItem.update({
        where: { id: existing.id },
        data: f,
      });
      console.log(`  * Updated FAQ: ${f.question.slice(0, 30)}...`);
    }
  }

  console.log("\n📦 Seeding CMS Site Content...");
  for (const sc of SITE_CONTENT) {
    await prisma.siteContent.upsert({
      where: { key: sc.key },
      create: sc,
      update: sc,
    });
    console.log(`  + Upserted SiteContent: ${sc.key}`);
  }

  // 2. Seed Fabric Products from mock-data
  console.log("\n📦 Seeding Fabric Products, Variants, and Price Tiers...");
  let fabricCount = 0;
  for (const f of MOCK_FABRICS) {
    const existing = await prisma.fabricProduct.findUnique({
      where: { slug: f.slug },
      include: { variants: true, priceTiers: true },
    });

    if (!existing) {
      await prisma.fabricProduct.create({
        data: {
          id: f.id,
          name: f.name,
          slug: f.slug,
          description: f.description,
          composition: f.composition,
          weaveType: f.weaveType,
          widthInch: f.widthInch,
          isSublimationReady: f.isSublimationReady,
          basePricePerMeter: f.basePricePerMeter,
          thumbnailUrl: f.thumbnailUrl,
          category: f.category || "Sportswear",
          variants: {
            create: f.variants.map((v) => ({
              id: v.id,
              gsm: v.gsm,
              colorName: v.colorName,
              stockMeters: v.stockMeters,
            })),
          },
          priceTiers: {
            create: f.priceTiers.map((t) => ({
              id: t.id,
              minMeters: t.minMeters,
              maxMeters: t.maxMeters ?? null,
              unitPrice: t.unitPrice,
            })),
          },
        },
      });
      console.log(`  + Created Product: ${f.name}`);
      fabricCount++;
    } else {
      await prisma.fabricProduct.update({
        where: { id: existing.id },
        data: {
          name: f.name,
          description: f.description,
          composition: f.composition,
          weaveType: f.weaveType,
          widthInch: f.widthInch,
          isSublimationReady: f.isSublimationReady,
          basePricePerMeter: f.basePricePerMeter,
          thumbnailUrl: f.thumbnailUrl,
          category: f.category || "Sportswear",
        },
      });
      console.log(`  * Updated Product: ${f.name}`);
      fabricCount++;
    }
  }

  console.log(`\n✅ Production seed completed! Fabric products in database: ${fabricCount}`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
