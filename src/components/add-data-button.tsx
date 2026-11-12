"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Briefcase, FolderKanban, GraduationCap, Plus, Users, Wrench } from "lucide-react";
import Modal from "@/components/modal";
import { RESOURCES } from "@/config/resources";

const ICONS: Record<string, React.ReactNode> = {
  pengalaman: <Briefcase size={18} />, proyek: <FolderKanban size={18} />, pendidikan: <GraduationCap size={18} />,
  keahlian: <Wrench size={18} />, sertifikasi: <Award size={18} />, organisasi: <Users size={18} />,
};

export default function AddDataButton({ label = "Tambah Data", className = "btn" }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}><Plus size={16} />{label}</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah data baru">
        <p className="text-sm text-slate-500 mb-4">Pilih bagian CV yang ingin Anda tambah.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {RESOURCES.map((r) => (
            <Link key={r.key} href={`/admin/${r.key}?add=1`} onClick={() => setOpen(false)}
              className="card card-hover flex items-center gap-3 p-3.5">
              <span className="grid place-items-center size-10 rounded-lg bg-brand-50 text-brand-600">{ICONS[r.key]}</span>
              <span className="text-sm font-semibold">{r.title}</span>
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}
