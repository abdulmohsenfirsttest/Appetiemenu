'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_BRANCHES } from '@/lib/seed-data'

interface Branch { id: number; name: string; location: string; is_active: boolean }

const BRANCH_CONFIG: Record<string, { color: string; bg: string; lightBg: string }> = {
  'Ar Rayyan': { color: '#16a34a', bg: '#dcfce7', lightBg: '#f0fdf4' },
  'Hittin':    { color: '#7c3aed', bg: '#ede9fe', lightBg: '#faf5ff' },
  'Malqa':     { color: '#2563eb', bg: '#dbeafe', lightBg: '#eff6ff' },
}

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [modal, setModal] = useState<{ open: boolean; branch: Partial<Branch> | null }>({ open: false, branch: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('branches').select('*').order('id')
    setBranches(data && data.length > 0 ? data : SEED_BRANCHES)
  }

  async function saveBranch() {
    if (!modal.branch) return
    setSaving(true)
    try {
      if (modal.branch.id) {
        await supabase.from('branches').update({
          name: modal.branch.name, location: modal.branch.location, is_active: modal.branch.is_active,
        }).eq('id', modal.branch.id)
      } else {
        await supabase.from('branches').insert({
          name: modal.branch.name, location: modal.branch.location, is_active: modal.branch.is_active ?? true,
        })
      }
      setModal({ open: false, branch: null }); loadData()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function toggleActive(b: Branch) {
    await supabase.from('branches').update({ is_active: !b.is_active }).eq('id', b.id)
    loadData()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 2 }}>Branches</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{branches.length} branches · {branches.filter(b => b.is_active).length} active</p>
        </div>
        <button onClick={() => setModal({ open: true, branch: { name: '', location: '', is_active: true } })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#25D366', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Branch
        </button>
      </div>

      <div className="admin-grid-3" style={{ gap: 16 }}>
        {branches.map(branch => {
          const cfg = BRANCH_CONFIG[branch.name] ?? { color: '#374151', bg: '#f3f4f6', lightBg: '#f9fafb' }
          return (
            <div key={branch.id} style={{ background: 'var(--admin-card)', borderRadius: 18, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {/* Colored top band */}
              <div style={{ height: 5, background: cfg.color }} />
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: cfg.color }}>
                    {branch.name.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => toggleActive(branch)} style={{
                      fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: branch.is_active ? '#dcfce7' : '#fef2f2',
                      color: branch.is_active ? '#16a34a' : '#ef4444',
                    }}>
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button className="ibtn ibtn-edit" onClick={() => setModal({ open: true, branch: { ...branch } })} title="Edit">
                      <PencilIcon />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6 }}>{branch.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: 13 }}>
                  <LocationIcon />
                  <span>{branch.location || 'No location set'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modal.open && modal.branch && (
        <div className="mobile-modal" style={{ zIndex: 100 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ borderTop: '4px solid #25D366', borderRadius: '20px 20px 0 0', padding: '18px 20px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{modal.branch.id ? 'Edit Branch' : 'Add Branch'}</h2>
              <button className="ibtn ibtn-edit" onClick={() => setModal({ open: false, branch: null })}><CloseIcon /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Branch Name</label>
                <input type="text" value={modal.branch.name || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, name: e.target.value } }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Location</label>
                <input type="text" value={modal.branch.location || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, location: e.target.value } }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--admin-subcard)', borderRadius: 10 }}>
                <input type="checkbox" id="active" checked={modal.branch.is_active ?? true}
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, is_active: e.target.checked } }))} />
                <label htmlFor="active" style={{ fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Branch is active</label>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal({ open: false, branch: null })} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveBranch} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: '#25D366', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
