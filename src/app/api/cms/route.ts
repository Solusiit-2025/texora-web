import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_LINKS_KEY,
  normalizeSocialLinks,
} from "@/config/social";
import {
  normalizeLocale,
  localizeRows,
  localizeSiteContentRows,
  preTranslateFields,
} from "@/lib/content-translator";
import { normalizeArticleInput } from "@/lib/article-utils";

/** Fire-and-forget: terjemahkan konten yg baru disimpan ke semua bahasa. */
function schedulePreTranslate(type: string, data: any, record: any) {
  if (!record) return;
  try {
    const id = String(record.id ?? data?.key ?? "");
    if (type === "heroSlide") {
      preTranslateFields("hero", id, { tag: data.tag, caption: data.caption, alt: data.alt }, ["tag", "caption", "alt"]).catch(() => {});
    } else if (type === "testimonial") {
      preTranslateFields("testimonial", id, { quote: data.quote }, ["quote"]).catch(() => {});
    } else if (type === "faq") {
      preTranslateFields("faq", id, { question: data.question, answer: data.answer }, ["question", "answer"]).catch(() => {});
    } else if (type === "siteContent" && data?.key === "site.pages") {
      try {
        const obj = JSON.parse(data.value);
        preTranslateFields("siteContent", "site.pages", obj, ["aboutTitle", "aboutDescription", "aboutCaption"]).catch(() => {});
      } catch {}
    } else if (type === "siteContent" && data?.key === "homepage.cta_b2b") {
      try {
        const obj = JSON.parse(data.value);
        preTranslateFields("siteContent", "homepage.cta_b2b", obj, ["title", "description", "actionText"]).catch(() => {});
      } catch {}
    } else if (type === "article") {
      preTranslateFields(
        "article",
        id,
        { title: data.title, excerpt: data.excerpt, body: data.body, seoTitle: data.seoTitle },
        ["title", "excerpt", "body", "seoTitle"]
      ).catch(() => {});
    }
  } catch {
    /* jangan ganggu alur simpan konten */
  }
}

export const dynamic = "force-dynamic";

