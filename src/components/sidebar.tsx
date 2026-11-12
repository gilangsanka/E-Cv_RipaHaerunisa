"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck, Briefcase, CircleUserRound, Eye, FolderKanban, Globe, GraduationCap, LayoutDashboard, Lightbulb, Users,
  type LucideIcon,
} from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon; newTab?: boolean };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Manajemen CV",
    items: [
      { href: "/admin", label: "Dashboard Ringkasan", icon: LayoutDashboard },
      { href: "/admin/profil", label: "Profil & Kontak", icon: CircleUserRound },
      { href: "/admin/pendidikan", label: "Riwayat Pendidikan", icon: GraduationCap },
      { href: "/admin/pengalaman", label: "Pengalaman Kerja", icon: Briefcase },
      { href: "/admin/proyek", label: "Proyek & Portofolio", icon: FolderKanban },
      { href: "/admin/organisasi", label: "Organisasi & Relawan", icon: Users },
      { href: "/admin/keahlian", label: "Keahlian & Skills", icon: Lightbulb },
      { href: "/admin/sertifikasi", label: "Sertifikasi & Pelatihan", icon: BadgeCheck },
    ],
  },
  {
    label: "Keluaran",
    items: [
      { href: "/admin/pratinjau", label: "Pratinjau CV", icon: Eye },
      { href: "/preview", label: "Preview Website", icon: Globe, newTab: true },
    ],
  },
];

/**
 * drawer=false (default): sidebar statis desktop, hanya tampil di >= lg.
 * drawer=true: dipakai di dalam drawer mobile (selalu tampil, mengisi wadahnya).
 */
export default function Sidebar({ drawer = false }: { drawer?: boolean }) {
  const pathname = usePathname();
  return (
    <aside
      className={
        drawer
          ? "flex h-full w-full flex-col bg-white p-4"
          : "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white p-4 print:hidden lg:flex"
      }
    >
      <div className={`mb-7 flex items-center gap-3 px-1 ${drawer ? "pr-10" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ripa.png"
          alt="Ripa Haerunisa"
          className="size-10 shrink-0 rounded-full bg-[#eef1fd] object-cover object-top ring-2 ring-white shadow-md"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-extrabold text-[15px]">Dashboard Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{g.label}</p>
            <div className="space-y-1">
              {g.items.map(({ href, label, icon: Icon, newTab }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} target={newTab ? "_blank" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active ? "bg-brand-600 text-white shadow-md shadow-brand-600/30" : "text-slate-600 hover:bg-brand-50 hover:translate-x-1"
                      }`}>
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between rounded-lg bg-brand-50/70 px-3 py-2.5 text-xs">
        <span className="flex items-center gap-2 font-medium text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />Sistem Sinkron
        </span>
        <span className="font-mono text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
}