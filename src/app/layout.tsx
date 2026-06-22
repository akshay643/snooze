import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { SWRegistrar } from '@/components/SWRegistrar';

export const metadata: Metadata = {
  title: 'Note⚡Alert',
  description: 'Notes that remember. Reminders that refuse to be ignored.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'NoteAlert', statusBarStyle: 'black-translucent' },
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
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0 }}>
        {/* Full-height flex column, max 480px centered */}
        <div
          style={{
            height: '100%',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: '#08080f',
          }}
        >
          {/* Page content fills remaining space */}
          <main style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>

          {/* Sticky bottom nav */}
          <BottomNav />
        </div>

        <SWRegistrar />
      </body>
    </html>
  );
}
