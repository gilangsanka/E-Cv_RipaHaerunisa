import { redirect } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import Link from "next/link";
import AdminShell from "@/components/admin-shell";
import AddDataButton from "@/components/add-data-button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const name = p?.full_name || user.email || "Admin";
  const needsAttention = !(p?.full_name && p?.headline && p?.email && p?.phone && p?.summary);

  const header = (
    <>
      <form action="/admin/cari" className="relative min-w-0 flex-1 max-w-xl">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input name="q" aria-label="Cari data" placeholder="Cari data…"
          className="w-full rounded-lg bg-brand-50/70 py-2.5 pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-brand-100" />
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-4">
        <AddDataButton className="btn hidden sm:inline-flex" />
        <Link href="/admin/profil" aria-label="Pengingat profil" className="relative grid size-9 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-brand-50">
          <Bell size={18} />
          {needsAttention && <span className="absolute right-2 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />}
        </Link>
        <div className="flex items-center gap-2.5">
          {p?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{name.charAt(0).toUpperCase()}</span>
          )}
          <div className="hidden leading-tight md:block">
            <p className="max-w-[10rem] truncate text-sm font-semibold">{name}</p>
            <p className="text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>
        <form action={signOut}>
          <button aria-label="Keluar" title="Keluar" className="grid size-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"><LogOut size={17} /></button>
        </form>
      </div>
    </>
  );

  return (
    <AdminShell
      header={header}
      fab={<AddDataButton className="btn fixed bottom-5 right-4 z-30 shadow-lg sm:hidden print:hidden" />}
    >
      {children}
    </AdminShell>
  );
}