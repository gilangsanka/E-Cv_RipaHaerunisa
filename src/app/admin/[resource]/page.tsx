import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResource } from "@/config/resources";
import ResourceManager from "@/components/resource-manager";

type Row = Record<string, string | number | null> & { id: string };

export default async function ResourcePage({
  params, searchParams,
}: { params: Promise<{ resource: string }>; searchParams: Promise<{ add?: string }> }) {
  const { resource } = await params;
  const { add } = await searchParams;
  const res = getResource(resource);
  if (!res) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from(res.table).select("*").order(res.orderBy, { ascending: false, nullsFirst: true });

  return <ResourceManager resource={res} rows={(data ?? []) as Row[]} autoOpen={add === "1"} />;
}
