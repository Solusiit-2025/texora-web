/**
 * Kamus teks halaman "Minta Penawaran" (RFQ) untuk 6 bahasa.
 * Dipisah dari dictionary utama agar file utama tetap ringkas.
 */

export interface QuoteCopy {
  eyebrow: string;
  title: string;
  lead: string;
  name: string;
  namePlaceholder: string;
  company: string;
  companyPlaceholder: string;
  email: string;
  phone: string;
  country: string;
  countryPlaceholder: string;
  meters: string;
  products: string;
  message: string;
  messagePlaceholder: string;
  file: string;
  fileHint: string;
  removeFile: string;
  sample: string;
  sampleHint: string;
  submit: string;
  sending: string;
  privacy: string;
  successTitle: string;
  successBody: string;
  backToCatalog: string;
  backToHome: string;
  validation: string;
  genericError: string;
  fileTooBig: string;
  fileType: string;
  benefitsTitle: string;
  benefits: string[];
  pdfCta: string;
  pdfHint: string;
  statReply: string;
  statReplyDesc: string;
  statFree: string;
  statSampleDesc: string;
}

const id: QuoteCopy = {
  eyebrow: "Permintaan Penawaran",
  title: "Minta Penawaran Harga Kain",
  lead: "Ceritakan kebutuhan kain Anda — jenis kain, estimasi panjang, dan target warna. Tim sales kami akan membalas dengan harga bertingkat, termin pembayaran, dan jadwal produksi dalam 1-2 jam kerja.",
  name: "Nama Lengkap",
  namePlaceholder: "Nama Anda",
  company: "Nama Perusahaan / Brand",
  companyPlaceholder: "PT Contoh Tekstil",
  email: "Email",
  phone: "WhatsApp / Telepon",
  country: "Negara",
  countryPlaceholder: "Indonesia / Turkey / UAE",
  meters: "Estimasi Kebutuhan (meter)",
  products: "Jenis Kain yang Dibutuhkan",
  message: "Detail Kebutuhan",
  messagePlaceholder:
    "Warna target, lebar kain, gramatur, tingkat repeats, deadline produksi, tema shipments, dan catatan teknis lainnya.",
  file: "File Referensi (opsional)",
  fileHint: "Unggah file desain / spesifikasi (JPG, PNG, WebP, atau PDF — maks 2MB).",
  removeFile: "Hapus file",
  sample: "Saya ingin sample swatch gratis dikirim ke alamat saya",
  sampleHint: "Contoh kain asli (Dryfit, Voal, Satin, Scuba) untuk memeriksa warna & tekstur sebelum order.",
  submit: "Kirim Permintaan Penawaran",
  sending: "Mengirim...",
  privacy:
    "Data Anda hanya digunakan untuk penyusunan penawaran. Kami tidak membagikan data ke pihak ketiga.",
  successTitle: "Permintaan Penawaran Terkirim!",
  successBody:
    "Terima kasih! Tim sales Texora sudah menerima permintaan Anda dan akan menghubungi via email/WhatsApp dalam 1-2 jam kerja. selama menunggu, Anda dapat mengunduh katalog PDF kami untuk melihat spesifikasi lengkap.",
  backToCatalog: "Lihat Katalog Kain",
  backToHome: "Kembali ke Beranda",
  validation: "Mohon lengkapi nama dan email yang valid.",
  genericError:
    "Terjadi masalah saat mengirim. Silakan coba lagi atau hubungi kami via WhatsApp.",
  fileTooBig: "Ukuran file maksimal 2MB.",
  fileType: "Tipe file harus JPG, PNG, WebP, atau PDF.",
  benefitsTitle: "Kenapa Menawar lewat Texora?",
  benefits: [
    "Harga bertingkat otomatis — semakin panjang pesanan, semakin ringan harga per meternya.",
    "Sample swatch gratis untuk memverifikasi warna & tekstur sebelum order.",
    "Proofing digital sebelum naik mesin cetak, jadi tidak ada kejutan warna.",
    "Jadwal produksi transparan dengan pelacakan SPK real-time.",
  ],
  pdfCta: "Unduh Katalog PDF",
  pdfHint: "Katalog lengkap dengan spesifikasi & harga tier (Bahasa Indonesia).",
  statReply: "1-2 jam",
  statReplyDesc: "Balasan penawaran",
  statFree: "Gratis",
  statSampleDesc: "Sample swatch",
};

