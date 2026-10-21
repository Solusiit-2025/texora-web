/**
 * Verifikasi Search Engine.
 *
 * File ini menyediakan tag verifikasi yang diperlukan oleh:
 *  - Google Search Console   (google-site-verification)
 *  - Bing Webmaster Tools    (msvalidate.01)
 *  - Yandex Webmaster        (yandex-verification)
 *  - Pinterest              (p:domain_verify)
 *  - Facebook                (facebook-domain-verification)
 *
 * Cara pakai:
 *  1. Login ke Search Console -> tambahkan properti -> pilih "Tag HTML".
 *  2. Salin nilai yang diberikan Google (contoh: "abc123def456").
 *  3. Isi environment variable di server:
 *       GOOGLE_SITE_VERIFICATION="abc123def456"
 *  4. Deploy ulang. Tag otomatis terpasang di <head> setiap halaman.
 *
 * Environment variable yang didukung:
 *   GOOGLE_SITE_VERIFICATION
 *   BING_SITE_VERIFICATION
 *   YANDEX_SITE_VERIFICATION
 *   PINTEREST_SITE_VERIFICATION
 *   FACEBOOK_DOMAIN_VERIFICATION
 *   NAVER_SITE_VERIFICATION
 *   GOOGLE_ANALYTICS_ID
 *   GOOGLE_TAG_MANAGER_ID
 */

import Script from "next/script";
import { headers } from "next/headers";

/**
 * Tag verifikasi + analytics untuk seluruh halaman.
 * Render sebagai SERVER component (bukan client) supaya tag ada di HTML awal
 * dan langsung dibaca mesin pencari.
 */
export async function VerificationTags() {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  const yandex = process.env.YANDEX_SITE_VERIFICATION;
  const pinterest = process.env.PINTEREST_SITE_VERIFICATION;
  const facebook = process.env.FACEBOOK_DOMAIN_VERIFICATION;
  const naver = process.env.NAVER_SITE_VERIFICATION;
  const gaId = process.env.GOOGLE_ANALYTICS_ID;
  const gtmId = process.env.GOOGLE_TAG_MANAGER_ID;

  return (
    <>
      {google && (
        <meta name="google-site-verification" content={google} />
      )}
      {bing && <meta name="msvalidate.01" content={bing} />}
      {yandex && <meta name="yandex-verification" content={yandex} />}
      {pinterest && <meta name="p:domain_verify" content={pinterest} />}
      {facebook && (
        <meta name="facebook-domain-verification" content={facebook} />
      )}
      {naver && (
        <meta name="naver-site-verification" content={naver} />
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
    </>
  );
}
