import Link from "next/link";
import { SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RESOURCES } from "@/config/resources";

export default async function CariPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.replace(/[,()%]/g, " ").trim();
  const supabase = await createClient();

  const groups = term
    ? await Promise.all(
        RESOURCES.map(async (r) => {
          const textCols = r.fields.filter((f) => f.type === "text" || f.type === "textarea");
          const { data } = await supabase.from(r.table).select("*").or(textCols.map((f) => `${f.name}.ilike.%${term}%`).join(",")).limit(10);
          return { r, rows: (data ?? []) as Record<string, string | null>[] };
        })
      )
    : [];
  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div className="space-y-5">
      <div className="anim-rise">
        <h1 className="text-2xl font-extrabold">Hasil pencarian</h1>
        <p className="text-sm text-slate-500">{term ? <>{total} hasil untuk “{term}”</> : "Ketik kata kunci di kolom pencarian di atas."}</p>
      </div>
      {term && total === 0 && (
        <div className="card p-10 text-center text-slate-500 anim-rise">
          <SearchX className="mx-auto mb-2 text-slate-300" size={32} />Tidak ada data yang cocok.
        </div>
      )}
      {groups.filter((g) => g.rows.length).map(({ r, rows }, gi) => (
        <section key={r.key} className="card anim-rise p-5" style={{ "--i": gi } as React.CSSProperties}>
          <h2 className="font-bold mb-3">{r.title}</h2>
          <div className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <Link key={i} href={`/admin/${r.key}`} className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600 transition-colors">
                <span className="font-medium">{row[r.fields[0].name]}</span>
                <span className="text-slate-500">{row[r.fields.slice(1).find((f) => f.type === "text" || f.type === "select")?.name ?? ""] ?? ""}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
