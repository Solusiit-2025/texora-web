"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  Copy,
  Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageContext";

export interface LocationData {
  id: string;
  tag: string;
  company: string;
  addressLines: string[];
  googleMapsUrl: string;
  embedQuery: string;
  badgeLabel?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const DEFAULT_LOCATIONS: LocationData[] = [
  {
    id: "main-office",
    tag: "Main Office",
    company: "Xora Materia",
    addressLines: [
      "Jl. Walang Baru VI No.3, RT.7/RW.7",
      "Tugu Utara, Kec. Koja, Jkt Utara,",
      "Daerah Khusus Ibukota Jakarta 14260",
    ],
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=-6.125302964527022,106.90543002829139",
    embedQuery: "-6.125302964527022,106.90543002829139",
    badgeLabel: "OUR LOCATION",
    coordinates: {
      lat: -6.125302964527022,
      lng: 106.90543002829139,
    },
  },
];

interface CompanyLocationMapProps {
  locations?: LocationData[];
  defaultLocationId?: string;
  className?: string;
  showLocationTabs?: boolean;
}

export function CompanyLocationMap({
  locations = DEFAULT_LOCATIONS,
  defaultLocationId = "main-office",
  className = "",
  showLocationTabs = false,
}: CompanyLocationMapProps) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string>(defaultLocationId);
  const [copied, setCopied] = useState(false);

  const activeLoc =
    locations.find((l) => l.id === activeId) || locations[0] || DEFAULT_LOCATIONS[0];

  const fullAddress = activeLoc.addressLines.join(" ");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${activeLoc.company} - ${fullAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-brand-500/30 bg-slate-950 shadow-2xl ${className}`}
    >
      {/* Top Accent Line matching active theme */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />

      {/* Optional Location Selector Tabs */}
      {showLocationTabs && locations.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 backdrop-blur">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-brand-400" /> {t("map.selectLocation", "Pilih Lokasi:")}
          </span>
          {locations.map((loc) => {
            const isSelected = loc.id === activeLoc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setActiveId(loc.id)}
                type="button"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-brand-400"}`} />
                <span>{loc.id === "main-office" ? t("map.mainOffice", loc.tag) : loc.tag}</span>
                <span className="text-[10px] opacity-75 font-normal">({loc.company})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Map View Area */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[580px] w-full overflow-hidden">
        {/* Google Maps Embed iframe dengan koordinat presisi */}
        <iframe
          title={`Lokasi ${activeLoc.company}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            activeLoc.embedQuery
          )}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
          className="absolute inset-0 h-full w-full border-0 filter contrast-[1.02] brightness-[0.98]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Ambient Top & Bottom Glass Gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-950/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/60 to-transparent" />

        {/* Top-Left Floating Info Card */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 w-[calc(100%-2rem)] max-w-[320px] sm:max-w-[340px]">
          <div className="rounded-2xl border border-brand-500/30 bg-slate-900/95 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:border-brand-500/50">
            {/* Header: Icon & Main Office Title */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
                  {activeLoc.id === "main-office" ? t("map.mainOffice", activeLoc.tag) : activeLoc.tag}
                </h3>
                <p className="text-[11px] font-semibold text-brand-400">
                  {activeLoc.company}
                </p>
              </div>
            </div>

            {/* Address Content */}
            <div className="mt-4 mb-5 space-y-1 text-xs leading-relaxed text-slate-300 font-medium">
              {activeLoc.addressLines.map((line, idx) => (
                <p key={idx} className={idx === 0 ? "font-semibold text-white" : ""}>
                  {line}
                </p>
              ))}
            </div>

            {/* Actions: Open in Google Maps & Copy */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5">
              <a
                href={activeLoc.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-400 transition-colors hover:text-brand-300"
              >
                <span>{t("map.openInMaps", "OPEN IN GOOGLE MAPS")}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                title={t("map.copy", "Salin Alamat")}
                className="flex items-center gap-1 rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">{t("map.copied", "Tersalin")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>{t("map.copy", "Salin")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Center Map Pin Marker Badge */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          {/* Pulsating Radar Halo mengikuti warna tema aplikasi */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-brand-500/25 blur-lg animate-pulse" />
          <div className="absolute -inset-8 sm:-inset-10 rounded-full bg-brand-500/15 blur-xl animate-ping" />

          {/* Location Badge Pill with Theme Color */}
          <a
            href={activeLoc.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Klik untuk membuka arah rute di Google Maps"
            className="pointer-events-auto relative group flex items-center gap-3 rounded-2xl border border-brand-300/40 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 px-4 py-2.5 sm:px-5 sm:py-3 text-white shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-brand-500/50"
          >
            {/* Building Icon Container */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 text-white shadow-inner">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Labels */}
            <div className="text-left select-none">
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-100">
                {t("map.ourLocation", activeLoc.badgeLabel || "OUR LOCATION")}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white tracking-wide whitespace-nowrap">
                {activeLoc.company}
              </div>
            </div>

            <ExternalLink className="h-3.5 w-3.5 text-white/70 transition-transform group-hover:scale-110" />

            {/* Downward Pointer Triangle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-r border-b border-brand-300/40 bg-brand-600 shadow-md" />
          </a>

          {/* Coordinate Target Dot on Map */}
          <div className="relative mt-3.5 h-3.5 w-3.5 rounded-full bg-brand-400 shadow-[0_0_12px_rgb(var(--brand-500))] ring-4 ring-brand-500/40 animate-pulse" />
        </div>

        {/* Bottom Right Floating Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <a
            href={activeLoc.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition-all hover:bg-slate-800 hover:text-brand-300"
          >
            <Navigation className="h-3.5 w-3.5 text-brand-400" />
            <span>{t("map.directions", "Petunjuk Arah")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default CompanyLocationMap;
