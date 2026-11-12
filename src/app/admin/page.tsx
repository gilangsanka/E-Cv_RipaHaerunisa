import Link from "next/link";
import {
  ArrowRight, Award, FolderKanban, BadgeCheck, Briefcase, CheckCircle2, Contact, ExternalLink, Eye, FileDown, FileText,
  Globe, GraduationCap, History, Lightbulb, Mail, MapPin, Pencil, Phone, Share2, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/stat-card";
import AddDataButton from "@/components/add-data-button";
import { ShareLinkButton } from "@/components/cv-actions";
import { formatStamp, stripProtocol, timeAgo } from "@/lib/format";
import type { Certification, Education, Experience, Organization, Profile, Project, Skill } from "@/types/db";

type Tone = "green" | "slate" | "blue" | "amber";
type Activity = { id: string; title: string; kind: string; icon: React.ReactNode; org: string; at: string; status: string; tone: Tone };

const TONES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
};

function Ring({ pct }: { pct: number }) {
  const r = 32, c = 2 * Math.PI * r;
  return (
    <div className="relative size-[76px] shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-brand-100" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          className="stroke-brand-600 ring-draw" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ "--c": c } as React.CSSProperties} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">{pct}%</span>
    </div>
  );
}

function InfoRow({ icon, label, value, href, mono }: { icon: React.ReactNode; label: string; value?: string | null; href?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 px-3.5 py-3 text-sm transition-colors hover:bg-brand-50/60">
      <span className="flex items-center gap-2.5 text-slate-500 shrink-0">{icon}{label}</span>
      {!value ? <span className="text-slate-400">Belum diisi</span>
        : href ? <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline truncate">{stripProtocol(value)}<ExternalLink size={12} className="shrink-0" /></a>
          : <span className={`font-semibold truncate ${mono ? "font-mono text-[13px]" : ""}`}>{value}</span>}
    </div>
  );
}

