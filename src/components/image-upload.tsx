"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Replace, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET } from "@/lib/storage";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" };

// Perkecil gambar besar di browser sebelum diunggah (lebih cepat & hemat storage)
async function shrink(file: File, maxSide: number): Promise<Blob> {
  if (file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

type Props = {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string | null;
  shape?: "wide" | "avatar";
  maxSide?: number;
};

export default function ImageUpload({ name, label, folder, defaultValue, shape = "wide", maxSide = 1600 }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const sessionPath = useRef<string | null>(null); // file yang diunggah pada sesi form ini (belum tentu disimpan)
  const input = useRef<HTMLInputElement>(null);

  async function dropSessionUpload() {
    if (!sessionPath.current) return;
    await createClient().storage.from(BUCKET).remove([sessionPath.current]);
    sessionPath.current = null;
  }

  async function handle(file?: File | null) {
    if (!file) return;
    setError(null);
    if (!ACCEPT.includes(file.type)) return setError("Format harus JPG, PNG, WebP, atau GIF.");
    setBusy(true);
    try {
      const blob = await shrink(file, maxSide);
      if (blob.size > MAX_BYTES) throw new Error("Ukuran gambar maksimal 5 MB.");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi berakhir, silakan login ulang.");
      const path = `${user.id}/${folder}/${crypto.randomUUID()}.${EXT[blob.type] ?? "jpg"}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (upErr) {
        throw new Error(/not found/i.test(upErr.message)
          ? "Bucket penyimpanan belum dibuat. Jalankan migration_004_storage.sql di Supabase."
          : upErr.message);
      }
      await dropSessionUpload();
      sessionPath.current = path;
      setUrl(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    await dropSessionUpload(); // file lama yang sudah tersimpan dihapus server saat Anda menyimpan
    setUrl("");
  }

  const box = shape === "avatar" ? "size-24 rounded-full" : "aspect-[16/10] w-44 rounded-xl";

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          aria-label={`Pilih ${label}`}
          className={`relative grid shrink-0 place-items-center overflow-hidden border-2 border-dashed bg-white/70 text-slate-400 transition-colors hover:border-brand-500 hover:text-brand-600 ${box} ${drag ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 px-2 text-center text-[11px] leading-tight">
              <ImagePlus size={20} />Seret gambar ke sini
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-[1px]">
              <Loader2 size={20} className="animate-[spin_.8s_linear_infinite] text-brand-600" />
            </span>
          )}
        </button>

        <div className="flex flex-col items-start gap-2">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-ghost !py-1.5">
            {url ? <><Replace size={14} />Ganti gambar</> : <><ImagePlus size={14} />Pilih gambar</>}
          </button>
          {url && (
            <button type="button" disabled={busy} onClick={remove} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline">
              <Trash2 size={13} />Hapus gambar
            </button>
          )}
          <p className="text-[11px] text-slate-500">JPG, PNG, WebP, GIF · maks 5 MB</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <input ref={input} type="file" accept={ACCEPT.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}
