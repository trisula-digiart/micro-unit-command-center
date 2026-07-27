// Location: src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro-Unit Area Command Center — Executive Banking Dashboard",
  description: "Monitoring Real-time Target Kredit, DPK, NPL, dan Laporan Operasional 17 Kantor Mikro Perbankan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#F8FAFC] text-[#0F172A] font-sans antialiased min-h-screen selection:bg-slate-900 selection:text-emerald-400">
        {children}
      </body>
    </html>
  );
}