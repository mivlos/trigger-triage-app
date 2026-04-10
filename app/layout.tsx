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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
