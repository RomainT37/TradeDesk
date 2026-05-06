'use client'
import { useState } from 'react'
import { createClient } from '../supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      background: '#080808', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', gap: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        top: -150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Trade<span style={{ fontWeight: 300, color: '#555' }}>Desk</span>
        </div>
        <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
          Plateforme privée
        </div>
      </div>

      <form onSubmit={handleLogin} style={{
        background: '#111', border: '0.5px solid #222', borderRadius: 16,
        padding: '32px 30px 28px', width: '100%', maxWidth: 380, zIndex: 1,
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', textAlign: 'center', marginBottom: 6, letterSpacing: '-0.4px' }}>
          Connexion à TradeDesk
        </div>
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center', marginBottom: 26 }}>
          Accès restreint · Romain & Nathan
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 7 }}>Email</label>
          <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #222', borderRadius: 10, fontSize: 13, color: '#e0e0e0', background: '#0d0d0d', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 7 }}>Mot de passe</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #222', borderRadius: 10, fontSize: 13, color: '#e0e0e0', background: '#0d0d0d', outline: 'none' }} />
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 12px', color: '#ef4444', fontSize: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 12, background: loading ? '#333' : '#fff',
          color: loading ? '#888' : '#000', border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
        }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div style={{ fontSize: 11, color: '#333', textAlign: 'center', marginTop: 18 }}>
          Application privée — accès sur invitation uniquement
        </div>
      </form>

      <div style={{ fontSize: 10, color: '#2a2a2a', zIndex: 1 }}>© 2026 TradeDesk · Tous droits réservés</div>
    </div>
  )
}
