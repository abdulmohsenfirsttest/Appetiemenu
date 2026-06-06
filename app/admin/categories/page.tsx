'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_CATEGORIES } from '@/lib/seed-data'

interface Cat { id: number; name_en: string; name_ar: string; sort_order: number }

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="mobile-modal" style={{ zIndex: 200 }}>
      <div className="mobile-modal-sheet" style={{ background: 'white', maxWidth: 360, textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', padding: '32px 28px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
          <TrashIcon size={22} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Category?</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}><strong>"{name}"</strong> will be permanently removed.</p>
        <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 28 }}>Items in this category will become uncategorized.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// Palette for category color dots
const DOT_COLORS = ['#25D366','#6366f1','#f59e0b','#ef4444','#0891b2','#ec4899','#8b5cf6','#10b981','#f97316','#14b8a6','#a78bfa']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([])
  const [modal, setModal] = useState<{ open: boolean; cat: Partial<Cat> | null }>({ open: false, cat: null })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [delConfirm, setDelConfirm] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data && data.length > 0 ? data : SEED_CATEGORIES)
  }

  async function saveCat() {
    if (!modal.cat) return
    setSaving(true)
    try {
      if (modal.cat.id) {
        const { error } = await supabase.from('categories').update({
          name_en: modal.cat.name_en, name_ar: modal.cat.name_ar, sort_order: modal.cat.sort_order,
        }).eq('id', modal.cat.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert({
          name_en: modal.cat.name_en, name_ar: modal.cat.name_ar, sort_order: modal.cat.sort_order,
        })
        if (error) throw error
      }
      setModal({ open: false, cat: null }); loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setSaving(false)
  }

  async function confirmDelete() {
    if (!delConfirm) return
    await supabase.from('categories').delete().eq('id', delConfirm.id)
    setDelConfirm(null); loadData()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 2 }}>Categories</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{categories.length} categories total</p>
        </div>
        <button onClick={() => setModal({ open: true, cat: { name_en: '', name_ar: '', sort_order: categories.length + 1 } })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#25D366', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      {status && <div style={{ padding: '10px 16px', background: '#fef2f2', borderRadius: 10, fontSize: 13, color: '#dc2626', border: '1px solid #fecaca' }}>{status}</div>}

      <div style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
              {['#', 'English Name', 'Arabic Name', 'Order', 'Actions'].map((h, i) => (
                <th key={h} style={{ padding: '11px 20px', textAlign: i === 4 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr key={cat.id} style={{ borderBottom: idx < categories.length - 1 ? '1px solid #f8fafc' : 'none' }}
                onMouseOver={e => (e.currentTarget.style.background = '#fafbfc')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: DOT_COLORS[idx % DOT_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{cat.id}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--admin-text)' }}>{cat.name_en}</td>
                <td style={{ padding: '13px 20px', color: '#475569' }} dir="rtl">{cat.name_ar}</td>
                <td style={{ padding: '13px 20px' }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{cat.sort_order}</span>
                </td>
                <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="ibtn ibtn-edit" onClick={() => setModal({ open: true, cat: { ...cat } })} title="Edit"><PencilIcon /></button>
                    <button className="ibtn ibtn-del" onClick={() => setDelConfirm({ id: cat.id, name: cat.name_en })} title="Delete"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal.open && modal.cat && (
        <div className="mobile-modal" style={{ zIndex: 100 }}>
          <div className="mobile-modal-sheet" style={{ background: 'var(--admin-card)', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ borderTop: '4px solid #25D366', borderRadius: '20px 20px 0 0', padding: '18px 20px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{modal.cat.id ? 'Edit Category' : 'Add Category'}</h2>
              <button className="ibtn ibtn-edit" onClick={() => setModal({ open: false, cat: null })}><CloseIcon /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>English Name</label>
                <input type="text" value={modal.cat.name_en || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, name_en: e.target.value } }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Arabic Name</label>
                <input type="text" dir="rtl" value={modal.cat.name_ar || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, name_ar: e.target.value } }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Sort Order</label>
                <input type="number" value={modal.cat.sort_order || ''} className="admin-input"
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, sort_order: Number(e.target.value) } }))} />
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal({ open: false, cat: null })} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveCat} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: '#25D366', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && <ConfirmDialog name={delConfirm.name} onConfirm={confirmDelete} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}
