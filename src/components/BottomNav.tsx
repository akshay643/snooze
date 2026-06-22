'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/notes',     label: 'Notes',  icon: '📝', activeIcon: '📝' },
  { href: '/reminders', label: 'Storms', icon: '⛈️',  activeIcon: '⛈️'  },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      style={{
        flexShrink: 0,
        display: 'flex',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(9,9,18,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'var(--safe-bot)',
      }}
    >
      {TABS.map(tab => {
        const active = path.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '10px 0',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                color: active ? '#a78bfa' : '#44445a',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '2px',
                  borderRadius: '1px',
                  background: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
                  marginTop: 0,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
