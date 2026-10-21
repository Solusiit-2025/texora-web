/**
 * Unit test untuk sanitizer HTML (anti stored XSS).
 * Jalankan: node scripts/test-sanitize.mjs
 *
 * Node.js >= 22.6 mendukung type-stripping bawaan, sehingga modul TypeScript
 * dapat di-import langsung tanpa build step.
 */
import { sanitizeHtml, htmlToPlainText } from "../src/lib/sanitize.ts";

let pass = 0;
let fail = 0;

function ok(label) {
  console.log(`PASS | ${label}`);
  pass++;
}
function bad(label, actual, expected) {
  console.log(`FAIL | ${label}`);
  console.log(`       expected: ${expected}`);
  console.log(`       actual  : ${actual}`);
  fail++;
}
function tContains(label, actual, expected) {
  if (String(actual).includes(expected)) ok(label);
  else bad(label, actual, expected);
}
function tNotContains(label, actual, forbidden) {
  if (!String(actual).toLowerCase().includes(String(forbidden).toLowerCase()))
    ok(label);
  else bad(label, actual, `tidak boleh mengandung "${forbidden}"`);
}

console.log("=== TEST SANITIZER HTML ===\n");

// --- Script & blok berbahaya ---
tNotContains("script tag dibuang", sanitizeHtml("<p>ok</p><script>alert(1)</script>"), "script");
tNotContains("script content dibuang", sanitizeHtml("<script>alert(1)</script>"), "alert(1)");
tNotContains("iframe dibuang", sanitizeHtml("<iframe src='http://evil.com'></iframe>"), "iframe");
tNotContains("object dibuang", sanitizeHtml("<object data='x'></object>"), "object");
tNotContains("embed dibuang", sanitizeHtml("<embed src='x'>"), "<embed");
tNotContains("form dibuang", sanitizeHtml("<form action='/x'><input name='a'></form>"), "<form");
tNotContains("style tag dibuang", sanitizeHtml("<style>body{display:none}</style><p>x</p>"), "display:none");
tNotContains("link tag dibuang", sanitizeHtml("<link rel='stylesheet' href='x.css'><p>y</p>"), "stylesheet");

// --- Event handler ---
tNotContains("onclick dibuang", sanitizeHtml('<p onclick="alert(1)">Halo</p>'), "onclick");
tNotContains("onerror dibuang", sanitizeHtml('<img src="a.jpg" onerror="alert(1)">'), "onerror");
tNotContains("onload dibuang", sanitizeHtml('<div onload="x()">y</div>'), "onload");

// --- URL berbahaya ---
tNotContains("javascript: href dibuang", sanitizeHtml('<a href="javascript:alert(1)">x</a>'), "javascript:");
tNotContains("vbscript: href dibuang", sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>'), "vbscript:");
tNotContains("data:text/html src dibuang", sanitizeHtml('<img src="data:text/html,<script>">'), "data:text/html");

// --- Tag aman dipertahankan ---
tContains("p dipertahankan", sanitizeHtml("<p>Halo</p>"), "<p>");
tContains("bold dipertahankan", sanitizeHtml("<p><strong>Tebal</strong></p>"), "<strong>");
tContains("italic dipertahankan", sanitizeHtml("<p><em>Miring</em></p>"), "<em>");
tContains("list dipertahankan", sanitizeHtml("<ul><li>Satu</li></ul>"), "<ul>");
tContains("ordered list dipertahankan", sanitizeHtml("<ol><li>Satu</li></ol>"), "<ol>");
tContains("heading dipertahankan", sanitizeHtml("<h2>Judul</h2>"), "<h2>");
tContains("blockquote dipertahankan", sanitizeHtml("<blockquote>Kutipan</blockquote>"), "<blockquote>");
tContains("pre/code dipertahankan", sanitizeHtml("<pre><code>npm i</code></pre>"), "<code>");
tContains("link http dipertahankan", sanitizeHtml('<a href="https://texora.co.id">x</a>'), "https://texora.co.id");
tContains("img src dipertahankan", sanitizeHtml('<img src="/images/hero/a.jpg" alt="Hero">'), "/images/hero/a.jpg");
tContains("tabel dipertahankan", sanitizeHtml("<table><tr><td>1</td></tr></table>"), "<td>");

// --- Tag tak dikenal ---
tContains("tag tak dikenal di-escape", sanitizeHtml("<marquee>hai</marquee>"), "&lt;marquee");

// --- Komentar ---
tNotContains("komentar dibuang", sanitizeHtml("<!-- secret --><p>ok</p>"), "secret");

// --- htmlToPlainText ---
tContains("plain text dari html", htmlToPlainText("<p>Halo <strong>Dunia</strong></p>"), "Halo Dunia");
tContains("plain text buang tag block", htmlToPlainText("<div>A</div><div>B</div>"), "A B");
tContains("span inline tidak disisipkan spasi", htmlToPlainText("<p><span>A</span><span>B</span></p>"), "AB");
tNotContains("plain text buang script", htmlToPlainText("<script>alert(1)</script><p>Ok</p>"), "alert");
{
  const long = htmlToPlainText("<p>" + "x".repeat(300) + "</p>", 50);
  if (long.length <= 51) ok("plain text dipotong sesuai maxLength");
  else bad("plain text dipotong sesuai maxLength", `len=${long.length}`, "<= 51");
}

// --- Empty / null ---
if (sanitizeHtml(null) === "") ok("null -> string kosong");
else bad("null -> string kosong", sanitizeHtml(null), "");
if (sanitizeHtml("") === "") ok("empty string aman");
else bad("empty string aman", sanitizeHtml(""), "");

console.log(`\n=== HASIL: ${pass} pass, ${fail} fail ===`);
if (fail > 0) process.exit(1);
