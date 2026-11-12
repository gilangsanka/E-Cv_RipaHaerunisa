"use client";

import { useCallback, useMemo, useState, useTransition, type FormEvent } from "react";
import { Eye, Loader2, Pencil, Plus, Search, Trash2, TriangleAlert } from "lucide-react";
import type { Field, Resource } from "@/config/resources";
import { createItem, deleteItem, updateItem } from "@/app/actions";
import FieldInput from "@/components/field-input";
import Modal from "@/components/modal";
import Toast from "@/components/toast";

type Row = Record<string, string | number | null> & { id: string };
type Mode = { type: "add" } | { type: "edit"; row: Row } | { type: "delete"; row: Row } | null;

function formatCell(f: Field, v: string | number | null) {
  if (v === null || v === "") return f.name === "end_date" ? "Sekarang" : "—";
  if (f.type === "date") return new Date(String(v)).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  return String(v);
}

export default function ResourceManager({ resource, rows, autoOpen = false }: { resource: Resource; rows: Row[]; autoOpen?: boolean }) {
  const [mode, setMode] = useState<Mode>(autoOpen ? { type: "add" } : null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const clearToast = useCallback(() => setToast(null), []);

  const cols = resource.fields.filter((f) => f.list);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => cols.some((c) => String(r[c.name] ?? "").toLowerCase().includes(q))) : rows;
  }, [rows, query, cols]);

  const close = () => { setMode(null); setError(null); };

  const run = (action: (fd: FormData) => Promise<void>, message: string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(fd);
        close();
        setToast(message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
      }
    });
  };

  const footer = (label: string) => (
    <div className="flex justify-end gap-2 sm:col-span-2 pt-1">
      <button type="button" onClick={close} className="btn btn-ghost">Batal</button>
      <button disabled={pending} className="btn">
        {pending && <Loader2 size={14} className="animate-[spin_.8s_linear_infinite]" />}
        {label}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 anim-rise">
        <div>
          <h1 className="text-2xl font-extrabold">{resource.title}</h1>
          <p className="text-sm text-slate-500">{resource.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreviewOpen(true)} className="btn btn-ghost"><Eye size={16} />Preview Website</button>
          <button onClick={() => setMode({ type: "add" })} className="btn"><Plus size={16} />{resource.addLabel}</button>
        </div>
      </div>

      <div className="relative max-w-xs anim-rise" style={{ "--i": 1 } as React.CSSProperties}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari data…" className="input !pl-9" aria-label="Cari data" />
      </div>

      <div className="card overflow-x-auto anim-rise" style={{ "--i": 2 } as React.CSSProperties}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
              {cols.map((c) => <th key={c.name} className="px-4 py-3 font-semibold">{c.label.split(" (")[0]}</th>)}
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-4 py-12 text-center text-slate-500">
                {rows.length === 0 ? <>Belum ada data. Klik “{resource.addLabel}” untuk mulai.</> : "Tidak ada data yang cocok dengan pencarian."}
              </td></tr>
            )}
            {shown.map((row, i) => (
              <tr key={row.id} className="anim-rise border-b border-slate-50 last:border-0 hover:bg-brand-50/50 transition-colors align-middle" style={{ "--i": i } as React.CSSProperties}>
                {cols.map((c) => (
                  <td key={c.name} className="px-4 py-3">
                    {c.type === "image" ? (
                      row[c.name]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={String(row[c.name])} alt="" className="size-11 rounded-lg border border-slate-100 object-cover" />
                        : <span className="text-slate-300">—</span>
                    ) : c.name === "level" ? (
                      <div className="flex items-center gap-2 min-w-32">
                        <div className="h-2 flex-1 rounded-full bg-brand-50 overflow-hidden">
                          <div className="bar-grow h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${Number(row.level ?? 0)}%`, "--i": i } as React.CSSProperties} />
                        </div>
                        <span className="text-xs font-semibold text-brand-700 w-9 text-right">{row.level ?? 0}%</span>
                      </div>
                    ) : formatCell(c, row[c.name])}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setMode({ type: "edit", row })} className="btn btn-ghost !px-2.5" aria-label="Ubah"><Pencil size={14} /></button>
                    <button onClick={() => setMode({ type: "delete", row })} className="btn btn-ghost !px-2.5 !text-red-600 hover:!bg-red-50" aria-label="Hapus"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pop up tambah */}
      <Modal open={mode?.type === "add"} onClose={close} title={resource.addLabel}>
        <form onSubmit={run(createItem, "Data berhasil ditambahkan")} className="grid sm:grid-cols-2 gap-4">
          <input type="hidden" name="resource" value={resource.key} />
          {resource.fields.map((f) => <FieldInput key={f.name} field={f} />)}
          {error && <p role="alert" className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          {footer("Simpan")}
        </form>
      </Modal>

      {/* Pop up ubah */}
      <Modal open={mode?.type === "edit"} onClose={close} title={`Ubah ${resource.title}`}>
        {mode?.type === "edit" && (
          <form key={mode.row.id} onSubmit={run(updateItem, "Perubahan berhasil disimpan")} className="grid sm:grid-cols-2 gap-4">
            <input type="hidden" name="resource" value={resource.key} />
            <input type="hidden" name="id" value={mode.row.id} />
            {resource.fields.map((f) => <FieldInput key={f.name} field={f} value={mode.row[f.name]} />)}
            {error && <p role="alert" className="sm:col-span-2 text-sm text-red-600">{error}</p>}
            {footer("Simpan perubahan")}
          </form>
        )}
      </Modal>

      {/* Pop up konfirmasi hapus */}
      <Modal open={mode?.type === "delete"} onClose={close} title="Hapus data?" size="sm">
        {mode?.type === "delete" && (
          <form onSubmit={run(deleteItem, "Data berhasil dihapus")} className="space-y-4">
            <input type="hidden" name="resource" value={resource.key} />
            <input type="hidden" name="id" value={mode.row.id} />
            <div className="flex gap-3">
              <span className="grid place-items-center size-10 shrink-0 rounded-full bg-red-50 text-red-600"><TriangleAlert size={18} /></span>
              <p className="text-sm text-slate-600">
                <b className="text-slate-900">{String(mode.row[cols[0].name] ?? "Data ini")}</b> akan dihapus permanen dan tidak bisa dikembalikan.
              </p>
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={close} className="btn btn-ghost">Batal</button>
              <button disabled={pending} className="btn btn-danger">
                {pending && <Loader2 size={14} className="animate-[spin_.8s_linear_infinite]" />}
                Ya, hapus
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Preview website: iframe dimuat ulang tiap dibuka, jadi selalu menampilkan data terbaru */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview Website" size="xl" bare>
        <iframe src="/preview?embed=1" title="Preview website" className="h-full w-full bg-white" />
      </Modal>

      <Toast message={toast} onDone={clearToast}
        action={{ label: "Lihat preview", onClick: () => { setToast(null); setPreviewOpen(true); } }} />
    </div>
  );
}
