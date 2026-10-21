/**
 * Route `/.well-known/ai-plugin-openapi.yaml`
 *
 * OpenAPI manifest untuk AI Plugin. Mendeskripsikan endpoint katalog &
 * FAQ yang bisa diakses AI assistant.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

export async function GET() {
  const yaml = `openapi: 3.0.3
info:
  title: PT. Texora Visi Prima — Katalog Kain Sublimasi API
  description: |
    API katalog kain poliester siap sublimasi dan informasi jasa cetak
    sublimasi skala industri dari PT. Texora Visi Prima (Jakarta Utara).

    Semua harga dalam Rupiah (IDR) per meter lari dan sudah memperhitungkan
    harga bertingkat berdasarkan total panjang pesanan.
  version: "1.0.0"
  contact:
    name: Tim Sales PT. Texora Visi Prima
    email: admin@texoraprima.com
    url: ${SITE_URL}/contact

servers:
  - url: ${SITE_URL}
    description: Production server

paths:
  /api/products:
    get:
      summary: Daftar seluruh kain di katalog
      description: |
        Mengembalikan daftar kain poliester siap sublimasi beserta varian
        gramatur (GSM), stok, dan tabel harga bertingkat.
      parameters:
        - name: category
          in: query
          required: false
          description: Filter kategori kain (Sportswear, Fashion & Hijab, Home Living, Merchandise & Flag)
          schema:
            type: string
        - name: q
          in: query
          required: false
          description: Kata kunci pencarian (nama, komposisi, anyaman, deskripsi)
          schema:
            type: string
        - name: slug
          in: query
          required: false
          description: Ambil satu produk berdasarkan slug
          schema:
            type: string
      responses:
        "200":
          description: Berhasil
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  total:
                    type: integer
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/FabricProduct"

  /api/cms:
    get:
      summary: Ambil konten website (hero, testimoni, FAQ, halaman statis)
      description: |
        Sumber data konten yang dikelola dari Content Management System
        (Content Management & SEO & AI Settings).
      responses:
        "200":
          description: Berhasil
          content:
            application/json:
              schema:
                type: object

  /api/seo:
    get:
      summary: Ambil pengaturan SEO per halaman
      description: |
        Metadata SEO (title, description, excerpt, schema type) untuk setiap
        halaman publik beserta status aktif/nonaktif modul.
      responses:
        "200":
          description: Berhasil
          content:
            application/json:
              schema:
                type: object

  /llms.txt:
    get:
      summary: Ringkasan terstruktur situs untuk AI assistant
      description: |
        Versi ringkas dari seluruh konten website dalam format plain text
        sesuai standar llmstxt.org.
      responses:
        "200":
          description: Berhasil
          content:
            text/plain:
              schema:
                type: string

  /llms-full.txt:
    get:
      summary: Dokumentasi lengkap situs untuk AI assistant
      description: |
        Seluruh konten tekstual website: profil perusahaan, katalog lengkap
        dengan spesifikasi & harga, layanan kustom, dan FAQ.
      responses:
        "200":
          description: Berhasil
          content:
            text/plain:
              schema:
                type: string

components:
  schemas:
    FabricVariant:
      type: object
      properties:
        id:
          type: string
        gsm:
          type: integer
          description: Gramatur (gram per meter persegi)
        colorName:
          type: string
        stockMeters:
          type: number
          description: Stok tersedia dalam meter

    PriceTier:
      type: object
      properties:
        minMeters:
          type: number
        maxMeters:
          type: number
          nullable: true
        unitPrice:
          type: number
          description: Harga per meter dalam IDR

    FabricProduct:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        slug:
          type: string
        description:
          type: string
        composition:
          type: string
          example: 100% Polyester
        weaveType:
          type: string
          example: Interlock Knit
        widthInch:
          type: number
          example: 60
        isSublimationReady:
          type: boolean
        basePricePerMeter:
          type: number
          description: Harga dasar per meter dalam IDR
        thumbnailUrl:
          type: string
        category:
          type: string
        variants:
          type: array
          items:
            $ref: "#/components/schemas/FabricVariant"
        priceTiers:
          type: array
          items:
            $ref: "#/components/schemas/PriceTier"
`;

  return new NextResponse(yaml, {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
