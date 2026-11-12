"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inter, Montserrat } from "next/font/google";
import type { Certification, Education, Experience, Organization, Profile, Project, Skill } from "@/types/db";

const body = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type Data = {
  profile: Profile | null;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  certifications: Certification[];
  organizations: Organization[];
  projects: Project[];
};

/* Taruh ilustrasi (PNG transparan) di public/ripa.png */
const HERO_SRC = "/ripa.png";
const DEFAULT_NAME = "Ripa Haerunisa";
const HEADLINE = "Mahasiswa Sistem Informasi · Administrasi · E-commerce";
const BIO =
  "Mahasiswa semester 5 Sistem Informasi di Universitas Bina Sarana Informatika dengan pengalaman sebagai host live, affiliate, dan admin e-commerce. Komunikatif, teliti, serta mampu bekerja mandiri maupun dalam tim. Memiliki minat pada administrasi, pelayanan pelanggan, dan pengelolaan bisnis digital. Siap belajar dan mengembangkan kemampuan profesional.";

/* kontak utama (dipakai bila kolom email / telepon di profil kosong) */
const DEFAULT_EMAIL = "rifkha1304@gmail.com";
const DEFAULT_PHONE = "081222486113";

/* nomor lokal (08xx) -> format internasional untuk wa.me (62xx), tautan penuh dibiarkan */
const waHref = (v: string, text = "") => {
  if (/^https?:/.test(v)) return v;
  let d = v.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

/* tombol "Unduh CV Lengkap": membuka halaman CV (format ATS) dan langsung memicu dialog cetak / simpan PDF.
   Pastikan halamannya publik (tidak butuh login). Ganti path bila rute Anda berbeda. */
const CV_URL = "/cv?print=1";

/* jumlah item organisasi yang tampil di panel sebelum "Lihat Selengkapnya" */
const PREVIEW_COUNT = 3;

/* perangkat sentuh (tanpa hover): efek parallax / tilt dimatikan agar tidak "macet" setelah tap */
const noHover = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

/* ---------- helper data ---------- */
const pick = (o: unknown, keys: string[]): string => {
  const r = o as Record<string, unknown>;
  for (const k of keys) {
    const v = r?.[k];
    if (v !== null && v !== undefined && v !== "" && !Array.isArray(v)) return String(v);
  }
  return "";
};
/* array atau string "a, b, c" -> string[] */
const list = (o: unknown, keys: string[]): string[] => {
  const r = o as Record<string, unknown>;
  for (const k of keys) {
    const v = r?.[k];
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (typeof v === "string" && v.trim()) return v.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
};
const isTrue = (o: unknown, keys: string[]) => /^(true|1|t|yes)$/i.test(pick(o, keys));
const startYear = (o: unknown) => pick(o, ["start_date", "start_year"]).slice(0, 4);
const endYear = (o: unknown) => pick(o, ["end_date", "end_year"]).slice(0, 4);
const isCurrent = (o: unknown) => isTrue(o, ["is_current", "current", "is_active"]) || (!!startYear(o) && !endYear(o));
/* "2023 - 2024" | "2023 - Sekarang" | "2023" */
const period = (o: unknown) => {
  const s = startYear(o);
  const e = endYear(o);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return `${s} - Sekarang`;
  return s === e ? s : `${s} - ${e}`;
};
const join = (...p: string[]) => p.filter(Boolean).join(" · ");
const link = (v: string, base: string) => (/^https?:|^mailto:|^tel:/.test(v) ? v : base + v.replace(/^@/, ""));
/* level skill -> persen (skala 1-5, 1-10, atau 0-100) */
const toPercent = (raw: string) => {
  const n = parseFloat(raw);
  if (!isFinite(n) || n <= 0) return 0;
  if (n <= 5) return n * 20;
  if (n <= 10) return n * 10;
  return Math.min(100, n);
};

/* ---------- warna ---------- */
const INK = "#0d0d0d";
const SAND = "#b9b08a";
const ACCENT = "#2f6bff";
const ACCENT_SOFT = "#e6edff";
const LAV = "#eee9fa";
const LAV_TEXT = "#3d2f7d";
const BROWN = "#5e5642";
const SOFT = "linear-gradient(180deg,#ffffff 0%,#f6f6f8 60%,#e9eaee 100%)";

/* Huruf "Portfolio": y = geser vertikal (em), r = rotasi (derajat) */
const LETTERS = [
  { c: "P", y: -0.02, r: -10 },
  { c: "o", y: 0.18, r: 12 },
  { c: "r", y: 0.02, r: -18 },
  { c: "t", y: -0.3, r: 8 },
  { c: "f", y: -0.12, r: -14 },
  { c: "o", y: 0.1, r: 16 },
  { c: "l", y: -0.24, r: -6 },
  { c: "i", y: 0.04, r: 12 },
  { c: "o", y: 0.22, r: -16 },
];

/* keliling ring progress tombol "kembali ke atas" (r = 18) */
const RING = 2 * Math.PI * 18;

/* kartu / chip muncul bergantian (delay per anak ke-n) */
const STAGGER_CSS = Array.from({ length: 12 }, (_, i) =>
  `.pf-reveal[data-in="1"] .pf-stagger > :nth-child(${i + 1}), .pf-modal .pf-stagger > :nth-child(${i + 1}) { animation-delay: ${i * 80}ms; }`,
).join("\n");

const CSS = `
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
:root { --ease: cubic-bezier(.22,1,.36,1); }
#home { min-height: 100vh; min-height: 100svh; }
.pf-text { font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif; }
.pf-clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pf-clamp4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

/* --- hero --- */
@keyframes pf-drop { from { opacity: 0; translate: 0 -70%; } to { opacity: 1; translate: 0 0; } }
@keyframes pf-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -.045em; } }
@keyframes pf-rise { from { opacity: 0; translate: 0 60px; scale: .96; } to { opacity: 1; translate: 0 0; scale: 1; } }
@keyframes pf-fade { from { opacity: 0; translate: 0 14px; } to { opacity: 1; translate: 0 0; } }
@keyframes pf-pop { from { opacity: 0; scale: .5; rotate: -30deg; } to { opacity: 1; scale: 1; rotate: 0deg; } }
@keyframes pf-glow { 0%,100% { opacity: .55; scale: 1; } 50% { opacity: .85; scale: 1.06; } }
@keyframes pf-scroll { 0% { translate: 0 -100%; } 100% { translate: 0 100%; } }
@keyframes pf-sway { 0%,100% { rotate: -2.5deg; } 50% { rotate: 2.5deg; } }
@keyframes pf-bar { from { scale: 0 1; } to { scale: 1 1; } }

.pf-letter-wrap {
  display: inline-block;
  opacity: 0;
  animation:
    pf-drop 1s var(--ease) calc(var(--i) * 70ms + 150ms) both,
    pf-float 6s ease-in-out calc(var(--i) * 260ms + 1.6s) infinite;
}
.pf-letter { display: inline-block; transform: translateY(var(--y)) rotate(var(--r)); transition: transform .6s var(--ease); }
@media (hover: hover) { .pf-letter:hover { transform: translateY(calc(var(--y) - .1em)) rotate(calc(var(--r) * -1)) scale(1.06); } }
.pf-year { opacity: 0; animation: pf-pop .9s var(--ease) 1.1s both; }
.pf-hero-img { opacity: 0; animation: pf-rise 1.4s var(--ease) .6s both; }
.pf-hero-meta { opacity: 0; animation: pf-fade 1s var(--ease) calc(var(--d) * 1ms + 1100ms) both; }
.pf-glow { animation: pf-glow 7s ease-in-out infinite; }
.pf-scroll-line::after { content: ""; position: absolute; inset: 0; background: ${INK}; animation: pf-scroll 2.2s var(--ease) infinite; }

/* --- hard skills mengorbit di sekitar gambar hero --- */
.pf-orbit { --P: 28s; --rx: min(calc(var(--h) * .66), 44vw); --ry: calc(var(--h) * .3); }
@keyframes pf-orb-x { from { translate: calc(var(--rx) * -1) 0; } to { translate: var(--rx) 0; } }
@keyframes pf-orb-y { from { translate: 0 calc(var(--ry) * -1); } to { translate: 0 var(--ry); } }
@keyframes pf-orb-z { 0%, 49.9% { z-index: 30; } 50%, 100% { z-index: 5; } }
@keyframes pf-orb-s {
  0%, 50% { scale: .92; opacity: .9; }
  25% { scale: 1.06; opacity: 1; }
  75% { scale: .78; opacity: .6; }
  100% { scale: .92; opacity: .9; }
}
.pf-orb-z { animation: pf-orb-z var(--P) linear infinite; animation-delay: calc(var(--o) * -1); }
.pf-orb-x { animation: pf-orb-x calc(var(--P) / 2) cubic-bezier(.37,0,.63,1) infinite alternate; animation-delay: calc(var(--o) * -1); }
.pf-orb-y { animation: pf-orb-y calc(var(--P) / 2) cubic-bezier(.37,0,.63,1) infinite alternate; animation-delay: calc(var(--o) * -1 - var(--P) / 4); }
.pf-orb-chip { position: absolute; left: 0; top: 0; translate: -50% -50%; white-space: nowrap; animation: pf-orb-s var(--P) linear infinite; animation-delay: calc(var(--o) * -1); }

/* --- scroll reveal --- */
.pf-reveal { opacity: 0; translate: 0 28px; transition: opacity 1s var(--ease), translate 1s var(--ease); transition-delay: var(--d, 0ms); }
.pf-reveal[data-in="1"] { opacity: 1; translate: 0 0; }

/* --- lanyard --- */
.pf-sway { transform-origin: 50% 0; animation: pf-sway 7s ease-in-out infinite; }
.pf-sway:hover { animation-play-state: paused; }

.pf-bar { transform-origin: left; animation: pf-bar 1.2s var(--ease) both; }
.pf-card { transition: translate .5s var(--ease), box-shadow .5s var(--ease); }
.pf-card:hover { translate: 0 -3px; box-shadow: 0 18px 30px -22px rgba(20,30,80,.35); }
.pf-click { cursor: pointer; }
.pf-click:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }

/* --- scroll horizontal --- */
.pf-hscroll {
  display: flex; gap: 1rem; overflow-x: auto; overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  padding: .5rem .25rem 1rem; margin: -.5rem -.25rem 0;
  scrollbar-width: none;
}
.pf-hscroll::-webkit-scrollbar { display: none; }
.pf-hscroll > * { flex: 0 0 auto; scroll-snap-align: start; }
.pf-arrow { transition: opacity .3s ease, background-color .2s ease, color .2s ease; }

/* --- pop up --- */
@keyframes pf-modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pf-modal-in { from { opacity: 0; translate: 0 24px; scale: .96; } to { opacity: 1; translate: 0 0; scale: 1; } }
.pf-modal-bg { animation: pf-modal-bg-in .25s ease both; }
.pf-modal { animation: pf-modal-in .45s var(--ease) both; }

/* --- kartu & chip muncul bergantian --- */
@keyframes pf-card-in { from { opacity: 0; translate: 0 36px; scale: .94; } to { opacity: 1; translate: 0 0; scale: 1; } }
.pf-reveal[data-in="1"] .pf-stagger > *, .pf-modal .pf-stagger > * { animation: pf-card-in .8s var(--ease) backwards; }
${STAGGER_CSS}

/* --- garis timeline & garis judul "menggambar" saat section muncul --- */
.pf-reveal .pf-line { transform-origin: top; scale: 1 0; transition: scale .9s var(--ease); transition-delay: var(--ld, 0ms); }
.pf-reveal[data-in="1"] .pf-line { scale: 1 1; }
.pf-reveal .pf-head-line { transform-origin: left; scale: 0 1; transition: scale 1s var(--ease) .35s; }
.pf-reveal[data-in="1"] .pf-head-line { scale: 1 1; }

/* --- tilt 3D kartu mengikuti kursor --- */
.pf-tilt {
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: translate .5s var(--ease), box-shadow .5s var(--ease), transform .25s ease-out;
}

/* --- pita skill berjalan --- */
@keyframes pf-marquee { from { translate: 0 0; } to { translate: -50% 0; } }
.pf-marquee { display: flex; width: max-content; animation: pf-marquee 42s linear infinite; }
.pf-marquee-wrap:hover .pf-marquee { animation-play-state: paused; }
.pf-marquee-wrap { -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }

/* --- titik "available" berdenyut --- */
@keyframes pf-ping { 0% { scale: 1; opacity: .7; } 80%, 100% { scale: 2.8; opacity: 0; } }
.pf-ping::after { content: ""; position: absolute; inset: 0; border-radius: 999px; background: inherit; animation: pf-ping 1.8s ease-out infinite; }

/* --- kilau tombol --- */
.pf-shine { position: relative; overflow: hidden; }
.pf-shine::before { content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-20deg); translate: 0 0; transition: translate .9s var(--ease); }
.pf-shine:hover::before { translate: 440% 0; }

/* --- kartu lanyard diayun saat diklik --- */
@keyframes pf-swing { 0% { rotate: 0deg; } 15% { rotate: 14deg; } 35% { rotate: -10deg; } 55% { rotate: 6deg; } 75% { rotate: -3deg; } 100% { rotate: 0deg; } }
.pf-swing { transform-origin: 50% 0; animation: pf-swing 1.8s ease-out both; }

/* --- navigasi --- */
.pf-nav-link { transition: background-color .3s ease, color .3s ease; }
.pf-nav-link:hover { background-color: rgba(0,0,0,.07); }
main [id] { scroll-margin-top: 5rem; }

/* --- perangkat sentuh: tanpa panah geser, tanpa efek hover / tilt --- */
@media (hover: none) {
  .pf-arrow { display: none; }
  .pf-card:hover { translate: 0 0; box-shadow: none; }
  .pf-tilt { transform: none !important; }
}

/* --- ponsel landscape (layar pendek) --- */
@media (max-height: 480px) and (orientation: landscape) {
  #home { min-height: 125svh; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  .pf-letter-wrap { animation: pf-drop 1s var(--ease) calc(var(--i) * 70ms + 150ms) both; }

  .pf-sway, .pf-glow, .pf-marquee,
  .pf-ping::after, .pf-scroll-line::after { animation: none !important; }
  .pf-tilt { transform: none !important; }

  .pf-orb-z, .pf-orb-x, .pf-orb-y, .pf-orb-chip { animation: none !important; }
  .pf-orb-x { translate: calc(var(--rx) * cos(var(--a))) 0; }
  .pf-orb-y { translate: 0 calc(var(--ry) * sin(var(--a))); }
  .pf-orb-chip { scale: .92; opacity: 1; }
}
`;

/* ---------- icon ---------- */
const ICONS: Record<string, React.ReactNode> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.2A8.5 8.5 0 1 1 21 11.5z" />,
  insta: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  in: <><path d="M6 10v8" /><path d="M6 6.5h.01" /><path d="M10.5 18v-8" /><path d="M10.5 13c0-2 1.5-3 3.2-3S17 11 17 13v5" /></>,
  code: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13.5 5-3 14" /></>,
  cap: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-4.5" /></>,
  term: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 10 3 2-3 2M13 15h4" /></>,
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  eye: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  brief: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 13h18" /></>,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  left: <path d="m15 5-7 7 7 7" />,
  right: <path d="m9 5 7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  up: <path d="m5 15 7-7 7 7" />,
};
const SOCIAL_ICON: Record<string, string> = { Email: "mail", WhatsApp: "chat", Instagram: "insta", LinkedIn: "in", GitHub: "code" };

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

/* ---------- util animasi ---------- */
function useInView<T extends HTMLElement>(threshold = 0.08) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-in={seen ? "1" : "0"} className={`pf-reveal ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/* ---------- layout konsisten & responsif ---------- */
const SECTION_X = "px-4 sm:px-6 md:px-12 lg:px-20"; /* padding horizontal semua section */
const WRAP = "mx-auto w-full max-w-[1180px] 2xl:max-w-[1320px]"; /* lebar konten semua section */
const PANEL = "rounded-[1.25rem] border border-black/[0.08] bg-white p-4 sm:rounded-[1.75rem] sm:p-6 md:p-8"; /* semua panel */

function PanelHead({
  label,
  title,
  right,
}: {
  label: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="relative mb-6 flex flex-col items-start gap-3 border-b border-black/[0.06] pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BROWN }}>{label}</p>
        {title && <h2 className="mt-1 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold leading-tight tracking-[-0.02em]">{title}</h2>}
      </div>
      {right && <div className="shrink-0 pb-0.5 text-[11px] font-bold" style={{ color: ACCENT }}>{right}</div>}
      <span aria-hidden className="pf-head-line absolute -bottom-px left-0 h-[2px] w-20 rounded-full" style={{ background: ACCENT }} />
    </div>
  );
}

/* tombol "Lihat Selengkapnya" + info kecil di kanan header panel */
function PanelRight({ info, onMore }: { info?: React.ReactNode; onMore: () => void }) {
  return (
    <div className="flex items-center gap-3">
      {info && <span className="hidden items-center gap-1.5 uppercase tracking-[0.04em] md:inline-flex">{info}</span>}
      <button
        type="button"
        onClick={onMore}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3.5 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-black hover:text-white"
      >
        Lihat Selengkapnya
        <Icon name="right" className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ---------- scroll horizontal: tombol panah di samping kiri & kanan ---------- */
function HScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [update]);

  const go = (d: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow =
    "pf-arrow absolute z-20 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/30 text-black/70 backdrop-blur-sm hover:bg-black/70 hover:text-white";

  return (
    <div className="relative">
      <div ref={ref} className="pf-hscroll pf-stagger">{children}</div>
      <button
        type="button"
        aria-label="Geser kiri"
        onClick={() => go(-1)}
        className={`${arrow} ${edge.l ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ left: "-1.25rem", top: "calc(50% - 1.5rem)" }}
      >
        <Icon name="left" className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Geser kanan"
        onClick={() => go(1)}
        className={`${arrow} ${edge.r ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ right: "-1.25rem", top: "calc(50% - 1.5rem)" }}
      >
        <Icon name="right" className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- pop up (bottom sheet di ponsel, dialog di tablet / desktop) ---------- */
function ModalShell({
  label,
  onClose,
  z = 100,
  listen = true,
  maxW = "max-w-[40rem]",
  children,
}: {
  label: string;
  onClose: () => void;
  z?: number;
  listen?: boolean;
  maxW?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!listen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listen, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="pf-modal-bg fixed inset-0 flex items-end justify-center p-2 sm:items-center sm:p-4"
      style={{ zIndex: z, background: "rgba(10,12,20,.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`pf-modal relative flex max-h-[90vh] max-h-[90dvh] w-full ${maxW} flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,.5)]`}
      >
        <button type="button" aria-label="Tutup" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/80 text-white transition-colors hover:bg-black">
          <Icon name="close" className="h-4 w-4" />
        </button>
        <div className="overflow-y-auto p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}

type ModalLink = { label: string; href: string; primary?: boolean };
type ModalData = { title: string; badge?: string; sub?: string; desc?: string; img?: string; tags?: string[]; links: ModalLink[] };

/* pop up detail (proyek / sertifikat) */
function DetailModal({ data, onClose }: { data: ModalData; onClose: () => void }) {
  return (
    <ModalShell label={data.title} onClose={onClose} z={110}>
      {data.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.img} alt={data.title} className="max-h-[50vh] w-full rounded-[1rem] bg-black/5 object-contain" />
      )}
      {data.badge && (
        <span className="mt-4 inline-block rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: ACCENT_SOFT, color: ACCENT }}>{data.badge}</span>
      )}
      {data.sub && <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-black/55">{data.sub}</p>}
      <h3 className="mt-1.5 pr-10 text-[clamp(1.2rem,2vw,1.6rem)] font-extrabold leading-tight tracking-[-0.01em]">{data.title}</h3>
      {data.desc && <p className="pf-text mt-3 whitespace-pre-line text-[14px] leading-[1.7] text-black/70">{data.desc}</p>}
      {data.tags && data.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.tags.map((t) => (
            <span key={t} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: LAV, color: "#2b2540" }}>{t}</span>
          ))}
        </div>
      )}
      {data.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-black/[0.06] pt-4">
          {data.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[12px] font-bold transition-opacity hover:opacity-90 ${l.primary ? "text-white" : "border border-black/15"}`}
              style={l.primary ? { background: ACCENT } : undefined}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

