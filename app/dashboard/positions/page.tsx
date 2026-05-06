'use client'
export default function PositionsPage() {
  return (
    <div>
      <div style={{ padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Positions</div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Positions ouvertes en temps réel</div>
      </div>
      <div style={{ padding: '16px 24px' }}>
        <div style={{ background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8, padding: '48px 24px', textAlign: 'center', color: '#333', fontSize: 13 }}>
          Connectez vos comptes MT5 pour afficher les positions en temps réel
        </div>
      </div>
    </div>
  )
}
