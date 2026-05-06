'use client'
import { useState } from 'react'

const PAIRS = [
  { label: 'EUR/USD', pip: 0.0001, lotValue: 10 },
  { label: 'GBP/USD', pip: 0.0001, lotValue: 10 },
]

const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8, padding: '20px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#0d0d0d', border: '0.5px solid #222', borderRadius: 7, color: '#e0e0e0', fontSize: 13, outline: 'none' }

export default function CalculatorPage() {
  const [pair, setPair] = useState(0)
  const [balance, setBalance] = useState('')
  const [risk, setRisk] = useState('1')
  const [sl, setSl] = useState('')
  const [entry, setEntry] = useState('')

  const selected = PAIRS[pair]
  const b = parseFloat(balance), r = parseFloat(risk), s = parseFloat(sl), e = parseFloat(entry)
  let result: { lots: string; riskAmount: string; pips: string } | null = null
  if (b > 0 && r > 0 && s > 0 && e > 0) {
    const riskAmount = (b * r) / 100
    const pips = Math.abs(e - s) / selected.pip
    const lots = riskAmount / (pips * selected.lotValue)
    result = { lots: lots.toFixed(2), riskAmount: riskAmount.toFixed(2), pips: pips.toFixed(0) }
  }

  return (
    <div>
      <div style={{ padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Calculateur</div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Position sizing — Stratégie Algora</div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <div style={{ ...card, maxWidth: 520 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Paramètres</div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {PAIRS.map((p, i) => (
              <button key={p.label} onClick={() => setPair(i)} style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: pair === i ? '#fff' : '#141414', color: pair === i ? '#000' : '#444',
              }}>{p.label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Balance ($)', val: balance, set: setBalance, ph: '10000' },
              { label: 'Risque (%)', val: risk, set: setRisk, ph: '1', step: '0.1' },
              { label: "Prix d'entrée", val: entry, set: setEntry, ph: '1.08500', step: '0.00001' },
              { label: 'Stop Loss', val: sl, set: setSl, ph: '1.08300', step: '0.00001' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: '#444', marginBottom: 6 }}>{f.label}</div>
                <input type="number" placeholder={f.ph} step={f.step || '1'} value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>

          {result && (
            <div style={{ background: '#0d0d0d', border: '0.5px solid #1e1e1e', borderRadius: 8, padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Taille position</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{result.lots} <span style={{ fontSize: 12, color: '#444', fontWeight: 400 }}>lots</span></div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Risque $</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', letterSpacing: '-0.5px' }}>${result.riskAmount}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Distance SL</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#888', letterSpacing: '-0.5px' }}>{result.pips} <span style={{ fontSize: 12, color: '#444', fontWeight: 400 }}>pips</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
