"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl";
  bare?: boolean; // tanpa padding & scroll, untuk konten penuh seperti iframe
};

export default function Modal({ open, onClose, title, children, size = "lg", bare = false }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const width = size === "sm" ? "max-w-sm" : size === "xl" ? "max-w-6xl h-[88vh]" : "max-w-2xl";

  // Portal ke <body>: lepas dari parent yang memiliki transform / backdrop-filter,
  // sehingga posisi fixed selalu relatif ke layar dan benar-benar di tengah.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop absolute inset-0 bg-slate-900/35 backdrop-blur-[3px]" onClick={onClose} />
      <div className={`modal-panel relative flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-2xl shadow-indigo-900/20 backdrop-blur-xl ${width}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-white/60 px-5 py-4">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Tutup"
            className="grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700">
            <X size={16} />
          </button>
        </div>
        <div className={`min-h-0 flex-1 ${bare ? "" : "overflow-y-auto p-5"}`}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
