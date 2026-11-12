"use client";

import { useCallback, useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { saveProfile } from "@/app/actions";
import Toast from "@/components/toast";
import ImageUpload from "@/components/image-upload";
import type { Profile } from "@/types/db";

const FIELDS: { name: string; label: string; type?: string }[] = [
  { name: "full_name", label: "Nama lengkap" },
  { name: "headline", label: "Headline profesional" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Nomor telepon" },
  { name: "location", label: "Domisili" },
  { name: "linkedin", label: "LinkedIn", type: "url" },
  { name: "portfolio", label: "Website portofolio", type: "url" },
  { name: "github", label: "GitHub", type: "url" },
  { name: "behance", label: "Behance", type: "url" },
];

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const val = (name: string) => String((profile as Record<string, unknown> | null)?.[name] ?? "");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveProfile(fd);
        setError(null);
        setToast("Profil berhasil disimpan");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
      }
    });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="card p-5 space-y-4 anim-rise" style={{ "--i": 1 } as React.CSSProperties}>
        <ImageUpload key={profile?.avatar_url ?? "none"} name="avatar_url" label="Foto profil" folder="avatar" shape="avatar" maxSide={800} defaultValue={profile?.avatar_url} />
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <label key={f.name} className="block text-sm font-medium">
              {f.label}
              <input name={f.name} type={f.type ?? "text"} defaultValue={val(f.name)} className="input mt-1" />
            </label>
          ))}
        </div>
        <label className="block text-sm font-medium">Ringkasan profesional
          <textarea name="summary" rows={5} defaultValue={val("summary")} className="input mt-1" />
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="open_to_work" defaultChecked={profile?.open_to_work ?? true} className="size-4 accent-brand-600" />
          Sedang aktif mencari kerja
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="btn">
          {pending && <Loader2 size={14} className="animate-[spin_.8s_linear_infinite]" />}
          Simpan perubahan
        </button>
      </form>
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}
