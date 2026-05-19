'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, getImageUrl } from '@/lib/supabase'
import { SEED_MENU_ITEMS, SEED_CATEGORIES } from '@/lib/seed-data'
import Image from 'next/image'

interface Item {
  id: number; name_en: string; name_ar: string; price: number
  calories: number | null; category_id: number | null; category?: string
  image_url: string | null; is_available: boolean; sort_order: number
}
interface Cat { id: number; name_en: string; name_ar: string }

const EMPTY: Omit<Item, 'id'> = {
  name_en: '', name_ar: '', price: 0, calories: null, category_id: null,
  image_url: null, is_available: true, sort_order: 0,
}

/* ── Icons ────────────────────────── */
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

/* ── Toggle switch ────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} title={on ? 'Hide item' : 'Show item'} style={{
      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
      background: on ? '#25D366' : '#cbd5e1', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0, outline: 'none',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: 'var(--admin-card)',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </button>
  )
}

/* ── Confirm dialog ───────────────── */
function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: 'var(--admin-card)', borderRadius: 20, padding: '32px 28px', maxWidth: 360, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
          <TrashIcon size={22} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Delete Item?</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>
          <strong>"{name}"</strong> will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function MenuManagement() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Cat[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterAvail, setFilterAvail] = useState('all')
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Item> | null }>({ open: false, item: null })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [delConfirm, setDelConfirm] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: cats }, { data: menuItems }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*, categories(name_en)').order('sort_order'),
    ])
    setCategories(cats && cats.length > 0 ? cats : SEED_CATEGORIES)
    if (menuItems && menuItems.length > 0) {
      setItems(menuItems.map((i: any) => ({ ...i, category: i.categories?.name_en || '' })))
    } else {
      setItems(SEED_MENU_ITEMS.map(i => ({ ...i, category_id: null, image_url: null })))
    }
  }

  function openAdd() {
    setModal({ open: true, item: { ...EMPTY } })
    setImageFile(null); setImagePreview(null)
  }

  function openEdit(item: Item) {
    setModal({ open: true, item: { ...item } })
    setImageFile(null)
    setImagePreview(item.image_url ? getImageUrl(item.image_url) : null)
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
    const path = `items/${itemId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('menu-images').upload(path, file, { upsert: true })
    if (error) { setStatus('Image upload failed: ' + error.message); return null }
    return path
  }

  async function saveItem() {
    if (!modal.item) return
    setSaving(true); setStatus('Saving...')
    try {
      let imageUrl = modal.item.image_url || null
      if (modal.item.id) {
        if (imageFile) imageUrl = await uploadImage(imageFile, modal.item.id)
        const { error } = await supabase.from('menu_items').update({
          name_en: modal.item.name_en, name_ar: modal.item.name_ar,
          price: modal.item.price, calories: modal.item.calories,
          category_id: modal.item.category_id, is_available: modal.item.is_available,
          image_url: imageUrl, updated_at: new Date().toISOString(),
        }).eq('id', modal.item.id)
        if (error) throw error
      } else {
        const newId = Math.max(...items.map(i => i.id), 0) + 1
        if (imageFile) imageUrl = await uploadImage(imageFile, newId)
        const { error } = await supabase.from('menu_items').insert({
          id: newId, name_en: modal.item.name_en, name_ar: modal.item.name_ar,
          price: modal.item.price, calories: modal.item.calories,
          category_id: modal.item.category_id, is_available: modal.item.is_available,
          image_url: imageUrl, sort_order: items.length + 1,
        })
        if (error) throw error
      }
      setStatus('Saved ✓')
      setModal({ open: false, item: null })
      loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setSaving(false)
  }

  async function confirmDelete() {
    if (!delConfirm) return
    await supabase.from('menu_items').delete().eq('id', delConfirm.id)
    setDelConfirm(null)
    loadData()
  }

  async function toggleAvailable(item: Item) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name_en.toLowerCase().includes(search.toLowerCase()) || i.name_ar.includes(search)
    const matchCat = filterCat === 'all' || String(i.category_id) === filterCat
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? i.is_available : !i.is_available)
    return matchSearch && matchCat && matchAvail
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 2 }}>Menu Management</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{items.length} items · {items.filter(i => i.is_available).length} available</p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#25D366', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Item
        </button>
      </div>

      {status && (
        <div style={{ padding: '10px 16px', background: status.startsWith('Error') ? '#fef2f2' : '#f0fdf4', borderRadius: 10, fontSize: 13, color: status.startsWith('Error') ? '#dc2626' : '#16a34a', border: `1px solid ${status.startsWith('Error') ? '#fecaca' : '#bbf7d0'}` }}>
          {status}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search items..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input" style={{ paddingLeft: 34 }} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="admin-select" style={{ width: 'auto', minWidth: 150 }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)} className="admin-select" style={{ width: 'auto', minWidth: 130 }}>
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                {['Image', 'Name', 'Category', 'Price', 'Calories', 'Available', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: i >= 5 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none', opacity: item.is_available ? 1 : 0.55 }}
                  onMouseOver={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#f8fafc', position: 'relative', flexShrink: 0 }}>
                      {item.image_url ? (
                        <Image src={getImageUrl(item.image_url)} alt={item.name_en} fill style={{ objectFit: 'cover' }} sizes="44px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥗</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>{item.name_en}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{item.name_ar}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {item.category || categories.find(c => c.id === item.category_id)?.name_en ? (
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', color: '#475569', fontWeight: 500 }}>
                        {item.category || categories.find(c => c.id === item.category_id)?.name_en}
                      </span>
                    ) : <span style={{ color: '#cbd5e1' }}>–</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#25D366' }}>{item.price} SAR</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.calories ?? '–'} kcal</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Toggle on={item.is_available} onToggle={() => toggleAvailable(item)} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="ibtn ibtn-edit" onClick={() => openEdit(item)} title="Edit">
                        <PencilIcon />
                      </button>
                      <button className="ibtn ibtn-del" onClick={() => setDelConfirm({ id: item.id, name: item.name_en })} title="Delete">
                        <TrashIcon />
                      </button>
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

      {/* Edit / Add Modal */}
      {modal.open && modal.item && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 25px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ borderTop: '4px solid #25D366', borderRadius: '20px 20px 0 0', padding: '18px 20px', borderBottom: '1px solid var(--admin-border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>{modal.item.id ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setModal({ open: false, item: null })} className="ibtn ibtn-edit"><CloseIcon /></button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Image */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: '#f8fafc', position: 'relative', border: '1.5px solid var(--admin-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {imagePreview ? <Image src={imagePreview} alt="preview" fill style={{ objectFit: 'cover' }} sizes="72px" /> : '🥗'}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 14px', border: '1.5px solid var(--admin-border)', borderRadius: 10, background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                      Change Image
                    </button>
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

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Price (SAR)</label>
                  <input type="number" value={modal.item.price || ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, price: Number(e.target.value) } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Calories</label>
                  <input type="number" value={modal.item.calories ?? ''} className="admin-input"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, calories: e.target.value ? Number(e.target.value) : null } }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>Category</label>
                  <select value={modal.item.category_id ?? ''} className="admin-select"
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, category_id: Number(e.target.value) || null } }))}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
              </div>

              {/* Available toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <Toggle on={modal.item.is_available ?? true} onToggle={() => setModal(m => ({ ...m, item: { ...m.item!, is_available: !m.item!.is_available } }))} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>Available on menu</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Customers can see and order this item</p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal({ open: false, item: null })} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveItem} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: '#25D366', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {delConfirm && <ConfirmDialog name={delConfirm.name} onConfirm={confirmDelete} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}
