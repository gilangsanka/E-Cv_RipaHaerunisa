"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RESOURCES } from "@/config/resources";
import { readImages, removeImages } from "@/lib/storage";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect("/login?error=" + encodeURIComponent("Email atau kata sandi salah."));
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Nama tabel & kolom divalidasi terhadap config, bukan dari input mentah
function parseRow(resourceKey: string, formData: FormData) {
  const res = RESOURCES.find((r) => r.key === resourceKey);
  if (!res) throw new Error("Resource tidak dikenal");
  const row: Record<string, string | number | null> = {};
  for (const f of res.fields) {
    const raw = String(formData.get(f.name) ?? "").trim();
    row[f.name] = raw === "" ? null : f.type === "number" ? Number(raw) : raw;
  }
  return { res, row };
}

const imageCols = (fields: { name: string; type: string }[]) => fields.filter((f) => f.type === "image").map((f) => f.name);

export async function createItem(formData: FormData) {
  const { res, row } = parseRow(String(formData.get("resource")), formData);
  const supabase = await createClient();
  const { error } = await supabase.from(res.table).insert(row);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/${res.key}`);
  revalidatePath("/admin");
}

export async function updateItem(formData: FormData) {
  const { res, row } = parseRow(String(formData.get("resource")), formData);
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const cols = imageCols(res.fields);
  const before = await readImages(supabase, res.table, id, cols);

  const { error } = await supabase.from(res.table).update(row).eq("id", id);
  if (error) throw new Error(error.message);

  // gambar yang diganti / dihapus → file lamanya dibuang dari storage
  await removeImages(supabase, cols.filter((c) => before[c] && before[c] !== row[c]).map((c) => before[c]));
  revalidatePath(`/admin/${res.key}`);
  revalidatePath("/admin");
}

export async function deleteItem(formData: FormData) {
  const res = RESOURCES.find((r) => r.key === String(formData.get("resource")));
  if (!res) throw new Error("Resource tidak dikenal");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const cols = imageCols(res.fields);
  const before = await readImages(supabase, res.table, id, cols);

  const { error } = await supabase.from(res.table).delete().eq("id", id);
  if (error) throw new Error(error.message);

  await removeImages(supabase, cols.map((c) => before[c]));
  revalidatePath(`/admin/${res.key}`);
  revalidatePath("/admin");
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const keys = ["full_name", "headline", "email", "phone", "location", "linkedin", "portfolio", "github", "behance", "summary", "avatar_url"];
  const row: Record<string, string | boolean | null> = {};
  for (const k of keys) {
    const v = String(formData.get(k) ?? "").trim();
    row[k] = v === "" ? null : v;
  }
  row.open_to_work = formData.get("open_to_work") === "on";

  const { data: old } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...row, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  if (old?.avatar_url && old.avatar_url !== row.avatar_url) await removeImages(supabase, [old.avatar_url]);
  revalidatePath("/admin", "layout");
}
