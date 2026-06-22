import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { SWRegistrar } from '@/components/SWRegistrar';

export const metadata: Metadata = {
  title: 'Note⚡Alert',
  description: 'Notes that remember. Reminders that refuse to be ignored.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'NoteAlert',
    statusBarStyle: 'black-translucent',
  },
  icons: { apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#08080f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="relative h-full max-w-[480px] mx-auto flex flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          <BottomNav />
        </div>
        <SWRegistrar />
      </body>
    </html>
  );
}
