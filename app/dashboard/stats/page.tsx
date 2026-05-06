'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

type Trade = { id: string; pnl: number; rr: number; setup: string; open_time: string; direction: string }

const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8, padding: '14px 16px' }
const clabel: React.CSSProperties = { fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }

export default function StatsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('trades').select('id,pnl,rr,setup,open_time,direction').eq('user_id', user.id).order('open_time').then(({ data }) => { if (data) setTrades(data) })
    })
  }, [])

  const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0)
  const wins = trades.filter(t => (t.pnl || 0) > 0)
  const losses = trades.filter(t => (t.pnl || 0) < 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length * 100).toFixed(1) : '0'
  const avgRR = trades.filter(t => t.rr).length > 0 ? (trades.filter(t => t.rr).reduce((acc, t) => acc + t.rr, 0) / trades.filter(t => t.rr).length).toFixed(2) : '0'

  let cum = 0
  const equityCurve = trades.map(t => { cum += t.pnl || 0; return { date: t.open_time ? format(new Date(t.open_time), 'dd/MM') : '', equity: parseFloat(cum.toFixed(2)) } })

  const setupStats = ['Breaker', 'Mitigation', 'Quasimodo'].map(setup => {
    const t = trades.filter(x => x.setup === setup)
    const w = t.filter(x => (x.pnl || 0) > 0)
    return { setup, count: t.length, winRate: t.length > 0 ? (w.length / t.length * 100).toFixed(0) : '0', pnl: t.reduce((acc, x) => acc + (x.pnl || 0), 0).toFixed(2) }
  })

  return (
    <div>
      <div style={{ padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Statistiques</div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Stratégie Algora</div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
          {[
            { label: 'P&L Total', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'Win Rate', value: `${winRate}%`, color: parseFloat(winRate) >= 50 ? '#22c55e' : '#ef4444' },
            { label: 'R:R Moyen', value: `${avgRR}R`, color: '#888' },
            { label: 'Trades', value: `${trades.length}`, color: '#fff' },
          ].map(kpi => (
            <div key={kpi.label} style={card}>
              <div style={clabel}>{kpi.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.8px', color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={card}>
            <div style={clabel}>Gagnants vs Perdants</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(34,197,94,0.06)', border: '0.5px solid rgba(34,197,94,0.15)', borderRadius: 7 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{wins.length}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>Gagnants</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.15)', borderRadius: 7 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{losses.length}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>Perdants</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={clabel}>Par setup</div>
            {setupStats.map(s => (
              <div key={s.setup} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid #141414' }}>
                <span style={{ fontSize: 11, color: '#555' }}>{s.setup}</span>
                <span style={{ fontSize: 10, color: '#333' }}>{s.count} trades</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: parseInt(s.winRate) >= 50 ? '#22c55e' : '#ef4444' }}>{s.winRate}% WR</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: parseFloat(s.pnl) >= 0 ? '#22c55e' : '#ef4444' }}>{parseFloat(s.pnl) >= 0 ? '+' : ''}${s.pnl}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={clabel}>Courbe d'equity</div>
          {equityCurve.length < 2 ? (
            <div style={{ color: '#333', fontSize: 12, textAlign: 'center', padding: 24 }}>Pas assez de trades pour afficher la courbe</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#141414" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#333' }} />
                <YAxis tick={{ fontSize: 10, fill: '#333' }} />
                <Tooltip contentStyle={{ background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 7, fontSize: 12, color: '#ccc' }} />
                <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
