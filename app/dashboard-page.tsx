'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../supabase'

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

function isOpen(s: { open: number; close: number }, h: number) {
  if (s.open < s.close) return h >= s.open && h < s.close
  return h >= s.open || h < s.close
}

type Trade = { id: string; symbol: string; direction: string; setup: string; pnl: number; rr: number; open_time: string }
type Account = { id: string; name: string; broker: string; equity: number; balance: number; drawdown_limit: number; is_active: boolean }
type Group = { id: string; name: string; is_active: boolean }
type CalEvent = { time: string; currency: string; impact: string; event: string; forecast: string; previous: string; actual: string }

export default function DashboardPage() {
  const [now, setNow] = useState(new Date())
  const [market, setMarket] = useState<any[]>([])
  const [fearGreed, setFearGreed] = useState<number | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [events, setEvents] = useState<CalEvent[]>([])
  const [nickname, setNickname] = useState('Mon Pseudo')
  const [editingNick, setEditingNick] = useState(false)
  const [nickInput, setNickInput] = useState('Mon Pseudo')
  const supabase = createClient()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetchMarket()
    fetchFearGreed()
    fetchData()
    fetchCalendar()
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

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: t }, { data: a }, { data: g }] = await Promise.all([
      supabase.from('trades').select('id,symbol,direction,setup,pnl,rr,open_time').eq('user_id', user.id).order('open_time', { ascending: false }).limit(5),
      supabase.from('accounts').select('id,name,broker,equity,balance,drawdown_limit,is_active').eq('user_id', user.id).eq('is_active', true),
      supabase.from('copy_groups').select('id,name,is_active').eq('user_id', user.id),
    ])
    if (t) setTrades(t)
    if (a) setAccounts(a)
    if (g) setGroups(g)
  }

  async function fetchCalendar() {
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()
      setEvents((data.events || []).filter((e: CalEvent) => e.impact === 'high' || e.currency === 'USD').slice(0, 6))
    } catch {}
  }

  const utcHour = now.getUTCHours()
  const paris = now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const ny = now.toLocaleTimeString('fr-FR', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })
  const london = now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })
  const tokyo = now.toLocaleTimeString('fr-FR', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const fgColor = fearGreed !== null ? (fearGreed >= 60 ? '#22c55e' : fearGreed >= 40 ? '#f59e0b' : '#ef4444') : '#444'
  const fgLabel = fearGreed !== null ? (fearGreed >= 75 ? 'Extrême Greed' : fearGreed >= 55 ? 'Greed' : fearGreed >= 45 ? 'Neutre' : fearGreed >= 25 ? 'Fear' : 'Extrême Fear') : '—'

  const totalPnlToday = trades.filter(t => t.open_time && new Date(t.open_time).toDateString() === now.toDateString()).reduce((acc, t) => acc + (t.pnl || 0), 0)
  const allTrades = trades
  const wins = allTrades.filter(t => (t.pnl || 0) > 0)
  const winRate = allTrades.length > 0 ? Math.round(wins.length / allTrades.length * 100) : 0
  const avgRR = allTrades.filter(t => t.rr).length > 0 ? (allTrades.filter(t => t.rr).reduce((acc, t) => acc + t.rr, 0) / allTrades.filter(t => t.rr).length).toFixed(1) : '—'

  const s: Record<string, React.CSSProperties> = {
    card: { background: '#111', border: '0.5px solid #1e1e1e', borderRadius: 10 },
    cp: { padding: '14px 16px' },
    clabel: { fontSize: 9, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8, display: 'block' },
    bignum: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', display: 'block' },
    stitle: { fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 10, display: 'block' },
    divider: { height: '0.5px', background: '#161616', margin: '18px 0' },
    rl: { fontSize: 11, color: '#666' },
    rv: { fontSize: 11, fontWeight: 500, color: '#aaa' },
  }

  const row = (children: React.ReactNode, last?: boolean): React.CSSProperties => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '5px 0', borderBottom: last ? 'none' : '0.5px solid #161616',
  })

  return (
    <div>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px 16px', borderBottom: '0.5px solid #1a1a1a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Dashboard</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2, textTransform: 'capitalize' }}>{date}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {editingNick ? (
            <form onSubmit={e => { e.preventDefault(); setNickname(nickInput); setEditingNick(false) }} style={{ display: 'flex', gap: 6 }}>
              <input value={nickInput} onChange={e => setNickInput(e.target.value)} autoFocus
                style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11, outline: 'none', width: 130 }} />
              <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>OK</button>
            </form>
          ) : (
            <div onClick={() => { setNickInput(nickname); setEditingNick(true) }}
              style={{ fontSize: 11, color: '#555', background: '#141414', border: '0.5px solid #222', borderRadius: 6, padding: '5px 11px', cursor: 'pointer' }}>
              NICKNAME: <span style={{ color: '#999', fontWeight: 500 }}>{nickname}</span> <span style={{ color: '#333' }}>✎</span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>{paris}</div>
            <div style={{ fontSize: 9, color: '#444' }}>Paris · CET</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 32px 40px' }}>

        {/* Sessions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {SESSIONS.map(sess => {
            const on = isOpen(sess, utcHour)
            return (
              <div key={sess.name} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 500, border: `0.5px solid ${on ? '#333' : '#1e1e1e'}`, color: on ? '#ccc' : '#444' }}>
                {on && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />}
                {sess.name}
              </div>
            )
          })}
        </div>

        {/* KPIs */}
        <span style={s.stitle}>Vue d'ensemble</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 18 }}>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>P&L aujourd'hui</span>
            <span style={{ ...s.bignum, color: totalPnlToday >= 0 ? '#22c55e' : '#ef4444' }}>{totalPnlToday >= 0 ? '+' : ''}${totalPnlToday.toFixed(0)}</span>
            <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>{accounts.length} comptes actifs</div>
          </div>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>Win Rate all time</span>
            <span style={{ ...s.bignum, color: '#fff' }}>{winRate}%</span>
            <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>{allTrades.length} trades total</div>
          </div>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>R:R Moyen</span>
            <span style={{ ...s.bignum, color: '#fff' }}>{avgRR}R</span>
            <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>Algora</div>
          </div>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>Fear & Greed</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ ...s.bignum, color: fgColor }}>{fearGreed ?? '—'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: fgColor }}>{fgLabel}</span>
            </div>
            <div style={{ height: 2, background: '#161616', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${fearGreed ?? 0}%`, background: fgColor, borderRadius: 1 }} />
            </div>
          </div>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>Sessions actives</span>
            {SESSIONS.map((sess, i) => {
              const on = isOpen(sess, utcHour)
              return (
                <div key={sess.name} style={row(null, i === SESSIONS.length - 1)}>
                  <span style={s.rl}>{sess.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: on ? '#22c55e' : '#333' }}>● {on ? 'Open' : 'Closed'}</span>
                </div>
              )
            })}
          </div>
          <div style={{ ...s.card, ...s.cp }}>
            <span style={s.clabel}>Horloges</span>
            {[{ l: 'New York', v: ny }, { l: 'Londres', v: london }, { l: 'Tokyo', v: tokyo }].map((c, i) => (
              <div key={c.l} style={row(null, i === 2)}>
                <span style={s.rl}>{c.l}</span>
                <span style={s.rv}>{c.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.divider} />

        {/* Marchés */}
        <span style={s.stitle}>Marchés en temps réel</span>
        <div style={{ ...s.card, marginBottom: 18, padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>
            {market.length === 0 ? (
              <div style={{ gridColumn: 'span 6', padding: '16px 20px', fontSize: 12, color: '#333' }}>Chargement...</div>
            ) : market.map((item, i) => (
              <div key={item.label} style={{ padding: '12px 14px', borderRight: i < market.length - 1 ? '0.5px solid #161616' : 'none' }}>
                <div style={{ fontSize: 9, color: '#444', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd', marginBottom: 2 }}>{item.price}</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: item.positive ? '#22c55e' : '#ef4444' }}>{item.positive ? '+' : ''}{item.change}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.divider} />

        {/* Comptes + Copy Groups + Derniers trades */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
          {/* Comptes */}
          <div>
            <span style={s.stitle}>Comptes prop firms</span>
            <div style={{ ...s.card, ...s.cp }}>
              {accounts.length === 0 ? (
                <div style={{ fontSize: 12, color: '#333', textAlign: 'center', padding: '12px 0' }}>Aucun compte actif</div>
              ) : accounts.slice(0, 4).map((acc, i) => {
                const ddUsed = acc.drawdown_limit > 0 ? Math.max(0, ((acc.balance - acc.equity) / acc.drawdown_limit) * 100) : 0
                const ddRemaining = acc.drawdown_limit > 0 ? (acc.drawdown_limit - (acc.balance - acc.equity)).toFixed(0) : null
                const ddColor = ddUsed > 80 ? '#ef4444' : ddUsed > 50 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={acc.id} style={row(null, i === accounts.length - 1 || i === 3)}>
                    <div>
                      <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{acc.name}</div>
                      <div style={{ fontSize: 10, color: '#444' }}>{acc.broker}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: (acc.equity - acc.balance) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {(acc.equity - acc.balance) >= 0 ? '+' : ''}${(acc.equity - acc.balance).toFixed(0)}
                      </div>
                      {ddRemaining && <div style={{ fontSize: 9, color: ddColor, marginTop: 2 }}>DD: ${ddRemaining}</div>}
                      {acc.drawdown_limit > 0 && (
                        <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1, overflow: 'hidden', width: 60, marginTop: 3 }}>
                          <div style={{ height: '100%', width: `${Math.min(100, ddUsed)}%`, background: ddColor, borderRadius: 1 }} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Copy Groups */}
          <div>
            <span style={s.stitle}>Copy Trading Groups</span>
            <div style={{ ...s.card, ...s.cp }}>
              {groups.length === 0 ? (
                <div style={{ fontSize: 12, color: '#333', textAlign: 'center', padding: '12px 0' }}>Aucun groupe créé</div>
              ) : groups.slice(0, 4).map((grp, i) => (
                <div key={grp.id} style={row(null, i === groups.length - 1 || i === 3)}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: grp.is_active ? '#22c55e' : '#333', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: grp.is_active ? '#ccc' : '#555', fontWeight: 500 }}>{grp.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#333' }}>{grp.is_active ? 'Actif' : 'En pause'}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: grp.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', color: grp.is_active ? '#22c55e' : '#444', border: `0.5px solid ${grp.is_active ? 'rgba(34,197,94,0.2)' : '#1e1e1e'}` }}>
                    {grp.is_active ? 'Actif' : 'Pause'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers trades */}
          <div>
            <span style={s.stitle}>Derniers trades</span>
            <div style={{ ...s.card, padding: 0 }}>
              {trades.length === 0 ? (
                <div style={{ fontSize: 12, color: '#333', textAlign: 'center', padding: '16px' }}>Aucun trade enregistré</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Paire', 'Setup', 'R:R', 'P&L'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 9, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '0.5px solid #161616' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 4).map((t, i) => (
                      <tr key={t.id} style={{ borderBottom: i < 3 ? '0.5px solid #161616' : 'none' }}>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: t.direction === 'buy' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: t.direction === 'buy' ? '#22c55e' : '#ef4444' }}>{t.direction?.toUpperCase()}</span>
                            <span style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>{t.symbol}</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 12px' }}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: '#555' }}>{t.setup}</span></td>
                        <td style={{ padding: '9px 12px', fontSize: 11, color: '#555' }}>{t.rr ? `${t.rr}R` : '—'}</td>
                        <td style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: (t.pnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>{t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(0)}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Calendrier */}
        <span style={s.stitle}>Événements économiques</span>
        <div style={{ ...s.card, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Heure', 'Devise', 'Événement', 'Impact', 'Prévision', 'Précédent', 'Actuel'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 9, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '0.5px solid #161616' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: '#333' }}>Chargement des événements...</td></tr>
              ) : events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < events.length - 1 ? '0.5px solid #161616' : 'none' }}>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#666' }}>{e.time}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: '#888' }}>{e.currency}</span></td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: e.impact === 'high' ? '#ccc' : '#666', fontWeight: e.impact === 'high' ? 500 : 400 }}>{e.event}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>{e.impact === 'high' ? '🔴' : e.impact === 'medium' ? '🟡' : '⚪'}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#555' }}>{e.forecast || '—'}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#444' }}>{e.previous || '—'}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: e.actual ? '#22c55e' : '#333' }}>{e.actual || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
