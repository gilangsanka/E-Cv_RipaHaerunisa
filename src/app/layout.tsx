import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ripa Haerunisa · Portfolio", template: "%s · Ripa Haerunisa" },
  description: "Portfolio Ripa Haerunisa, mahasiswa Sistem Informasi.",
  icons: {
    icon: "/ripa.png",
    apple: "/ripa.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}