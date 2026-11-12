import { createClient } from "@/lib/supabase/server";
import { PrintControls } from "@/components/cv-actions";
import { yearOf } from "@/lib/format";
import type { Certification, Education, Experience, Organization, Profile, Project, Skill } from "@/types/db";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-slate-300 pb-1 text-[13px] font-bold tracking-wide uppercase">{title}</h2>
      <div className="mt-2 space-y-3 text-[13px] leading-relaxed">{children}</div>
    </section>
  );
}

export default async function PratinjauPage({ searchParams }: { searchParams: Promise<{ print?: string }> }) {
  const { print } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [pr, ex, ed, sk, ce, og, pj] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("experiences").select("*").order("start_date", { ascending: false, nullsFirst: true }),
    supabase.from("educations").select("*").order("end_year", { ascending: false, nullsFirst: true }),
    supabase.from("skills").select("*").order("created_at"),
    supabase.from("certifications").select("*").order("issued_at", { ascending: false, nullsFirst: true }),
    supabase.from("organizations").select("*").order("start_year", { ascending: false, nullsFirst: true }),
    supabase.from("projects").select("*").order("year", { ascending: false, nullsFirst: true }),
  ]);
  const p = pr.data as Profile | null;
  const exps = (ex.data ?? []) as Experience[];
  const edus = (ed.data ?? []) as Education[];
  const skills = (sk.data ?? []) as Skill[];
  const certs = (ce.data ?? []) as Certification[];
  const orgs = (og.data ?? []) as Organization[];
  const projects = (pj.data ?? []) as Project[];
  const contact = [p?.location, p?.phone, p?.email, p?.linkedin, p?.portfolio].filter(Boolean).join(" | ");
  const skillLine = (cat: string) => skills.filter((s) => s.category === cat).map((s) => s.name).join(", ");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden anim-rise">
        <div>
          <h1 className="text-2xl font-extrabold">Pratinjau CV</h1>
          <p className="text-sm text-slate-500">Tampilan CV format ATS dari data yang Anda kelola.</p>
        </div>
        <PrintControls autoPrint={print === "1"} />
      </div>

      <article className="card anim-rise mx-auto max-w-3xl p-10 print:max-w-none print:border-0 print:p-0" style={{ "--i": 1 } as React.CSSProperties}>
        <header className="text-center">
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">{p?.full_name ?? "Nama belum diisi"}</h1>
          {p?.headline && <p className="mt-1 text-sm text-slate-600">{p.headline}</p>}
          {contact && <p className="mt-1 text-xs text-slate-500">{contact}</p>}
        </header>

        {p?.summary && <Section title="Profil Singkat"><p>{p.summary}</p></Section>}

        {edus.length > 0 && (
          <Section title="Pendidikan">
            {edus.map((e) => (
              <div key={e.id}>
                <p className="font-semibold">{e.institution}</p>
                <p className="text-slate-600">{[e.degree, e.field].filter(Boolean).join(" ")} | {e.start_year ?? ""} – {e.end_year ?? "Sekarang"}{e.gpa ? ` | IPK ${e.gpa}` : ""}</p>
              </div>
            ))}
          </Section>
        )}

        {exps.length > 0 && (
          <Section title="Pengalaman Kerja">
            {exps.map((x) => (
              <div key={x.id}>
                <p className="font-semibold">{x.position} – {x.company} <span className="font-normal text-slate-500">| {yearOf(x.start_date)} – {x.end_date ? yearOf(x.end_date) : "Sekarang"}</span></p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {(x.description ?? "").split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Proyek">
            {projects.map((x) => (
              <div key={x.id}>
                <p className="font-semibold">{x.title}{x.role ? ` – ${x.role}` : ""}{x.year ? <span className="font-normal text-slate-500"> | {x.year}</span> : null}</p>
                {x.description && <p className="text-slate-700">{x.description}</p>}
                {x.tech_stack && <p className="text-slate-500">Teknologi: {x.tech_stack}</p>}
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Keterampilan">
            {["Hard Skills", "Soft Skills", "Bahasa"].map((c) => skillLine(c) && <p key={c}><b>{c}:</b> {skillLine(c)}</p>)}
          </Section>
        )}

        {orgs.length > 0 && (
          <Section title="Pengalaman Organisasi dan Kegiatan">
            {orgs.map((o) => (
              <div key={o.id}>
                <p className="font-semibold">{o.role ? `${o.role} – ` : ""}{o.name}</p>
                {o.description && <p className="text-slate-700">{o.description}</p>}
              </div>
            ))}
          </Section>
        )}

        {certs.length > 0 && (
          <Section title="Sertifikasi dan Pelatihan">
            {certs.map((c) => (
              <p key={c.id}><b>{c.title}</b>{c.issuer ? ` | ${c.issuer}` : ""}{c.issued_at ? ` | ${yearOf(c.issued_at)}` : ""}</p>
            ))}
          </Section>
        )}
      </article>
    </div>
  );
}
