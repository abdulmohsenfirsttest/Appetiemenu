'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { GHABASHI_MENU, GHABASHI_CATEGORIES } from '@/lib/ghabashi-menu'
import Image from 'next/image'

interface GItem {
  id: number
  name_en: string; name_ar: string
  category_en: string; category_ar: string
  size_en: string; size_ar: string
  price: number
  desc_en: string; desc_ar: string
  add_en: string; add_ar: string
  img_url: string | null
  is_available: boolean
  sort_order: number
}

const EMPTY: Omit<GItem, 'id'> = {
  name_en: '', name_ar: '', category_en: '', category_ar: '',
  size_en: '', size_ar: '', price: 0,
  desc_en: '', desc_ar: '', add_en: '', add_ar: '',
  img_url: null, is_available: true, sort_order: 0,
}

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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
      background: on ? '#25D366' : '#cbd5e1', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: 'var(--admin-card)',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </button>
  )
}

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: 'var(--admin-card)', borderRadius: 20, padding: '32px 28px', maxWidth: 360, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
          <TrashIcon size={22} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Delete Item?</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}><strong>"{name}"</strong> will be permanently removed.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function getImgSrc(url: string | null): string {
  if (!url) return ''
  return url
}

export default function GhabashiMenuPage() {
  const [items, setItems] = useState<GItem[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterAvail, setFilterAvail] = useState('all')
  const [modal, setModal] = useState<{ open: boolean; item: Partial<GItem> | null }>({ open: false, item: null })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [delConfirm, setDelConfirm] = useState<{ id: number; name: string } | null>(null)
  const [useDb, setUseDb] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data, error } = await supabase.from('ghabashi_menu_items').select('*').order('sort_order')
    if (!error && data && data.length > 0) {
      setItems(data)
      setUseDb(true)
    } else {
      // Table doesn't exist yet or is empty — use static seed data
      setItems(GHABASHI_MENU.map((i, idx) => ({
        id: i.id, name_en: i.nameEn, name_ar: i.nameAr,
        category_en: i.catEn, category_ar: i.catAr,
        size_en: i.sizeEn, size_ar: i.sizeAr,
        price: i.price, desc_en: i.descEn, desc_ar: i.descAr,
        add_en: i.addEn, add_ar: i.addAr,
        img_url: i.img, is_available: i.available, sort_order: idx + 1,
      })))
      setUseDb(false)
    }
  }

  function openAdd() {
    setModal({ open: true, item: { ...EMPTY, sort_order: items.length + 1 } })
    setImageFile(null); setImagePreview(null)
  }

  function openEdit(item: GItem) {
    setModal({ open: true, item: { ...item } })
    setImageFile(null)
    setImagePreview(item.img_url || null)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadImage(file: File, itemId: number): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `ghabashi/${itemId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('menu-images').upload(path, file, { upsert: true })
    if (error) { setStatus('Image upload failed: ' + error.message); return null }
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${base}/storage/v1/object/public/menu-images/${path}`
  }

  async function saveItem() {
    if (!modal.item) return
    if (!useDb) { setStatus('Run the SQL below to enable saving.'); return }
    setSaving(true); setStatus('Saving...')
    try {
      let imgUrl = modal.item.img_url || null
      const payload = {
        name_en: modal.item.name_en, name_ar: modal.item.name_ar,
        category_en: modal.item.category_en, category_ar: modal.item.category_ar,
        size_en: modal.item.size_en, size_ar: modal.item.size_ar,
        price: modal.item.price,
        desc_en: modal.item.desc_en, desc_ar: modal.item.desc_ar,
        add_en: modal.item.add_en, add_ar: modal.item.add_ar,
        is_available: modal.item.is_available,
        sort_order: modal.item.sort_order,
      }
      if (modal.item.id) {
        if (imageFile) imgUrl = await uploadImage(imageFile, modal.item.id)
        const { error } = await supabase.from('ghabashi_menu_items').update({ ...payload, img_url: imgUrl }).eq('id', modal.item.id)
        if (error) throw error
      } else {
        const newId = Math.max(...items.map(i => i.id), 0) + 1
        if (imageFile) imgUrl = await uploadImage(imageFile, newId)
        const { error } = await supabase.from('ghabashi_menu_items').insert({ id: newId, ...payload, img_url: imgUrl })
        if (error) throw error
      }
      setStatus('Saved ✓'); setModal({ open: false, item: null }); loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setSaving(false)
  }

  async function confirmDelete() {
    if (!delConfirm || !useDb) return
    await supabase.from('ghabashi_menu_items').delete().eq('id', delConfirm.id)
    setDelConfirm(null); loadData()
  }

  async function toggleAvailable(item: GItem) {
    if (!useDb) return
    await supabase.from('ghabashi_menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  const filtered = items.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !search || i.name_en.toLowerCase().includes(q) || i.name_ar.includes(search) || i.category_en.toLowerCase().includes(q)
    const matchCat = filterCat === 'all' || i.category_en === filterCat
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? i.is_available : !i.is_available)
    return matchSearch && matchCat && matchAvail
  })

  const catForModal = GHABASHI_CATEGORIES.find(c => c.nameEn === modal.item?.category_en)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 2 }}>Ghabashi Menu</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{items.length} items · {items.filter(i => i.is_available).length} available</p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#25D366', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Item
        </button>
      </div>

      {/* DB setup notice */}
      {!useDb && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: 10, fontSize: 13, color: '#92400e', border: '1px solid #fde68a' }}>
          <strong>Setup required:</strong> Run this SQL in your Supabase dashboard to enable saving:
          <pre style={{ marginTop: 8, fontSize: 11, background: '#fef3c7', padding: '8px 12px', borderRadius: 8, overflow: 'auto', color: '#78350f' }}>{`create table ghabashi_menu_items (
  id integer primary key,
  name_en text, name_ar text,
  category_en text, category_ar text,
  size_en text, size_ar text,
  price numeric default 0,
  desc_en text, desc_ar text,
  add_en text, add_ar text,
  img_url text,
  is_available boolean default true,
  sort_order integer default 0
);`}</pre>
        </div>
      )}

      {status && (
        <div style={{ padding: '10px 16px', background: status.startsWith('Error') ? '#fef2f2' : '#f0fdf4', borderRadius: 10, fontSize: 13, color: status.startsWith('Error') ? '#dc2626' : '#16a34a', border: `1px solid ${status.startsWith('Error') ? '#fecaca' : '#bbf7d0'}` }}>
          {status}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="admin-input" style={{ paddingLeft: 34 }} />
      </div>

      {/* Foodics-style category + status pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* All */}
        <button onClick={() => { setFilterCat('all'); setFilterAvail('all') }} style={{
          padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '1.5px solid var(--admin-border)', cursor: 'pointer',
          background: filterCat === 'all' && filterAvail === 'all' ? '#0f172a' : 'var(--admin-card)',
          color: filterCat === 'all' && filterAvail === 'all' ? 'white' : '#64748b',
          boxShadow: filterCat === 'all' && filterAvail === 'all' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        } as React.CSSProperties}>
          All <span style={{ fontSize: 11, opacity: 0.7 }}>({items.length})</span>
        </button>

        {/* Category buttons */}
        {GHABASHI_CATEGORIES.map(c => {
          const count = items.filter(i => i.category_en === c.nameEn).length
          const active = filterCat === c.nameEn && filterAvail === 'all'
          return (
            <button key={c.nameEn} onClick={() => { setFilterCat(c.nameEn); setFilterAvail('all') }} style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '1.5px solid var(--admin-border)', cursor: 'pointer',
              background: active ? '#c8733a' : 'var(--admin-card)',
              color: active ? 'white' : '#374151',
              boxShadow: active ? '0 2px 8px rgba(200,115,58,0.35)' : 'none',
            } as React.CSSProperties}>
              {c.nameEn} <span style={{ fontSize: 11, opacity: 0.75 }}>({count})</span>
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--admin-border)', margin: '0 4px' }} />

        {/* Hidden button */}
        <button onClick={() => { setFilterCat('all'); setFilterAvail(filterAvail === 'hidden' ? 'all' : 'hidden') }} style={{
          padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '1.5px solid var(--admin-border)', cursor: 'pointer',
          background: filterAvail === 'hidden' ? '#fef2f2' : 'var(--admin-card)',
          color: filterAvail === 'hidden' ? '#ef4444' : '#64748b',
          boxShadow: filterAvail === 'hidden' ? '0 2px 8px rgba(239,68,68,0.2)' : 'none',
        } as React.CSSProperties}>
          🚫 Hidden <span style={{ fontSize: 11, opacity: 0.75 }}>({items.filter(i => !i.is_available).length})</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-thead)', borderBottom: '1.5px solid var(--admin-border2)' }}>
                {['Image', 'Name', 'Category', 'Size', 'Price', 'Available', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: i >= 5 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--admin-border2)' : 'none', opacity: item.is_available ? 1 : 0.55 }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-subcard)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--admin-subcard)', position: 'relative', flexShrink: 0 }}>
                      {item.img_url ? (
                        <img src={getImgSrc(item.img_url)} alt={item.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>{item.name_en}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{item.name_ar}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--admin-subcard)', color: '#475569', fontWeight: 500 }}>{item.category_en || '–'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.size_en || '–'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#25D366' }}>{item.price} SAR</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Toggle on={item.is_available} onToggle={() => toggleAvailable(item)} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="ibtn ibtn-edit" onClick={() => openEdit(item)} title="Edit"><PencilIcon /></button>
                      <button className="ibtn ibtn-del" onClick={() => setDelConfirm({ id: item.id, name: item.name_en })} title="Delete"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal.open && modal.item && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 25px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            <div style={{ borderTop: '4px solid #25D366', borderRadius: '20px 20px 0 0', padding: '18px 20px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{modal.item.id ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setModal({ open: false, item: null })} className="ibtn ibtn-edit"><CloseIcon /></button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Image */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: 'var(--admin-subcard)', position: 'relative', border: '1.5px solid var(--admin-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🍽'}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 14px', border: '1.5px solid var(--admin-border)', borderRadius: 10, background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Change Image</button>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>JPG, PNG, WebP · Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>English Name</label>
                  <input type="text" value={modal.item.name_en || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, name_en: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Arabic Name</label>
                  <input type="text" dir="rtl" value={modal.item.name_ar || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, name_ar: e.target.value } }))} />
                </div>
              </div>

              {/* Category + Size + Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Category</label>
                  <select value={modal.item.category_en || ''} className="admin-select"
                    onChange={e => {
                      const cat = GHABASHI_CATEGORIES.find(c => c.nameEn === e.target.value)
                      setModal(m => ({ ...m, item: { ...m.item!, category_en: cat?.nameEn || '', category_ar: cat?.nameAr || '' } }))
                    }}>
                    <option value="">Select...</option>
                    {GHABASHI_CATEGORIES.map(c => <option key={c.nameEn} value={c.nameEn}>{c.nameEn}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Size (EN)</label>
                  <input type="text" value={modal.item.size_en || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, size_en: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Price (SAR)</label>
                  <input type="number" value={modal.item.price || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, price: Number(e.target.value) } }))} />
                </div>
              </div>

              {/* Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Description (EN)</label>
                  <textarea value={modal.item.desc_en || ''} rows={3} className="admin-input" style={{ resize: 'vertical' }}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, desc_en: e.target.value } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Description (AR)</label>
                  <textarea dir="rtl" value={modal.item.desc_ar || ''} rows={3} className="admin-input" style={{ resize: 'vertical' }}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, desc_ar: e.target.value } }))} />
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Add-ons (EN)</label>
                <input type="text" value={modal.item.add_en || ''} className="admin-input" placeholder="e.g. Extra Cheese, Extra Sauce"
                  onChange={e => setModal(m => ({ ...m, item: { ...m.item!, add_en: e.target.value } }))} />
              </div>

              {/* Available */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--admin-subcard)', borderRadius: 10 }}>
                <Toggle on={modal.item.is_available ?? true} onToggle={() => setModal(m => ({ ...m, item: { ...m.item!, is_available: !m.item!.is_available } }))} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>Available on menu</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Customers can see and order this item</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--admin-border2)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal({ open: false, item: null })} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveItem} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: '#25D366', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && <ConfirmDialog name={delConfirm.name} onConfirm={confirmDelete} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}