const DEFAULT_HERO_SLIDES = [
  {
    id: "default-1",
    order: 1,
    tag: "Mesin Cetak Sublim Digital",
    caption: "“Operator mengalibrasi profil warna ICC pada panel kontrol mesin cetak sublimasi digital.”",
    alt: "Proses cetak kertas transfer sublimasi digital skala industri",
    mainImage: "/images/hero/hero-printer.jpg",
    secondaryImage: "/images/hero/hero-printer-sub.jpg",
    isActive: true,
  },
  {
    id: "default-2",
    order: 2,
    tag: "Hijab & Fashion Voal",
    caption: "“Kain Voal Ultrafine cetak motif kustom dengan tekstur lembut & tembus warna presisi.”",
    alt: "Kain Voal Ultrafine hasil cetak sublimasi motif batik & floral modern",
    mainImage: "/images/hero/hero-hijab.jpg",
    secondaryImage: "/images/hero/hero-hijab-sub.jpg",
    isActive: true,
  },
  {
    id: "default-3",
    order: 3,
    tag: "Sportswear & Dryfit Milano",
    caption: "“Bahan Dryfit Milano & Poly Spandex anti-luntur untuk kostum tim, jersey, dan activewear.”",
    alt: "Bahan kain Dryfit Milano dengan cetak sublimasi warna neon vibrant",
    mainImage: "/images/hero/hero-sportswear.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
  {
    id: "default-4",
    order: 4,
    tag: "Kalender Rotary Press 210°C",
    caption: "“Kalender rotary 210°C mengubah tinta dispersi menjadi gas yang mengunci sempurna di dalam serat benang.”",
    alt: "Mesin kalender rotary heat press sublimasi rol-ke-rol dengan silinder drum pemanas 210°C",
    mainImage: "/images/hero/hero-rotary.jpg",
    secondaryImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    id: "default-1",
    quote: "Warna neon Dryfit Milano konsisten antar-lot. Untuk order turnamen 3.000 meter, kami tidak perlu sortir ulang.",
    name: "Budi Kurniawan",
    org: "Apex Athletic Apparel, Bandung",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    quote: "Voal-nya jatuh lembut dan tembusnya bagus. Tier harga membuat ongkos koleksi Raya kami lebih terkendali.",
    name: "Nadira Al-Habsyi",
    org: "Zavira Signature Scarf, Jakarta",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    quote: "Proofing digital dan pelacakan SPK memudahkan tim pengadaan memantau 800 meter canvas tanpa telepon bolak-balik.",
    name: "Rian Pramono",
    org: "CV. Rekanindo Event Kreasi",
    order: 3,
    isActive: true,
  },
];

const DEFAULT_FAQS = [
  {
    id: "default-1",
    question: "Berapa resolusi minimal file untuk sublimasi?",
    answer: "Kami menyarankan 150–300 DPI pada ukuran cetak sebenarnya. Visualizer akan memberi peringatan bila resolusi file di bawah ambang tersebut.",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    question: "Bagaimana harga bertingkat dihitung?",
    answer: "Harga per meter turun sesuai total panjang pesanan per jenis kain. Tier yang berlaku langsung terlihat di kalkulator dan keranjang.",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    question: "Apakah bisa proofing fisik sebelum produksi massal?",
    answer: "Bisa. Selain proofing digital, kami menyediakan cetak sampel 1 yard agar warna dapat dicek di bawah pencahayaan standar Anda.",
    order: 3,
    isActive: true,
  },
  {
    id: "default-4",
    question: "Bagaimana pengiriman ke luar kota?",
    answer: "Melalui kargo spesialis roll (Dakota Cargo, JNE Trucking) atau armada sendiri untuk Bandung dan Jabodetabek. Gulungan dikemas plastik tebal dan karton pelindung.",
    order: 4,
    isActive: true,
  },
];

export async function GET(request: Request) {
  try {
    // ?lang=xx -> terjemahkan konten on-demand (cache DB) untuk pembaca asing.
    const lang = normalizeLocale(new URL(request.url).searchParams.get("lang"));

    const [heroSlidesRaw, testimonialsRaw, faqsRaw, siteContentRaw] = await Promise.all([
      prisma.heroSlide.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.testimonial.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.faqItem.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.siteContent.findMany().catch(() => []),
    ]);

    let heroSlides = heroSlidesRaw.length > 0 ? heroSlidesRaw : DEFAULT_HERO_SLIDES;
    let testimonials = testimonialsRaw.length > 0 ? testimonialsRaw : DEFAULT_TESTIMONIALS;
    let faqs = faqsRaw.length > 0 ? faqsRaw : DEFAULT_FAQS;
    let siteContent = siteContentRaw;

    if (lang) {
      heroSlides = await localizeRows("hero", heroSlides, (s: any) => String(s.id), ["tag", "caption", "alt"], lang);
      testimonials = await localizeRows("testimonial", testimonials, (s: any) => String(s.id), ["quote"], lang);
      faqs = await localizeRows("faq", faqs, (s: any) => String(s.id), ["question", "answer"], lang);
      siteContent = await localizeSiteContentRows(siteContent, lang);
    }

    let socialLinks = DEFAULT_SOCIAL_LINKS;
    const socialRow = siteContent.find((s: any) => s.key === SOCIAL_LINKS_KEY);
    if (socialRow?.value) {
      try {
        socialLinks = normalizeSocialLinks(JSON.parse(socialRow.value));
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        heroSlides,
        testimonials,
        faqs,
        siteContent,
        socialLinks,
      },
    });
  } catch (err: any) {
    console.error("Error fetching CMS content:", err);
    return NextResponse.json({
      success: true,
      data: {
        heroSlides: DEFAULT_HERO_SLIDES,
        testimonials: DEFAULT_TESTIMONIALS,
        faqs: DEFAULT_FAQS,
        siteContent: [],
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat mengubah konten." }, { status: 403 });
    }
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Tipe dan data konten wajib diisi." },
        { status: 400 }
      );
    }

    let created;
    if (type === "heroSlide") {
      created = await prisma.heroSlide.create({ data });
    } else if (type === "testimonial") {
      created = await prisma.testimonial.create({ data });
    } else if (type === "faq") {
      created = await prisma.faqItem.create({ data });
    } else if (type === "siteContent") {
      created = await prisma.siteContent.upsert({
        where: { key: data.key },
        create: data,
        update: data,
      });
    } else if (type === "socialLinks") {
      const value = Array.isArray(data) ? JSON.stringify(data) : JSON.stringify(data.links ?? data);
      created = await prisma.siteContent.upsert({
        where: { key: SOCIAL_LINKS_KEY },
        create: {
          key: SOCIAL_LINKS_KEY,
          group: "social",
          label: "Tautan Media Sosial",
          value,
        },
        update: { value },
      });
    } else if (type === "article") {
      const payload = normalizeArticleInput(data);
      if (!payload.title) {
        return NextResponse.json(
          { success: false, error: "Judul artikel wajib diisi." },
          { status: 400 }
        );
      }
      // Slug harus unik
      const clash = await prisma.article.findUnique({ where: { slug: payload.slug } });
      if (clash) {
        payload.slug = `${payload.slug}-${Date.now().toString(36).slice(-4)}`;
      }
      created = await prisma.article.create({ data: payload as any });
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "CMS_CREATE",
          userId: user.id,
          description: `Administrator menambah konten CMS tipe ${type}.`,
        },
      });
    } catch {}

    // Pre-translate (fire-and-forget) agar konten baru langsung tersedia
    // dalam bahasa asing tanpa menunggu pengunjung asing datang.
    schedulePreTranslate(type, data, created);

    return NextResponse.json({
      success: true,
      message: "Konten berhasil ditambahkan.",
      data: created,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating CMS item:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan konten." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat mengubah konten." }, { status: 403 });
    }
    const { type, id, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Parameter type dan data wajib diisi." },
        { status: 400 }
      );
    }

    let updated;
    if (type === "heroSlide") {
      updated = await prisma.heroSlide.update({ where: { id }, data });
    } else if (type === "testimonial") {
      updated = await prisma.testimonial.update({ where: { id }, data });
    } else if (type === "faq") {
      updated = await prisma.faqItem.update({ where: { id }, data });
    } else if (type === "siteContent") {
      updated = await prisma.siteContent.upsert({
        where: { key: data.key },
        create: data,
        update: data,
      });
    } else if (type === "socialLinks") {
      const value = Array.isArray(data) ? JSON.stringify(data) : JSON.stringify(data.links ?? data);
      updated = await prisma.siteContent.upsert({
        where: { key: SOCIAL_LINKS_KEY },
        create: {
          key: SOCIAL_LINKS_KEY,
          group: "social",
          label: "Tautan Media Sosial",
          value,
        },
        update: { value },
      });
    } else if (type === "article") {
      const current = await prisma.article.findUnique({ where: { id } });
      if (!current) {
        return NextResponse.json(
          { success: false, error: "Artikel tidak ditemukan." },
          { status: 404 }
        );
      }
      const payload = normalizeArticleInput(data, current);
      if (!payload.title) {
        return NextResponse.json(
          { success: false, error: "Judul artikel wajib diisi." },
          { status: 400 }
        );
      }
      // Slip uniqueness: jika slug diubah dan dipakai artikel lain -> tolak
      if (payload.slug !== current.slug) {
        const clash = await prisma.article.findUnique({ where: { slug: payload.slug } });
        if (clash) {
          return NextResponse.json(
            {
              success: false,
              error: `Slug "${payload.slug}" sudah dipakai artikel lain.`,
            },
            { status: 409 }
          );
        }
      }
      updated = await prisma.article.update({ where: { id }, data: payload as any });
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "CMS_UPDATE",
          userId: user.id,
          description: `Administrator memperbarui konten CMS tipe ${type}.`,
        },
      });
    } catch {}

    // Pre-translate (fire-and-forget) — cache lama otomatis dianggap basi
    // karena source teks berubah, lalu dibuat ulang.
    schedulePreTranslate(type, data, updated);

    return NextResponse.json({
      success: true,
      message: "Konten berhasil diperbarui.",
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating CMS item:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui konten." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ success: false, error: "Hanya Administrator yang dapat mengubah konten." }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: "Parameter type dan id wajib diisi." },
        { status: 400 }
      );
    }

    if (type === "heroSlide") {
      await prisma.heroSlide.delete({ where: { id } });
    } else if (type === "testimonial") {
      await prisma.testimonial.delete({ where: { id } });
    } else if (type === "faq") {
      await prisma.faqItem.delete({ where: { id } });
    } else if (type === "siteContent") {
      await prisma.siteContent.delete({ where: { id } });
    } else if (type === "article") {
      await prisma.article.delete({ where: { id } });
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "CMS_DELETE",
          userId: user.id,
          description: `Administrator menghapus konten CMS tipe ${type}.`,
        },
      });
    } catch {}
    return NextResponse.json({
      success: true,
      message: "Konten berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Error deleting CMS item:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menghapus konten." },
      { status: 500 }
    );
  }
}
