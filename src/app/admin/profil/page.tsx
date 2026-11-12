import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile-form";

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: p } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();

  return (
    <div className="space-y-4">
      <div className="anim-rise">
        <h1 className="text-2xl font-extrabold">Profil & Informasi Kontak</h1>
        <p className="text-sm text-slate-500">Informasi ini tampil di bagian atas CV Anda.</p>
      </div>
      <ProfileForm profile={p} />
    </div>
  );
}
