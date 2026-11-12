const TZ = "Asia/Jakarta";

export function timeAgo(iso?: string | null) {
  if (!iso) return "belum ada";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export function formatStamp(iso: string) {
  const d = new Date(iso);
  const key = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).replace(".", ":");
  if (key(d) === key(new Date())) return `Hari ini, ${time}`;
  if (key(d) === key(new Date(Date.now() - 864e5))) return `Kemarin, ${time}`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export const yearOf = (date?: string | null) => (date ? String(new Date(date).getFullYear()) : "");
export const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
export const monthYear = (d?: string | null) => (d ? new Date(d).toLocaleDateString("id-ID", { month: "short", year: "numeric", timeZone: "UTC" }) : "");
