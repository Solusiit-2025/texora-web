/**
 * Kamus teks halaman Artikel / Pusat Panduan Tekstil (6 bahasa).
 *
 * Dipisah dari dictionary utama (src/lib/i18n/dictionary.ts) supaya file
 * utama tetap ringkas dan teks khusus artikel mudah dirawat.
 */

export interface ArticleCopy {
  eyebrow: string;
  title: string;
  lead: string;
  searchPlaceholder: string;
  filterAll: string;
  resultCount: string;
  readMinutes: string;
  publishedOn: string;
  updatedOn: string;
  tocTitle: string;
  relatedTitle: string;
  relatedProductsTitle: string;
  emptyTitle: string;
  emptyDesc: string;
  backToArticles: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  pdfCta: string;
  authorLabel: string;
  writtenBy: string;
  relatedEmpty: string;
  minRead: string;
  categories: Record<string, string>;
  types: Record<string, string>;
}

const id: ArticleCopy = {
  eyebrow: "Pusat Panduan Tekstil",
  title: "Artikel & Panduan Tekstil Sublimasi",
  lead:
    "Panduan praktis dari tim produksi Texora: memilih kain, mengatur mesin sublimasi, menjaga kualitas cetak, hingga memahami harga & termin untuk brand garmen. Ditulis oleh teknisi cetak, bukan sekadar copywriter.",
  searchPlaceholder: "Cari artikel, topik, atau kata kunci...",
  filterAll: "Semua",
  resultCount: "artikel",
  readMinutes: "menit baca",
  publishedOn: "Terbit",
  updatedOn: "Diperbarui",
  tocTitle: "Daftar Isi",
  relatedTitle: "Artikel Terkait",
  relatedProductsTitle: "Kain yang Dibahas",
  emptyTitle: "Belum ada artikel",
  emptyDesc: "Coba kata kunci lain atau pilih kategori lain.",
  backToArticles: "Semua Artikel",
  ctaTitle: "Butuh penawaran harga?",
  ctaBody:
    "Ceritakan jenis kain, estimasi panjang, dan warna target Anda. Tim sales kami membalas harga bertingkat, termin, dan jadwal produksi dalam 1-2 jam kerja.",
  ctaButton: "Minta Penawaran",
  pdfCta: "Unduh Katalog PDF",
  authorLabel: "Penulis",
  writtenBy: "Ditulis oleh",
  relatedEmpty: "Belum ada artikel terkait.",
  minRead: "Baca",
  categories: {
    sportswear: "Sportswear & Activewear",
    "hijab-fashion": "Fashion & Hijab",
    "home-living": "Home Living & Dekorasi",
    merchandise: "Merchandise & Event",
    proses: "Proses, Teknis & Bisnis",
    panduan: "Panduan Tekstil",
  },
  types: {
    panduan: "Panduan",
    tips: "Tips",
    "case-study": "Studi Kasus",
    news: "Berita Pabrik",
  },
};

const en: ArticleCopy = {
  eyebrow: "Technical Knowledge Hub",
  title: "Articles & Sublimation Textile Guides",
  lead:
    "Practical notes from the Texora production team: choosing fabric, tuning the sublimation press, protecting print quality, and understanding pricing and payment terms for garment brands. Written by print engineers, not copywriters.",
  searchPlaceholder: "Search articles, topics, or keywords...",
  filterAll: "All",
  resultCount: "articles",
  readMinutes: "min read",
  publishedOn: "Published",
  updatedOn: "Updated",
  tocTitle: "Table of Contents",
  relatedTitle: "Related Articles",
  relatedProductsTitle: "Fabrics Discussed",
  emptyTitle: "No articles yet",
  emptyDesc: "Try another keyword or pick a different category.",
  backToArticles: "All Articles",
  ctaTitle: "Need a price quote?",
  ctaBody:
    "Tell us the fabric type, estimated length, and target colour. Our sales team replies with tiered pricing, payment terms, and a production schedule within 1-2 working hours.",
  ctaButton: "Request a Quote",
  pdfCta: "Download PDF Catalogue",
  authorLabel: "Author",
  writtenBy: "Written by",
  relatedEmpty: "No related articles yet.",
  minRead: "Read",
  categories: {
    sportswear: "Sportswear & Activewear",
    "hijab-fashion": "Fashion & Hijab",
    "home-living": "Home Living & Decor",
    merchandise: "Merchandise & Event",
    proses: "Process, Technical & Business",
    panduan: "Textile Guides",
  },
  types: {
    panduan: "Guide",
    tips: "Tips",
    "case-study": "Case Study",
    news: "Factory News",
  },
};

