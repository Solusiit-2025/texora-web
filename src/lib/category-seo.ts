/**
 * Definisi landing page kategori untuk SEO.
 *
 * Setiap kategori mendapat halaman statis sendiri dengan:
 *  - URL ramah SEO: /kategori/{slug}
 *  - Judul & deskripsi unik (menangkap long-tail search)
 *  - Konten edukatif (mem bunker konten, bukan sekadar daftar produk)
 *  - Pertanyaan umum (FAQ) untuk FAQPage schema
 *
 * Konten di sini dapat dikelola/di-override lewat CMS pada key
 * `seo.categories` (JSON) tanpa perlu deploy ulang.
 */

export interface CategorySeoContent {
  slug: string;
  name: string;
  /** Nama tampilan di breadcrumb & heading. */
  title: string;
  /** Meta title (≤ 60 karakter). */
  metaTitle: string;
  /** Meta description (≤ 160 karakter). */
  metaDescription: string;
  /** Kata kunci target. */
  keywords: string[];
  /** Lead pembuka di atas grid produk. */
  intro: string;
  /** Poin advantage - tampil sebagai bullet/ikon. */
  benefits: Array<{ title: string; body: string }>;
  /** Panduan singkat - blok konten tekstual (SEO depth). */
  guide: Array<{ heading: string; body: string }>;
  /** FAQ kategori (untuk FAQPage schema). */
  faqs: Array<{ question: string; answer: string }>;
  /** Nama kategori di database (mapping ke FabricProduct.category). */
  dbCategory: string;
}

