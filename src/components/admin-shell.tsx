"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/sidebar";

/**
 * Shell responsif untuk area admin.
 * - >= lg : sidebar tampil statis di kiri
 * - <  lg : sidebar menjadi drawer, dibuka lewat tombol hamburger di header
 */
export default function AdminShell({
    header,
    fab,
    children,
}: {
    header: React.ReactNode;
    fab?: React.ReactNode;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Tutup drawer saat pindah halaman
    useEffect(() => setOpen(false), [pathname]);

    // Kunci scroll body + tutup dengan Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar desktop */}
            <Sidebar />

            {/* Drawer mobile */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden print:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={() => setOpen(false)}
                aria-hidden
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu navigasi"
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-200 lg:hidden print:hidden ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Tutup menu"
                    className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                    <X size={18} />
                </button>
                <Sidebar drawer />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-slate-100 bg-white/90 px-3 backdrop-blur sm:gap-4 sm:px-6 print:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-label="Buka menu"
                        aria-expanded={open}
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-brand-50 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    {header}
                </header>

                <main className="w-full max-w-7xl p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
            </div>

            {/* Tombol aksi mengambang (mobile saja) */}
            {fab}
        </div>
    );
}