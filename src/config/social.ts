/**
 * Central social media links for PT. Texora Visi Prima.
 *
 * TODO: ganti placeholder di bawah dengan URL akun resmi.
 * Format https:// (bukan deep-link apps://) supaya di HP otomatis
 * membuka aplikasi TikTok/IG/FB/YT, dan di desktop membuka browser.
 */
export interface SocialLink {
  id: "tiktok" | "instagram" | "facebook" | "youtube" | "whatsapp";
  label: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "tiktok",
    label: "TikTok Texora",
    href: "https://www.tiktok.com/@texoravisiprima",
  },
  {
    id: "instagram",
    label: "Instagram Texora",
    href: "https://www.instagram.com/texoravisiprima",
  },
  {
    id: "facebook",
    label: "Facebook Texora",
    href: "https://www.facebook.com/texoravisiprima",
  },
  {
    id: "youtube",
    label: "YouTube Texora",
    href: "https://www.youtube.com/@texoravisiprima",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Sales",
    href: "https://wa.me/6287889856066?text=Halo%20Texora%2C%20saya%20ingin%20bertanya%20tentang%20kain%20sublimasi.",
  },
];
