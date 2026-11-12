import Link from "next/link";
import { Inter, Montserrat } from "next/font/google";
import { signIn } from "@/app/actions";
import { EmailField, PasswordField, SubmitButton } from "@/components/login-form-parts";

export const metadata = { title: "Masuk · Ripa Haerunisa" };

const body = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const NAME = "Ripa Haerunisa";
const HERO_SRC = "/ripa.png"; /* gambar yang sama dengan halaman portfolio */

/* warna yang sama dengan halaman front end */
const INK = "#0d0d0d";
const SAND = "#b9b08a";
const ACCENT = "#2f6bff";
const SOFT = "linear-gradient(180deg,#ffffff 0%,#f6f6f8 60%,#e9eaee 100%)";

/* huruf "Masuk": y = geser vertikal (em), r = rotasi (derajat), seperti judul hero */
const LETTERS = [
  { c: "M", y: -0.02, r: -8 },
  { c: "a", y: 0.12, r: 10 },
  { c: "s", y: -0.08, r: -12 },
  { c: "u", y: 0.1, r: 8 },
  { c: "k", y: -0.14, r: -10 },
];

const CSS = `
:root { --ease: cubic-bezier(.22,1,.36,1); }
.lg-text { font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif; }

@keyframes lg-rise { from { opacity: 0; translate: 0 50px; scale: .96; } to { opacity: 1; translate: 0 0; scale: 1; } }
@keyframes lg-fade { from { opacity: 0; translate: 0 14px; } to { opacity: 1; translate: 0 0; } }
@keyframes lg-drop { from { opacity: 0; translate: 0 -70%; } to { opacity: 1; translate: 0 0; } }
@keyframes lg-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -.05em; } }
@keyframes lg-glow { 0%,100% { opacity: .55; scale: 1; } 50% { opacity: .85; scale: 1.06; } }
@keyframes lg-drift { 0%,100% { translate: 0 0; } 50% { translate: 22px -16px; } }
@keyframes lg-pop { from { opacity: 0; scale: .4; rotate: -25deg; } to { opacity: 1; scale: 1; rotate: 0deg; } }
@keyframes lg-sway { 0%,100% { rotate: -3deg; } 50% { rotate: 3deg; } }
@keyframes lg-ping { 0% { scale: 1; opacity: .7; } 80%,100% { scale: 2.8; opacity: 0; } }
@keyframes lg-shake { 0%,100% { translate: 0 0; } 20% { translate: -8px 0; } 40% { translate: 7px 0; } 60% { translate: -5px 0; } 80% { translate: 3px 0; } }
@keyframes lg-line { from { scale: 0 1; } to { scale: 1 1; } }
@keyframes lg-spin { to { rotate: 360deg; } }

.lg-panel { animation: lg-rise 1.1s var(--ease) .15s both; }
.lg-avatar { animation: lg-pop .9s var(--ease) .45s both; }
.lg-sway { transform-origin: 50% 0; animation: lg-sway 7s ease-in-out infinite; }
.lg-item { opacity: 0; animation: lg-fade .9s var(--ease) calc(var(--d, 0) * 1ms + 500ms) both; }
.lg-meta { opacity: 0; animation: lg-fade 1s var(--ease) calc(var(--d, 0) * 1ms + 200ms) both; }
.lg-letter-wrap { display: inline-block; opacity: 0; animation: lg-drop 1s var(--ease) calc(var(--i) * 80ms + 700ms) both, lg-float 6s ease-in-out calc(var(--i) * 260ms + 2.2s) infinite; }
.lg-letter { display: inline-block; transform: translateY(var(--y)) rotate(var(--r)); transition: transform .6s var(--ease); }
@media (hover: hover) { .lg-letter:hover { transform: translateY(calc(var(--y) - .1em)) rotate(calc(var(--r) * -1)) scale(1.08); } }
.lg-glow { animation: lg-glow 7s ease-in-out infinite; }
.lg-drift { animation: lg-drift 12s ease-in-out infinite; }
.lg-ping::after { content: ""; position: absolute; inset: 0; border-radius: 999px; background: inherit; animation: lg-ping 1.8s ease-out infinite; }
.lg-alert { animation: lg-shake .5s ease-out .6s both; }
.lg-line { transform-origin: left; animation: lg-line 1s var(--ease) 1s both; }
.lg-spin { animation: lg-spin .8s linear infinite; }
.lg-shine { position: relative; overflow: hidden; }
.lg-shine::before { content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-20deg); translate: 0 0; transition: translate .9s var(--ease); }
.lg-shine:hover::before { translate: 440% 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .lg-panel, .lg-avatar, .lg-item, .lg-meta, .lg-letter-wrap { opacity: 1 !important; translate: none !important; }
}
`;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const year = new Date().getFullYear();

  return (
    <main
      className={`${body.className} ${inter.variable} relative flex min-h-[100svh] w-full flex-col overflow-hidden`}
      style={{ background: SOFT, color: INK }}
    >
      <style>{CSS}</style>

      {/* latar: cahaya pasir + dua gumpalan biru yang melayang pelan */}
      <div aria-hidden className="lg-glow pointer-events-none absolute left-1/2 top-[50%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(185,176,138,.35),transparent 65%)" }} />
      <div aria-hidden className="lg-drift pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(47,107,255,.14)" }} />
      <div aria-hidden className="lg-drift pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-3xl [animation-delay:-5s]" style={{ background: "rgba(47,107,255,.10)" }} />

      {/* header kecil, seperti hero portfolio */}
      <header
        className="relative z-20 flex items-center justify-between gap-3 px-4 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] sm:px-6 sm:text-[11px] sm:tracking-[0.24em] md:px-12 md:pt-8 lg:px-20"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <span className="lg-meta truncate" style={{ "--d": 0 } as React.CSSProperties}>{NAME}</span>
        <span className="lg-meta inline-flex shrink-0 items-center gap-2" style={{ "--d": 100 } as React.CSSProperties}>
          <span className="lg-ping relative inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Area pribadi
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[26rem]">
          {/* foto yang berayun pelan, menumpang di atas kartu */}
          <div className="lg-avatar relative z-20 mx-auto -mb-12 h-24 w-24">
            <div className="lg-sway h-full w-full overflow-hidden rounded-full p-1.5 shadow-[0_18px_30px_-14px_rgba(10,20,50,.45)] ring-4 ring-white" style={{ background: "linear-gradient(135deg,#dfe6fb,#eef1fd)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_SRC} alt={NAME} className="h-full w-full rounded-full object-cover object-top" />
            </div>
          </div>

          <form
            action={signIn}
            className="lg-panel relative rounded-[1.25rem] border border-black/[0.08] bg-white px-5 pb-6 pt-16 shadow-[0_40px_80px_-40px_rgba(20,30,80,.35)] sm:rounded-[1.75rem] sm:px-8 sm:pb-8"
          >
            <div className="text-center">
              <h1 className="text-[clamp(2.6rem,11vw,3.6rem)] font-black leading-none tracking-[-0.04em]">
                <span className="sr-only">Masuk</span>
                <span aria-hidden className="flex items-end justify-center whitespace-nowrap">
                  {LETTERS.map((l, i) => (
                    <span key={i} className="lg-letter-wrap" style={{ "--i": i } as React.CSSProperties}>
                      <span className="lg-letter" style={{ "--y": `${l.y}em`, "--r": `${l.r}deg`, color: i === 0 ? SAND : INK } as React.CSSProperties}>
                        {l.c}
                      </span>
                    </span>
                  ))}
                </span>
              </h1>
              <p className="lg-text lg-item mx-auto mt-3 max-w-[20rem] text-[14px] leading-[1.6] text-black/65" style={{ "--d": 700 } as React.CSSProperties}>
                Halaman ini khusus pemilik. Masuk untuk mengelola isi portfolio.
              </p>
            </div>

            <div className="relative mt-5 h-[2px] w-full bg-black/[0.06]" aria-hidden>
              <span className="lg-line absolute left-0 top-0 h-[2px] w-20 rounded-full" style={{ background: ACCENT }} />
            </div>

            {error && (
              <p role="alert" className="lg-text lg-alert mt-5 rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium leading-snug text-red-700">
                {error}
              </p>
            )}

            <div className="lg-item mt-5 space-y-4" style={{ "--d": 800 } as React.CSSProperties}>
              <EmailField />
              <PasswordField />
            </div>

            <div className="lg-item mt-6" style={{ "--d": 950 } as React.CSSProperties}>
              <SubmitButton />
            </div>
          </form>

          <div className="lg-item mt-5 text-center" style={{ "--d": 1100 } as React.CSSProperties}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold text-black/70 transition-colors hover:bg-black/[0.06]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m15 5-7 7 7 7" />
              </svg>
              Kembali ke portfolio
            </Link>
          </div>
        </div>
      </div>

      <p className="relative z-10 pb-6 text-center text-[11px] text-black/40" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        © {year} {NAME}
      </p>
    </main>
  );
}