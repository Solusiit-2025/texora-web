# Arsitektur & Struktur Folder Proyek
## PT. Texora Visi Prima — E-Commerce & CRM Platform

Dokumen arsitektur ini disusun mengacu pada spesifikasi **Product Requirement Document (PRD)** `PRD_Texora_Visi_Prima_Ecommerce_CRM.docx`.

---

## 1. Ringkasan Tech Stack & Prinsip Desain
- **Framework Frontend & Backend**: Next.js (App Router, React 19 / TypeScript)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **UI & Styling**: Tailwind CSS, Shadcn UI, Lucide Icons, Framer Motion
- **Standar Tipografi (LOCKED / TERKUNCI PERMANEN)**:
  - **Judul Besar & Display (`font-display`, `h1 - h6`)**: **`Urbanist`** (Geometric Modern Luxury Sans)
  - **Teks Isi, Tabel & UI (`font-sans`, `body`)**: **`Plus Jakarta Sans`** (Optimal Modern Legibility)
- **State & Data Fetching**: TanStack Query / Server Actions, Zustand (Client state: Cart & Canvas Mockup)
- **Storage Service**: Cloudflare R2 / AWS S3 / Local MinIO (untuk file vector/raster artwork sublimasi resolusi tinggi)
- **Deployment & DevOps**: Docker, Docker Compose, Nginx Reverse Proxy, Cloudflare CDN & SSL

---

## 2. Struktur Direktori Lengkap

