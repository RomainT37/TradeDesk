'use client'
import { useEffect, useState } from 'react'

type Event = { time: string; currency: string; impact: string; event: string; actual: string; forecast: string; previous: string }

const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8 }

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'high' | 'usd' | 'all'>('high')

  useEffect(() => {
    fetch('/api/calendar').then(r => r.json()).then(d => { setEvents(d.events || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = events.filter(e => {
    if (filter === 'high') return e.impact === 'high'
    if (filter === 'usd') return e.currency === 'USD'
    return true
  })

  const btn = (active: boolean): React.CSSProperties => ({ padding: '5px 12px', borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#fff' : '#141414', color: active ? '#000' : '#444' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Calendrier économique</div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>NFP, CPI, FOMC et events majeurs</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setFilter('high')} style={btn(filter === 'high')}>🔴 High</button>
          <button onClick={() => setFilter('usd')} style={btn(filter === 'usd')}>🇺🇸 USD</button>
          <button onClick={() => setFilter('all')} style={btn(filter === 'all')}>Tous</button>
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <div style={card}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#333', fontSize: 13 }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#333', fontSize: 13 }}>Aucun événement</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Heure', 'Devise', 'Impact', 'Événement', 'Actuel', 'Prévision', 'Précédent'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '0.5px solid #1a1a1a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid #141414' }}>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#444' }}>{e.time}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', color: '#666' }}>{e.currency}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                      {e.impact === 'high' ? '🔴' : e.impact === 'medium' ? '🟡' : '⚪'}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: e.impact === 'high' ? '#ccc' : '#555', fontWeight: e.impact === 'high' ? 500 : 400 }}>{e.event}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: e.actual ? '#22c55e' : '#333' }}>{e.actual || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#444' }}>{e.forecast || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#333' }}>{e.previous || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
