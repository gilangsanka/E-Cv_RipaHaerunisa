"use client";

import { useCallback, useEffect, useState } from "react";
import { Printer, Share2 } from "lucide-react";
import Toast from "@/components/toast";

export function ShareLinkButton({ className }: { className?: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const done = useCallback(() => setMsg(null), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/admin/pratinjau`);
      setMsg("Tautan pratinjau disalin");
    } catch {
      setMsg("Gagal menyalin tautan");
    }
  }
  return (
    <>
      <button onClick={copy} className={className}><Share2 size={15} />Bagikan Link</button>
      <Toast message={msg} onDone={done} />
    </>
  );
}

export function PrintControls({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => { if (autoPrint) window.print(); }, [autoPrint]);
  return <button onClick={() => window.print()} className="btn print:hidden"><Printer size={15} />Cetak / Simpan PDF</button>;
}