type Kind = "exp" | "org" | "proj" | "cert";
type CertPanel = { t: string; issuer: string; y: string; cat: string; href: string; img: string };

export default function PortfolioView({ data, embed = false }: { data: Data; embed?: boolean }) {
  const { profile, experiences, educations, skills, certifications, organizations, projects } = data;

  const name = pick(profile, ["full_name", "name"]) || DEFAULT_NAME;
  const firstName = name.split(" ")[0];
  const year = new Date().getFullYear();

  /* --- accessor per tabel (beberapa kemungkinan nama kolom ditoleransi) --- */
  const expRole = (e: Experience) => pick(e, ["position", "title", "role"]);
  const expOrg = (e: Experience) => pick(e, ["company", "organization", "employer"]);
  const expType = (e: Experience) => pick(e, ["employment_type", "type", "job_type", "category"]);
  const expDesc = (e: Experience) => pick(e, ["description", "desc", "summary", "details"]);
  const expTags = (e: Experience, n = 4) => {
    const all = list(e, ["tags", "skills", "tech_stack", "technologies", "tools"]);
    return n ? all.slice(0, n) : all;
  };

  const orgTitle = (o: Organization) => pick(o, ["position", "role", "jabatan", "title"]) || pick(o, ["name", "organization", "organization_name"]);
  const orgSub = (o: Organization) => {
    const s = pick(o, ["name", "organization", "organization_name"]);
    return s && s !== orgTitle(o) ? s : "";
  };
  const orgType = (o: Organization) => pick(o, ["type", "category"]) || "Organisasi";
  const orgDesc = (o: Organization) => pick(o, ["description", "desc", "summary", "details"]);
  const orgBadge = (o: Organization) => pick(o, ["highlight", "badge", "impact", "focus", "scope"]);

  const eduSchool = (e: Education) => pick(e, ["institution", "school", "university", "name"]);
  const eduDegree = (e: Education) => pick(e, ["degree", "level"]);
  const eduMajor = (e: Education) => pick(e, ["major", "field_of_study", "field", "program"]);
  const eduTitle = (e: Education) => (eduDegree(e) ? [eduDegree(e), eduMajor(e)].filter(Boolean).join(" ") : eduSchool(e));
  const eduSub = (e: Education) => (eduDegree(e) ? eduSchool(e) : eduMajor(e) || pick(e, ["description", "desc", "summary"]));
  const eduNote = (e: Education) => pick(e, ["note", "status", "semester"]);
  const eduGpa = (e: Education) => {
    const g = pick(e, ["gpa", "ipk"]);
    if (!g) return "";
    const max = pick(e, ["gpa_max", "max_gpa"]) || "4.00";
    return `IPK: ${g.includes("/") ? g : `${Number(g).toFixed(2)} / ${Number(max).toFixed(2)}`}`;
  };

  const skillName = (s: Skill) => pick(s, ["name", "title", "skill"]);
  const skillCat = (s: Skill) => pick(s, ["category", "type", "kind", "group"]);
  const skillPct = (s: Skill) => toPercent(pick(s, ["level", "proficiency", "percentage", "percent", "score", "value"]));

  const certTitle = (c: Certification) => pick(c, ["name", "title"]);
  const certIssuer = (c: Certification) => pick(c, ["issuer", "organization", "publisher", "penerbit"]);
  const certYear = (c: Certification) => pick(c, ["issued_at", "issue_date", "issued_date", "date", "year"]).slice(0, 4);
  const certCat = (c: Certification) => pick(c, ["category", "kategori", "type"]);
  const certImg = (c: Certification) => pick(c, ["image_url", "image", "certificate_image", "thumbnail", "photo", "file_url"]);
  const certUrl = (c: Certification) => pick(c, ["url", "credential_url", "link", "certificate_url"]);

  const projTitle = (p: Project) => pick(p, ["title", "name"]);
  const projDesc = (p: Project) => pick(p, ["description", "desc", "summary"]);
  const projImg = (p: Project) => pick(p, ["image_url", "image", "thumbnail", "cover", "cover_url", "photo"]);
  const projTags = (p: Project, n = 4) => {
    const all = list(p, ["tech_stack", "technologies", "tools", "tags", "stack", "skills"]);
    return n ? all.slice(0, n) : all;
  };
  const projLive = (p: Project) => pick(p, ["demo_url", "live_url", "url", "link", "website"]);
  const projDetail = (p: Project) => pick(p, ["case_study_url", "detail_url", "repo_url", "github_url", "source_url", "repository"]);
  const projBadge = (p: Project) => pick(p, ["category", "kategori", "type", "badge", "label"]);
  const projRole = (p: Project) => pick(p, ["role", "my_role", "peran", "position"]);
  const projYear = (p: Project) => pick(p, ["year", "tahun", "project_year", "date", "start_date"]).slice(0, 4);

  const contacts = [
    { label: "Email", v: pick(profile, ["email"]) || DEFAULT_EMAIL, href: (v: string) => link(v, "mailto:") },
    { label: "WhatsApp", v: pick(profile, ["phone", "whatsapp", "wa"]) || DEFAULT_PHONE, href: (v: string) => waHref(v) },
    { label: "Instagram", v: pick(profile, ["instagram"]), href: (v: string) => link(v, "https://instagram.com/") },
    { label: "LinkedIn", v: pick(profile, ["linkedin"]), href: (v: string) => link(v, "https://linkedin.com/in/") },
    { label: "GitHub", v: pick(profile, ["github"]), href: (v: string) => link(v, "https://github.com/") },
  ].filter((c) => c.v);
  const waNumber = pick(profile, ["phone", "whatsapp", "wa"]) || DEFAULT_PHONE;
  const mainContact = waHref(waNumber, `Halo ${firstName}, saya melihat portfolio Anda dan ingin berdiskusi.`);

  /* --- skill: hard skill (bar persen + orbit hero) --- */
  const namedSkills = skills.filter((s) => skillName(s));
  const isSoft = (s: Skill) => (skillCat(s) ? /soft|interpersonal|non[- ]?teknis/i.test(skillCat(s)) : skillPct(s) === 0);
  const hardSkills = namedSkills.filter((s) => !isSoft(s));
  const softSkills = namedSkills.filter(isSoft); /* tampil di pita berjalan antara section 1 & 2 */
  /* pita skill berjalan: diulang sampai cukup panjang */
  const marqueeSkills = softSkills.length ? Array.from({ length: Math.max(1, Math.ceil(12 / softSkills.length)) }, () => softSkills).flat() : [];
  const orbitSkills = hardSkills.slice(0, 8); /* hard skill yang mengorbit di hero */

  const eduList = educations.filter((e) => eduTitle(e));
  const certPanels: CertPanel[] = certifications
    .map((c) => ({ t: certTitle(c), issuer: certIssuer(c), y: certYear(c), cat: certCat(c), href: certUrl(c), img: certImg(c) }))
    .filter((c) => c.t);
  const projList = projects.filter((p) => projTitle(p));
  const orgList = organizations.filter((o) => orgTitle(o));

  /* --- state pop up --- */
  const [modal, setModal] = useState<ModalData | null>(null); /* detail proyek / sertifikat */
  const [more, setMore] = useState<Kind | null>(null); /* "Lihat Selengkapnya" */
  const closeModal = useCallback(() => setModal(null), []);
  const closeMore = useCallback(() => setMore(null), []);

  /* --- progress scroll, navigasi melayang, tombol ke atas, ayunan lanyard --- */
  const navItems = [
    { id: "tentang", label: "Tentang" },
    experiences.length > 0 && { id: "pengalaman", label: "Pengalaman" },
    orgList.length > 0 && { id: "organisasi", label: "Organisasi" },
    projList.length > 0 && { id: "proyek", label: "Proyek" },
    certPanels.length > 0 && { id: "sertifikasi", label: "Sertifikasi" },
    { id: "kontak", label: "Kontak" },
  ].filter(Boolean) as { id: string; label: string }[];
  const navKey = navItems.map((n) => n.id).join(",");

  const ringRef = useRef<SVGCircleElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [active, setActive] = useState("");
  const [swinging, setSwinging] = useState(false);

  useEffect(() => {
    const ids = navKey.split(",");
    let raf = 0;
    const calc = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const pr = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING * (1 - pr));
      setPastHero(y > window.innerHeight * 0.75);
      let cur = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [navKey]);

  const openProj = (p: Project) =>
    setModal({
      title: projTitle(p),
      badge: projBadge(p),
      sub: join(projRole(p), projYear(p)),
      desc: projDesc(p),
      img: projImg(p),
      tags: projTags(p, 0),
      links: [
        projLive(p) && { label: "Lihat Demo", href: link(projLive(p), "https://"), primary: true },
        projDetail(p) && { label: "Lihat Repo / Detail", href: link(projDetail(p), "https://") },
      ].filter(Boolean) as ModalLink[],
    });

  const openCert = (c: CertPanel) =>
    setModal({
      title: c.t,
      badge: c.cat,
      sub: [c.issuer, c.y].filter(Boolean).join(" • ") || "Sertifikat",
      img: c.img,
      links: c.href ? [{ label: "Buka Tautan Kredensial", href: link(c.href, "https://"), primary: true }] : [],
    });

  const onKeyOpen = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  /* parallax + sorotan kursor di hero (dinonaktifkan di layar sentuh) */
  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    if (noHover()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", String((x - 0.5) * 2));
    el.style.setProperty("--my", String((y - 0.5) * 2));
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
  };
  const onHeroLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  /* tilt 3D kartu proyek & sertifikat (dinonaktifkan di layar sentuh) */
  const tiltMove = (e: React.MouseEvent<HTMLElement>) => {
    if (noHover()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 8}deg`);
    el.style.setProperty("--rx", `${-y * 8}deg`);
  };
  const tiltLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  /* --- potongan kartu yang dipakai di panel & di pop up --- */
  const expCard = (e: Experience, i: number, full = false, cls = "") => {
    const active = isCurrent(e);
    const type = expType(e);
    const tag = active ? `Aktif${type ? ` • ${type}` : ""}` : type;
    const tags = expTags(e, full ? 0 : 4);
    return (
      <article key={i} className={`flex flex-col rounded-[1.25rem] border border-black/[0.07] bg-[#f9f8f6] p-5 ${full ? "" : "pf-card"} ${cls}`}>
        <div className="flex items-center justify-between gap-2">
          {tag ? (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={active ? { background: ACCENT_SOFT, color: ACCENT } : { background: "#e4def8", color: LAV_TEXT }}
            >
              {tag}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[12px] font-bold text-black/65">{period(e)}</span>
        </div>
        <h3 className="mt-3 text-[clamp(1.1rem,1.7vw,1.4rem)] font-extrabold leading-tight tracking-[-0.01em]">{expRole(e)}</h3>
        {expOrg(e) && <p className="mt-1 text-[14px] font-bold" style={{ color: BROWN }}>{expOrg(e)}</p>}
        {expDesc(e) && <p className={`pf-text mt-2 whitespace-pre-line text-[14px] leading-[1.6] text-black/70 ${full ? "" : "pf-clamp3"}`}>{expDesc(e)}</p>}
        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-black/[0.06] pt-3.5" style={{ marginTop: "auto" }}>
            {tags.map((t) => (
              <span key={t} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: LAV, color: "#2b2540" }}>{t}</span>
            ))}
          </div>
        )}
      </article>
    );
  };

  const orgItem = (o: Organization, i: number, arr: Organization[], full = false) => {
    const last = i === arr.length - 1;
    return (
      <li key={i} className={`relative flex items-start justify-between gap-4 pl-9 ${last ? "" : "pb-9"}`}>
        {!last && <span aria-hidden className="pf-line absolute left-[7px] top-4 -bottom-1 w-px bg-black/10" style={{ "--ld": `${i * 200 + 300}ms` } as React.CSSProperties} />}
        <span aria-hidden className="absolute left-0 top-[5px] h-[15px] w-[15px] rounded-full border-[3px] bg-white" style={{ borderColor: ACCENT }} />
        <div className="min-w-0 max-w-[44rem]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "#e4def8", color: LAV_TEXT }}>{orgType(o)}</span>
            {period(o) && <span className="text-[12px] font-bold tracking-[0.04em] text-black/60">{period(o)}</span>}
          </div>
          <h3 className="mt-1.5 text-[clamp(1.15rem,1.9vw,1.55rem)] font-extrabold leading-tight tracking-[-0.01em]">{orgTitle(o)}</h3>
          {orgSub(o) && <p className="mt-0.5 text-[14px] font-bold" style={{ color: ACCENT }}>{orgSub(o)}</p>}
          {orgDesc(o) && <p className={`pf-text mt-2.5 whitespace-pre-line text-[14px] leading-[1.65] text-black/70 ${full ? "" : "pf-clamp3"}`}>{orgDesc(o)}</p>}
        </div>
        {orgBadge(o) && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#f3f2ef] px-3 py-1.5 text-[11px] font-bold text-black/60 sm:inline-flex">
            <Icon name="spark" className="h-3.5 w-3.5" />
            {orgBadge(o)}
          </span>
        )}
      </li>
    );
  };

  const projCard = (p: Project, i: number, cls = "") => {
    const live = projLive(p);
    const img = projImg(p);
    const badge = projBadge(p);
    const meta = join(projRole(p), projYear(p));
    const tags = projTags(p);
    const open = () => openProj(p);
    return (
      <article
        key={i}
        role="button"
        tabIndex={0}
        aria-label={`Lihat detail ${projTitle(p)}`}
        onClick={open}
        onKeyDown={onKeyOpen(open)}
        onMouseMove={tiltMove}
        onMouseLeave={tiltLeave}
        className={`pf-card pf-tilt pf-click group flex flex-col rounded-[1.25rem] border border-black/[0.07] bg-[#fafafa] p-3.5 ${cls}`}
      >
        <div className="relative aspect-[16/9.4] w-full overflow-hidden rounded-[0.9rem] bg-[#eceaf5]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={projTitle(p)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full" style={{ background: "linear-gradient(135deg,#e1e8ff,#f1eefb)" }} />
          )}
          {badge && (
            <span
              className="absolute right-2.5 top-2.5 rounded-full px-3 py-1 text-[11px] font-bold text-white backdrop-blur"
              style={{ background: live ? ACCENT : "rgba(40,40,48,.72)" }}
            >
              {badge}
            </span>
          )}
        </div>
        <h3 className="mt-4 px-1 text-[clamp(1.05rem,1.5vw,1.2rem)] font-extrabold leading-snug tracking-[-0.01em]">{projTitle(p)}</h3>
        {meta && <p className="mt-1 px-1 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: BROWN }}>{meta}</p>}
        {projDesc(p) && <p className="pf-text pf-clamp4 mt-1.5 px-1 text-[14px] leading-[1.6] text-black/70">{projDesc(p)}</p>}
        {tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-2 px-1">
            {tags.map((t) => (
              <span key={t} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: LAV, color: "#2b2540" }}>{t}</span>
            ))}
          </div>
        )}
        <div className="mt-auto border-t border-black/[0.06] px-1 pt-4" style={{ marginTop: "auto" }}>
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-bold text-white" style={{ background: ACCENT }}>
            <Icon name="eye" className="h-4 w-4" />Lihat Detail
          </span>
        </div>
      </article>
    );
  };

  const certCard = (c: CertPanel, i: number, cls = "") => {
    const open = () => openCert(c);
    return (
      <article
        key={i}
        role="button"
        tabIndex={0}
        aria-label={`Lihat detail ${c.t}`}
        onClick={open}
        onKeyDown={onKeyOpen(open)}
        onMouseMove={tiltMove}
        onMouseLeave={tiltLeave}
        className={`pf-card pf-tilt pf-click group flex flex-col rounded-[1.25rem] border border-black/[0.07] bg-[#fafafa] p-5 ${cls}`}
      >
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-black/55">{[c.issuer, c.y].filter(Boolean).join(" • ") || "Sertifikat"}</p>
        <h3 className="mt-2 min-h-[2.6em] text-[16px] font-bold leading-snug">{c.t}</h3>
        <div className="mt-3 border-t border-black/[0.06] pt-4">
          {c.img && (
            <div className="mx-auto aspect-[1.7] w-[88%] overflow-hidden rounded-[0.9rem] bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          )}
        </div>
        <span className="mt-auto pt-4 text-center text-[11px] font-bold tracking-[0.04em] group-hover:underline" style={{ color: ACCENT }}>
          Lihat Sertifikat
        </span>
      </article>
    );
  };

  const orgShown = orgList.slice(0, PREVIEW_COUNT);

  /* judul & lebar pop up "Lihat Selengkapnya" */
  const moreMeta: Record<Kind, { label: string; title: string; maxW: string }> = {
    exp: { label: "Pengalaman Kerja & Profesional", title: `${experiences.length} Pengalaman`, maxW: "max-w-[64rem]" },
    org: { label: "Organisasi & Kepanitiaan", title: `${orgList.length} Organisasi & Kepanitiaan`, maxW: "max-w-[52rem]" },
    proj: { label: "Portfolio Project", title: `${projList.length} Proyek`, maxW: "max-w-[64rem]" },
    cert: { label: "Sertifikasi & Lisensi Kompetensi", title: `${certPanels.length} Sertifikat`, maxW: "max-w-[64rem]" },
  };

  return (
    <main
      data-embed={embed ? "1" : undefined}
      className={`${body.className} ${inter.variable} relative w-full overflow-x-hidden bg-white`}
      style={{ color: INK }}
    >
      <style>{CSS}</style>

      {!embed && (
        <>
          {/* navigasi melayang: muncul setelah hero, menandai section aktif */}
          <nav
            aria-label="Navigasi bagian"
            className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[85] max-w-[94vw]"
            style={{
              transform: `translate(-50%, ${pastHero ? "0" : "-180%"})`,
              opacity: pastHero ? 1 : 0,
              pointerEvents: pastHero ? "auto" : "none",
              transition: "transform .6s var(--ease), opacity .4s ease",
            }}
          >
            <ul
              className="flex items-center gap-1 overflow-x-auto rounded-full bg-white/15 p-1.5 ring-1 ring-black/10 backdrop-blur-lg"
              style={{ scrollbarWidth: "none" }}
            >
              {navItems.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="pf-nav-link block whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold sm:px-3.5 sm:py-2 sm:text-[12px]"
                    style={active === n.id ? { background: INK, color: "#fff" } : { color: "rgba(0,0,0,.75)" }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* kembali ke atas + ring progress */}
          <button
            type="button"
            aria-label="Kembali ke atas"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[85] grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow-[0_14px_30px_-10px_rgba(10,20,50,.4)] backdrop-blur transition-colors hover:bg-black hover:text-white sm:right-6 sm:h-12 sm:w-12"
            style={{
              transform: pastHero ? "scale(1)" : "scale(.6)",
              opacity: pastHero ? 1 : 0,
              pointerEvents: pastHero ? "auto" : "none",
              transition: "transform .5s var(--ease), opacity .3s ease, background-color .2s ease, color .2s ease",
            }}
          >
            <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90">
              <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="2" />
              <circle ref={ringRef} cx="20" cy="20" r="18" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
            </svg>
            <Icon name="up" className="relative h-4 w-4" />
          </button>
        </>
      )}

      {/* ====================== HERO ====================== */}
      <section
        id="home"
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        className="relative flex min-h-[100svh] w-full flex-col overflow-hidden"
        style={{ background: SOFT, "--title": "clamp(2.75rem, min(15vw, 27svh), 17rem)", "--hero-h": "clamp(15rem, 50svh, 40rem)" } as React.CSSProperties}
      >
        {/* sorotan lembut yang mengikuti kursor */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(520px circle at var(--px, 50%) var(--py, 45%), rgba(47,107,255,.10), transparent 60%)" }} />
        <div aria-hidden className="pf-glow pointer-events-none absolute left-1/2 top-[48%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(185,176,138,.35),transparent 65%)" }} />

        <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] sm:px-6 sm:text-[11px] sm:tracking-[0.24em] md:px-12 md:pt-8 lg:px-20">
          <span className="pf-hero-meta truncate" style={{ "--d": 0 } as React.CSSProperties}>{name}</span>
          <span className="pf-hero-meta hidden items-center gap-2 sm:flex" style={{ "--d": 100 } as React.CSSProperties}>
            <span className="pf-ping relative inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Available for work
          </span>
          <span className="pf-hero-meta shrink-0" style={{ "--d": 200 } as React.CSSProperties}>Portfolio — {year}</span>
        </header>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-6">
          <h1
            className="relative"
            style={{
              fontSize: "var(--title)",
              transform: "translate3d(calc(var(--mx, 0) * -12px), calc(var(--my, 0) * -6px), 0)",
              transition: "transform .5s ease-out",
            }}
          >
            <span className="sr-only">Portfolio {name}</span>
            <span aria-hidden className="flex items-end justify-center whitespace-nowrap font-black leading-none tracking-[-0.04em]">
              {LETTERS.map((l, i) => (
                <span key={i} className="pf-letter-wrap" style={{ "--i": i } as React.CSSProperties}>
                  <span className="pf-letter" style={{ "--y": `${l.y}em`, "--r": `${l.r}deg`, fontWeight: 900 } as React.CSSProperties}>
                    {l.c}
                  </span>
                </span>
              ))}
            </span>
            <span aria-hidden className="pf-year absolute right-[27%] top-[-2%] text-[0.14em] font-bold" style={{ color: SAND }}>
              &apos;{String(year).slice(2)}
            </span>
          </h1>

          <div
            className="pf-hero-img relative z-10 -mt-[calc(var(--title)*0.5)] flex justify-center"
            style={{ transform: "translate3d(calc(var(--mx, 0) * 16px), calc(var(--my, 0) * 8px), 0)", transition: "transform .5s ease-out" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_SRC} alt={name} className="relative z-10 h-[var(--hero-h)] w-auto max-w-full object-contain object-bottom drop-shadow-[0_30px_30px_rgba(0,0,0,.12)]" />

            {/* hard skills mengorbit di sekitar gambar */}
            {orbitSkills.length > 0 && (
              <>
                <ul className="sr-only">
                  {orbitSkills.map((s, i) => (
                    <li key={i}>{skillName(s)}</li>
                  ))}
                </ul>
                <div aria-hidden className="pf-orbit pointer-events-none absolute inset-0" style={{ "--h": "var(--hero-h)" } as React.CSSProperties}>
                  {orbitSkills.map((s, i, arr) => (
                    <span
                      key={i}
                      className={`pf-orb-z absolute left-1/2 top-[44%] block h-0 w-0 ${i >= 5 ? "max-sm:hidden" : ""}`}
                      style={{ "--o": `${(i / arr.length) * 28}s`, "--a": `${(i / arr.length) * 360}deg` } as React.CSSProperties}
                    >
                      <span className="pf-orb-x relative block">
                        <span className="pf-orb-y relative block">
                          <span className="pf-orb-chip inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-bold shadow-[0_10px_24px_-10px_rgba(20,30,60,.4)] ring-1 ring-black/5 sm:text-[12px]">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                            {skillName(s)}
                          </span>
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="relative z-20 grid grid-cols-1 items-end gap-6 px-4 pb-8 text-center sm:px-6 md:grid-cols-3 md:px-12 md:text-left lg:px-20">
          <p className="pf-hero-meta mx-auto max-w-xs text-[12px] font-medium leading-relaxed opacity-70 md:mx-0 md:max-w-sm" style={{ "--d": 300 } as React.CSSProperties}>
            {HEADLINE}
          </p>
          <div className="pf-hero-meta hidden flex-col items-center gap-3 md:flex" style={{ "--d": 400 } as React.CSSProperties}>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Scroll</span>
            <span className="pf-scroll-line relative block h-10 w-px overflow-hidden bg-black/15" />
          </div>
          <ul className="pf-hero-meta flex flex-wrap items-center justify-center gap-5 md:justify-end" style={{ "--d": 500 } as React.CSSProperties}>
            {contacts.map((c) => (
              <li key={c.label}>
                <a href={c.href(c.v)} target="_blank" rel="noreferrer" aria-label={c.label} title={c.label} className="block p-1 transition-transform duration-500 hover:-translate-y-1">
                  <Icon name={SOCIAL_ICON[c.label] || "mail"} className="h-6 w-6" />
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </section>

      {/* ====================== PITA SKILL BERJALAN ====================== */}
      {marqueeSkills.length > 0 && (
        <div aria-hidden className="pf-marquee-wrap overflow-hidden py-5" style={{ background: "#e9eaee" }}>
          <div className="pf-marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {marqueeSkills.map((s, i) => (
                  <span key={i} className="mr-8 inline-flex items-center gap-8 whitespace-nowrap text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/55">
                    {skillName(s)}
                    <span style={{ color: ACCENT }}><Icon name="star" className="h-3 w-3" /></span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================== PROFIL ====================== */}
      <section id="tentang" className={`relative ${SECTION_X} pb-16 pt-4 lg:pb-20`} style={{ background: "linear-gradient(180deg,#e9eaee 0%,#f6f6f8 22%,#ffffff 70%)" }}>
        <div className={`${WRAP} grid items-start gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14`}>
          {/* kartu lanyard */}
          <Reveal className="mx-auto lg:mx-0">
            <div
              className={`${swinging ? "pf-swing" : "pf-sway"} relative flex w-[16rem] cursor-pointer flex-col items-center`}
              title="Klik untuk mengayunkan"
              onClick={() => setSwinging(true)}
              onAnimationEnd={(e) => {
                if (e.animationName === "pf-swing") setSwinging(false);
              }}
            >
              <span aria-hidden className="relative z-10 block h-[14rem] w-[4.2rem] rounded-[50%] border-[11px] border-[#d8d6cd] bg-transparent" />
              <span aria-hidden className="relative z-20 -mt-[3.6rem] block h-[3.4rem] w-[1.1rem] rounded-md border border-[#c4c2b8] bg-[#e4e2da]" />
              <div className="-mt-6 w-full rotate-[-5deg] rounded-[1.5rem] bg-[#f6f5f1] p-3.5 pb-4 shadow-[0_28px_40px_-20px_rgba(10,20,50,.45)] ring-1 ring-black/5">
                <div className="aspect-[4/5] overflow-hidden rounded-xl p-1.5" style={{ background: "linear-gradient(135deg,#dfe6fb,#eef1fd)" }}>
                  <div className="h-full w-full overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={HERO_SRC} alt={name} className="h-full w-full object-cover object-top" />
                  </div>
                </div>
                <p className="mt-3.5 text-center text-[15px] font-extrabold uppercase tracking-[0.02em]">{name}</p>
              </div>
            </div>
          </Reveal>

          {/* teks */}
          <div className="min-w-0 lg:pt-16">
            <Reveal>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-0.02em]">
                    Hi, saya <span style={{ color: SAND }}>{name}</span>
                  </h2>
                  <p className="mt-2 text-[13px] font-bold uppercase tracking-[0.02em]" style={{ color: "#a79e82" }}>
                    {HEADLINE.split(" · ").join(" / ")}
                  </p>
                </div>
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-shine inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(47,107,255,.55)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <Icon name="download" className="h-4 w-4" />
                  Unduh CV Lengkap
                </a>
              </div>
              <p className="pf-text mt-5 text-[16px] leading-[1.6] text-black/85">{BIO}</p>
            </Reveal>

            {eduList.length > 0 && (
              <Reveal delay={120}>
                <div className="mt-10 max-w-xl">
                  {/* Pendidikan */}
                  <div>
                    <h3 className="flex items-center gap-2.5 text-[clamp(1.2rem,1.8vw,1.5rem)] font-extrabold tracking-[-0.01em]">
                      <span style={{ color: ACCENT }}><Icon name="cap" className="h-6 w-6" /></span>Pendidikan
                    </h3>
                    <ol className="pf-stagger mt-5 space-y-6">
                      {eduList.map((e, i) => {
                        const active = isCurrent(e);
                        const note = eduNote(e);
                        const last = i === eduList.length - 1;
                        return (
                          <li key={i} className="relative pl-7">
                            <span aria-hidden className="pf-line absolute left-[5px] top-3 w-px" style={{ bottom: last ? "0" : "-1.5rem", background: active ? "#8fb0ff" : "#dedede", "--ld": `${i * 200 + 300}ms` } as React.CSSProperties} />
                            <span aria-hidden className="absolute left-0 top-[3px] h-3 w-3 rounded-full ring-[3px] ring-white" style={{ background: active ? ACCENT : "#d4d4d4" }} />
                            {active ? (
                              <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: ACCENT_SOFT, color: ACCENT }}>
                                {period(e)}{note ? ` (${note})` : ""}
                              </span>
                            ) : (
                              <span className="block text-[11px] font-bold tracking-[0.08em] text-black/55">{period(e)}</span>
                            )}
                            <b className="mt-1.5 block text-[clamp(1.05rem,1.5vw,1.25rem)] font-extrabold leading-snug">{eduTitle(e)}</b>
                            {eduSub(e) && <span className="pf-text mt-0.5 block text-[13px] leading-snug text-black/60">{eduSub(e)}</span>}
                            {eduGpa(e) && (
                              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: ACCENT_SOFT, color: "#3a4a8f" }}>
                                <span style={{ color: ACCENT }}><Icon name="star" className="h-3 w-3" /></span>
                                {eduGpa(e)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ====================== PANEL-PANEL (jarak & lebar seragam) ====================== */}
      <div className={`${SECTION_X} bg-white`}>
        <div className={`${WRAP} flex flex-col gap-8`}>
          {/* ---------- PENGALAMAN KERJA ---------- */}
          {experiences.length > 0 && (
            <Reveal>
              <section id="pengalaman" className={PANEL}>
                <PanelHead
                  label="Pengalaman Kerja & Profesional"
                  right={
                    <PanelRight
                      onMore={() => setMore("exp")}
                      info={<><Icon name="brief" className="h-3.5 w-3.5" />{experiences.length} Posisi Terverifikasi</>}
                    />
                  }
                />
                <HScroll>{experiences.map((e, i) => expCard(e, i, false, "w-[82%] sm:w-[21rem]"))}</HScroll>
              </section>
            </Reveal>
          )}

          {/* ---------- ORGANISASI ---------- */}
          {orgList.length > 0 && (
            <Reveal>
              <section id="organisasi" className={PANEL}>
                <PanelHead
                  label="Organisasi & Kepanitiaan"
                  right={<PanelRight onMore={() => setMore("org")} info="Kepemimpinan & Kontribusi" />}
                />
                <ol className="pf-stagger relative">{orgShown.map((o, i, arr) => orgItem(o, i, arr))}</ol>
              </section>
            </Reveal>
          )}

          {/* ---------- PROYEK (scroll samping + popup) ---------- */}
          {projList.length > 0 && (
            <Reveal>
              <section id="proyek" className={PANEL}>
                <PanelHead
                  label="Portfolio Project"
                  title="Proyek Pilihan & Eksplorasi Digital"
                  right={<PanelRight onMore={() => setMore("proj")} info={`${projList.length} Studi Kasus Utama`} />}
                />
                <HScroll>{projList.map((p, i) => projCard(p, i, "w-[82%] sm:w-[21rem]"))}</HScroll>
              </section>
            </Reveal>
          )}

          {/* ---------- SERTIFIKASI (scroll samping + popup) ---------- */}
          {certPanels.length > 0 && (
            <Reveal>
              <section id="sertifikasi" className={PANEL}>
                <PanelHead
                  label="Sertifikasi & Lisensi Kompetensi"
                  right={<PanelRight onMore={() => setMore("cert")} info={`${certPanels.length} Sertifikat`} />}
                />
                <HScroll>{certPanels.map((c, i) => certCard(c, i, "w-[15rem] sm:w-[16.5rem]"))}</HScroll>
              </section>
            </Reveal>
          )}
        </div>
      </div>

      {/* ====================== KONTAK / CTA ====================== */}
      <section id="kontak" className={`${SECTION_X} bg-white pb-20 pt-8`}>
        <div className={WRAP}>
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 rounded-[1.75rem] border border-black/[0.04] px-2 py-8 md:flex-row md:items-center md:px-8">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f0fb] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                  Mari Terhubung
                </span>
                <h2 className="mt-3 text-[clamp(1.6rem,2.8vw,2.2rem)] font-extrabold leading-[1.15] tracking-[-0.02em]">
                  Punya ide proyek atau ingin sekadar berdiskusi santai?
                </h2>
                <p className="pf-text mt-3 text-[15px] leading-[1.6] text-black/65">
                  Terbuka untuk peluang kolaborasi desain produk, rekayasa frontend, konsultasi arsitektur UI, hingga sesi mentoring.
                </p>
                {contacts.length === 0 && (
                  <p className="pf-text mt-2 text-[12px] text-black/50">Isi email atau WhatsApp di profil admin agar tombol kontak berfungsi.</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={mainContact}
                  target="_blank"
                  rel="noreferrer"
                  className="pf-shine rounded-full px-7 py-3.5 text-[13px] font-bold text-white shadow-[0_12px_26px_-8px_rgba(47,107,255,.7)] transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ background: ACCENT }}
                >
                  Kirim Pesan
                </a>
                <a href="#proyek" className="rounded-full bg-white px-6 py-3.5 text-[13px] font-bold shadow-[0_8px_22px_-10px_rgba(0,0,0,.25)] ring-1 ring-black/[0.04] transition-transform duration-300 hover:-translate-y-0.5">
                  Lihat Eksplorasi
                </a>
              </div>
            </div>
          </Reveal>
          <p className="mt-6 text-center text-[11px] text-black/40">© {year} {name}. {firstName} · Seluruh hak cipta dilindungi.</p>
        </div>
      </section>

      {/* ====================== POP UP "LIHAT SELENGKAPNYA" ====================== */}
      {more && (
        <ModalShell label={moreMeta[more].label} onClose={closeMore} z={100} listen={!modal} maxW={moreMeta[more].maxW}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BROWN }}>{moreMeta[more].label}</p>
          <h3 className="mb-5 mt-1 pr-10 text-[clamp(1.3rem,2.2vw,1.8rem)] font-extrabold leading-tight tracking-[-0.02em]">{moreMeta[more].title}</h3>

          {more === "exp" && <div className="pf-stagger grid gap-4 md:grid-cols-2">{experiences.map((e, i) => expCard(e, i, true))}</div>}
          {more === "org" && <ol className="pf-stagger relative pt-1">{orgList.map((o, i, arr) => orgItem(o, i, arr, true))}</ol>}
          {more === "proj" && <div className="pf-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projList.map((p, i) => projCard(p, i))}</div>}
          {more === "cert" && <div className="pf-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{certPanels.map((c, i) => certCard(c, i))}</div>}
        </ModalShell>
      )}

      {/* ====================== POP UP DETAIL (proyek / sertifikat) ====================== */}
      {modal && <DetailModal data={modal} onClose={closeModal} />}
    </main>
  );
}