/**
 * Seed 12 artikel "Pusat Panduan Tekstil" (blog B2B).
 *
 * Jalankan: node scripts/seed-articles.mjs
 * Aman diulang: artikel di-skip kalau slug-nya sudah ada.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ARTICLES = [
  // ------------------------------------------------------------------
  {
    slug: "panduan-memilih-kain-sublimasi-sportwear",
    title: "Panduan Memilih Kain Sublimasi untuk Produksi Sportswear",
    excerpt:
      "Dryfit, jersey, atau pique? Panduan teknis memilih kain sublimasi untuk seragam olahraga: GSM, lebar kain, elastisitas, dan kebutuhan ready-to-print.",
    category: "sportswear",
    articleType: "panduan",
    tags: ["panduan", "sublimasi", "sportswear", "dryfit", "garmen"],
    relatedProducts: ["dryfit-milano-premium", "dryfit-brazil-wave", "dryfit-jarum-quickdry"],
    coverImage: "/images/hero/hero-sportswear.jpg",
    author: "Rudi Hartono",
    authorRole: "Supervisor Dyeing & Printing",
    readMinutes: 6,
    seoTitle: "Panduan Memilih Kain Sublimasi untuk Sportswear | Texora",
    seoDescription:
      "Cara memilih kain sublimasi untuk produksi sportswear: perbedaan dryfit, jersey, dan pique, memilih GSM, lebar kain, serta kebutuhan ready-to-print.",
    body: `<p>Kesalahan paling umum saat memulai produksi sportswear biasanya bukan di mesin cetak, melainkan di pemilihan kain. Banyak brand memesan satu jenis kain untuk semua kebutuhan: jersey untuk tim futsal, dryfit untuk seragam sekolah, dan pique untuk kemeja kantor. Akibatnya, kaus jadi tidak nyaman dipakai, motif terlihat kacau, atau biaya per pcs jauh melewati target.</p>
<h2>1. Mulai dari fungsi, bukan dari tren</h2>
<p>Sebelum memilih GSM, jawab satu pertanyaan lebih dulu: wearer dipakai dalam situasi apa? Untuk tim yang berlari, kain harus cepat kering dan ringan. Untuk seragam kantor, yang dicari adalah kerapian jahitan dan warna yang konsisten, bukan kemampuan menyerap keringat.</p>
<ul>
<li><strong>Aktivitas tinggi (futsal, lari, panjat dinding)</strong> — dryfit dengan teknologi wicking. Serat polyester menarik keringat ke permukaan kain lalu menguapkannya, sehingga wearer terasa jauh lebih gerah dibandingkan cotton jersey.</li>
<li><strong>Latihan harian dan seragam sekolah</strong> — dryfit atau jersey. Dryfit memberi kesan lebih ringan dan tidak mudah kusam; jersey tetap menjadi pilihan ekonomis dengan karakter jatuh yang lebihReserved ala kaos.</li>
<li><strong>Kemeja dan polo uniforms</strong> — pique dengan rajut bergaris. Teksturnya rapi, tidak menerawang, dan umumnya bertahan lebih lama di pemakaian kantor.</li>
</ul>
<h2>2. GSM: angka yang paling sering disalahartikan</h2>
<p>GSM adalah gram per meter persegi. Semakin tinggi, semakin tebal, semakin kaku, dan semakin tahan lama, tetapi juga semakin berat dan semakin jarang yang bisa dipakai untuk fashion.</p>
<ul>
<li><strong>120-140 GSM</strong> — ringan, untuk jersey dan activewear tipis. Cocok untuk warna terang dan motif detail halus.</li>
<li><strong>150-180 GSM</strong> — titik tengah terbaik untuk dryfit seragam. Tetap ringan, tidak transparan, dan jauh lebih awet.</li>
<li><strong>190-220 GSM</strong> — untuk activewear premium, jaket, dan seragam lapangan yang dipakai berat.</li>
</ul>
<p>Catatan teknis: semakin tebal kain, semakin lama waktu press yang dibutuhkan, dan semakin tinggi risiko blocking, yaitu bagian dalam kain yang menempel karena panas. Blocking muncul kalau suhu terlalu tinggi atau waktu terlalu lama. Untuk kain di atas 200 GSM, turunkan suhu 5 sampai 10 derajat dan perpanjang waktu 5 sampai 10 detik.</p>
<h2>3. Lebar kain:.jpeg</h2>
<p>Tentukan lebar sebelum mencetak artwork. Menyesuaikan layout saat lebar kain berubah berarti mengulang proofing dan membuang kain percobaan.</p>
<ul>
<li>36 inci (91 cm) — kaus, rash guard, singlet</li>
<li>40 inci (102 cm) — seragam kerja, kemeja, dress</li>
<li>60 inci (152 cm) — banner, spanduk, display textile</li>
</ul>
<h2>4. Ready-to-print: urutan kerja yang benar</h2>
<p>Kain dalam bentuk roll siap cetak (Optic White) sudah diproses menjadi warna dasar siap cetak. Urutan produksinya: greige, bleaching, dyeing optic white, calendering atau finishing, lalu digulung. Kalau brand membeli kain yang belum siap cetak, ada biaya dan waktu tambahan untuk proses di luar pabrik.</p>
<h2>5. Sample sebelum commit</h2>
<p>Selalu minta sample fisik minimal 30x30 cm sebelum order besar. Sample untuk dipakai launching, bukan untuk foto katalog. Periksa tiga hal: kerapatan_anyaman, ketebalan saat kain dibentangkan, dan akurasi warna di bawah pencahayaan yang akan dipakai di lapangan.</p>
<p>PT Texora Visi Prima menyediakan sampleran gratis untuk mitra terverifikasi, termasuk sample swatch Dryfit, Voal, Satin, dan Scuba. Dipadukan dengan kalkulator harga bertingkat, ini membuat estimasi budget jauh lebih akurat sebelum PO dikonfirmasi.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "dryfit-jersey-pique-membedakan",
    title: "Dryfit, Jersey, atau Pique? Membedakan Tiga Kain Sportswear Terlaris",
    excerpt:
      "Struktur rajut, karakter jatuh, dan elastisitas membedakan dryfit, jersey, dan pique. Panduan memilih tiga kain paling dicari di pabrik sublimasi.",
    category: "sportswear",
    articleType: "panduan",
    tags: ["dryfit", "jersey", "pique", "perbandingan kain", "sportswear"],
    relatedProducts: ["dryfit-milano-premium", "dryfit-brazil-wave", "dryfit-jarum-quickdry"],
    coverImage: "/images/fabrics/tc-sublimasi-distro-shirt.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 7,
    seoTitle: "Dryfit vs Jersey vs Pique: Mana yang Tepat? | Texora",
    seoDescription:
      "Perbedaan dryfit, jersey, dan pique dari struktur rajut, elastisitas, karakter jatuh, serta pemakaiannya untuk seragam olahraga dan fashion.",
    body: `<p>Ketiganya adalah keluarga rajut polyester, tetapi struktur anyaman dan treatment-nya berbeda. Itulah yang menentukan harga, tampilan, serta daya tahannya. Berikut perbandingan yang kami pakai saat advising brand yang baru memulai.</p>
<h2>1. Struktur rajut</h2>
<p><strong>Jersey</strong> memakai rajut single knit dengan titik-titik mata yang rapat. Murah, ringan, dan banyak dipakai untuk produksi massal. Cocok untuk merchandise event, kaus warna, dan lapisan dalam jersey.</p>
<p><strong>Dryfit</strong> tetap rajut single, tetapi dengan penampang serat mikroskopis berbentuk huruf V sehingga luas permukaannya lebih besar. Akibatnya, kain lebih cepat memindahkan keringat dan mengering lebih cepat dibanding jersey biasa. Inilah alasan teknis kenapa dryfit terasa dingin saat dipakai.</p>
<p><strong>Pique</strong> adalah rajut majemuk: dua lapis rajut dihubungkan pada titik-titik sehingga terbentuk pola sarang lebah. Hasilnya bertekstur, tidak menerawang, dan bentuk jatuhnya lebih tegas.</p>
<h2>2. Elastisitas dan daya pulih</h2>
<p>Dryfit Milano punya daya pulih (elastisitas balik) paling baik di kelas ini, penting untuk seragam yang dipakai setiap hari. Pique punya daya pulih sedang, tetapi tampilannya lebih rapi di badan sehingga cocok untuk kemeja formal. Jersey paling rentan berubah bentuk setelah beberapa kali cuci, terutama di bagian pinggang dan lengan.</p>
<h2>3. Karakter cetak sublimasi</h2>
<p>Semakin rapat struktur rajut, semakin halus dan tajam motif yang terbentuk. Dryfit Milano 140 sampai 180 GSM cocok untuk cetak penuh dengan gradasi halus. Pique cocok untuk logo dan motif solid, bukan gambar foto. Jersey paling memaafkan kesalahan, cocok untuk produksi besar dengan banyak warna solid.</p>
<h2>4. Tabel ringkas</h2>
<table>
<thead><tr><th>Aspek</th><th>Dryfit</th><th>Jersey</th><th>Pique</th></tr></thead>
<tbody>
<tr><td>Struktur</td><td>Single knit serong</td><td>Single knit rapat</td><td>Double knit sarang lebah</td></tr>
<tr><td>Bobot umum</td><td>135-185 GSM</td><td>120-160 GSM</td><td>180-240 GSM</td></tr>
<tr><td>Wicking</td><td>Sangat baik</td><td>Baik</td><td>Menengah</td></tr>
<tr><td>Kesan</td><td>Sporty, teknikal</td><td>Kasual, ringan</td><td>Rapi, premium</td></tr>
<tr><td>Ketahanan</td><td>Tinggi</td><td>Sedang</td><td>Tinggi</td></tr>
<tr><td>Harga</td><td>Menengah sampai atas</td><td>Ekonomis</td><td>Menengah</td></tr>
</tbody>
</table>
<h2>5. Rekomendasi praktis</h2>
<ul>
<li><strong>Jersey tim dengan 3 sampai 5 warna</strong> — pilih jersey 140 GSM, cetak penuh, empat sampai enam warna sudah menutup 90 persen kebutuhan tim.</li>
<li><strong>Dryfit seragam sekolah atau kantor</strong> — pilih 160 sampai 180 GSM dengan warna sedikit, jauh lebih hemat dan tidak perlu setrika terus-menerus.</li>
<li><strong>Polo dan Corporate</strong> — pilih pique, motif di area dada dan punggung, sisanya polos.</li>
</ul>
<p>Kalau masih ragu, kirimkan sample ke alamat kami. Kami kirimkan sample swatch lengkap dengan spesifikasi GSM, lebar, dan harga bertingkat, plus simulasi motif supaya Anda bisa menilai hasilnya sebelum PO.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "setting-heat-press-sublimasi-210-derajat",
    title: "Setting Heat Press Sublimasi 210 Derajat: Suhu, Tekanan, dan Waktu",
    excerpt:
      "Panduan teknis operator mesin sublimasi: setting suhu 210 derajat, tekanan, waktu press, kalender rotary, dan kesalahan yang menyebabkan warna gelap atau kudip.",
    category: "proses",
    articleType: "panduan",
    tags: ["setting mesin", "sublimasi", "produksi", "operator", "kualitas cetak"],
    relatedProducts: ["dryfit-milano-premium", "polyester-oxford-600d"],
    coverImage: "/images/hero/hero-printer.jpg",
    author: "Rudi Hartono",
    authorRole: "Supervisor Dyeing & Printing",
    readMinutes: 8,
    seoTitle: "Setting Heat Press Sublimasi 210 Derajat: Panduan Teknis | Texora",
    seoDescription:
      "Panduan operator mesin sublimasi: setting suhu, tekanan, waktu press, kalender rotary, serta penanganan masalah warna terlalu gelap, kusam, dan transfer tidak sempurna.",
    body: `<p>Sublimasi bukan sekadar soal panas. Ada tiga variabel yang saling terkait: suhu, tekanan, dan waktu. Salah satunya meleset, hasilnya langsung terlihat: warna terlalu gelap, motif buram, atau tinta tidak berpindah sama sekali. Panduan ini adalah standar operasional yang kami pakai di floors produksi Texora.</p>
<h2>1. Suhu: 200 sampai 210 derajat untuk polyester</h2>
<p>Sublimasi terjadi ketika tinta dispersi yang berkeadaan padat berubah menjadi gas di sekitar 180 sampai 200 derajat, lalu masuk ke dalam polimer polyester. Untuk hasil paling konsisten di mesin rotary kami, kami bekerja di 210 derajat dengan toleransi sekitar 5 derajat antar roll.</p>
<ul>
<li><strong>210 derajat</strong> — standar umum untuk rajut polyester dan kain tenun.</li>
<li><strong>200 sampai 205 derajat</strong> — turunkan bila kain mengandung elastane tinggi, atau warna terlalu gelap dan pekat.</li>
<li><strong>215 sampai 220 derajat</strong> — dihindari untuk sebagian besar kasus; hanya untuk kain filament yang sangat tebal dengan warna pekat.</li>
</ul>
<p>Semakin tinggi suhu, semakin banyak tinta yang berpindah, tetapi risiko blocking dan warna yang terlalu pekat sampai detail hilang juga makin besar.</p>
<h2>2. Tekanan: 4 sampai 6 bar pada kalender rotary</h2>
<p>Tekanan memastikan kertas transfer menekan permukaan kain secara merata. Terlalu rendah, ada bagian yang tidak mendapat tinta. Terlalu tinggi, permukaan kain bisa menjadi cekung dan motif terlihat tenggelam ke dalam serat sehingga warna dari jauh terlihat kusam.</p>
<p>Di mesin roll to roll, tekanan diatur lewat celah antar roll, bukan hidrolik per item, sehingga konsisten untuk ribuan meter dalam sekali jalan. Untuk press manual, gunakan tekanan setara 4 sampai 6 bar dan pastikan kertas transfer terhampar rapi tanpa kerutan.</p>
<h2>3. Waktu: 8 sampai 14 detik per meter</h2>
<p>Kecepatan belt menentukan lama kontak. Pada belt 60 meter per menit, kontak sekitar 9 detik per meter. Pada 40 meter per menit, sekitar 14 detik. Aturan praktis: mulai dari 10 detik, naikkan bila motif terlalu pucat, turunkan bila warna terlalu pekat atau blocking mulai terlihat.</p>
<h2>4. Kalibrasi warna: bagian yang paling sering dilewati</h2>
<p>Sebelum produksi massal, selalu kalibrasi profil warna ICC untuk setiap warna. Urutannya:</p>
<ol>
<li>Cetak chart warna dengan setting yang akan dipakai.</li>
<li>Ukur dengan spectrophotometer, bandingkan dengan target.</li>
<li>Simpan profil per warna di controller mesin.</li>
<li>Lakukan cetakan ulang 1 sampai 2 meter dan periksa secara visual di bawah pencahayaan daylight.</li>
</ol>
<p>Tanpa kalibrasi, warna antar roll bisa berbeda jelas. Pada order 3.000 meter, selisih kecil berarti ribuan unit yang berpotensi ditolak.</p>
<h2>5. Penanganan masalah cepat</h2>
<table>
<thead><tr><th>Gejala</th><th>Penyebab</th><th>Tindakan</th></tr></thead>
<tbody>
<tr><td>Warna terlalu gelap</td><td>Suhu terlalu tinggi atau waktu terlalu lama</td><td>Turunkan 5 derajat, percepat belt 10 persen</td></tr>
<tr><td>Motif pucat</td><td>Suhu terlalu rendah atau tinta kedaluwarsa</td><td>Naikkan 5 sampai 10 derajat, ganti tinta</td></tr>
<tr><td>Motif buram</td><td>Tekanan tidak rata atau kertas transfer keriput</td><td>Set ulang celah roll, rapikan kertas</td></tr>
<tr><td>Kain mengkerut</td><td>Suhu tinggi, waktu lama, pendinginan cepat</td><td>Turunkan suhu, tambahkan roll pendingin</td></tr>
<tr><td>Warna antar roll berbeda</td><td>Belum dikalibrasi</td><td>Kalibrasi profil ICC per warna</td></tr>
</tbody>
</table>
<h2>6. Checklist sebelum jalan produksi</h2>
<ul>
<li>Roll kertas transfer masih dalam masa simpan (6 sampai 12 bulan, simpan di ruang gelap 20 sampai 25 derajat)</li>
<li>Mesin sudah pemanasan minimal 30 menit</li>
<li>Chart warna sudah dikalibrasi dan disetujui</li>
<li>Sample approve sudah ada di tangan tim QC</li>
<li>Roll kain sudah dipasang dan core sudah sejajar</li>
</ul>
<p>Kami mengoperasikan mesin rotary 210 derajat dengan ruang kontrol penuh dan pemantauan SPK real time, sehingga buyer dapat memantau progres produksi tanpa harus berada di lokasi.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "sublimasi-vs-printing-plastisol",
    title: "Sublimasi atau Printing Plastisol: Mana yang Lebih Tahan Cuci?",
    excerpt:
      "Perbandingan teknik cetak untuk seragam: substrat tinta, daya tahan, rasa kain, dan hasil visual. Kapan memilih yang mana untuk brand garmen.",
    category: "proses",
    articleType: "panduan",
    tags: ["sublimasi", "plastisol", "printing", "ketahanan", "seragam"],
    relatedProducts: ["dryfit-milano-premium", "polyester-oxford-600d"],
    coverImage: "/images/hero/hero-rotary.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 6,
    seoTitle: "Sublimasi vs Plastisol: Mana yang Tahan Cuci? | Texora",
    seoDescription:
      "Perbandingan cetak sublimasi dan printing plastisol: kepekaan kain, daya tahan, detail warna, biaya, dan panduan memilih untuk seragam brand.",
    body: `<p>Dua teknik cetak paling umum di konveksi saat ini, dan keduanya punya tempatnya. Pertanyaan yang paling sering masuk ke tim kami: metode mana yang paling tahan dicuci? Jawabannya, sublimasi, tetapi hanya jika bahannya memang polyester dan siap sublimasi.</p>
<h2>1. Cara kerja, bukan sekadar tampilan</h2>
<p><strong>Sublimasi</strong>: tinta dispersi dipanaskan menjadi gas, masuk ke dalam molekul polyester, lalu terkunci secara fisik di dalam serat. Tidak ada lapisan tinta di atas permukaan kain. Yang tersisa hanyalah pigmen di dalam benang.</p>
<p><strong>Plastisol</strong>: tinta berbasis plastisol dicetak di atas permukaan kain lalu dipanaskan, membentuk lapisan film yang menempel di permukaan serat. Ada bantalan film di atas kain.</p>
<h2>2. Komparasi praktis</h2>
<table>
<thead><tr><th>Aspek</th><th>Sublimasi</th><th>Plastisol</th></tr></thead>
<tbody>
<tr><td>Transfer ke kain</td><td>Menyatu ke serat</td><td>Film di permukaan</td></tr>
<tr><td>Rasa kain</td><td>Sepenuhnya kain, tidak ada ketebalan</td><td>Terasa lebih tebal, bisa kaku</td></tr>
<tr><td>Ketahanan cuci</td><td>Sangat tinggi, tidak retak dan tidak mengelupas</td><td>Bisa retak dan mengelupas seiring waktu</td></tr>
<tr><td>Detail warna</td><td>Gradasi halus, nuansa foto realistis</td><td>Warna solid dan mencolok</td></tr>
<tr><td>Substrat</td><td>Polyester minimal 80 persen</td><td>Hampir semua kain</td></tr>
<tr><td>Biaya setup</td><td>Murah, satu warna sama saja</td><td>Mahal, biaya screen per warna</td></tr>
<tr><td>Minimum order</td><td>Bisa 1 meter</td><td>Umumnya ratusan</td></tr>
</tbody>
</table>
<h2>3. Kapan memilih plastisol</h2>
<ul>
<li>Kain berbasis cotton atau campuran yang tidak bisa disublimasi</li>
<li>Butuh warna solid dengan kode Pantone spesifik milik brand</li>
<li>Butuh efekEmboss seperti print rugby</li>
<li>Produksi kecil dengan tiga sampai lima warna dan tanpa gambar detail</li>
</ul>
<h2>4. Kapan memilih sublimasi</h2>
<ul>
<li>Seragam dengan cetak penuh dan desain foto atau gradasi</li>
<li>Produksi besar dengan banyak warna dalam sekali jalan tanpa biaya screen</li>
<li>Kain polyester 100 persen, atau minimal 80 persen. Campuran 50:50 dengan cotton umumnya tidak cocok</li>
<li>Produk yang sering dicuci: jersey tim, seragam sekolah, activewear</li>
</ul>
<h2>5. Jebakan umum: saya punya kain cotton, bisa sublimasi?</h2>
<p>Tidak bisa. Serat cotton bukan polyester, sehingga tinta dispersi tidak punya substrat untuk masuk. Yang terjadi jika dipaksakan: motif hanya menempel di permukaan, mudah retak, dan hasilnya tidak memuaskan.</p>
<p>Solusinya: cetak sublimasi pada panel polyester, lalu dijahit ke panel cotton. Kami sering menyarankan pola ini untuk brand yang ingin kesan jersey cotton tetapi tetap ingin cetak penuh. Alternatifnya, gunakan polyester minimal 70 sampai 80 persen. Makin tinggi kandungan polyester, makin baik hasilnya.</p>
<p>Semua kain siap sublimasi yang kami produksi (Optic White Ready Sublimation) sudah memiliki label komposisi yang jelas. Anda bisa langsung mengecek spesifikasi teknis setiap roll di katalog, atau meminta sample untuk diuji sendiri oleh vendor percetakan Anda.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "voal-ultrafine-atau-ceruty-hijab",
    title: "Voal Ultrafine atau Ceruty? Memilih Kain Hijab yang Tepat",
    excerpt:
      "Perbedaan voal ultrafine, ceruty, dan chiffon: bobot, jatuh, tembus cahaya, serta kesesuaiannya untuk gamis, khimar, syal, sampai jilbab kantor.",
    category: "hijab-fashion",
    articleType: "panduan",
    tags: ["voal", "ceruty", "hijab", "fashion", "pilihan kain"],
    relatedProducts: ["voal-ultrafine-premium", "chiffon-ceruty-babydoll", "polyester-silk-satin"],
    coverImage: "/images/hero/hero-hijab.jpg",
    author: "Nadia Puspita",
    authorRole: "Fashion & Material Consultant",
    readMinutes: 7,
    seoTitle: "Voal Ultrafine atau Ceruty? Panduan Kain Hijab | Texora",
    seoDescription:
      "Bandingkan voal ultrafine, ceruty, dan chiffon untuk hijab: bobot, karakter jatuh, tingkat tembus cahaya, dan panduan memilih per jenis produk.",
    body: `<p>Hijab bukan satu jenis kain. keluhan yang paling sering kami terima: brand sudah desain gamis, baru sadar kain yang dipakai terlalu menerawang untuk koleksi formal, atau terlalu berat untuk dipakai harian. Panduan ini membantu memilih berdasarkan produk, bukan berdasarkan tren.</p>
<h2>1. Ceruty: yang paling halus dan paling menerawang</h2>
<p>Ceruty atau chiffon punya anyaman paling rapat di kelompok ini, tetapi tetap ringan dan tembus cahaya. Sekitar 55 sampai 70 GSM, jatuh mengikuti bentuk badan dan sedikit bergoyang saat berjalan. Cocok untuk:</p>
<ul>
<li>Gamis syar'i dan outer gamis yang terlihat effortless</li>
<li>Layering dengan dress harian atau kemeja</li>
<li>Brand yang mengejar kesan premium dan feminin</li>
</ul>
<p>Catatan produksi: warna harus solid atau bermotif halus, karena warna terang pada ceruty bisa menampakkan sambungan jahitan. Gunakan lining atau dua lapis untuk bagian sensitif.</p>
<h2>2. Voal Ultrafine: pilihan paling aman</h2>
<p>Voal ultrafine berada di antara ceruty dan jersey: bobot sekitar 60 sampai 80 GSM, anyaman rapat tapi sedikit lebih berisi dari ceruty sehingga tidak menerawang berlebihan, dan jatuhnya lebih stabil. Inilah pilihan yang paling jarang bermasalah untuk produk konsumer:</p>
<ul>
<li>Gamis dan khimar harian yang tetap sopan dan tidak transparan</li>
<li>Seragam modern: bioskop, kantor, sekolah</li>
<li>Produk yang butuh motif besar seperti batik atau floral tanpa kehilangan detail</li>
</ul>
<h2>3. Chiffon dan Satin: dua permukaan berbeda</h2>
<p>Jangan tertukar. Chiffon seperti ceruty bersifat doff, sedangkan satin berkilap dan licin. Satin polyester memberi kesan luxurious dan drape yang jatuh, cocok untuk gamis gaun, syal, dan lini produk premium. Untuk gamis yang butuh bentuk tetap dan tidak tergoyang, pilih satin. Untuk yang butuh ringan dan mengalir, pilih voal.</p>
<h2>4. Tabel panduan cepat</h2>
<table>
<thead><tr><th>Produk</th><th>Rekomendasi kain</th><th>Alasan</th></tr></thead>
<tbody>
<tr><td>Gamis syar'i dan khimar</td><td>Voal Ultrafine</td><td>Tidak menerawang, jatuh, aditif</td></tr>
<tr><td>Gamis formal dan gaun</td><td>Polyester Satin</td><td>Kilap premium, drape jatuh</td></tr>
<tr><td>Khimar kasual harian</td><td>Voal ultrafine atau ceruty</td><td>Ringan, mudah dipakai</td></tr>
<tr><td>Syal dan scarf</td><td>Voal, chiffon, atau satin</td><td>Sesuai target harga dan kesan</td></tr>
<tr><td>Jilbab kantor formal</td><td>Voal ultrafine tebal</td><td>Tidak menerawang, terlihat profesional</td></tr>
<tr><td>Outer dan kaftan</td><td>Ceruty atau chiffon</td><td>Ringan, mengalir, mudah dilapis</td></tr>
</tbody>
</table>
<h2>5. Empat hal yang perlu dicek sebelum PO</h2>
<ol>
<li><strong>Uji opakness</strong> — letakkan kain di atas kain putih, nyalakan lampu dari belakang. Untuk gamis formal, opakness minimal 80 persen.</li>
<li><strong>Hand feel dan jatuh</strong> — pegang 1 yard, jatuhkan. Voal jatuh dengan baik, ceruty lebih bergoyang, satin lebih licin.</li>
<li><strong>Colorfastness</strong> — sublimasi di Optic White memberi warna solid dan tahan cuci. Selalu cek akurasi warna sebelum printing.</li>
<li><strong>Shrinkage</strong> — minta data shrink test, standar industri toleransi sekitar 3 persen setelah tiga kali cuci. Kain yang kami jual sudah melalui proses heat setting.</li>
</ol>
<p>Kami bisa mengirim sample swatch gratis untuk Voal, Satin, Ceruty, dan Scuba supaya tim desain bisa langsung menilai jatuh dan opakness sebelum menentukan PO. Silakan ajukan lewat form Minta Penawaran.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "kenapa-viscose-tidak-bisa-disublimasi",
    title: "Kenapa Viscose Tidak Bisa Disublimasi? Penjelasan Teknis untuk Pembeli Kain",
    excerpt:
      "Sublimasi hanya bekerja pada polyester. Ini penjelasan teknis kenapa viscose, rayon, dan katun tidak bisa disublimasi, serta solusinya untuk brand yang tetap ingin cetak penuh.",
    category: "proses",
    articleType: "panduan",
    tags: ["viscose", "rayon", "katun", "sublimasi", "material", "polyester"],
    relatedProducts: ["polyester-silk-satin", "voal-ultrafine-premium", "dryfit-milano-premium"],
    coverImage: "/images/fabrics/chiffon-khimar-syari.jpg",
    author: "Rudi Hartono",
    authorRole: "Supervisor Dyeing & Printing",
    readMinutes: 6,
    seoTitle: "Kenapa Viscose Tidak Bisa Disublimasi? | Texora",
    seoDescription:
      "Penjelasan teknis kenapa viscose, rayon, dan katun tidak bisa disublimasi, cara mengenali bahan polyester, dan solusi printing untuk brand yang ingin motif penuh.",
    body: `<p>Pertanyaan ini muncul hampir setiap minggu: kainnya lembut, jatuhnya bagus, dan rasanya flow. Bisa disublimasi? Jawabannya bergantung pada satu hal, yaitu isi seratnya. Sublimasi bukan soal suhu atau tekanan, tapi soal kimia serat.</p>
<h2>1. Prinsip dasarnya: pigmen butuh tempat masuk</h2>
<p>Tinta sublimasi adalah pigmen dispersi berkeadaan padat. Saat dipanaskan, pigmen berubah menjadi gas dan harus menyatu dengan polimer polyester. Molekul pigmen dispersi secara kimia cocok dengan struktur kristal polyester, sehingga bisa masuk ke dalam serat dan terkunci di sana secara permanen.</p>
<p>Viscose atau rayon, katun, linen, sutra, dan wol memiliki struktur polimer yang berbeda, yaitu selulosa atau protein. Pigmen dispersi tidak punya afinitas kimia terhadapnya. Hasilnya, pigmen hanya menempel di permukaan kain tanpa masuk ke serat.</p>
<h2>2. Kenapa hasilnya buruk, bukan sekadar tidak bisa</h2>
<ul>
<li><strong>Motif retak setelah dicuci</strong> — film tinta di permukaan kain bersifat rapuh dan tidak lentur seperti serat polyester.</li>
<li><strong>Warna pudar</strong> — pigmen yang tidak terkunci di serat mudah terlepas saat dicuci atau terkena keringat.</li>
<li><strong>Memudar karena panas</strong> — suhu tubuh 37 derajat sudah cukup untuk membuat pigmen di permukaan bermigrasi, terutama pada warna gelap.</li>
<li><strong>Terasa kaku dan berat</strong> — lapisan tinta menambah bobot dan mengurangi jatuh kain.</li>
</ul>
<p>Kami sering menerima sample viscose yang dicoba disublimasi oleh vendor lain, dan hampir selalu hasilnya sama: motif menempel di permukaan, tepi motif mulai terkelupas, warna terasa blok warna.</p>
<h2>3. Cara cepat mengenali polyester</h2>
<table>
<thead><tr><th>Uji</th><th>Polyester</th><th>Viscose atau katun</th></tr></thead>
<tbody>
<tr><td>Ujung bakar</td><td>Meleleh dan membentuk tetesan</td><td>Terbakar seperti kertas</td></tr>
<tr><td>Cuci air dingin</td><td>Nyenyak, tidak menyusut</td><td>Sedikit menyusut</td></tr>
<tr><td>Serat di bawah mikroskop</td><td>Serat bulat dan licin</td><td>Serat pipih dan berlekuk</td></tr>
<tr><td>Label komposisi</td><td>Tulis polyester 100 persen</td><td>Tulis viscose, rayon, atau cotton</td></tr>
</tbody>
</table>
<p>Cara paling aman: baca label komposisi. Brand yang menulis polyester tanpa mencantumkan angka kandungan biasanya sudah mencantumkan kandungan serat dengan benar, tapi tidak ada salahnya diverifikasi ulang.</p>
<h2>4. Solusi untuk brand yang tetap ingin motif penuh</h2>
<ul>
<li><strong>Panel polyester dicetak sublimasi lalu dijahit ke panel cotton</strong> — pola ini dipakai luas untuk gamis hybrid: badan cotton, lengan polyester cetak penuh. Hasilnya motif penuh dengan bahan tetap lembut.</li>
<li><strong>Ganti ke polyester 100 persen</strong> — satin untuk versi premium, voal untuk versi harian, dryfit untuk versi sporty.</li>
<li><strong>Printing plastisol</strong> — pilihan lain bila bahan tidak bisa diganti, dengan catatan hasilnya berada di permukaan dan tidak setahan sublimasi.</li>
<li><strong>Digital printing</strong> — bisa masuk ke katun, tetapi gradasi halus terbatas, warnanya tidak secerah sublimasi, dan ekonominya hanya masuk untuk kuantitas kecil.</li>
</ul>
<h2>5. Soal campuran viscose</h2>
<p>Campuran 50 persen viscose dan 50 persen polyester masih bisa disublimasi, tetapi hasilnya lebih redup dan kurang tahan lama, karena hanya separuh serat yang terbuka menerima pigmen. Standar yang kami sarankan: minimal 80 persen polyester untuk hasil sublimasi yang jernih dan awet.</p>
<p>Semua kain siap sublimasi yang kami produksi sudah berupa Optic White Ready Sublimation dan label komposisinya tercatat. Silakan cek spesifikasi teknis setiap roll di katalog, atau minta sample untuk diuji langsung oleh vendor percetakan Anda.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "merawat-cetak-sublimasi-tahan-cuci",
    title: "Merawat Cetak Sublimasi: 7 Aturan Agar Warna Tidak Pudar",
    excerpt:
      "Panduan care label untuk produk sublimasi: suhu cuci, pewarna, drying, larangan pemutih dan pelembut kain, serta kesalahan yang merusak motif.",
    category: "proses",
    articleType: "tips",
    tags: ["perawatan", "cucian", "care label", "tips", "konsumen"],
    relatedProducts: ["dryfit-milano-premium", "polyester-oxford-600d", "taffeta-parachute-ripstop"],
    coverImage: "/images/fabrics/canvas-cushion-interior.jpg",
    author: "Nadia Puspita",
    authorRole: "Fashion & Material Consultant",
    readMinutes: 5,
    seoTitle: "Merawat Cetak Sublimasi: 7 Aturan Agar Warna Tidak Pudar | Texora",
    seoDescription:
      "Panduan care label produk sublimasi: suhu dan siklus cuci, pewarna, pengeringan, larangan pemutih dan pelembut kain, serta kesalahan yang merusak cetak.",
    body: `<p>Keunggulan sublimasi adalah motifnya menyatu di dalam serat, bukan menempel di permukaan. Karena itu, bila dirawat dengan benar, warnanya tidak pudar dan tidak mengelupas selama bertahun-tahun. Tetap ada kebiasaan salah yang memperpendek umur pakai produk. Berikut care label yang kami rekomendasikan.</p>
<h2>1. Suhu dan siklus cuci</h2>
<p>Gunakan air dingin, maksimal 30 derajat, dengan siklus cepat atau halus. Air panas adalah musuh utama pigmen dispersi. Pada 60 derajat, warna gelap bisa bergeser 5 sampai 10 persen dalam satu kali pencucian.</p>
<h2>2. Jangan memakai pemutih</h2>
<p>Pemutih chlorine merusak pigmen dan bisa membuat warna pucat atau kekuningan. Untuk noda membandel, gunakan pemutih oksigen yang aman untuk polyester.</p>
<h2>3. Pisahkan warna, jangan dicampur</h2>
<p>Sublimasi dengan kain gelap bisa menyebabkan transfer warna ke kain putih. Pisahkan pencucian berdasarkan warna, dan untuk produk dengan bagian cetak dan bagian putih, balik bagian dalam saat dicuci untuk mengurangi risiko noda.</p>
<h2>4. Pengeringan: panas rendah atau udara</h2>
<p>Mesin pengering dengan panas tinggi memicu efek memanas dan dapat membuat kain menyusut serta berubah bentuk. Gunakan pengaturan panas rendah, atau lebih aman: jemur di tempat teduh. Untuk activewear, jemur dengan bentuk datar helps mempertahankan bentuk.</p>
<h2>5. Jangan memakai pelembut kain</h2>
<p>Pelembut kain membentuk lapisan pada serat yang menutupi pigmen. Efeknya, motif terasa kaku dan warnanya terlihat redup seiring pemakaian. Inilah advice yang sering terlewat dan jadi penyebab utama keluhan warna pudar padahal produk belum banyak dicuci.</p>
<h2>6. Setika dengan hati-hati</h2>
<p>Setika langsung di area cetak bisa memindahkan pigmen. Gunakan setrika uap dari belakang kain, atau alas pelindung di atas motif. Untuk dryfit dan rajut, biasanya tidak perlu disetrika sama sekali.</p>
<h2>7. Simpan dengan benar</h2>
<p>Simpan dalam kondisi kering, terlindung dari sinar matahari langsung, dan jangan ditekuk pada bagian motif. Untuk produk dalam kemasan ritel, gunakan kertas pelindung, jangan plastik yang menempel langsung karena dapat membuat motif lengket.</p>
<h2>Template care label siap pakai</h2>
<blockquote><p>CUCI: Air dingin (maks 30 derajat), siklus halus, pisahkan warna. JANGAN memakai pemutih atau pelembut kain. SETRIKA: Hindari area cetak, gunakan uap dari belakang. JEMUR: di tempat teduh, hindari panas tinggi.</p></blockquote>
<h2>Bonus: checklist sebelum produk tayang</h2>
<ul>
<li>Klaim tahan luntur hanya sah bila care label dipakai konsumen dengan benar</li>
<li>Sertakan tips perawatan di halaman produk di website, biasanya ikut menaikkan keyakinan pembeli</li>
<li>Untuk order besar, sertakan sample care label ke tim QC sebagai acuan</li>
</ul>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "canvas-vs-oxford-600d",
    title: "Canvas atau Oxford 600D? Memilih Kain untuk Totebag, Bantal, dan Dekorasi",
    excerpt:
      "Perbandingan bobot, kekuatan, dan karakter cetak antara canvas polyester, Oxford 600D, dan taffeta ripstop untuk produk non-pakaian.",
    category: "merchandise",
    articleType: "panduan",
    tags: ["canvas", "oxford", "ripstop", "merchandise", "dekorasi"],
    relatedProducts: ["canvas-polyester-industrial", "polyester-oxford-600d", "taffeta-parachute-ripstop"],
    coverImage: "/images/fabrics/oxford-backpack-merch.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 6,
    seoTitle: "Canvas vs Oxford 600D: Memilih Kain Totebag dan Dekorasi | Texora",
    seoDescription:
      "Bandingkan canvas polyester, Oxford 600D, dan taffeta ripstop untuk totebag, bantal, tenda, dan dekorasi: bobot, ketahanan, dan karakter cetak sublimasi.",
    body: `<p>Di luar pakaian, pasar B2B tekstil punya istilah sendiri. Totebag, bantal, tenda, dan display event punya requirement berbeda, dan salah pilih kain berarti barang jadi terasa murah sebelum dipakai. Berikut peta singkat tiga kain yang paling sering kami rekomendasikan untuk non apparel.</p>
<h2>1. Canvas polyester</h2>
<p>Canvas adalah anyaman plain yang tebal, sering dikombinasikan dengan coating atau laminasi. Polyester canvas sekitar 400 sampai 600 GSM, terasa tegas, tidak lentur, dan cocok untuk:</p>
<ul>
<li>Totebag dan tas belanja yang harus menahan bebanisi</li>
<li>Bantal dan sarung bantal untuk furnitur outdoor, kafe, atau hotel</li>
<li>Alas display, pouch keras, dan tas seragam</li>
</ul>
<p>Karakter cetak: permukaan rata dan tebal membuat motif solid dan mencolok bagus. Foto realistis atau gradasi halus akan kehilangan detail karena tekstur kain. Untuk tote yang dipakai harian, canvas 500 GSM tanpa coating sudah cukup kuat.</p>
<h2>2. Oxford 600D</h2>
<p>Oxford adalah anyaman basket dua arah, lebih ringan dari canvas, dan punya karakter teknis. Angka 600D adalah satuan denier, makin besar makin tebal. Untuk tote dan tas, Oxford 600D memberi:</p>
<ul>
<li>Bobot lebih ringan dari canvas dengan kekuatan yang tetap memadai</li>
<li>Permukaan halus sehingga hasil cetak jauh lebih tajam dan gradasi tetap terbaca</li>
<li>Awet, cepat kering, dan tidak mudah kusam</li>
</ul>
<p>Oxford 600D adalah pilihan paling aman bagi brand yang memulai produk tas: tampilannya rapi, harga masuk akal, dan hasil cetaknya menarik.</p>
<h2>3. Taffeta ripstop</h2>
<p>Ripstop ditandai pola garis halus yang dibuat dari benang lebih rapat setiap beberapa milimeter. Taffeta sendiri adalah anyaman plain yang licin dan tahan air. Cocok untuk:</p>
<ul>
<li>Banner, spanduk, flag event, dan tenda outdoor</li>
<li>Rain cover, pouch, dan tas outdoor</li>
<li>Merchandise event dan activation</li>
</ul>
<p>Karakter cetak: permukaan licin dan mengilap membuat warna lebih cerah dan tajam dengan kontras tinggi. Pola rip bisa sedikit terlihat pada motif besar yang solid, jadi gunakan motif bertekstur atau warna penuh.</p>
<h2>4. Tabel perbandingan</h2>
<table>
<thead><tr><th>Aspek</th><th>Canvas</th><th>Oxford 600D</th><th>Taffeta Ripstop</th></tr></thead>
<tbody>
<tr><td>Bobot</td><td>400-600 GSM</td><td>300-400 GSM</td><td>120-200 GSM</td></tr>
<tr><td>Karakter</td><td>Kaku, tebal</td><td>Teknis, serbaguna</td><td>Licin, ringan</td></tr>
<tr><td>Kekuatan</td><td>Tinggi</td><td>Tinggi</td><td>Sedang, tahan sobek</td></tr>
<tr><td>Cetak detail</td><td>Cukup</td><td>Bagus</td><td>Sangat bagus</td></tr>
<tr><td>Pakai utama</td><td>Tote besar, bantal</td><td>Tote, tas, seragam</td><td>Banner, flag, tenda</td></tr>
<tr><td>Harga</td><td>Menengah</td><td>Menengah</td><td>Ekonomis sampai menengah</td></tr>
</tbody>
</table>
<h2>5. Rekomendasi cepat</h2>
<ul>
<li><strong>Totebag dengan logo besar</strong> — Oxford 600D. Foto cetak tajam, harga masuk akal, dan siap produksi.</li>
<li><strong>Totebag heavy duty</strong> — Canvas 500 GSM.</li>
<li><strong>Banner outdoor 3x5 meter</strong> — Taffeta ripstop 190 GSM dengan ring reinforcement setiap 50 cm.</li>
<li><strong>Bantal dan sarung furnitur</strong> — Canvas 400 GSM, atau polyester microfiber bila kesan lembut lebih diutamakan.</li>
</ul>
<p>Semua pilihan di atas tersedia dalam warna Optic White Ready Sublimation di Texora, dengan lebar 36 sampai 60 inci. Kirimkan brief produk Anda, dan kami kirimkan sample kit agar tim desain bisa menilai jatuh kain dan hasil cetak sebelum PO.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "banner-flag-menggunakan-polyester",
    title: "Banner, Flag, dan Spanduk: Kenapa Harus Polyester",
    excerpt:
      "Alasan teknis banner dan flag outdoor memakai polyester, pilihan GSM dan finishing, serta tips desain agar warna tetap tajam saat tertiang di angin.",
    category: "merchandise",
    articleType: "panduan",
    tags: ["banner", "flag", "spanduk", "event", "outdoor", "polyester"],
    relatedProducts: ["taffeta-parachute-ripstop", "polyester-oxford-600d", "polyester-silk-satin"],
    coverImage: "/images/fabrics/promotional-flags-event.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 5,
    seoTitle: "Banner dan Flag: Kenapa Harus Polyester? | Texora",
    seoDescription:
      "Alasan teknis banner, flag, dan spanduk menggunakan polyester, pilihan GSM, jenis finishing, dan tips desain agar cetak tetap tajam saat tertiang.",
    body: `<p>Banyak percetakan banner masih memakai vinil atau PVC karena biayanya terasa lebih murah di awal. Untuk pemakaian event beberapa bulan, hasilnya hampir selalu sama. Untuk pemakaian outdoor jangka panjang, polyester menang telak, dan inilah alasannya.</p>
<h2>1. Ketahanan cuaca</h2>
<p>Polyester tidak menyerap air, tidak lapuk seperti katun, dan tidak menjadi rapuh seperti PVC pada suhu panas. Untuk banner yang dipasang outdoor selama 3 sampai 12 bulan, kain polyester dengan lapisan anti UV bertahan jauh lebih lama dan warnanya tidak berubah kuning.</p>
<h2>2. Printing dan saturasi warna</h2>
<p>Sublimasi pada polyester menghasilkan warna yang benar-benar masuk ke serat, sehingga tidak ada lapisan yang bisa retak atau terkelupas. Untuk warna brand yang harus persis, ini penting: tidak ada pergeseran warna karena perbedaan media. Dan karena warnanya menyatu, tidak ada risiko cetak terkelupas saat banner terlipat untuk transportation.</p>
<h2>3. Lebar roll</h2>
<p>Polyester tersedia dalam lebar 60 inci, yang bertepatan untuk banner 3x1 meter atau 3x5 meter tanpa sambungan. Ini nilai tambah besar: banner yang disambung dari beberapa roll terlihat janggal dan bisa sobek di sambungan.</p>
<h2>4. Memilih GSM dan finishing</h2>
<ul>
<li><strong>140 sampai 160 GSM</strong> — banner indoor, X banner, dan backdrop indoor.</li>
<li><strong>190 sampai 210 GSM</strong> — banner outdoor dan flag, lebih tegak dan tidak mudah berkibar.</li>
<li><strong>Finishing</strong> — hem bertajin, ring reinforcement, dan rope hem untuk titik gantung.</li>
</ul>
<h2>5. Tips desain agar hasil maksimal</h2>
<ol>
<li><strong>Jangan pakai font terlalu kecil.</strong> Di banner, teks minimal setara 3 cm agar terbaca dari jarak 5 meter.</li>
<li><strong>Tambah bleed 3 sampai 5 cm</strong> di sekeliling, karena banner biasanya ada lipatan atau ring di sisi.</li>
<li><strong>Hitung resolusi minimum 100 sampai 150 DPI</strong> pada ukuran akhir, bukan ukuran file. Untuk banner besar, 100 DPI sudah cukup karena mata jauh.</li>
<li><strong>Gunakan warna solid dengan kontras tinggi</strong> — gradien halus akan hilang saat kain berkibar di angin.</li>
<li><strong>Rancang dengan margin aman 5 persen</strong> untuk logo penting, karena tepi banner bisa masuk ke lipatan atau terpotong saat dipasang.</li>
</ol>
<h2>6. Ring dan_point gantung</h2>
<p>Setiap titik gantung melemahkan kain. Untuk banner yang digantung di beberapa titik, gunakan reinforced rope hem, yaitu lipatan kain dengan kawat, bukan sekadar lubang ring di atas kain tipis. Jahitan yang kuat juga penting agar angin tidak sobek di titik gantung.</p>
<h2>7. Paket dari Texora</h2>
<p>Kami menyediakan taffeta ripstop 190 GSM dan polyester 210 GSM dalam roll 60 inci, siap cetak sublimasi, dengan pilihan finishing rope hem dan ring reinforcement. Cocok untuk event agency, production house, dan brand activation yang butuh turnaround cepat.</p>
<p>Untuk estimasi harga dan kebutuhan material, kirimkan ukuran dan desain ke tim kami lewat form Minta Penawaran. Tim kami akan menghitung kebutuhan roll, meter, dan finishing yang paling sesuai.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "harga-bertingkat-moq-hitung-biaya-kain",
    title: "Harga Bertingkat dan MOQ: Cara Menghitung Biaya Kain yang Tepat",
    excerpt:
      "Cara kerja harga bertingkat per meter, hubungan MOQ dengan panjang pesanan, tips menghitung kebutuhan roll, dan kesalahan estimasi budget yang sering terjadi.",
    category: "proses",
    articleType: "tips",
    tags: ["harga", "tier", "MOQ", "estimasi", "procurement"],
    relatedProducts: ["dryfit-milano-premium", "voal-ultrafine-premium", "canvas-polyester-industrial"],
    coverImage: "/images/hero/hero-warehouse.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 6,
    seoTitle: "Harga Bertingkat dan MOQ: Cara Menghitung Biaya Kain | Texora",
    seoDescription:
      "Penjelasan harga bertingkat per meter, hubungan MOQ dan panjang pesanan, tips menghitung kebutuhan roll, dan kesalahan estimasi budget yang sering terjadi.",
    body: `<p>Salah satu pertanyaan paling sering muncul di awal hubungan bisnis: berapa harga per meternya? Jawabannya tidak pernah satu angka, karena harga kain B2B selalu bertingkat sesuai panjang pesanan. Ini penjelasan singkat supaya estimasi budget Anda tidak meleset.</p>
<h2>1. Cara kerja harga bertingkat</h2>
<p>Setiap jenis kain punya beberapa lapis harga yang terikat pada panjang total per order. Contoh ilustrasi untuk Dryfit Milano 180 GSM:</p>
<table>
<thead><tr><th>Panjang order</th><th>Harga per meter (ilustrasi)</th></tr></thead>
<tbody>
<tr><td>1 - 49 m</td><td>Rp 78.000</td></tr>
<tr><td>50 - 199 m</td><td>Rp 71.000</td></tr>
<tr><td>200 - 499 m</td><td>Rp 65.500</td></tr>
<tr><td>500 - 999 m</td><td>Rp 61.000</td></tr>
<tr><td>1.000 m ke atas</td><td>Rp 58.000</td></tr>
</tbody>
</table>
<p>Di katalog, tier yang berlaku untuk pesanan Anda bisa langsung dilihat di tabel harga produk atau di kalkulator harga.</p>
<h2>2. Mengapa ada minimum order</h2>
<p>Setiap roll punya panjang minimum, dan setiap batch punya biaya setup berupa warna, kalibrasi, dan cetakan uji. MOQ di fabrik seperti kami umumnya satu meter. Inilah yang membedakan model B2B dari toko e commerce: Anda bisa order sample cetak penuh satu meter untuk diuji, tanpa minimum ratusan meter.</p>
<h2>3. Kesalahan estimasi yang sering terjadi</h2>
<ul>
<li><strong>Tidak menghitung waste</strong> — cetakan reject, pemotongan dari lebar, dan cetakan uji menghabiskan kain. Tambahkan buffer 5 sampai 8 persen.</li>
<li><strong>Menyamakan meter dengan pcs</strong> — satu kaus dryfit butuh sekitar 1,3 sampai 1,5 meter, bukan 1 meter. Hitung dari marker pattern Anda.</li>
<li><strong>Mengabaikan ongkos setting</strong> — artwork dengan banyak warna solid butuh lebih banyak roll dan waktu setup.</li>
<li><strong>Salah baca tier</strong> — tier berlaku per jenis kain per order, bukan digabung antar jenis kain. Order 300 meter dryfit dan 300 meter voal bukan 600 meter satu tier.</li>
</ul>
<h2>4. Cara menghitung kebutuhan meter</h2>
<p>Gunakan rumus sederhana:</p>
<blockquote><p>Total meter = (jumlah pcs x kebutuhan per pcs) x (1 + buffer 5 sampai 8 persen)</p></blockquote>
<p>Kebutuhan per pcs tergantung lebar kain dan ukuran pattern. Untuk kaus dryfit ukuran reguler, kebutuhan sekitar 1,3 meter pada lebar 36 inci. Untuk gamis, kebutuhan bisa 2,5 sampai 3 meter.</p>
<h2>5. Komponen biaya lain di luar harga kain</h2>
<ul>
<li><strong>Biaya printing</strong> — dihitung per meter area cetak, tergantung jumlah warna dan tingkat detail.</li>
<li><strong>Finishing</strong> — misalnya jahitan, patching, packaging, dan label.</li>
<li><strong>Tooling atau screen</strong> — untuk printing plastisol dengan warna spesifik.</li>
<li><strong>Ongkos kirim</strong> — kargo roll dengan packaging khusus dan pengaman tambahan.</li>
</ul>
<h2>6. Cara meminta penawaran yang mudah ditindaklanjuti</h2>
<p>Supaya tim kami bisa menghitung dengan tepat, sertakan: jenis kain (atau hasil substitusi bila belum diputuskan), GSM, warna, panjang dalam meter, lebar, kebutuhan cetak, jumlah warna, dan target delivery. Dengan data itu, kami kirimkan penawaran berisi tier harga yang berlaku, sample, dan jadwal produksi.</p>
<p>Semua kalkulasi ini bisa dilakukan langsung di katalog dan visualizer kami, dan tim kami siap membantu menyusun spesifikasi untuk brand Anda. Silakan ajukan lewat form Minta Penawaran.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "studi-kasus-3000-meter-dryfit-turnamen",
    title: "Studi Kasus: 3.000 Meter Dryfit Milano untuk Turnamen Antivirus",
    excerpt:
      "Studi kasus nyata: 3.000 meter dryfit untuk 12 tim, bagaimana kalibrasi warna menjaga konsistensi antar batch, dan delivery 9 hari.",
    category: "sportswear",
    articleType: "case-study",
    tags: ["case study", "dryfit", "order besar", "konsistensi warna", "turnamen"],
    relatedProducts: ["dryfit-milano-premium", "dryfit-brazil-wave", "dryfit-jarum-quickdry"],
    coverImage: "/images/hero/hero-sportswear.jpg",
    author: "Nadia Puspita",
    authorRole: "Fashion & Material Consultant",
    readMinutes: 6,
    seoTitle: "Studi Kasus: Order 3.000 Meter Dryfit Milano | Texora",
    seoDescription:
      "Studi kasus produksi 3.000 meter dryfit Milano untuk 12 tim: kalibrasi warna, konsistensi antar batch, dan jadwal produksi 9 hari.",
    body: `<p>Klien kami adalah organizer Amateur Sports Competitive, yang membutuhkan seragam untuk 12 tim, sekitar 1.500 potong, dengan warna yang harus identik antar tim meski dikerjakan dalam tiga batch produksi terpisah. Ini cerita bagaimana permintaan itu kami kerjakan.</p>
<h2>1. Kebutuhan sebenarnya</h2>
<p>Klien awalnya hanya meminta dryfit warna navy dan merah tanpa spesifikasi GSM. Setelah konsultasi, kami menetapkan:</p>
<ul>
<li>Dryfit Milano 180 GSM, lima warna: dua warna gelap untuk home jersey dan tiga warna terang untuk away</li>
<li>Lebar 36 inci, cetak penuh dengan sponsor di punggung dan lengan</li>
<li>Total kebutuhan 3.000 meter termasuk buffer 6 persen untuk waste pemotongan</li>
</ul>
<p>Keputusan ini penting. Seribu lima ratus potong dengan angka tersebut berarti total panjang order jatuh di tier 3.000 meter, bukan tier 500. Satu tingkat tier berarti selisih ribuan rupiah per meter.</p>
<h2>2. Tahap proofing tiga langkah, bukan satu</h2>
<p>Sebelum batch pertama jalan, kami melakukan:</p>
<ol>
<li><strong>Proof digital</strong> — file dikirim ke tim desain untuk mengecek posisi logo dan proporsi.</li>
<li><strong>Proof fisik 1 yard</strong> — dicetak dengan setting final, dikirim via kurir, dan dicek warnanya di bawah cahaya daylight.</li>
<li><strong>Persetujuan tertulis</strong> — baru setelah klien menyetujui proof fisik, kalibrasi ICC dilakukan untuk lima warna tersebut.</li>
</ol>
<p>Langkah kedua inilah yang sering dilewati, dan justru di situ keluhan datang: warnanya beda tipis dengan file di layar.</p>
<h2>3. Menjaga konsistensi antar tiga batch</h2>
<p>Karena order dipecah tiga batch mengikuti jadwal klien, ada risiko warna bergeser antar batch. Yang kami lakukan:</p>
<ul>
<li>Simpan profil ICC hasil kalibrasi di controller mesin dan gunakan profil yang sama untuk batch kedua dan ketiga.</li>
<li>Menjadwalkan seluruh batch dalam rentang sembilan hari sehingga tinta dan kondisi mesin relatif konsisten.</li>
<li>QC mengambil sample satu meter di awal, tengah, dan akhir tiap batch, lalu membandingkannya dengan sample batch pertama.</li>
</ul>
<h2>4. Hasil</h2>
<table>
<thead><tr><th>Indikator</th><th>Hasil</th></tr></thead>
<tbody>
<tr><td>Total kain</td><td>3.000 meter selesai</td></tr>
<tr><td>Waktu produksi</td><td>9 hari kalender, 6 hari mesin</td></tr>
<tr><td>Selisih warna antar batch</td><td>Di bawah ambang toleransi, tanpa komplain</td></tr>
<tr><td>Rejection rate</td><td>0,4 persen, di bawah target 1 persen</td></tr>
<tr><td>Delivery</td><td>Tepat waktu, tiga batch bertahap sesuai jadwal</td></tr>
</tbody>
</table>
<h2>5. Pelajaran yang bisa diambil</h2>
<ul>
<li><strong>Gabungkan tier</strong> — kalau klien bisa menerima delivery bertahap, pesan totalnya tetap berada di tier teratas karena harga dihitung dari total panjang, bukan per batch.</li>
<li><strong>Proof fisik bukan opsional</strong> — satu yard sample mencegah potensi pembuangan 3.000 meter.</li>
<li><strong>Simpan profil kalibrasi</strong> — kalau mesin berganti atau dikalibrasi ulang, hasil bisa bergeser.</li>
</ul>
<p>Untuk brand yang punya kebutuhan serupa, kami bisa mengirim sample swatch dan berdiskusi tentang spesifikasi. Form Minta Penawaran kami bisa Anda isi dengan data proyek singkat, dan tim kami akan mengembalikan estimasi tier harga serta jadwal produksi dalam 1 sampai 2 jam kerja.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "proofing-digital-vs-sample-fisik-warna",
    title: "Proofing Digital atau Sample Fisik: Mengendalikan Warna Cetak Sublimasi",
    excerpt:
      "Kenapa sample fisik masih wajib meski sudah ada proofing digital, cara membaca perbedaan warna di layar dan di kain, serta kapan cukup dengan proof digital.",
    category: "proses",
    articleType: "panduan",
    tags: ["proofing", "warna", "color management", "sample", "kualitas"],
    relatedProducts: ["dryfit-milano-premium", "voal-ultrafine-premium", "polyester-silk-satin"],
    coverImage: "/images/hero/hero-printer-sub.jpg",
    author: "Rudi Hartono",
    authorRole: "Supervisor Dyeing & Printing",
    readMinutes: 6,
    seoTitle: "Proofing Digital vs Sample Fisik: Kontrol Warna Sublimasi | Texora",
    seoDescription:
      "Perbedaan proofing digital dan sample fisik untuk kontrol warna cetak sublimasi, cara menutupi perbedaan layar dan kain, serta kapan proof digital cukup.",
    body: `<p>Warna di layar saya lebih terang dari yang di kain. Ini keluhan paling umum di industri cetak, dan tidak selalu kesalahan operator. Emissive layar, setting cahaya ruang, dan perbedaan material membuat hasil digital dan fisik selalu punya jarak. Artikel ini membahas cara menutup jarak itu secara efektif.</p>
<h2>1. Apa itu proofing digital</h2>
<p>Proofing digital adalah render file dengan profil warna yang disimulasikan ke media tertentu. Murah, cepat, dan bisa menunjukkan komposisi warna sebelum ada biaya produksi. Di Texora, proof digital diberikan untuk setiap file artwork dan menjadi bahan revisi layout.</p>
<h2>2. Apa itu sample fisik</h2>
<p>Sample fisik adalah potongan kain yang dicetak dengan setting mesin sungguhan. Ini satu-satunya cara untuk melihat hasil akhir sebenarnya: tekstur kain, detail motif, dan karakter warna setelah melewati panas dan tekanan.</p>
<h2>3. Kenapa keduanya tidak bisa saling menggantikan</h2>
<ul>
<li><strong>Layar memancarkan cahaya, kain memantulkan.</strong> Warna yang sama bisa terlihat jauh lebih pekat di layar.</li>
<li><strong>Ruang warna monitor</strong> — sebagian besar monitor diner menggunakan RGB dengan gamma yang membuat warna tengah tampak lebih cerah daripada hasil cetak di bawah daylight.</li>
<li><strong>Tekstur kain menyerap cahaya</strong> — serat polyester tidak memantulkan seperti kertas coated, sehingga warna pada kain selalu sedikit lebih pekat dari pratinjau.</li>
<li><strong>White point berbeda</strong> — kain Optic White bukan kertas putih murni, dan itu menggeser semua warna di atasnya.</li>
</ul>
<h2>4. Cara menutupi jarak antara layar dan kain</h2>
<ol>
<li><strong>Gunakan satu profil ICC untuk pratinjau dan produksi.</strong> Kalau pratinjau memakai profil RGB dan produksi memakai profil lain, hasilnya pasti meleset.</li>
<li><strong>Pratinjau di atas latar netral.</strong> Jangan menilai warna di atas putih murni atau di atas gambar. Tampilkan file dengan latar abu-abu netral agar persepsi warna lebih realistis.</li>
<li><strong>Lakukan penilaian di bawah cahaya daylight</strong>, bukan lampu neon kantor. Perbedaan antara dua sumber cahaya ini signifikan untuk warna pekat.</li>
<li><strong>Cetak satu yard, bukan A4.</strong> Kain besar memberi luas area yang cukup untuk menilai motif sekaligus realitas warna dengan mata.</li>
<li><strong>Setujui warnanya, bukan berkasnya.</strong> Simpan sample fisik yang disetujui sebagai acuan, dan sample itulah yang jadi rujukan saat batch berikutnya.</li>
</ol>
<h2>5. Kapan proof digital sudah cukup</h2>
<p>Digital cukup untuk hal-hal berikut, dan di sinilah kita hemat waktu:</p>
<ul>
<li>Komposisi layout: posisi logo, proporsi, dan jarak aman dari tepi</li>
<li>Pemeriksaan teknis: resolusi, mode warna, bleed, dan outline</li>
<li>Revisi kecil pada artwork yang sample fisiknya sudah disetujui</li>
</ul>
<p>Sample fisik wajib untuk approval pertama, warna yang menjadi identitas brand, atau setiap kali setting mesin berubah.</p>
<h2>6. Checklist warna sebelum produksi massal</h2>
<ul>
<li>File artwork dalam RGB, bukan CMYK, untuk sublimasi</li>
<li>Resolusi 150 sampai 300 DPI pada ukuran cetak sebenarnya</li>
<li>Foto sudah diperiksa untuk detail di bagian gelap</li>
<li>Proof digital memakai profil yang sama dengan produksi</li>
<li>Sample fisik satu yard disetujui secara tertulis</li>
<li>Profil ICC tersimpan di controller mesin</li>
</ul>
<p>Dengan alur ini, revisi setelah produksi jarang terjadi. Dan kalau ada order besar, sample fisik bisa dikirim ke tim desain Anda kapan saja. Cukup ajukan lewat form Minta Penawaran bersama brief warna.</p>`,
  },

  // ------------------------------------------------------------------
  {
    slug: "oeko-tex-standard-100-class-1",
    title: "OEKO-TEX Standard 100 Class 1: Apa Artinya untuk Produk Tekstil Anda",
    excerpt:
      "Penjelasan singkat standar OEKO-TEX Class 1, bedanya dengan Class 2, dan relevansi sertifikasi ini untuk brand yang ekspor, merintis, dan produk anak-anak.",
    category: "proses",
    articleType: "panduan",
    tags: ["OEKO-TEX", "sertifikasi", "keamanan", "ekspor", "regulasi"],
    relatedProducts: ["dryfit-milano-premium", "voal-ultrafine-premium", "tc-sublimasi-cotton-feel"],
    coverImage: "/images/hero/hero-warehouse.jpg",
    author: "Sinta Wahyuni",
    authorRole: "Product Specialist Kain",
    readMinutes: 5,
    seoTitle: "OEKO-TEX Standard 100 Class 1 untuk Tekstil | Texora",
    seoDescription:
      "Penjelasan OEKO-TEX Standard 100 Class 1: apa yang diuji, perbedaan dengan Class 2, dan relevansi sertifikat ini untuk brand ekspor dan produk anak-anak.",
    body: `<p>Banyak buyer ekspor dan brand yang mewajibkan supplier untuk memiliki untuk memiliki OEKO-TEX Standard 100. Berikut pengantar singkat supaya Anda tahu sertifikat mana yang benar-benar relevan, dan apa bedanya antar class.</p>
<h2>1. Apa itu OEKO-TEX Standard 100</h2>
<p>OEKO-TEX Standard 100 adalah skema pengujian yang menilai keamanan produk tekstil terhadap bahan kimia berbahaya. Standar ini sudah diterapkan oleh ribuan perusahaan tekstil di seluruh dunia, dan sebagian besar pasar ritel maupun marketplace sekarang meminta nomor sertifikat yang valid sebelum produk boleh masuk listing.</p>
<h2>2. Membaca label Class 1, 2, dan 3</h2>
<table>
<thead><tr><th>Class</th><th>Untuk siapa</th><th>Contoh produk</th></tr></thead>
<tbody>
<tr><td><strong>Class 1</strong></td><td>Bayi dan anak, bahan yang menyentuh kulit langsung</td><td>Seragam sekolah, kaos bayi, sarung stroller, seprai</td></tr>
<tr><td>Class 2</td><td>Kontak langsung dengan kulit</td><td>Kaos, gamis, activewear</td></tr>
<tr><td>Class 3</td><td>Kontak tidak langsung</td><td>Canvas, banner, tote bag</td></tr>
</tbody>
</table>
<p>Kalau produk Anda dipakai anak-anak atau bersentuhan langsung dengan kulit, misalnya seragam sekolah atau kaos tim, Class 1 adalah standar yang tepat. Kain siap sublimasi yang kami produksi berstatus OEKO-TEX Standard 100 Class 1 sehingga aman untuk usage tersebut.</p>
<h2>3. Apa yang diuji</h2>
<ul>
<li><strong>Substance banned</strong> — azo dyes, formaldehida, dan bahan kimia yang dilarang.</li>
<li><strong>Substance restricted</strong> — pestisida, talk, heavy metal, dan kontaminasi lain.</li>
<li><strong>Color fastness dan perspiration fastness</strong> — memastikan warna tidak luntur karena keringat, hal yang krusial untuk seragam pemakaian harian.</li>
</ul>
<h2>4. Mengapa ini penting secara bisnis</h2>
<ul>
<li><strong>Gerbang ekspor</strong> — Eropa punya semakin banyak persyaratan REACH dan labeling, dan supplier tanpa sertifikat bisa otomatis gugur dari tender.</li>
<li><strong>Perlindungan brand</strong> — marketplace besar semakin sering meminta nomor sertifikat valid sebelum produk masuk listing.</li>
<li><strong>Kompatibilitas internal</strong> — perusahaan clothing yang menyasar anak-anak sering punya kebijakan internal yang lebih ketat dari syarat minimum.</li>
</ul>
<h2>5. Yang perlu ditanyakan ke supplier</h2>
<ul>
<li>Apakah sertifikatnya milik fasilitas produksi yang benar-benar dipakai, bukan milik tempat lain?</li>
<li>Nomor sertifikat dan masa berlakunya kapan?</li>
<li>Apakah produk jadi sudah tercakup, bukan hanya kainnya?</li>
<li>Apakah sudah termasuk Class 1, bukan hanya Class 2?</li>
</ul>
<p>Di Texora, kami menyediakan dokumentasi pendukung untuk material yang kami produksi, termasuk catatan OEKO-TEX pada spesifikasi produk. Saat meminta sample atau penawaran, mintalah informasi sertifikat untuk tipe kain dan class yang Anda butuhkan.</p>
<p>Perlu dicatat, label OEKO-TEX sendiri tidak boleh dicetak pada produk kecuali sesuai aturan usage. Yang bisa kami lakukan adalah menyediakan material bersertifikat, sehingga brand Anda yang mengurus deklarasi dan pelabelan produk jadi sesuai regulations di masing-masing pasar.</p>`,
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const [index, a] of ARTICLES.entries()) {
    const existing = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (existing) {
      skipped++;
      console.log(`SKIP   ${a.slug}`);
      continue;
    }

    // Tanggal terbit bertahap mundur 3-4 hari per artikel
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - index * 4);
    publishedAt.setHours(9, 0, 0, 0);

    await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        coverImage: a.coverImage,
        category: a.category,
        articleType: a.articleType,
        tags: JSON.stringify(a.tags),
        relatedProducts: JSON.stringify(a.relatedProducts),
        author: a.author,
        authorRole: a.authorRole,
        readMinutes: a.readMinutes,
        seoTitle: a.seoTitle,
        seoDescription: a.seoDescription,
        isPublished: true,
        publishedAt,
      },
    });
    created++;
    console.log(`CREATE ${a.slug}`);
  }

  console.log(`\nSelesai: ${created} artikel dibuat, ${skipped} dilewati.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Gagal seed artikel:", e);
  await prisma.$disconnect();
  process.exit(1);
});
