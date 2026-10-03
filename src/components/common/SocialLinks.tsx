import { Facebook, Instagram, Youtube } from "lucide-react";
import { SOCIAL_LINKS, type SocialLink } from "@/config/social";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2 122.2 122.2 0 0 0 54.7 45.2 121.2 121.2 0 0 0 66.2 19v89a211.3 211.3 0 0 1-100-24.9z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

const ICONS: Record<SocialLink["id"], (props: { className?: string }) => JSX.Element> = {
  tiktok: TikTokIcon,
  instagram: (p) => <Instagram className={p.className} />,
  facebook: (p) => <Facebook className={p.className} />,
  youtube: (p) => <Youtube className={p.className} />,
  whatsapp: WhatsAppIcon,
};

const HOVER: Record<SocialLink["id"], string> = {
  tiktok: "hover:border-white/50 hover:text-white",
  instagram: "hover:border-pink-500/60 hover:text-pink-400",
  facebook: "hover:border-blue-500/60 hover:text-blue-400",
  youtube: "hover:border-red-500/60 hover:text-red-400",
  whatsapp: "hover:border-emerald-500/60 hover:text-emerald-400",
};

/** Social media icon buttons (TikTok, Instagram, Facebook, YouTube, WhatsApp). */
export function SocialLinks() {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIAL_LINKS.map((s) => {
        const Icon = ICONS[s.id];
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all hover:-translate-y-0.5 ${HOVER[s.id]}`}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
