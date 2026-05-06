'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../supabase'

type Group = { id: string; name: string; description: string; is_active: boolean }
type Account = { id: string; name: string; broker: string }
type Member = { id: string; account_id: string; role: string; lot_multiplier: number; accounts: Account }

const card: React.CSSProperties = { background: '#111', border: '0.5px solid #1a1a1a', borderRadius: 8, marginBottom: 10, overflow: 'hidden' }
const clabel: React.CSSProperties = { fontSize: 9, fontWeight: 600, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }

export default function CopierPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [members, setMembers] = useState<Record<string, Member[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const supabase = createClient()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: g }, { data: a }] = await Promise.all([
      supabase.from('copy_groups').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('accounts').select('id,name,broker').eq('user_id', user.id)
    ])
    if (g) setGroups(g)
    if (a) setAccounts(a)
    if (g) {
      const mm: Record<string, Member[]> = {}
      for (const grp of g) {
        const { data: m } = await supabase.from('copy_group_accounts')
          .select('id,account_id,role,lot_multiplier,accounts(id,name,broker)').eq('group_id', grp.id)
        mm[grp.id] = (m as any) || []
      }
      setMembers(mm)
    }
  }

  async function createGroup() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('copy_groups').insert({ user_id: user.id, ...form })
    setShowForm(false); setForm({ name: '', description: '' }); fetchAll()
  }

  async function toggleGroup(id: string, current: boolean) {
    await supabase.from('copy_groups').update({ is_active: !current }).eq('id', id); fetchAll()
  }

  async function addMember(groupId: string, accountId: string, role: string) {
    await supabase.from('copy_group_accounts').insert({ group_id: groupId, account_id: accountId, role, lot_multiplier: 1 }); fetchAll()
  }

  async function removeMember(id: string) {
    await supabase.from('copy_group_accounts').delete().eq('id', id); fetchAll()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#0d0d0d', border: '0.5px solid #222', borderRadius: 8, color: '#e0e0e0', fontSize: 13, outline: 'none' }
  const btnStyle = (primary?: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: primary ? '#fff' : '#141414', color: primary ? '#000' : '#444',
  })
  const badge = (on: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
    background: on ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
    color: on ? '#22c55e' : '#444',
    border: `0.5px solid ${on ? 'rgba(34,197,94,0.2)' : '#1e1e1e'}`,
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px 14px', borderBottom: '0.5px solid #141414' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>Copy Trading</div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Gestion des groupes de copie</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(true)}>+ Nouveau groupe</button>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {showForm && (
          <div style={{ ...card, padding: '16px', marginBottom: 16 }}>
            <div style={{ ...clabel }}>Nouveau groupe</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              <input placeholder="Nom du groupe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Description (ex: FundedNext + FTMO)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={createGroup} style={btnStyle(true)}>Créer</button>
              <button onClick={() => setShowForm(false)} style={btnStyle()}>Annuler</button>
            </div>
          </div>
        )}

        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#333', fontSize: 13 }}>Aucun groupe créé</div>
        ) : groups.map(grp => {
          const grpMembers = members[grp.id] || []
          const master = grpMembers.find(m => m.role === 'master')
          const followers = grpMembers.filter(m => m.role === 'follower')
          const isExp = expanded === grp.id

          return (
            <div key={grp.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: isExp ? '0.5px solid #141414' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {grp.is_active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />}
                    {grp.name}
                    <span style={badge(grp.is_active)}>{grp.is_active ? 'Actif' : 'En pause'}</span>
                  </div>
                  {grp.description && <div style={{ fontSize: 10, color: '#333', marginTop: 2 }}>{grp.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={badge(false)}>{grpMembers.length} comptes</span>
                  <button onClick={() => toggleGroup(grp.id, grp.is_active)} style={{ ...btnStyle(), fontSize: 11 }}>{grp.is_active ? 'Pause' : 'Activer'}</button>
                  <button onClick={() => setExpanded(isExp ? null : grp.id)} style={{ ...btnStyle(), fontSize: 11 }}>Configurer {isExp ? '▲' : '▾'}</button>
                </div>
              </div>

              {!isExp && grpMembers.length > 0 && (
                <div style={{ padding: '10px 16px', display: 'flex', gap: 16 }}>
                  {grpMembers.map(m => (
                    <div key={m.id} style={{ fontSize: 11, color: '#444' }}>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: m.role === 'master' ? 'rgba(255,255,255,0.06)' : 'rgba(34,197,94,0.08)', color: m.role === 'master' ? '#666' : '#22c55e', marginRight: 6 }}>{m.role.toUpperCase()}</span>
                      {m.accounts?.name}
                    </div>
                  ))}
                </div>
              )}

              {isExp && (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={clabel}>Compte Master</div>
                    {master ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid #1e1e1e', borderRadius: 7 }}>
                        <div style={{ fontSize: 12, color: '#ccc' }}>{master.accounts?.name} <span style={{ color: '#333' }}>· {master.accounts?.broker}</span></div>
                        <button onClick={() => removeMember(master.id)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Retirer</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {accounts.filter(a => !grpMembers.find(m => m.account_id === a.id)).map(a => (
                          <button key={a.id} onClick={() => addMember(grp.id, a.id, 'master')} style={{ ...btnStyle(), fontSize: 11 }}>{a.name}</button>
                        ))}
                        {accounts.filter(a => !grpMembers.find(m => m.account_id === a.id)).length === 0 && <span style={{ fontSize: 11, color: '#333' }}>Aucun compte disponible</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={clabel}>Followers ({followers.length})</div>
                    {followers.map(f => (
                      <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0d0d0d', border: '0.5px solid #141414', borderRadius: 7, marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: '#888' }}>{f.accounts?.name} <span style={{ color: '#333' }}>· {f.accounts?.broker}</span></div>
                        <button onClick={() => removeMember(f.id)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Retirer</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {accounts.filter(a => !grpMembers.find(m => m.account_id === a.id)).map(a => (
                        <button key={a.id} onClick={() => addMember(grp.id, a.id, 'follower')} style={{ ...btnStyle(), fontSize: 11 }}>+ {a.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '0.5px solid #141414' }}>
                <div style={{ padding: 10, textAlign: 'center', fontSize: 11, color: '#333', cursor: 'pointer', borderRight: '0.5px solid #141414' }}>Voir détails</div>
                <div style={{ padding: 10, textAlign: 'center', fontSize: 11, color: '#333', cursor: 'pointer' }}>P&L Card ↗</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
