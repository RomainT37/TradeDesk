'use client'
import { useEffect, useState } from 'react'

const ASSETS = [
  { label: 'EUR/USD', stooq: 'eur/usd' },
  { label: 'GBP/USD', stooq: 'gbp/usd' },
  { label: 'DXY', stooq: 'dx.f' },
  { label: 'S&P 500', stooq: '^spx' },
  { label: 'US 10Y', stooq: '^tnx' },
  { label: 'Oil WTI', stooq: 'cl.f' },
]

const SESSIONS = [
  { name: 'Sydney', open: 21, close: 6 },
  { name: 'Tokyo', open: 23, close: 8 },
  { name: 'Londres', open: 7, close: 16 },
  { name: 'New York', open: 13, close: 22 },
]

function isSessionOpen(s: { open: number; close: number }, utcHour: number) {
  if (s.open < s.close) return utcHour >= s.open && utcHour < s.close
  return utcHour >= s.open || utcHour < s.close
}

export default function DashboardPage() {
  const [now, setNow] = useState(new Date())
  const [market, setMarket] = useState<any[]>([])
  const [fearGreed, setFearGreed] = useState<number | null>(null)
  const [nickname, setNickname] = useState('RomainNQ')
  const [editingNick, setEditingNick] = useState(false)
  const [nickInput, setNickInput] = useState('RomainNQ')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetchMarket()
    fetchFearGreed()
  }, [])

  async function fetchMarket() {
    const results = []
    for (const asset of ASSETS) {
      try {
        const res = await fetch(`/api/market?symbol=${asset.stooq}`)
        const data = await res.json()
        results.push({ ...asset, price: data.price, change: data.change, positive: parseFloat(data.change) >= 0 })
      } catch {
        results.push({ ...asset, price: '—', change: '0', positive: true })
      }
    }
    setMarket(results)
  }

  async function fetchFearGreed() {
    try {
      const res = await fetch('/api/feargreed')
      const data = await res.json()
      setFearGreed(data.value)
    } catch {}
  }

  const utcHour = now.getUTCHours()
  const paris = now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const ny = now.toLocaleTimeString('fr-FR', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })
  const london = now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })
  const tokyo = now.toLocaleTimeString('fr-FR', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })
  const sydney = now.toLocaleTimeString('fr-FR', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fgColor = fearGreed !== null ? (fearGreed >= 60 ? '#22c55e' : fearGreed >= 40 ? '#f59e0b' : '#ef4444') : '#444'
  const fgLabel = fearGreed !== null ? (fearGreed >= 75 ? 'Extrême Greed' : fearGreed >= 55 ? 'Greed' : fearGreed >= 45 ? 'Neutre' : fearGreed >= 25 ? 'Fear' : 'Extrême Fear') : '—'

  const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8, padding: '14px 16px' }
  const clabel: React.CSSProperties = { fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #141414' }

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>Dashboard</div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 2, textTransform: 'capitalize' }}>{date}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {editingNick ? (
            <form onSubmit={e => { e.preventDefault(); setNickname(nickInput); setEditingNick(false) }} style={{ display: 'flex', gap: 6 }}>
              <input value={nickInput} onChange={e => setNickInput(e.target.value)} autoFocus
                style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11, outline: 'none', width: 120 }} />
              <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>OK</button>
            </form>
          ) : (
            <div onClick={() => { setNickInput(nickname); setEditingNick(true) }}
              style={{ fontSize: 11, color: '#444', background: '#111', border: '0.5px solid #1e1e1e', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
              NICKNAME: <span style={{ color: '#888', fontWeight: 600 }}>{nickname}</span> <span style={{ color: '#333' }}>✎</span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>{paris}</div>
            <div style={{ fontSize: 9, color: '#333' }}>Paris · CET</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {/* Sessions */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {SESSIONS.map(s => {
            const on = isSessionOpen(s, utcHour)
            return (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                border: `0.5px solid ${on ? '#2a2a2a' : '#1a1a1a'}`,
                color: on ? '#ccc' : '#333', background: '#0f0f0f',
              }}>
                {on && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />}
                {s.name}
              </div>
            )
          })}
        </div>

        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          {/* Fear & Greed */}
          <div style={card}>
            <div style={clabel}>Fear & Greed</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: fgColor }}>
                {fearGreed ?? '—'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: fgColor }}>{fgLabel}</div>
                <div style={{ fontSize: 10, color: '#444' }}>CNN Index</div>
              </div>
            </div>
            <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${fearGreed ?? 0}%`, background: fgColor, borderRadius: 1 }} />
            </div>
          </div>

          {/* Sessions */}
          <div style={card}>
            <div style={clabel}>Sessions de trading</div>
            {SESSIONS.map((s, i) => {
              const on = isSessionOpen(s, utcHour)
              return (
                <div key={s.name} style={{ ...row, borderBottom: i === SESSIONS.length - 1 ? 'none' : '0.5px solid #141414' }}>
                  <span style={{ fontSize: 11, color: '#444' }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: on ? '#22c55e' : '#333' }}>● {on ? 'Ouverte' : 'Fermée'}</span>
                </div>
              )
            })}
          </div>

          {/* Clocks */}
          <div style={card}>
            <div style={clabel}>Horloges mondiales</div>
            {[
              { label: 'New York', val: ny },
              { label: 'Londres', val: london },
              { label: 'Tokyo', val: tokyo },
              { label: 'Sydney', val: sydney },
            ].map((c, i) => (
              <div key={c.label} style={{ ...row, borderBottom: i === 3 ? 'none' : '0.5px solid #141414' }}>
                <span style={{ fontSize: 11, color: '#444' }}>{c.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>{c.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market */}
        <div style={card}>
          <div style={{ ...clabel, marginBottom: 12 }}>Marchés en temps réel</div>
          {market.length === 0 ? (
            <div style={{ color: '#333', fontSize: 12 }}>Chargement...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {market.map((item, i) => (
                <div key={item.label} style={{
                  padding: '8px 0',
                  borderRight: i < market.length - 1 ? '0.5px solid #141414' : 'none',
                  paddingRight: i < market.length - 1 ? 12 : 0,
                  marginRight: i < market.length - 1 ? 12 : 0,
                }}>
                  <div style={{ fontSize: 9, color: '#333', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>{item.price}</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: item.positive ? '#22c55e' : '#ef4444' }}>{item.positive ? '+' : ''}{item.change}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
