import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://texora.co.id";

/**
 * robots.txt
 *
 * Melarang area privat & autentikasi, mengizinkan seluruh crawler
 * (termasuk AI crawler) menjelajahi halaman bisnis, dan mendaftarkan
 * sitemap + llms.txt sebagai sumber data terstruktur.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/portal",
    "/customer",
    "/api",
    "/checkout",
    "/cart",
    "/login",
    "/register",
    "/forgot-password",
    "/unauthorized",
    "/track-order",
  ];

  // AI crawler modern yang menilai konten untuk menjawab & meringkas
  const aiCrawlers = [
    "GPTBot", // OpenAI — training data
    "OAI-SearchBot", // OpenAI — ChatGPT search
    "ChatGPT-User", // OpenAI — user-triggered browsing
    "ClaudeBot", // Anthropic — training data
    "Claude-User", // Anthropic — user-triggered browsing
    "Claude-SearchBot", // Anthropic — search index
    "anthropic-ai", // Anthropic — legacy
    "PerplexityBot", // Perplexity AI
    "Perplexity-User", // Perplexity — user-triggered
    "Google-Extended", // Google — Gemini / AI Overviews
    "Applebot-Extended", // Apple Intelligence
    "meta-externalagent", // Meta AI
    "FacebookBot", // Meta
    "CCBot", // Common Crawl
    "Bytespider", // ByteDance
    "Amazonbot", // Amazon
    "cohere-ai", // Cohere
    "Diffbot", // Diffbot
    "MistralAI-User", // Mistral
    "YouBot", // You.com
  ];

  return {
    rules: [
      {
        // Crawler umum
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      // AI crawler: izinkan halaman bisnis, larang area privat
      ...aiCrawlers.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/portal", "/customer", "/api", "/checkout", "/cart", "/login", "/register"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
    // Catatan: llms.txt berada di root (`/llms.txt`) sesuai standar llmstxt.org
    // dan ditemukan otomatis oleh AI crawler tanpa directive tambahan.
  };
}
