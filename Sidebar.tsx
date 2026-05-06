'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from './supabase'

const nav = [
  { section: 'Principal', items: [
    { href: '/dashboard', icon: '▦', label: 'Dashboard' },
    { href: '/dashboard/copier', icon: '⇄', label: 'Copy Trading' },
    { href: '/dashboard/positions', icon: '◎', label: 'Positions' },
  ]},
  { section: 'Analyse', items: [
    { href: '/dashboard/journal', icon: '≡', label: 'Journal' },
    { href: '/dashboard/stats', icon: '∿', label: 'Statistiques' },
    { href: '/dashboard/calculator', icon: '∑', label: 'Calculateur' },
  ]},
  { section: 'Outils', items: [
    { href: '/dashboard/accounts', icon: '◻', label: 'Comptes' },
    { href: '/dashboard/calendar', icon: '◷', label: 'Calendrier' },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside style={{
      width: 200, minHeight: '100vh',
      background: '#0f0f0f',
      borderRight: '0.5px solid #1a1a1a',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
      position: 'fixed', top: 0, left: 0, zIndex: 50,
    }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '0.5px solid #1a1a1a', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Trade<span style={{ fontWeight: 300, color: '#444' }}>Desk</span>
        </div>
        <div style={{ fontSize: 8, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
          Plateforme privée
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map(group => (
          <div key={group.section}>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#222', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '12px 16px 4px' }}>
              {group.section}
            </div>
            {group.items.map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', fontSize: 12, textDecoration: 'none',
                color: pathname === item.href ? '#fff' : '#444',
                background: pathname === item.href ? '#141414' : 'transparent',
                borderLeft: `2px solid ${pathname === item.href ? '#fff' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ borderTop: '0.5px solid #1a1a1a', paddingTop: 12 }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 16px', fontSize: 12, color: '#444',
          background: 'none', border: 'none', cursor: 'pointer', width: '100%',
        }}>
          <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>↩</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
