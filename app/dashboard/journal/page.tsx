'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

type Trade = { id: string; symbol: string; direction: string; setup: string; entry_price: number; sl_price: number; lot_size: number; pnl: number; rr: number; open_time: string; close_time: string; notes: string }

const SETUPS = ['Breaker', 'Mitigation', 'Quasimodo']
const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#0d0d0d', border: '0.5px solid #222', borderRadius: 7, color: '#e0e0e0', fontSize: 13, outline: 'none' }

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showForm, setShowForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()
  const [form, setForm] = useState({ symbol: 'EURUSD', direction: 'buy', setup: 'Breaker', entry_price: '', sl_price: '', lot_size: '', pnl: '', rr: '', open_time: '', close_time: '', notes: '' })

  useEffect(() => { fetchTrades() }, [])

  async function fetchTrades() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('open_time', { ascending: false })
    if (data) setTrades(data)
  }

  async function saveTrade() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('trades').insert({ user_id: user.id, ...form, entry_price: parseFloat(form.entry_price) || null, sl_price: parseFloat(form.sl_price) || null, lot_size: parseFloat(form.lot_size) || null, pnl: parseFloat(form.pnl) || null, rr: parseFloat(form.rr) || null, is_manual: true })
    setShowForm(false); fetchTrades()
  }

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const dayPnl = (day: Date) => trades.filter(t => t.open_time && isSameDay(new Date(t.open_time), day)).reduce((acc, t) => acc + (t.pnl || 0), 0)

  const btn = (primary?: boolean): React.CSSProperties => ({ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: primary ? '#fff' : '#141414', color: primary ? '#000' : '#444' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Journal de trading</div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Stratégie Algora — EURUSD / GBPUSD</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} style={btn()}>{view === 'list' ? 'Calendrier' : 'Liste'}</button>
          <button onClick={() => setShowForm(!showForm)} style={btn(true)}>+ Ajouter</button>
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {showForm && (
          <div style={{ ...card, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Nouveau trade</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Paire</div>
                <select style={{ ...inputStyle }} value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })}>
                  <option>EURUSD</option><option>GBPUSD</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Direction</div>
                <select style={{ ...inputStyle }} value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
                  <option value="buy">Buy</option><option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Setup</div>
                <select style={{ ...inputStyle }} value={form.setup} onChange={e => setForm({ ...form, setup: e.target.value })}>
                  {SETUPS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>P&L ($)</div>
                <input type="number" placeholder="45.50" style={inputStyle} value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Entrée</div>
                <input type="number" step="0.00001" placeholder="1.08500" style={inputStyle} value={form.entry_price} onChange={e => setForm({ ...form, entry_price: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Stop Loss</div>
                <input type="number" step="0.00001" placeholder="1.08300" style={inputStyle} value={form.sl_price} onChange={e => setForm({ ...form, sl_price: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>R:R</div>
                <input type="number" step="0.1" placeholder="1.5" style={inputStyle} value={form.rr} onChange={e => setForm({ ...form, rr: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Lots</div>
                <input type="number" step="0.01" placeholder="0.10" style={inputStyle} value={form.lot_size} onChange={e => setForm({ ...form, lot_size: e.target.value })} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Ouverture</div>
                <input type="datetime-local" style={inputStyle} value={form.open_time} onChange={e => setForm({ ...form, open_time: e.target.value })} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Notes</div>
                <input placeholder="Observations..." style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveTrade} style={btn(true)}>Enregistrer</button>
              <button onClick={() => setShowForm(false)} style={btn()}>Annuler</button>
            </div>
          </div>
        )}

        {view === 'list' ? (
          <div style={card}>
            {trades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#333', fontSize: 13 }}>Aucun trade enregistré</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Date', 'Paire', 'Dir.', 'Setup', 'Entrée', 'SL', 'R:R', 'Lots', 'P&L', 'Notes'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '0.5px solid #1a1a1a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map(t => (
                    <tr key={t.id} style={{ borderBottom: '0.5px solid #141414' }}>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#333' }}>{t.open_time ? format(new Date(t.open_time), 'dd/MM HH:mm') : '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#ccc' }}>{t.symbol}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: t.direction === 'buy' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: t.direction === 'buy' ? '#22c55e' : '#ef4444' }}>
                          {t.direction?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', color: '#666' }}>{t.setup}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#555' }}>{t.entry_price ?? '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#555' }}>{t.sl_price ?? '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#888' }}>{t.rr ? `${t.rr}R` : '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#555' }}>{t.lot_size ?? '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: (t.pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={btn()}>←</button>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={btn()}>→</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: '#333', padding: '4px 0' }}>{d}</div>
              ))}
              {Array.from({ length: (days[0].getDay() || 7) - 1 }).map((_, i) => <div key={`e${i}`} />)}
              {days.map(day => {
                const pnl = dayPnl(day)
                const has = trades.some(t => t.open_time && isSameDay(new Date(t.open_time), day))
                return (
                  <div key={day.toISOString()} style={{
                    padding: '8px 4px', borderRadius: 6, textAlign: 'center',
                    background: has ? (pnl >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') : '#0d0d0d',
                    border: `0.5px solid ${has ? (pnl >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)') : 'transparent'}`,
                  }}>
                    <div style={{ fontSize: 10, color: '#444' }}>{format(day, 'd')}</div>
                    {has && <div style={{ fontSize: 9, fontWeight: 700, color: pnl >= 0 ? '#22c55e' : '#ef4444', marginTop: 2 }}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}$</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