const zh: ArticleCopy = {
  eyebrow: "纺织知识中心",
  title: "文章与升华印花技术指南",
  lead:
    "来自 Texora 生产团队的实用笔记：选布、调机、保证印花品质，以及品牌服装的价格与付款条款。由印花工程师撰写，而非营销文案。",
  searchPlaceholder: "搜索文章、主题或关键词……",
  filterAll: "全部",
  resultCount: "篇文章",
  readMinutes: "分钟阅读",
  publishedOn: "发布于",
  updatedOn: "更新于",
  tocTitle: "目录",
  relatedTitle: "相关文章",
  relatedProductsTitle: "文中涉及的布料",
  emptyTitle: "暂无文章",
  emptyDesc: "请尝试其他关键词或选择其他分类。",
  backToArticles: "全部文章",
  ctaTitle: "需要报价吗？",
  ctaBody:
    "告诉我们布料类型、预计用量与目标颜色。我们的销售团队将在 1-2 个工作小时内回复阶梯价格、付款条件与生产排期。",
  ctaButton: "申请报价",
  pdfCta: "下载 PDF 目录",
  authorLabel: "作者",
  writtenBy: "撰稿",
  relatedEmpty: "暂无相关文章。",
  minRead: "阅读",
  categories: {
    sportswear: "运动与休闲服饰",
    "hijab-fashion": "时尚与头巾",
    "home-living": "家居与装饰",
    merchandise: "周边与活动",
    proses: "工艺、技术与商务",
    panduan: "纺织指南",
  },
  types: {
    panduan: "指南",
    tips: "技巧",
    "case-study": "案例研究",
    news: "工厂动态",
  },
};

const ja: ArticleCopy = {
  eyebrow: "テキスタイル知識ハブ",
  title: "Sublimation テキスタイルの記事とガイド",
  lead:
    "Texora 生産チームの実務メモ：生地の選び方、sublimation press の調整、プリント品質の維持、ブランド向けの価格と支払条件。コピーライターではなくプリントエンジニアが執筆しています。",
  searchPlaceholder: "記事・トピック・キーワードを検索…",
  filterAll: "すべて",
  resultCount: "件の記事",
  readMinutes: "分で読めます",
  publishedOn: "公開日",
  updatedOn: "更新日",
  tocTitle: "目次",
  relatedTitle: "関連記事",
  relatedProductsTitle: "生地の種類",
  emptyTitle: "記事がまだありません",
  emptyDesc: "別のキーワードを試すか、カテゴリーを変更してください。",
  backToArticles: "すべての記事",
  ctaTitle: "お見積り必要ですか？",
  ctaBody:
    "生地の種類、推定メートル数、希望色をお知らせください。営業チームが 1〜2 営業日以内に段階価格・支払条件・生産スケジュールでご回答します。",
  ctaButton: "見積依頼",
  pdfCta: "PDF カタログをダウンロード",
  authorLabel: "執筆",
  writtenBy: "執筆",
  relatedEmpty: "関連記事はまだありません。",
  minRead: "読了",
  categories: {
    sportswear: "スポーツ・アクティブウェア",
    "hijab-fashion": "ファッション・ヒジャブ",
    "home-living": "ホーム-living・インテリア",
    merchandise: "ノベルティ・イベント",
    proses: "工程・技術・ビジネス",
    panduan: "テキスタイルガイド",
  },
  types: {
    panduan: "ガイド",
    tips: "コツ",
    "case-study": "事例",
    news: "工場ニュース",
  },
};

