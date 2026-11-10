import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sakura — QR to Living Tree Experience',
  description: 'An interactive 3D Japanese garden experience where a QR code blossoms into a living Yoshino cherry tree.',
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

