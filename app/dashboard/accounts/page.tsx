'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../supabase'

type Account = { id: string; name: string; broker: string; account_number: string; type: string; platform: string; balance: number; equity: number; drawdown_limit: number; profit_target: number; is_active: boolean }

const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#0d0d0d', border: '0.5px solid #222', borderRadius: 7, color: '#e0e0e0', fontSize: 13, outline: 'none' }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', broker: '', account_number: '', type: 'cfd', platform: 'mt5', balance: '', equity: '', drawdown_limit: '', profit_target: '' })

  useEffect(() => { fetchAccounts() }, [])

  async function fetchAccounts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at')
    if (data) setAccounts(data)
  }

  async function saveAccount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('accounts').insert({ user_id: user.id, ...form, balance: parseFloat(form.balance) || 0, equity: parseFloat(form.equity) || 0, drawdown_limit: parseFloat(form.drawdown_limit) || null, profit_target: parseFloat(form.profit_target) || null })
    setShowForm(false); setForm({ name: '', broker: '', account_number: '', type: 'cfd', platform: 'mt5', balance: '', equity: '', drawdown_limit: '', profit_target: '' }); fetchAccounts()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('accounts').update({ is_active: !current }).eq('id', id); fetchAccounts()
  }

  const btn = (primary?: boolean): React.CSSProperties => ({ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: primary ? '#fff' : '#141414', color: primary ? '#000' : '#444' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Comptes</div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Suivi prop firms CFD</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn(true)}>+ Ajouter compte</button>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {showForm && (
          <div style={{ ...card, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Nouveau compte</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Nom', key: 'name', ph: 'FundedNext 10k' },
                { label: 'Prop firm', key: 'broker', ph: 'FundedNext' },
                { label: 'N° compte', key: 'account_number', ph: '123456' },
                { label: 'Balance ($)', key: 'balance', ph: '10000' },
                { label: 'Equity ($)', key: 'equity', ph: '10000' },
                { label: 'Drawdown max ($)', key: 'drawdown_limit', ph: '500' },
                { label: 'Objectif profit ($)', key: 'profit_target', ph: '1000' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>{f.label}</div>
                  <input placeholder={f.ph} style={inputStyle} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Type</div>
                <select style={{ ...inputStyle }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="cfd">CFD</option><option value="futures">Futures</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 5 }}>Plateforme</div>
                <select style={{ ...inputStyle }} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                  <option value="mt5">MT5</option><option value="tradovate">Tradovate</option><option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveAccount} style={btn(true)}>Enregistrer</button>
              <button onClick={() => setShowForm(false)} style={btn()}>Annuler</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, padding: 48, textAlign: 'center', color: '#333', fontSize: 13 }}>Aucun compte enregistré</div>
          ) : accounts.map(acc => {
            const ddUsed = acc.drawdown_limit > 0 ? Math.max(0, ((acc.balance - acc.equity) / acc.drawdown_limit) * 100) : 0
            const profitPct = acc.profit_target > 0 ? Math.min(100, ((acc.equity - acc.balance) / acc.profit_target) * 100) : 0
            const ddRemaining = acc.drawdown_limit > 0 ? (acc.drawdown_limit - (acc.balance - acc.equity)).toFixed(0) : null

            return (
              <div key={acc.id} style={{ ...card, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 20, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: acc.is_active ? '#22c55e' : '#333', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{acc.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#333' }}>{acc.broker} · #{acc.account_number}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', color: '#555' }}>{acc.type.toUpperCase()}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', color: '#555' }}>{acc.platform.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Equity</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>${acc.equity?.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#333' }}>Balance: ${acc.balance?.toLocaleString()}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {acc.drawdown_limit > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: '#333' }}>DRAWDOWN</span>
                        <span style={{ fontSize: 9, color: ddUsed > 80 ? '#ef4444' : '#333' }}>${ddRemaining} restant</span>
                      </div>
                      <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, ddUsed)}%`, background: ddUsed > 80 ? '#ef4444' : ddUsed > 50 ? '#f59e0b' : '#22c55e', borderRadius: 1 }} />
                      </div>
                    </div>
                  )}
                  {acc.profit_target > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: '#333' }}>OBJECTIF</span>
                        <span style={{ fontSize: 9, color: '#333' }}>{profitPct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${profitPct}%`, background: '#888', borderRadius: 1 }} />
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => toggleActive(acc.id, acc.is_active)} style={{ ...btn(), fontSize: 11 }}>
                  {acc.is_active ? 'Pause' : 'Activer'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
