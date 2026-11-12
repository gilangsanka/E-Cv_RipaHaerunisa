import CountUp from "./count-up";

export default function StatCard({
  label, value, title, sub, icon, index = 0,
}: { label: string; value: number; title: string; sub?: React.ReactNode; icon?: React.ReactNode; index?: number }) {
  return (
    <div className="card card-hover p-5 anim-rise h-full flex flex-col" style={{ "--i": index } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{label}</p>
        {icon && <span className="grid place-items-center size-10 shrink-0 rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
      </div>
      <p className="text-4xl font-extrabold mt-5"><CountUp to={value} /></p>
      <p className="text-sm font-semibold mt-1">{title}</p>
      {sub && <div className="mt-1.5 text-xs text-slate-500 truncate">{sub}</div>}
    </div>
  );
}