const en: QuoteCopy = {
  eyebrow: "Request a Quote",
  title: "Request a Fabric Price Quote",
  lead: "Tell us what you need — fabric type, estimated length, and target colour. Our sales team replies with tiered pricing, payment terms, and a production schedule within 1-2 working hours.",
  name: "Full Name",
  namePlaceholder: "Your name",
  company: "Company / Brand",
  companyPlaceholder: "Example Textiles Ltd.",
  email: "Email",
  phone: "WhatsApp / Phone",
  country: "Country",
  countryPlaceholder: "Indonesia / Turkey / UAE",
  meters: "Estimated Requirement (meters)",
  products: "Fabric Types Needed",
  message: "Requirement Details",
  messagePlaceholder:
    "Target colour, fabric width, weight, repeat count, production deadline, shipment theme, and any other technical notes.",
  file: "Reference File (optional)",
  fileHint: "Upload your artwork / spec sheet (JPG, PNG, WebP, or PDF — max 2MB).",
  removeFile: "Remove file",
  sample: "Please send me a free fabric swatch",
  sampleHint:
    "Real fabric samples (Dryfit, Voal, Satin, Scuba) so you can verify colour and texture before ordering.",
  submit: "Send Quote Request",
  sending: "Sending...",
  privacy:
    "Your details are used only to prepare your quotation. We never share data with third parties.",
  successTitle: "Quote Request Sent!",
  successBody:
    "Thank you! Texora's sales team has received your request and will contact you by email/WhatsApp within 1-2 working hours. Meanwhile you can download our PDF catalogue for full specifications.",
  backToCatalog: "Browse Fabric Catalogue",
  backToHome: "Back to Home",
  validation: "Please fill in your name and a valid email.",
  genericError:
    "Something went wrong while sending. Please try again or contact us on WhatsApp.",
  fileTooBig: "Maximum file size is 2MB.",
  fileType: "File type must be JPG, PNG, WebP, or PDF.",
  benefitsTitle: "Why request a quote with Texora?",
  benefits: [
    "Automatic tiered pricing — the longer your order, the lighter the price per meter.",
    "Free swatch samples to verify colour and texture before you commit.",
    "Digital proofing before the press runs, so there are no colour surprises.",
    "Transparent production schedule with real-time work-order tracking.",
  ],
  pdfCta: "Download PDF Catalogue",
  pdfHint: "Full catalogue with specifications and tier pricing (Indonesian).",
  statReply: "1-2 hours",
  statReplyDesc: "Quote response time",
  statFree: "Free",
  statSampleDesc: "Swatch sample",
};

