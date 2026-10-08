import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FloatingSocial } from "@/components/common/FloatingSocial";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "PT. Texora Visi Prima — Sublimasi & Kain Industri",
  description:
    "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain, visualizer motif, harga bertingkat, dan portal B2B terintegrasi.",
  keywords: ["sublimasi kain", "dryfit milano", "kain jersey", "sublimasi jakarta", "tekstil industri", "voal ultrafine", "texora"],
  icons: {
    icon: "/icons/logo-texora.ico",
    shortcut: "/icons/logo-texora.ico",
    apple: "/icons/texora-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Urbanist:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Apply stored accent theme before first paint (avoids flash). */}
        <Script id="texora-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('texora-theme');if(t==='emerald'||t==='sapphire'||t==='crimson'){document.documentElement.dataset.theme=t;}}catch(e){}})()`}
        </Script>
      </head>
      <body className="bg-textile-pattern text-slate-100 antialiased min-h-screen flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
        <FloatingSocial />
      </body>
    </html>
  );
}