```text
web-texora/
├── .env.example                               # Konfigurasi variabel lingkungan template
├── docker/                                    # Konfigurasi deployment & containerization
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── prisma/                                    # Database schema & migrations
│   ├── schema.prisma                          # Skema PostgreSQL (E-Commerce, Sublimasi, CRM, RBAC)
│   └── seed.ts                                # Data awal (Master kain, Role, Superadmin)
├── public/                                    # Static assets publik
│   ├── icons/                                 # Favicon & logo SVG
│   └── images/
│       ├── fabrics/                           # Asset tekstur kain & swatch
│       ├── hero/                              # Banner & aset halaman utama
│       └── mockups/                           # Template mockup 2D/3D sublimasi (kaos, jersey, roll)
├── src/
│   ├── app/                                   # Next.js App Router (Routing & Layouts)
│   │   ├── (auth)/                            # Route Group: Autentikasi Pengguna & Karyawan
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx                 # Login (Email/Password & Google OAuth)
│   │   │   ├── register/page.tsx              # Pendaftaran akun B2B / B2C
│   │   │   └── forgot-password/page.tsx       # Pemulihan sandi
│   │   │
│   │   ├── (storefront)/                      # Route Group: Katalog Publik & Belanja
│   │   │   ├── layout.tsx                     # Header publik, Navbar, Footer
│   │   │   ├── page.tsx                       # Landing Page / Beranda
│   │   │   ├── catalog/                       # Katalog Kain Sublimasi
│   │   │   │   ├── page.tsx                   # Filter berdasarkan GSM, jenis serat, lebar kain
│   │   │   │   └── [slug]/page.tsx            # Detail kain, spesifikasi teknis & tabel harga grosir
│   │   │   ├── custom-sublimation/            # Modul Unggah Desain Sublimasi Khusus
│   │   │   │   └── page.tsx                   # Canvas preview, kalkulasi meter lari, spesifikasi cetak
│   │   │   ├── cart/page.tsx                  # Keranjang belanja kain & cetakan
│   │   │   ├── checkout/page.tsx              # Checkout multi-step, PPN, ongkos kirim
│   │   │   ├── track-order/page.tsx           # Lacak status pesanan publik (nomor resi/SPK)
│   │   │   └── contact/page.tsx               # Kontak, konsultasi kain & lokasi pabrik
│   │   │
│   │   ├── (customer)/                        # Route Group: Portal Pelanggan Terdaftar
│   │   │   ├── layout.tsx                     # Customer dashboard layout & sidebar
│   │   │   ├── dashboard/page.tsx             # Ringkasan pesanan & status produksi berjalan
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                   # Riwayat pesanan & invoice
│   │   │   │   └── [orderId]/page.tsx         # Detail pesanan, tracking progress produksi
│   │   │   ├── designs/page.tsx               # Galeri file artwork desain yang pernah diunggah
│   │   │   └── profile/page.tsx               # Data perusahaan, NPWP/KTP, alamat penagihan
│   │   │
│   │   ├── (portal)/                          # Route Group: Internal Enterprise Portal (CRM, OMS, Warehouse, Admin)
│   │   │   ├── layout.tsx                     # Portal sidebar, role badge, quick actions
│   │   │   ├── dashboard/page.tsx             # Metrik penjualan, produksi, dan pipeline CRM
│   │   │   ├── crm/                           # Modul CRM (Customer Relationship Management)
│   │   │   │   ├── customers/page.tsx         # Database 360° profil klien B2B & B2C
│   │   │   │   ├── leads/page.tsx             # Pipeline penawaran harga (Quotation Kanban)
│   │   │   │   ├── activities/page.tsx        # Penugasan sales, follow-up, meeting & catatan
│   │   │   │   └── campaigns/page.tsx         # Broadcast penawaran & katalog berkala
│   │   │   ├── oms/                           # Modul OMS (Order Management System)
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx               # Seluruh pesanan masuk (filter status produksi)
│   │   │   │   │   └── [id]/page.tsx          # Detail SPK (Surat Perintah Kerja) & rincian cetak
│   │   │   │   ├── custom-orders/page.tsx     # Verifikasi file artwork & approval proof cetak
│   │   │   │   └── invoices/page.tsx          # Invoice, faktur pajak & status pelunasan
│   │   │   ├── warehouse/                     # Modul Gudang & Logistik
│   │   │   │   ├── inventory/page.tsx         # Stok bahan baku (roll kain, tinta, kertas sublim)
│   │   │   │   └── fulfillment/page.tsx       # Packing list, cetak resi pengiriman, QC
│   │   │   ├── catalog-management/page.tsx    # Manajemen produk kain, varian GSM & tier harga volume
│   │   │   └── settings/                      # Konfigurasi Sistem
│   │   │       ├── users-rbac/page.tsx        # Manajemen user & role permission
│   │   │       └── integrations/page.tsx      # Konfigurasi Payment Gateway, ERP Sync, Webhook
│   │   │
│   │   └── api/                               # Next.js Route Handlers (API Layer)
│   │       ├── auth/[...nextauth]/route.ts    # Endpoint autentikasi sesi NextAuth/JWT
│   │       ├── products/route.ts              # API CRUD katalog kain
│   │       ├── custom-sublimation/
│   │       │   └── upload/route.ts            # Handler upload file artwork besar (TIFF, AI, PDF, PNG)
│   │       ├── checkout/route.ts              # Inisialisasi transaksi & verifikasi stok
│   │       ├── orders/route.ts                # API manajemen order & perubahan status
│   │       ├── crm/leads/route.ts             # API pipeline prospek & penawaran harga
│   │       └── webhooks/
│   │           ├── payment/route.ts           # Webhook notifikasi pembayaran (Midtrans / Xendit)
│   │           └── erp/route.ts               # Sinkronisasi dua arah stok & faktur dengan ERP
│   │
│   ├── components/                            # Komponen UI Modular
│   │   ├── ui/                                # Primitif Shadcn UI (Button, Dialog, Dropdown, dll.)
│   │   ├── common/                            # Komponen bersama (Navbar, Footer, Sidebar, Breadcrumb)
│   │   ├── storefront/                        # Komponen katalog (FabricCard, GSMFilter, TierPriceTable)
│   │   ├── customizer/                        # Komponen khusus sublimasi (CanvasPreview, DPIValidator, FileDropzone)
│   │   ├── crm/                               # Komponen CRM (LeadKanbanBoard, CustomerTimeline, TaskReminder)
│   │   ├── oms/                               # Komponen OMS (OrderStatusBadge, ProofApprovalModal, InvoicePDF)
│   │   ├── warehouse/                         # Komponen Gudang (RollStockTracker, BarcodeScannerModal)
│   │   └── forms/                             # Reusable forms dengan React Hook Form + Zod
│   │
│   ├── config/                                # Konfigurasi Statis
│   │   ├── site.ts                            # Nama situs, metadata SEO, kontak Texora
│   │   └── navigation.ts                      # Navigasi berdasarkan role pengguna
│   │
│   ├── hooks/                                 # Custom React Hooks
│   │   ├── use-cart.ts                        # Manajemen keranjang belanja
│   │   ├── use-canvas-preview.ts              # Interaksi visualizer pola cetak sublimasi
│   │   └── use-auth.ts                        # Helper status login & role check
│   │
│   ├── lib/                                   # Core Utilities & Library Integrations
│   │   ├── db/prisma.ts                       # Prisma Client singleton
│   │   ├── auth/rbac.ts                       # Middleware helper & verifikasi izin akses role
│   │   ├── storage/s3.ts                      # Koneksi upload file artwork ke cloud storage
│   │   └── utils/formatters.ts                # Format mata uang Rupiah, konversi berat GSM/Yard/Meter
│   │
│   ├── providers/                             # React Context Providers
│   │   ├── session-provider.tsx               # NextAuth session context
│   │   ├── query-provider.tsx                 # TanStack Query client provider
│   │   └── theme-provider.tsx                 # Dark/Light mode theme provider
│   │
│   ├── services/                              # Business Logic Layer (Clean Service Pattern)
│   │   ├── fabric.service.ts                  # Logika filter katalog, GSM, & perhitungan harga volume
│   │   ├── order.service.ts                   # Logika pembuatan order, SPK produksi & status tracking
│   │   ├── crm.service.ts                     # Logika lead stage progression & aktivitas sales
│   │   └── invoice.service.ts                 # Logika penghitungan PPN & pembuatan invoice resmi
│   │
│   ├── types/                                 # TypeScript Type Definitions
│   │   ├── fabric.ts                          # Tipe data kain, varian, GSM, dan satuan (Meter/Roll)
│   │   ├── order.ts                           # Status produksi sublimasi, item pesanan, invoice
│   │   ├── crm.ts                             # Lead pipeline stage, customer history, log aktivitas
│   │   └── user.ts                            # Role: CUSTOMER, SALES_REP, WAREHOUSE_STAFF, ADMIN
│   │
│   └── validations/                           # Skema Validasi Zod
│       ├── auth.schema.ts                     # Validasi form registrasi & login
│       ├── custom-order.schema.ts             # Validasi dimensi kain, upload DPI, meter lari
│       └── lead.schema.ts                     # Validasi inquiry penawaran harga B2B
```

