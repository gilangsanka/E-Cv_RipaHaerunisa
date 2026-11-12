// template.tsx dibuat ulang tiap pindah halaman, sehingga animasi masuk berjalan di setiap navigasi
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
