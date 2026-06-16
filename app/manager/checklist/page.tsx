'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  CHECKLIST, ALL_ITEMS, TOTAL_ITEMS, today,
  checklistTableReady, checklistPhotosReady, uploadChecklistPhoto,
  submitChecklist, fetchChecklists, ChecklistSubmission,
} from '@/lib/checklist-db'

const BRANCHES = ['Ar Rayyan', 'Hittin', 'Malqa']
const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#16a34a', bg: '#dcfce7' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

export default function ManagerChecklist() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [branch, setBranch] = useState('')
  const [date, setDate] = useState(today())
  const [shift, setShift] = useState('Morning')
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [photos, setPhotos] = useState<Record<string, string[]>>({})
  const [photosReady, setPhotosReady] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [todaysSubs, setTodaysSubs] = useState<ChecklistSubmission[]>([])
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
    checklistTableReady().then(setReady)
    checklistPhotosReady().then(setPhotosReady)
  }, [])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !branch) return
    setUploadingKey(key)
    const urlStr = await uploadChecklistPhoto(file, branch, date, key)
    if (urlStr) setPhotos(prev => ({ ...prev, [key]: [...(prev[key] || []), urlStr] }))
    else flash('Photo upload failed')
    setUploadingKey(null)
  }

  function removePhoto(key: string, idx: number) {
    setPhotos(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== idx) }))
  }

  useEffect(() => {
    if (ready && branch) fetchChecklists({ branch, date }).then(setTodaysSubs)
  }, [ready, branch, date, saving])

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function toggle(key: string) { setResults(prev => ({ ...prev, [key]: !prev[key] })) }
  function reset() { setResults({}); setPhotos({}); setNotes('') }

  const checkedCount = ALL_ITEMS.filter(i => results[i.key]).length
  const pct = Math.round((checkedCount / TOTAL_ITEMS) * 100)

  async function submit() {
    if (!branch) return
    setSaving(true)
    const { error } = await submitChecklist({
      branch, check_date: date, shift,
      results, photos, checked_count: checkedCount, total_count: TOTAL_ITEMS,
      notes: notes.trim() || null, completed_by: email,
    }, photosReady)
    if (!error) { flash(`Checklist submitted for ${branch} (${checkedCount}/${TOTAL_ITEMS}) ✓`); reset() }
    else flash('Error: ' + error)
    setSaving(false)
  }

  const card: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'white', color: '#0f172a' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Daily Branch Check</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Walk the branch on arrival and tick each item.</p>
      </div>

      {ready === false && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
          ⚠️ <strong>Setup needed.</strong> Run <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>scripts/checklist-schema.sql</code> once in the Supabase SQL Editor, then refresh.
        </div>
      )}
      {ready && !photosReady && (
        <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
          Photo attachments need one more step — run <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>scripts/checklist-photos-column.sql</code> in the SQL Editor. Checklists still submit without photos until then.
        </div>
      )}

      {/* Branch + date + shift */}
      <div style={{ ...card, padding: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Branch</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {BRANCHES.map(b => {
            const c = BRANCH_COLORS[b]; const active = branch === b
            return (
              <button key={b} onClick={() => setBranch(b)} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: active ? c.text : '#e2e8f0', background: active ? c.bg : 'white', color: active ? c.text : '#475569' }}>{b}</button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Shift</label>
            <select value={shift} onChange={e => setShift(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="Morning">Morning</option>
              <option value="Night">Night</option>
            </select>
          </div>
        </div>
      </div>

      {!branch && <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 24 }}>Pick a branch to start the checklist.</p>}

      {branch && (
        <>
          {/* Already submitted today */}
          {todaysSubs.length > 0 && (
            <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 13, color: '#1e40af' }}>
              {todaysSubs.length} checklist{todaysSubs.length > 1 ? 's' : ''} already submitted for {branch} on this date
              {todaysSubs.map(s => <span key={s.id}> · {s.shift || ''} {s.checked_count}/{s.total_count}</span>)}.
            </div>
          )}

          {/* Progress */}
          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? '#16a34a' : '#f59e0b' }}>{checkedCount} / {TOTAL_ITEMS}</span>
            </div>
            <div style={{ height: 8, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#16a34a' : '#f59e0b', transition: 'width 0.2s' }} />
            </div>
          </div>

          {/* Sections */}
          {CHECKLIST.map(section => {
            const done = section.items.filter(i => results[i.key]).length
            return (
              <div key={section.title} style={{ ...card, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{section.title}</h2>
                  <span style={{ fontSize: 12, fontWeight: 700, color: done === section.items.length ? '#16a34a' : '#94a3b8' }}>{done}/{section.items.length}</span>
                </div>
                <div>
                  {section.items.map((item, i) => {
                    const checked = !!results[item.key]
                    const itemPhotos = photos[item.key] || []
                    return (
                      <div key={item.key} style={{ borderTop: i === 0 ? 'none' : '1px solid #f8fafc', background: checked ? '#f0fdf4' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                          <button onClick={() => toggle(item.key)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                            <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, border: '2px solid', borderColor: checked ? '#16a34a' : '#cbd5e1', background: checked ? '#16a34a' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                              {checked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                            </span>
                            <span style={{ fontSize: 14, color: checked ? '#166534' : '#334155', fontWeight: checked ? 600 : 400 }}>{item.label}</span>
                          </button>
                          <input ref={el => { fileInputs.current[item.key] = el }} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhoto(e, item.key)} />
                          <button onClick={() => fileInputs.current[item.key]?.click()} disabled={uploadingKey === item.key} title="Attach photo of an issue"
                            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1.5px solid', borderColor: itemPhotos.length ? '#f59e0b' : '#e2e8f0', background: itemPhotos.length ? '#fffbeb' : 'white', color: itemPhotos.length ? '#b45309' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            {uploadingKey === item.key ? '…' : itemPhotos.length || ''}
                          </button>
                        </div>
                        {itemPhotos.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 16px 12px 50px' }}>
                            {itemPhotos.map((src, pi) => (
                              <div key={pi} style={{ position: 'relative' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="issue" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                <button onClick={() => removePhoto(item.key, pi)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#ef4444', color: 'white', fontSize: 12, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Notes */}
          <div style={{ ...card, padding: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Notes / issues found</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Anything to report — e.g. AC dirty, grill not prepared…" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={saving}
            style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#f59e0b', color: 'white', fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}>
            {saving ? 'Submitting…' : `Submit Checklist (${checkedCount}/${TOTAL_ITEMS})`}
          </button>
        </>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.startsWith('Error') ? '#dc2626' : '#0f172a', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', maxWidth: '90vw', textAlign: 'center' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