---

## 3. Pemetaan Modul Sesuai Bagian PRD

| Modul PRD | Folder & Implementasi Utama | Fitur Utama |
|---|---|---|
| **3.1 E-Commerce & Catalog** | `src/app/(storefront)/catalog`<br>`src/components/storefront` | Filter kain berdasarkan GSM, lebar bahan, jenis rajutan/anyaman, dan tabel diskon bertingkat (*volume tier pricing*). |
| **3.1 Custom Sublimation Tool** | `src/app/(storefront)/custom-sublimation`<br>`src/components/customizer` | Upload artwork resolusi tinggi (raster/vektor), kalkulasi kebutuhan meter lari kain, dan *real-time mockup preview*. |
| **3.1 Cart, Checkout & OMS** | `src/app/(storefront)/cart`, `checkout`<br>`src/app/(portal)/oms` | Multi-step checkout, ongkos kirim kargo roll kain, pelacakan tahapan produksi (*Pending -> In Production/Sublimation -> Shipped*). |
| **3.2 Database & API Layer** | `prisma/schema.prisma`<br>`src/app/api/`<br>`src/services/` | PostgreSQL via Prisma ORM, Next.js Route Handlers, webhook sinkronisasi invoice/stok ke sistem ERP. |
| **3.2 RBAC & Autentikasi** | `src/lib/auth/rbac.ts`<br>`src/app/(portal)/settings/users-rbac` | Hak akses bertingkat: *Customer, Sales Rep, Warehouse Staff, Administrator*. |
| **3.3 CRM Module** | `src/app/(portal)/crm/`<br>`src/components/crm/` | Database profil pelanggan 360°, Kanban board pipeline penawaran (*quotation*), penugasan task follow-up sales, dan riwayat komunikasi. |
| **Gudang & Logistik** | `src/app/(portal)/warehouse/`<br>`src/components/warehouse/` | Kontrol stok roll kain, kertas sublim, tinta, dan status *pick-and-pack* pengiriman. |
| **4 & 5 DevOps & Deploy** | `docker/`, `prisma/` | Siap kontainerisasi Docker, Nginx reverse proxy, dan Cloudflare CDN caching. |
