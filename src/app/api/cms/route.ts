import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_LINKS_KEY,
  normalizeSocialLinks,
} from "@/config/social";

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
    const [heroSlides, testimonials, faqs, siteContent] = await Promise.all([
      prisma.heroSlide.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.testimonial.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.faqItem.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.siteContent.findMany().catch(() => []),
    ]);

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
        heroSlides: heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES,
        testimonials: testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS,
        faqs: faqs.length > 0 ? faqs : DEFAULT_FAQS,
        siteContent: siteContent,
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

export async function POST(request: Request) {
  try {
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
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

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

export async function PUT(request: Request) {
  try {
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
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

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

export async function DELETE(request: Request) {
  try {
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
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe konten tidak valid." },
        { status: 400 }
      );
    }

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