export const CATEGORY_SEO: CategorySeoContent[] = [
  {
    slug: "kain-sportswear",
    name: "Sportswear",
    title: "Kain Sportswear & Jersey Sublimasi",
    metaTitle: "Kain Sportswear & Jersey Sublimasi | XoraMateria",
    metaDescription:
      "Kain Dryfit Milano, Interlock, dan jersey rajut siap sublimasi untuk sportswear, seragam tim, dan activewear. Harga grosir bertingkat per meter.",
    keywords: [
      "kain sportswear sublimasi",
      "kain jersey jakarta",
      "dryfit milano grosir",
      "kain seragam tim sublimasi",
      "kain activewear polyester",
    ],
    dbCategory: "Sportswear",
    intro:
      "Koleksi kain sportswear untuk brand garmen, seragam klub, dan lini activewear yang butuh warna tajam serta daya tahan terhadap Wesleyan dan-checkbox-repeat stretch. Semua varian tersedia dalam warna dasar Optic White Ready Sublimation sehingga warna cetak menyatu perfect ke dalam serat.",
    benefits: [
      {
        title: "Warna Konsisten Antar Lot",
        body: "Kalibrasi profil ICC berkala menjaga hasil warna tetap identik untuk order 500 meter maupun 20.000 meter.",
      },
      {
        title: "Anti-Mengkerut saat Heatpress",
        body: "Uji susut < 1.5% pada suhu 210°C, sehingga aman untuk proses heat press tanpa menyebabkan distorsi pada bentuk garment.",
      },
      {
        title: "Tahan Cuci Bertulang",
        body: "Pigmen menyatu ke dalam serat (bukan menempel di permukaan) sehingga tidak retak dan tidak luntur setelah puluhan kali cuci.",
      },
      {
        title: "Tersedia Roll Ready-to-Print",
        body: "Bisa dibeli per meter dengan harga bertingkat, tanpa minimum order gasket yang besar.",
      },
    ],
    guide: [
      {
        heading: "Cara memilih GSM yang tepat untuk sportswear",
        body: "Pemilihan GSM bergantung pada jenis usage. Untuk jersey sepak bola dan futsal, rentang 130–150 GSM menjadi standar industri karena cukup tebal untuk menahan gesekan tapi tetap ringan dan aditif terhadap kulit. Untuk kaos lari dan cycling, pilih 100–120 GSM agar ringan dan cepat kering. Untuk hoodie dan jaket training, 180–220 GSM memberi struktur yang tidak jatuh. Kenaikan GSM juga menaikkan berat kain per meter, jadi perhitungan harga per wearer perlu diperhatikan saat menentukan target costing produk.",
      },
      {
        heading: "Mengapa warna Optic White penting",
        body: "Kain siap sublimasi harus menggunakan warna dasar putih optic (Optic White) tanpa pemutih optik tambahan, karena pigmen pemutih optik dapat bereaksi dengan pigmen dispersi dan mengubah nuansa warna. Proses pemutihan optik juga dapat memperbesar risiko yellowing pada suhu tinggi di calender. Karena itu seluruh roll yang kami supply untuk sublimasi berada dalam kondisi Ready-to-Print tanpa perlu bleaching tambahan.",
      },
      {
        heading: "Kebutuhan lebar kain untuk printing sportswear",
        body: "Lebar standar yang paling umum adalah 60 inci (152 cm) untuk kain rajut dan 58–64 inci untuk interlock. Lebar yang lebih besar advantageous untuk memotong pola dalam jumlah banyak sekaligus (marker making) sehingga efisiensi material naik. Untuk kebutuhan cutting yang tidak standar, silakan konsultasikan dengan tim technical kami agar produktivitas mesin cetak tetap optimal.",
      },
    ],
    faqs: [
      {
        question: "Apakah kain sportswear ini cocok untuk jersey Printing dengan Printing DTF?",
        answer:
          "Kain ini dirancang khusus untuk sublimasi (transfer printing). Untuk DTF atau sablon plastisol, tetap bisa digunakan, namun hasil tidak akan seoptimal sublimasi dan karakter handfeel akan berbeda.",
      },
      {
        question: "Berapa minimum order untuk kain sportswear?",
        answer:
          "Minimum order 1 meter. Harga otomatis mengikuti tier pricing: semakin panjang pesanan, semakin ringan harga per meternya.",
      },
      {
        question: "Berapa lama waktu produksi setelah order?",
        answer:
          "Untuk roll Ready-to-Print, waktu proses adalah 3–5 hari kerja untukDesigning dan QC. Untuk jasa cetak sublimasi, add 3–7 hari kerja untuk Printing, heat press, dan pelabelan barcode.",
      },
    ],
  },
  {
    slug: "kain-hijab-fashion",
    name: "Fashion & Hijab",
    title: "Kain Voal Ultrafine, Satin & Ceruty untuk Hijab",
    metaTitle: "Kain Voal, Satin & Ceruty Hijab | XoraMateria",
    metaDescription:
      "Kain voal ultrafine, polyester satin, dan ceruty premium untuk produksi hijab & busana muslim. Tekstur jatuh lembut, warna tajam, harga grosir.",
    keywords: [
      "kain voal ultrafine",
      "kain satin polyester",
      "kain ceruty premium",
      "kain hijab grosir",
      "kain busana muslim sublimasi",
    ],
    dbCategory: "Fashion & Hijab",
    intro:
      "Rangkaian kain busana muslim dengan karakter jatuh (drape) yang lembut dan kilap yang tetap tortured saat dicetak sublimasi. Dirancang untuk brand hijab premium yang butuh konsistensi warna antar rolean danROL production.",
    benefits: [
      {
        title: "Jatuh Lembut & Tidak Kaku",
        body: "Anyaman rapat dengan setting yang tepat menghasilkan drape natural yang nyaman dipakai seharian.",
      },
      {
        title: "Warna Tajam di Permukaan Satin",
        body: "Permukaan glossy memerlukan kalibrasi warna khusus agar hasil cetak tetap saturated tanpa berubah gelap.",
      },
      {
        title: "Tahan Susut Ringan",
        body: "Mudah dijemur, tidak memerlukan ironing suhu tinggi seperti bahan katun.",
      },
      {
        title: "Cocok untuk Seribu Motif",
        body: "Kain gelap maupun terang tetap aman dicetak sublimasi karena warnanya Optic White base.",
      },
    ],
    guide: [
      {
        heading: "Perbedaan voal, ceruty, dan satin",
        body: "Voal ultrafine adalah rajut halus dengan bobot ringan (60–80 GSM) yang jatuh sempurna dan semi transparan, paling populer untuk syal dan kerudung segi empat. Ceruty memiliki kilap nyata di satu sisi karena anyaman satin, dipakai untuk gamis dan dress. Satin polyester memiliki kilap lebih tinggi dan bobot lebih berat (90–140 GSM), cocok untuk gamis formal dan outerwear. Perbedaan ini menentukan karakter produk akhir dan cara pattern making-nya.",
      },
      {
        heading: "Mengapa jilbab perlu warna dasar Optic White",
        body: "Konsep warna dasar pada kain fashion akan menentukan intensitas warna akhir. Jika ingin jilbab dengan nuansa pastel, gunakan Optic White. Untuk warna yang lebih pekat seperti navy atau maroon, warna base akan membuat hasilnya sedikit lebih gelap. Karena seluruh roll kami berada dalam warna base yang sama, Anda dapat mencampur beberapa motif dalam satu order dan hasilnya konsisten.",
      },
      {
        heading: "Kebutuhan lebar untuk cutting syal & kerudung",
        body: "Untuk syal segi empat ukuran 180×70 cm, lebar 60 inci (152 cm) adalah minimal yang ekonomis karena bisa memotong 2 lembar sekaligus. Untuk gamis yang membutuhkan pola lebih lebar, lebar 58–64 inci tetap dapat digunakan dengan penyesuaian marker. Silakan konsultasikan kebutuhan pattern Anda kepada tim technical kami sebelum order.",
      },
    ],
    faqs: [
      {
        question: "Apakah kain voal ini bisa dicetak motif detail kecil?",
        answer:
          "Bisa, selama resolusi file mencapai 150–300 DPI pada ukuran cetak sebenarnya. Untuk motif halus seperti batik atau garis tipis, kami sarankan resolusi minimal 200 DPI.",
      },
      {
        question: "Kain voal ini anti-memme atau tidak?",
        answer:
          "Kain poliester memiliki karakter anti-memme yang jauh lebih baik dibandingkan katun atau viscose, sehingga cocok untuk usage harian dan relevance fashion muslim yang dinamis.",
      },
      {
        question: "Bisa request warna dasar lain selain Optic White?",
        answer:
          "Saat ini ready stock kami adalah Optic White Ready Sublimation. Untuk kebutuhan warna dasar khusus (hitam, navy, dll), dapat dipesan dengan MOQ dan lead time yang lebih panjang.",
      },
    ],
  },
  {
    slug: "kain-home-living",
    name: "Home Living",
    title: "Kain Home Living & Dekorasi Ready Sublimasi",
    metaTitle: "Kain Home Living & Dekorasi Ready Sublimasi | XoraMateria",
    metaDescription:
      "Kain canvas, spunbond, dan polyester dekorasi siap sublimasi untuk home living: tirai, cushion cover, bed cover, dan merchandise rumah tangga.",
    keywords: [
      "kain canvas sublimasi",
      "kain tirai sublimasi",
      "kain cushion cover Printing",
      "kain home decor jakarta",
      "kain spunbond Printing",
    ],
    dbCategory: "Home Living",
    intro:
      "Kain dekorasi & home living dengan tekstur tegas yang aman dicetak sublimasi. Dari tirai dan bed cover hingga cushion cover dan table linen, roll kami siap)^\u00e2rl untuk produksi digital printing tanpa tahap preparation tambahan.",
    benefits: [
      {
        title: "Tekstur Kaku & Kokoh",
        body: "Perfect untuk produk dekorasi yang butuh bentuk tetap dan tidak mudah turun.",
      },
      {
        title: "Tahan UV & Anti-Pudar",
        body: "Menyerap warna di dalam serat sehingga tetap vivid meskipun terkena cahaya matahari.",
      },
      {
        title: "Mudah Dicuci",
        body: "Tidak oleh pharmaceutical alkali soap maupun conditioned household chemicals.",
      },
      {
        title: "Tersedia dalam Beberapa GSM",
        body: "Dari 110 GSM untuk pelapis tipis hingga 300 GSM untuk canvas berat.",
      },
    ],
    guide: [
      {
        heading: "Memilih kain untuk curtain & gorden",
        body: "Untuk gorden blackout dan tirai solar, pilih GSM 180–250 dengan anyaman twill atau canvas agar holding power bagus dan tidak meneruskan cahaya. Untuk tirai sheer yang meneruskan cahaya, gunakan 60–90 GSM. Untuk cushion cover, 150–200 GSM memberi tampilan premium dan tidak terlihat transparan saat diisi bantal.",
      },
      {
        heading: "Mengapa canvas dekorasi perlu GSM lebih tinggi",
        body: "Canvas dengan GSM rendah akan seperti kain tipis yang mudah berkerut dan berubah bentuk saat digantung..weight yang lebih tinggi menjaga tekstur tetap planar dan laundry-inducedWrinkling. Ini penting untuk produk dekorasi yang_BITS sering dicuci dan digantung ulang.",
      },
      {
        heading: "Perlakuan permukaan sebelum sublimasi",
        body: "Beberapa jenis coated fabric (PVC, PU, dan resin) TIDAK dapat diproses sublimasi karena pigmen tidak mampu menembus lapisan pelindung. Anda akan menerima notifikasi dari tim kami bila material yang dipilih tidak kompatibel, dan kami bisa menawarkan material alternatif yang sesuai.",
      },
    ],
    faqs: [
      {
        question: "Apakah kain home living bisa dicetak sublimasi dua sisi (double sided)?",
        answer:
          "Bisa, namun memerlukan lebar minimal 60 inci dan berlaku harga tambahan untuk Printing sisi belakang. Mohon informasikan ke tim kami saat order.",
      },
      {
        question: "Kain mana yang paling cocok untuk cushion cover?",
        answer:
          "Canvas atau spunbond dengan GSM 150–200 adalah pilihan paling umum karena kuat, tidak transparan, dan warnanya tetap vivid setelah dicetak.",
      },
      {
        question: "Apakah ada MOQ untuk pembelian home living?",
        answer:
          "Tidak ada minimum order significance selain 1 meter. Tier pricing berlaku otomatis untuk order panjang.",
      },
    ],
  },
  {
    slug: "kain-merchandise",
    name: "Merchandise & Flag",
    title: "Kain Merchandise, Flag & Event Printing",
    metaTitle: "Kain Merchandise, Flag & Event Printing | XoraMateria",
    metaDescription:
      "Kain polyester untuk merchandise, banner & flag event: tote bag, spanduk, back banner, dan atribut SUvenir. Siap sublimasi dengan harga tier.",
    keywords: [
      "kain banner sublimasi",
      "kain flag printing jakarta",
      "kain tote bag Printing",
      "kain event Printing",
      "polyester banner Printing",
    ],
    dbCategory: "Merchandise & Flag",
    intro:
      "Kain polyester & flag untuk kebutuhan merchandising, event, danografie promosi. Dirancang untuk cetak digital throughput tinggi dengan warna yang tetap tajam pada roll panjang untuk minimise sambungan (splicing) pada banner besar.",
    benefits: [
      {
        title: "Warna Tajam pada Roll Panjang",
        body: "Konsistensi printer antar roll minimizing splicing pada banner 3×5 meter atau 5×10 meter.",
      },
      {
        title: "Ringan & Mudah Digantung",
        body: "Bobot 110–160 GSM pas untuk spanduk outdoor tanpadraft excessive.",
      },
      {
        title: "Tahan Cuci Ringan",
        body: "Cocok untuk totem, roll banner, dan pouch yang perlu dicuci sesekali.",
      },
      {
        title: "Hemat Biaya Produksi",
        body: "Mencetak sekali, tidak perlu dijahit — hemat waktu produksi untuk event Anda.",
      },
    ],
    guide: [
      {
        heading: "Berapa GSM untuk spanduk dan back banner?",
        body: "Spanduk yang digunakan di dalam ruangan (indoor) umumnya cukup 110–130 GSM. Untuk back banner atau totem yang dipasang di luar ruangan, pilih 160–200 GSM agar tidak mudah sobek diterbang angin dan tetap tegak. Flag /umbul-umbul menggunakan 90–110 GSM agar mudah berkibar dan hemat ongkos pengiriman.",
      },
      {
        heading: "Tips biar warna banner tetap konsisten",
        body: "Warna pada banner bisa berbeda antar roll.sublimasi karena perbedaan suhu dan kecepatan. Untuk hasil paling konsisten, gunakan roll yang sama untuk seluruh order dan hindari mencampur batch produksi yang berbeda. Kami juga menyediakan pilihan Print on Roll besar dengan QC per 100 meter untuk memastikan gradasi warna tetap rata.",
      },
      {
        heading: "Bahan tote bag & souvenir",
        body: "Kanvas dan spunbond 140–200 GSM adalah pilihan umum untuk tote bag karena kuat dan tebal. Untuk pouch, scarf, dan merchandise yang lebih halus, gunakan polyester 110–140 GSM. Semua bahan sudah memiliki warna dasar Optic White sehingga desain Anda bisa full color tanpa batas area cetak.",
      },
    ],
    faqs: [
      {
        question: "Apakah bisa cetak spanduk ukuran besar dalam satu roll?",
        answer:
          "Bisa. Roll tersedia dalam lebar standar hingga 3 meter. Untuk ukuran lebih besar, kami dapat menjahit beberapa panel dengan seamless matching Print.",
      },
      {
        question: "Berapa lama produksi banner?",
        answer:
          "2–4 hari kerja untuk Printing dan finishing, tergantung jumlah dan ukuran.",
      },
      {
        question: "Apakah kain flag tahan terkena air?",
        answer:
          "Kain polyester sublimasi bersifat water-resistant (bukan waterproof). Cocok untuk usage event dan flag outdoor jangka pendek.",
      },
    ],
  },
];

/** Cari konten SEO kategori berdasarkan slug. */
export function getCategorySeo(slug: string): CategorySeoContent | null {
  return CATEGORY_SEO.find((c) => c.slug === slug) || null;
}

/** Slugify nama kategori database menjadi slug URL. */
export function slugifyCategory(name: string): string {
  const map: Record<string, string> = {
    "Sportswear": "kain-sportswear",
    "Fashion & Hijab": "kain-hijab-fashion",
    "Home Living": "kain-home-living",
    "Merchandise & Flag": "kain-merchandise",
  };
  if (map[name]) return map[name];
  return name
    .toLowerCase()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