const zh: QuoteCopy = {
  eyebrow: "询价申请",
  title: "申请布料价格报价",
  lead: "请告诉我们您的需求——布料类型、预计长度与目标颜色。我们的销售团队将在 1-2 个工作小时内回复阶梯价格、付款条件与生产排期。",
  name: "姓名",
  namePlaceholder: "您的姓名",
  company: "公司 / 品牌",
  companyPlaceholder: "示例纺织有限公司",
  email: "邮箱",
  phone: "WhatsApp / 电话",
  country: "国家",
  countryPlaceholder: "印度尼西亚 / 土耳其 / 阿联酋",
  meters: "预计需求（米）",
  products: "所需布料类型",
  message: "需求详情",
  messagePlaceholder:
    "目标颜色、布宽、克重、循环数、生产交期、出货方式及其他技术说明。",
  file: "参考文件（可选）",
  fileHint: "上传设计稿 / 规格表（JPG、PNG、WebP 或 PDF，最大 2MB）。",
  removeFile: "删除文件",
  sample: "请免费寄送布样给我",
  sampleHint: "提供真实布料小样（Dryfit、Voal、Satin、Scuba），便于下单前确认颜色与手感。",
  submit: "发送询价申请",
  sending: "发送中...",
  privacy: "您的信息仅用于准备报价，我们不会与第三方共享。",
  successTitle: "询价申请已发送！",
  successBody:
    "感谢您的咨询！Texora 销售团队已收到您的需求，将在 1-2 个工作小时内通过邮件/WhatsApp 与您联系。您也可以先下载我们的 PDF 目录查看完整规格。",
  backToCatalog: "浏览布料目录",
  backToHome: "返回首页",
  validation: "请填写姓名与有效邮箱。",
  genericError: "发送时出现问题，请重试或通过 WhatsApp 联系我们。",
  fileTooBig: "文件最大 2MB。",
  fileType: "文件类型须为 JPG、PNG、WebP 或 PDF。",
  benefitsTitle: "为什么向 Texora 询价？",
  benefits: [
    "阶梯价格自动计算——订单越长，每米单价越低。",
    "免费布样，下单前先确认颜色与手感。",
    "开机前完成数字打样，颜色零意外。",
    "透明生产排期，支持工单实时追踪。",
  ],
  pdfCta: "下载 PDF 目录",
  pdfHint: "含完整规格与阶梯价格的目录（印度尼西亚语）。",
  statReply: "1-2 小时",
  statReplyDesc: "报价响应时间",
  statFree: "免费",
  statSampleDesc: "布样寄送",
};

const ja: QuoteCopy = {
  eyebrow: "見積依頼",
  title: "生地のお見積り依頼",
  lead: "必要な生地の種類・推定メートル数・希望色をお知らせください。営業チームが 1〜2 営業日以内に段階価格・支払条件・生産スケジュールでご回答します。",
  name: "お名前",
  namePlaceholder: "お名前",
  company: "会社名 / ブランド",
  companyPlaceholder: "株式会社サンプル",
  email: "メールアドレス",
  phone: "WhatsApp / 電話番号",
  country: "国",
  countryPlaceholder: "インドネシア / トルコ / UAE",
  meters: "推定使用量（メートル）",
  products: "ご希望の生地",
  message: "ご要望の詳細",
  messagePlaceholder:
    "希望色、幅、重さ、レピート数、納期、輸送方法、その他の技術仕様など。",
  file: "参考ファイル（任意）",
  fileHint: "デザイン画や仕様書をアップロード（JPG / PNG / WebP / PDF、最大 2MB）。",
  removeFile: "ファイルを削除",
  sample: "生地サンプルを無償で送ってください",
  sampleHint:
    "実際の生地サンプル（Dryfit・Voal・Satin・Scuba）で色と手触りをご確認いただけます。",
  submit: "見積依頼を送信",
  sending: "送信中...",
  privacy: "お客様の情報は見積準備のみに使用し、第三者に提供することはありません。",
  successTitle: "見積依頼を送信しました！",
  successBody:
    "ありがとうございます。Texora 営業チームが依頼を受け付け、1〜2 営業日以内にメールまたは WhatsApp でご連絡します。その間、PDF カタログで仕様をご確認いただけます。",
  backToCatalog: "生地カタログを見る",
  backToHome: "ホームへ戻る",
  validation: "お名前と有効なメールアドレスをご入力ください。",
  genericError:
    "送信中に問題が発生しました。再度お試しいただくか、WhatsApp でお問い合わせください。",
  fileTooBig: "ファイルサイズは最大 2MB です。",
  fileType: "ファイル形式は JPG / PNG / WebP / PDF にしてください。",
  benefitsTitle: "Texora に見積りを依頼する理由",
  benefits: [
    "段階価格は注文量に応じて自動計算。多いほど 1 メートルあたりの単価が下がります。",
    "無償の生地サンプルで、発注前に色と質感を確認できます。",
    "本番印刷前にデジタルプルーフで確認するため色のズレがありません。",
    "透明な生産スケジュールと作業指示のリアルタイム追跡。",
  ],
  pdfCta: "PDF カタログをダウンロード",
  pdfHint: "仕様と段階価格を含むカタログ（インドネシア語）。",
  statReply: "1〜2 時間",
  statReplyDesc: "見積回答時間",
  statFree: "無償",
  statSampleDesc: "生地サンプル",
};