const delay = (i: number) => ({ "--i": i } as React.CSSProperties);

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [pr, ex, ed, sk, ce, og, pj] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("experiences").select("*").order("start_date", { ascending: false, nullsFirst: true }),
    supabase.from("educations").select("*").order("end_year", { ascending: false, nullsFirst: true }),
    supabase.from("skills").select("*"),
    supabase.from("certifications").select("*"),
    supabase.from("organizations").select("*"),
    supabase.from("projects").select("*").order("year", { ascending: false, nullsFirst: true }),
  ]);
  const p = pr.data as Profile | null;
  const exps = (ex.data ?? []) as Experience[];
  const edus = (ed.data ?? []) as Education[];
  const skills = (sk.data ?? []) as Skill[];
  const certs = (ce.data ?? []) as Certification[];
  const orgs = (og.data ?? []) as Organization[];
  const projects = (pj.data ?? []) as Project[];

  // ---- Kelengkapan: 9 modul ----
  const modules = [
    { label: "Profil", ok: !!(p?.full_name && p?.headline) },
    { label: "Kontak", ok: !!(p?.email && p?.phone) },
    { label: "Tautan online", ok: !!(p?.linkedin || p?.portfolio) },
    { label: "Ringkasan", ok: !!p?.summary },
    { label: "Pengalaman", ok: exps.length > 0 },
    { label: "Proyek", ok: projects.length > 0 },
    { label: "Pendidikan", ok: edus.length > 0 },
    { label: "Keahlian", ok: skills.length > 0 },
    { label: "Sertifikasi", ok: certs.length > 0 },
    { label: "Organisasi", ok: orgs.length > 0 },
  ];
  const done = modules.filter((m) => m.ok).length;
  const pct = Math.round((done / modules.length) * 100);
  const missing = modules.filter((m) => !m.ok).map((m) => m.label);
  const grade = pct >= 90 ? "Sangat Bagus" : pct >= 70 ? "Bagus" : pct >= 40 ? "Cukup" : "Perlu Dilengkapi";

  // ---- Statistik ----
  const today = new Date().toISOString().slice(0, 10);
  const expired = certs.filter((c) => c.expires_at && c.expires_at < today).length;
  const hard = skills.filter((s) => s.category === "Hard Skills").length;
  const soft = skills.filter((s) => s.category === "Soft Skills").length;
  const lang = skills.filter((s) => s.category === "Bahasa").length;
  const lastExp = exps[0];
  const lastEdu = edus[0];

  const stamps = [p?.updated_at, ...[...exps, ...edus, ...skills, ...certs, ...orgs, ...projects].map((r) => r.created_at)].filter(Boolean) as string[];
  const lastUpdate = stamps.sort().at(-1);

  // ---- Aktivitas terbaru ----
  const levelText = (n: number | null) => ((n ?? 0) >= 85 ? "Ahli (Advanced)" : (n ?? 0) >= 60 ? "Mahir (Intermediate)" : "Dasar (Beginner)");
  const activity: Activity[] = [
    ...exps.map((r): Activity => ({ id: r.id, title: r.position, kind: "Pengalaman Kerja", icon: <Briefcase size={15} />, org: r.company, at: r.created_at, status: r.end_date ? "Selesai" : "Aktif", tone: r.end_date ? "slate" : "green" })),
    ...certs.map((r): Activity => {
      const exp = r.expires_at && r.expires_at < today;
      return { id: r.id, title: r.title, kind: r.category ?? "Sertifikasi", icon: <Award size={15} />, org: r.issuer ?? "—", at: r.created_at, status: exp ? "Kedaluwarsa" : r.credential_url ? "Terverifikasi" : "Tercatat", tone: exp ? "amber" : r.credential_url ? "green" : "slate" };
    }),
    ...skills.map((r): Activity => ({ id: r.id, title: r.name, kind: "Keahlian (Skill)", icon: <Lightbulb size={15} />, org: `Tingkat ${levelText(r.level)}`, at: r.created_at, status: (r.level ?? 0) >= 60 ? "Stabil" : "Berkembang", tone: (r.level ?? 0) >= 60 ? "slate" : "blue" })),
    ...edus.map((r): Activity => ({ id: r.id, title: [r.degree, r.field].filter(Boolean).join(" ") || r.institution, kind: "Pendidikan", icon: <GraduationCap size={15} />, org: r.institution, at: r.created_at, status: r.end_year ? `Lulus${r.gpa ? ` (${r.gpa})` : ""}` : "Berjalan", tone: r.end_year ? "green" : "blue" })),
    ...projects.map((r): Activity => ({ id: r.id, title: r.title, kind: "Proyek", icon: <FolderKanban size={15} />, org: r.category ?? "—", at: r.created_at, status: r.demo_url ? "Live" : "Tercatat", tone: r.demo_url ? "green" : "slate" })),
    ...orgs.map((r): Activity => ({ id: r.id, title: r.role ?? r.name, kind: "Organisasi", icon: <Users size={15} />, org: r.name, at: r.created_at, status: r.end_year ? "Selesai" : "Aktif", tone: r.end_year ? "slate" : "green" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);

  const words = p?.summary?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const name = p?.full_name ?? "Admin";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="card anim-rise relative overflow-hidden p-6 sm:p-7">
        <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_50%,var(--color-brand-50),transparent_65%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${p?.open_to_work ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                <span className={`size-1.5 rounded-full ${p?.open_to_work ? "bg-emerald-500" : "bg-slate-400"}`} />
                {p?.open_to_work ? "SIAP KERJA" : "TIDAK MENCARI KERJA"}
              </span>
              <span className="font-mono text-slate-500">Terakhir diperbarui: {timeAgo(lastUpdate)}</span>
            </div>
            <h1 className="text-3xl font-extrabold mt-3">Halo, {name}</h1>
            <p className="text-sm text-slate-500 mt-2">
              {missing.length === 0
                ? "Portofolio dan ringkasan riwayat karir Anda sudah lengkap. Perbarui sertifikasi terkini untuk visibilitas optimal ke perekrut."
                : `Portofolio Anda hampir sempurna. Bagian yang belum lengkap: ${missing.join(", ")}.`}
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-brand-50/70 p-4">
            <Ring pct={pct} />
            <div className="text-sm">
              <p className="font-bold">Kelengkapan Profil</p>
              <p className="text-xs text-slate-500 mt-0.5">{grade} ({done}/{modules.length} Modul)</p>
            </div>
            <Link href="/admin/pratinjau" className="btn"><Eye size={16} />Pratinjau CV</Link>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Link href="/admin/pengalaman"><StatCard index={1} label="Pengalaman Kerja" value={exps.length} title="Posisi Profesional" icon={<Briefcase size={18} />}
          sub={lastExp ? `${lastExp.position} @ ${lastExp.company}` : "Belum ada data"} /></Link>
        <Link href="/admin/proyek"><StatCard index={2} label="Proyek & Portofolio" value={projects.length} title="Proyek Dikerjakan" icon={<FolderKanban size={18} />}
          sub={projects[0] ? projects[0].title : "Belum ada data"} /></Link>
        <Link href="/admin/pendidikan"><StatCard index={2} label="Riwayat Pendidikan" value={edus.length} title="Institusi Pendidikan" icon={<GraduationCap size={18} />}
          sub={lastEdu ? `${[lastEdu.degree, lastEdu.field].filter(Boolean).join(" ")}${lastEdu.gpa ? ` (IPK ${lastEdu.gpa})` : ""}` : "Belum ada data"} /></Link>
        <Link href="/admin/keahlian"><StatCard index={3} label="Keahlian & Skills" value={skills.length} title="Keahlian Tercatat" icon={<Lightbulb size={18} />}
          sub={<span className="flex flex-wrap gap-1.5 font-mono">
            <span className="rounded bg-slate-100 px-1.5 py-0.5">{hard} Hard</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5">{soft} Soft</span>
            {lang > 0 && <span className="rounded bg-slate-100 px-1.5 py-0.5">{lang} Bahasa</span>}
          </span>} /></Link>
        <Link href="/admin/sertifikasi"><StatCard index={4} label="Sertifikasi & Lisensi" value={certs.length - expired} title="Sertifikat Aktif" icon={<BadgeCheck size={18} />}
          sub={certs.length === 0 ? "Belum ada data" : expired ? `${expired} kedaluwarsa` : <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={13} />Semua sertifikat berlaku</span>} /></Link>
      </div>

      <div className="grid lg:grid-cols-[2fr_3fr] gap-6 items-start">
        {/* Kolom kiri */}
        <div className="space-y-6">
          <section className="card anim-rise p-5" style={delay(5)}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 font-bold"><Contact size={18} className="text-brand-600" />Informasi Pribadi & Kontak</h2>
              <Link href="/admin/profil" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:gap-2 transition-all">Kelola <ArrowRight size={13} /></Link>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-brand-50/70 p-3.5 mb-3">
              {p?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="size-14 rounded-full object-cover" />
              ) : (
                <span className="grid place-items-center size-14 rounded-full bg-brand-600 text-white text-xl font-bold">{name.charAt(0).toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <p className="font-bold truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{p?.headline ?? "Headline belum diisi"}</p>
                {p?.open_to_work && <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Status Aktif Mencari Kerja</span>}
              </div>
            </div>
            <div className="space-y-2">
              <InfoRow icon={<MapPin size={15} />} label="Domisili" value={p?.location} />
              <InfoRow icon={<Mail size={15} />} label="Email" value={p?.email} href={p?.email ? `mailto:${p.email}` : undefined} />
              <InfoRow icon={<Phone size={15} />} label="Telepon" value={p?.phone} mono />
              <InfoRow icon={<Globe size={15} />} label="LinkedIn" value={p?.linkedin} href={p?.linkedin ?? undefined} />
              <InfoRow icon={<Globe size={15} />} label="Portofolio" value={p?.portfolio} href={p?.portfolio ?? undefined} />
            </div>
          </section>

          <section className="card anim-rise p-5" style={delay(6)}>
            <h2 className="flex items-center gap-2 font-bold"><Share2 size={18} className="text-brand-600" />Distribusi & Publikasi</h2>
            <p className="text-sm text-slate-500 mt-3">Bagikan portofolio daring atau unduh dokumen siap cetak standar ATS untuk melamar pekerjaan.</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link href="/admin/pratinjau?print=1" className="btn btn-ghost !bg-brand-50"><FileDown size={15} />Ekspor PDF</Link>
              <ShareLinkButton className="btn" />
            </div>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6">
          <section className="card anim-rise p-5" style={delay(5)}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 font-bold"><FileText size={18} className="text-brand-600" />Ringkasan Profil (Professional Summary)</h2>
              <Link href="/admin/profil" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors"><Pencil size={13} />Ubah Teks</Link>
            </div>
            <div className="rounded-xl bg-brand-50/70 p-4 text-sm leading-7 text-slate-700 min-h-24">
              {p?.summary ?? <span className="text-slate-400">Ringkasan belum diisi. Klik “Ubah Teks” untuk menulisnya.</span>}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>Diperbarui: <b className="text-slate-800">{timeAgo(p?.updated_at)}</b></span>
              <span className="font-mono">{words} kata / {p?.summary?.length ?? 0} karakter</span>
            </div>
          </section>

          <section className="card anim-rise p-5" style={delay(6)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold"><History size={18} className="text-brand-600" />Aktivitas Entri Terbaru & Pembaruan Terakhir</h2>
                <p className="text-xs text-slate-500 mt-1">Catatan perubahan riwayat, modul keterampilan, dan sertifikasi terkini.</p>
              </div>
              <AddDataButton label="Tambah Baru" className="btn" />
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-50/70 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    <th className="px-3 py-2.5 rounded-l-lg">Entri & Kategori</th>
                    <th className="px-3 py-2.5">Institusi / Perusahaan</th>
                    <th className="px-3 py-2.5">Waktu Pembaruan</th>
                    <th className="px-3 py-2.5 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 && <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-500">Belum ada aktivitas. Klik “Tambah Baru” untuk memulai.</td></tr>}
                  {activity.map((a, i) => (
                    <tr key={a.id} className="anim-rise border-b border-slate-50 last:border-0 hover:bg-brand-50/40 transition-colors" style={delay(i + 7)}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-8 shrink-0 rounded-lg bg-brand-50 text-brand-600">{a.icon}</span>
                          <div className="min-w-0">
                            <p className="font-semibold leading-snug">{a.title}</p>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{a.kind}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{a.org}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{formatStamp(a.at)}</td>
                      <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[a.tone]}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-slate-500">Menampilkan {activity.length} entri aktivitas terakhir</span>
              <Link href="/admin/pengalaman" className="flex items-center gap-1 font-semibold text-brand-600 hover:gap-2 transition-all">Lihat Semua Modul <ArrowRight size={13} /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