const de: ArticleCopy = {
  eyebrow: "Technischer Wissenshub",
  title: "Artikel & Leitfäden für Sublimationstextilien",
  lead:
    "Praktische Notizen aus dem Texora-Produktionsteam: Stoffauswahl, Einstellung der Sublimationspresse, dauerhafte Druckqualität sowie Preise und Zahlungsziele für Modebrands. Geschrieben von Drucktechnikern, nicht von Copywritern.",
  searchPlaceholder: "Artikel, Themen oder Stichwörter suchen...",
  filterAll: "Alle",
  resultCount: "Artikel",
  readMinutes: "Min. Lesezeit",
  publishedOn: "Veröffentlicht",
  updatedOn: "Aktualisiert",
  tocTitle: "Inhaltsverzeichnis",
  relatedTitle: "Ähnliche Artikel",
  relatedProductsTitle: "Behandelte Stoffe",
  emptyTitle: "Noch keine Artikel",
  emptyDesc: "Versuche einen anderen Suchbegriff oder eine andere Kategorie.",
  backToArticles: "Alle Artikel",
  ctaTitle: "Preisangebot benötigt?",
  ctaBody:
    "Nennen Sie uns Stoffart, geschätzte Meter und Zielfarbe. Unser Vertriebsteam antwortet innerhalb von 1–2 Werktagen mit Staffelpreisen, Zahlungszielen und Produktionsplan.",
  ctaButton: "Angebot anfragen",
  pdfCta: "PDF-Katalog herunterladen",
  authorLabel: "Autor",
  writtenBy: "Geschrieben von",
  relatedEmpty: "Noch keine ähnlichen Artikel.",
  minRead: "Lesen",
  categories: {
    sportswear: "Sportswear & Activewear",
    "hijab-fashion": "Fashion & Hijab",
    "home-living": "Wohnen & Dekoration",
    merchandise: "Merchandise & Event",
    proses: "Prozess, Technik & Geschäft",
    panduan: "Textil-Leitfäden",
  },
  types: {
    panduan: "Leitfaden",
    tips: "Tipps",
    "case-study": "Fallstudie",
    news: "Fabriknews",
  },
};

const ar: ArticleCopy = {
  eyebrow: "مركز معرفة النسيج",
  title: "مقالات وأدلة أقمشة التسامي",
  lead:
    "ملاحظات عملية من فريق الإنتاج في Texora: اختيار القماش، ضبط آلة الطباعة، الحفاظ على جودة الطباعة، وفهم الأسعار وشروط الدفع لعلامات الأزياء. كتبها مهندسو طباعة وليس كتاب تسويق.",
  searchPlaceholder: "ابحث في المقالات والمواضيع والكلمات المفتاحية…",
  filterAll: "الكل",
  resultCount: "مقالات",
  readMinutes: "دقائق قراءة",
  publishedOn: "نُشر",
  updatedOn: "حُدّث",
  tocTitle: "المحتويات",
  relatedTitle: "مقالات ذات صلة",
  relatedProductsTitle: "الأقمشة المذكورة",
  emptyTitle: "لا توجد مقالات بعد",
  emptyDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
  backToArticles: "كل المقالات",
  ctaTitle: "تحتاج عرض سعر؟",
  ctaBody:
    "أخبرنا بنوع القماش والطول التقريبي واللون المطلوب. سيرد فريق المبيعات خلال 1-2 ساعة عمل بالأسعار المتدرجة وشروط الدفع وجدول الإنتاج.",
  ctaButton: "اطلب عرض سعر",
  pdfCta: "تحميل كتالوج PDF",
  authorLabel: "الكاتب",
  writtenBy: "كتبه",
  relatedEmpty: "لا توجد مقالات ذات صلة بعد.",
  minRead: "اقرأ",
  categories: {
    sportswear: "رياضة وملابس نشطة",
    "hijab-fashion": "أزياء وحجاب",
    "home-living": "منزل وديكور",
    merchandise: "منتجات ترويجية وفعاليات",
    proses: "العمليات والتقنية والأعمال",
    panduan: "أدلة النسيج",
  },
  types: {
    panduan: "دليل",
    tips: "نصائح",
    "case-study": "دراسة حالة",
    news: "أخبار المصنع",
  },
};

export const ARTICLE_COPY: Record<string, ArticleCopy> = { id, en, zh, ja, de, ar };