const de: QuoteCopy = {
  eyebrow: "Preisanfrage",
  title: "Preis für Stoffe anfragen",
  lead: "Beschreiben Sie Ihren Bedarf — Stoffart, geschätzte Meter und Zielfarbe. Unser Vertriebsteam antwortet innerhalb von 1–2 Werktagen mit Staffelpreisen, Zahlungszielen und Produktionsplan.",
  name: "Vollständiger Name",
  namePlaceholder: "Ihr Name",
  company: "Unternehmen / Marke",
  companyPlaceholder: "Beispiel Textil GmbH",
  email: "E-Mail",
  phone: "WhatsApp / Telefon",
  country: "Land",
  countryPlaceholder: "Indonesien / Türkei / VAE",
  meters: "Geschätzter Bedarf (Meter)",
  products: "Benötigte Stoffarten",
  message: "Details zum Bedarf",
  messagePlaceholder:
    "Zielfarbe, Stoffbreite, Grammatur, Rapportzahl, Produktionstermin, Versandart und weitere technische Hinweise.",
  file: "Referenzdatei (optional)",
  fileHint: "Design oder Spezifikationsblatt hochladen (JPG, PNG, WebP oder PDF — max. 2 MB).",
  removeFile: "Datei entfernen",
  sample: "Bitte senden Sie mir kostenlos ein Stoffmuster",
  sampleHint:
    "Echte Stoffmuster (Dryfit, Voal, Satin, Scuba), um Farbe und Griff vor der Bestellung zu prüfen.",
  submit: "Preisanfrage senden",
  sending: "Wird gesendet...",
  privacy:
    "Ihre Daten werden ausschließlich zur Angebotserstellung genutzt und nicht an Dritte weitergegeben.",
  successTitle: "Preisanfrage gesendet!",
  successBody:
    "Vielen Dank! Unser Vertriebsteam hat Ihre Anfrage erhalten und meldet sich innerhalb von 1–2 Werktagen per E-Mail oder WhatsApp. In der Zwischenzeit können Sie unseren PDF-Katalog einsehen.",
  backToCatalog: "Stoffkatalog ansehen",
  backToHome: "Zurück zur Startseite",
  validation: "Bitte Name und gültige E-Mail-Adresse angeben.",
  genericError:
    "Beim Senden ist ein Problem aufgetreten. Bitte erneut versuchen oder uns per WhatsApp kontaktieren.",
  fileTooBig: "Maximale Dateigröße: 2 MB.",
  fileType: "Dateityp muss JPG, PNG, WebP oder PDF sein.",
  benefitsTitle: "Warum Preise bei Texora anfragen?",
  benefits: [
    "Automatische Staffelpreise — je länger die Bestellung, desto günstiger der Meterpreis.",
    "Kostenlose Stoffmuster zur Farb- und Griffprüfung vor der Bestellung.",
    "Digitales Proofing vor dem Druck — keine Farbüberraschungen.",
    "Transparenter Produktionsplan mit Echtzeit-Tracking des Auftrags.",
  ],
  pdfCta: "PDF-Katalog herunterladen",
  pdfHint: "Vollständiger Katalog mit Spezifikationen und Staffelpreisen (Indonesisch).",
  statReply: "1–2 Stunden",
  statReplyDesc: "Angebots-Antwortzeit",
  statFree: "Kostenlos",
  statSampleDesc: "Stoffmuster",
};

