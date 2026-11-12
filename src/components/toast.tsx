"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = { message: string | null; onDone: () => void; action?: { label: string; onClick: () => void } };

// onDone harus stabil (useCallback) agar timer tidak terulang
export default function Toast({ message, onDone, action }: Props) {
  const hasAction = !!action;
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, hasAction ? 6000 : 2800);
    return () => clearTimeout(t);
  }, [message, onDone, hasAction]);

  if (!message) return null;
  return (
    <div role="status" className="toast fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-slate-900/95 backdrop-blur text-white px-4 py-3 text-sm shadow-xl">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span>{message}</span>
      {action && (
        <button onClick={action.onClick} className="ml-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold hover:bg-white/25 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
