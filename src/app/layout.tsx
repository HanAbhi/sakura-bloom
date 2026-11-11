import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sakura — Ocha Party',
  description: 'A tiny sakura seed grows into a cherry tree in full bloom, with a little message waiting for you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full bg-[#F8F0EA] overflow-hidden">
        {children}
      </body>
    </html>
  );
}

