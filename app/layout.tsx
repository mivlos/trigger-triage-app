import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trigger Triage — Draper',
  description: 'Review and approve pending GTM triggers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
        {children}
      </body>
    </html>
  );
}
