'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/notes',     label: 'Notes',   icon: '📝' },
  { href: '/reminders', label: 'Storms',  icon: '⛈️'  },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="flex-shrink-0 flex border-t border-white/5 bg-[#0a0a14]"
      style={{ paddingBottom: 'var(--safe-bot)' }}
    >
      {TABS.map(tab => {
        const active = path.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 transition-colors ${
              active ? 'text-accent' : 'text-[#666688]'
            }`}
          >
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span className={`text-[11px] font-semibold tracking-wide ${active ? 'text-[#8b5cf6]' : 'text-[#666688]'}`}>
              {tab.label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-[#8b5cf6] rounded-full" style={{ position: 'relative' }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
