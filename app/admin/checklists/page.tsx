'use client'

import { useState, useEffect } from 'react'
import {
  CHECKLIST, labelForKey, today, checklistTableReady, fetchChecklists, ChecklistSubmission,
} from '@/lib/checklist-db'

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

export default function AdminChecklists() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [subs, setSubs] = useState<ChecklistSubmission[]>([])
  const [date, setDate] = useState(today())
  const [filterBranch, setFilterBranch] = useState('all')
  const [open, setOpen] = useState<ChecklistSubmission | null>(null)

  useEffect(() => {
    checklistTableReady().then(async (ok) => {
      setReady(ok)
      if (ok) setSubs(await fetchChecklists())
    })
  }, [])

  const filtered = subs.filter(s => s.check_date === date && (filterBranch === 'all' || s.branch === filterBranch))

  const card: React.CSSProperties = { background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  const branchPill = (b: string) => {
    const c = BRANCH_COLORS[b]
    return <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, color: c?.text ?? '#374151', background: c?.bg ?? '#f3f4f6' }}>{b}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)' }}>Branch Checklists</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Daily branch inspections submitted by managers</p>
      </div>

      {ready === false && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          ⚠️ <strong>Setup needed.</strong> Run <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>scripts/checklist-schema.sql</code> once in the Supabase SQL Editor, then refresh.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="admin-input" style={{ maxWidth: 180 }} />
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="admin-select" style={{ maxWidth: 180 }}>
          <option value="all">All branches</option>
          {['Ar Rayyan', 'Hittin', 'Malqa'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
                {['Branch', 'Shift', 'Completed', 'Notes', 'By', 'Time', ''].map((h, i) => (
                  <th key={h || i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => {
                const full = s.checked_count === s.total_count
                return (
                  <tr key={s.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--admin-border2)' : 'none' }}>
                    <td style={{ padding: '11px 14px' }}>{branchPill(s.branch)}</td>
                    <td style={{ padding: '11px 14px', color: '#64748b' }}>{s.shift || '—'}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: full ? '#16a34a' : '#d97706' }}>{s.checked_count}/{s.total_count}</td>
                    <td style={{ padding: '11px 14px', color: '#64748b', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 12 }}>{s.completed_by || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>{s.created_at?.slice(11, 16)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => setOpen(s)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No checklists submitted for this date.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {open && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--admin-card)', borderRadius: 18, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--admin-card)' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)' }}>{open.branch} · {open.check_date}</h2>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{open.shift || ''} · {open.checked_count}/{open.total_count} checked · {open.completed_by}</p>
              </div>
              <button onClick={() => setOpen(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              {CHECKLIST.map(section => (
                <div key={section.title} style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{section.title}</h3>
                  {section.items.map(item => {
                    const ok = !!open.results?.[item.key]
                    const pics = open.photos?.[item.key] || []
                    return (
                      <div key={item.key} style={{ padding: '6px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ flexShrink: 0, color: ok ? '#16a34a' : '#cbd5e1', fontSize: 16 }}>{ok ? '✓' : '○'}</span>
                          <span style={{ fontSize: 13, color: ok ? 'var(--admin-text)' : '#94a3b8' }}>{item.label}</span>
                          {pics.length > 0 && <span style={{ fontSize: 11, color: '#b45309' }}>📷 {pics.length}</span>}
                        </div>
                        {pics.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 0 8px 26px' }}>
                            {pics.map((src, pi) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <a key={pi} href={src} target="_blank" rel="noreferrer">
                                <img src={src} alt="issue" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--admin-border)' }} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              {open.notes && (
                <div style={{ marginTop: 8, padding: 12, background: 'var(--admin-subcard)', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Notes</p>
                  <p style={{ fontSize: 13, color: 'var(--admin-text)' }}>{open.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
