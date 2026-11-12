import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "portfolio";

// Ambil path file di bucket dari URL publiknya (null jika bukan file milik bucket ini)
export function storagePathFromUrl(url?: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

export async function readImages(supabase: SupabaseClient, table: string, id: string, cols: string[]) {
  if (cols.length === 0) return {} as Record<string, string | null>;
  const { data } = await supabase.from(table).select(cols.join(",")).eq("id", id).maybeSingle();
  return ((data as unknown as Record<string, string | null>) ?? {}) as Record<string, string | null>;
}

// Hapus file lama dari storage. Kegagalan di sini tidak boleh menggagalkan penyimpanan data.
export async function removeImages(supabase: SupabaseClient, urls: (string | null | undefined)[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(BUCKET).remove(paths);
  } catch {
    /* abaikan */
  }
}