const ar: QuoteCopy = {
  eyebrow: "طلب عرض سعر",
  title: "اطلب سعر الأقمشة",
  lead: "أخبرنا باحتياجك — نوع القماش والطول التقريبي واللون المطلوب. سيرد فريق المبيعات لدينا خلال 1-2 ساعة عمل بالأسعار المتدرجة وشروط الدفع وجدول الإنتاج.",
  name: "الاسم الكامل",
  namePlaceholder: "اسمك",
  company: "الشركة / العلامة التجارية",
  companyPlaceholder: "شركة النسيج مثال",
  email: "البريد الإلكتروني",
  phone: "واتساب / الهاتف",
  country: "الدولة",
  countryPlaceholder: "إندونيسيا / تركيا / الإمارات",
  meters: "الكمية التقديرية (متر)",
  products: "أنواع الأقمشة المطلوبة",
  message: "تفاصيل الاحتياج",
  messagePlaceholder:
    "اللون المستهدف، عرض القماش، الوزن، عدد التكرارات، موعد التسليم، طريقة الشحن، وأي ملاحظات فنية أخرى.",
  file: "ملف مرجعي (اختياري)",
  fileHint: "ارفع ملف التصميم أو ورقة المواصفات (JPG أو PNG أو WebP أو PDF — بحد أقصى 2 ميجابايت).",
  removeFile: "إزالة الملف",
  sample: "أرغب في استلام عينة قماش مجانية",
  sampleHint:
    "عينات قماش حقيقية (Dryfit و Voal و Satin و Scuba) للتحقق من اللون والملمس قبل الطلب.",
  submit: "إرسال طلب عرض السعر",
  sending: "جارٍ الإرسال...",
  privacy: "تُستخدم بياناتك فقط لإعداد عرض السعر، ولا نشاركها مع أي طرف ثالث.",
  successTitle: "تم إرسال طلب عرض السعر!",
  successBody:
    "شكرًا لك! استلم فريق مبيعات Texora طلبك وسيتواصل معك عبر البريد الإلكتروني أو واتساب خلال 1-2 ساعة عمل. يمكنك في هذه الأثناء تحميل كتالوج PDF لمعرفة المواصفات الكاملة.",
  backToCatalog: "تصفح كتالوج الأقمشة",
  backToHome: "العودة للرئيسية",
  validation: "يرجى إدخال الاسم وبريد إلكتروني صحيح.",
  genericError:
    "حدثت مشكلة أثناء الإرسال. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.",
  fileTooBig: "الحد الأقصى لحجم الملف 2 ميجابايت.",
  fileType: "يجب أن يكون نوع الملف JPG أو PNG أو WebP أو PDF.",
  benefitsTitle: "لماذا تطلب عرض السعر من Texora؟",
  benefits: [
    "تسعير متدرج تلقائي — كلما زاد الطلب، انخفض سعر المتر.",
    "عينات قماش مجانية للتحقق من اللون والملمس قبل الالتزام بالطلب.",
    "معاينة رقمية قبل الطباعة حتى لا مفاجآت في الألوان.",
    "جدول إنتاج شفاف مع تتبع مباشر لأوامر العمل.",
  ],
  pdfCta: "تحميل كتالوج PDF",
  pdfHint: "كتالوج كامل بالمواصفات والأسعار المتدرجة (باللغة الإندونيسية).",
  statReply: "1-2 ساعة",
  statReplyDesc: "وقت الرد على العرض",
  statFree: "مجاناً",
  statSampleDesc: "عينة قماش",
};

export const QUOTE_COPY: Record<string, QuoteCopy> = { id, en, zh, ja, de, ar };
