'use client'

import { useState, useMemo } from 'react'
import { GHABASHI_MENU, GHABASHI_CATEGORIES, type GhabashiMenuItem } from '@/lib/ghabashi-menu'

const CAT_COLORS: Record<string, string> = {
  'Gathering Box':        '#f59e0b',
  'Meals':                '#ef4444',
  'Sandwiches And Chips': '#8b5cf6',
  'Sandwiches':           '#3b82f6',
  'Ciabatta & Salad':     '#10b981',
  'Eggs And Kebda':       '#f97316',
  'Pies':                 '#ec4899',
  'Side Orders':          '#64748b',
  'Drinks':               '#0891b2',
}

function ItemModal({ item, onClose }: { item: GhabashiMenuItem; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--admin-card)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {item.img && (
          <div style={{ height: 220, overflow: 'hidden', background: '#f1f5f9' }}>
            <img src={item.img} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>{item.nameEn}</h2>
              <p style={{ fontSize: 15, color: '#94a3b8', fontFamily: 'inherit' }} dir="rtl">{item.nameAr}</p>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#c8733a', flexShrink: 0, marginLeft: 12 }}>{item.price} SAR</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: CAT_COLORS[item.catEn] + '22', color: CAT_COLORS[item.catEn] || '#64748b', fontWeight: 700 }}>{item.catEn}</span>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{item.sizeEn}</span>
          </div>
          {item.descEn && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--admin-text)', lineHeight: 1.6, marginBottom: 6 }}>{item.descEn}</p>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }} dir="rtl">{item.descAr}</p>
            </div>
          )}
          {item.addEn && (
            <div style={{ background: 'var(--admin-subcard)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>Add-ons</p>
              <p style={{ fontSize: 12, color: 'var(--admin-text)' }}>{item.addEn}</p>
            </div>
          )}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--admin-border2)' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid var(--admin-border)', background: 'var(--admin-card)', fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function GhabashiMenuPage() {
  const [items, setItems] = useState<GhabashiMenuItem[]>(GHABASHI_MENU)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [modal, setModal] = useState<GhabashiMenuItem | null>(null)
  const [editPrice, setEditPrice] = useState<{ id: number; value: string } | null>(null)

  const filtered = useMemo(() => {
    let list = items
    if (activeCat !== 'all') list = list.filter(i => i.catEn === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.nameEn.toLowerCase().includes(q) ||
        i.nameAr.includes(search) ||
        i.descEn.toLowerCase().includes(q) ||
        i.catEn.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, activeCat, search])

  function toggleAvailable(id: number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i))
  }

  function savePrice(id: number) {
    if (!editPrice) return
    const val = parseFloat(editPrice.value)
    if (!isNaN(val) && val >= 0) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, price: val } : i))
    }
    setEditPrice(null)
  }

  const available = items.filter(i => i.available).length
  const unavailable = items.length - available

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 2 }}>Ghabashi Menu</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{items.length} items · {available} available · {unavailable} hidden</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input"
            style={{ width: 200 }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCat('all')} style={{
          padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
          background: activeCat === 'all' ? '#0f172a' : 'var(--admin-subcard)',
          color: activeCat === 'all' ? 'white' : '#64748b',
        }}>All ({items.length})</button>
        {GHABASHI_CATEGORIES.map(cat => {
          const count = items.filter(i => i.catEn === cat.nameEn).length
          const active = activeCat === cat.nameEn
          const col = CAT_COLORS[cat.nameEn] || '#64748b'
          return (
            <button key={cat.nameEn} onClick={() => setActiveCat(cat.nameEn)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: active ? col : 'var(--admin-subcard)',
              color: active ? 'white' : '#64748b',
            }}>{cat.nameEn} ({count})</button>
          )
        })}
      </div>

      {/* Items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(item => {
          const col = CAT_COLORS[item.catEn] || '#64748b'
          return (
            <div key={item.id} style={{
              background: 'var(--admin-card)', borderRadius: 16, border: '1px solid var(--admin-border2)',
              overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              opacity: item.available ? 1 : 0.55,
            }}>
              {/* Image */}
              <div onClick={() => setModal(item)} style={{ height: 140, overflow: 'hidden', background: '#f8fafc', cursor: 'pointer', position: 'relative' }}>
                {item.img
                  ? <img src={item.img} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍽</div>
                }
                {!item.available && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>Hidden</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 14px 12px' }}>
                {/* Category tag */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: col + '22', color: col, fontWeight: 700 }}>{item.catEn}</span>
                </div>

                {/* Names */}
                <h3 onClick={() => setModal(item)} style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 3, cursor: 'pointer', lineHeight: 1.3 }}>{item.nameEn}</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }} dir="rtl">{item.nameAr}</p>

                {/* Price row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {editPrice?.id === item.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={editPrice.value}
                        onChange={e => setEditPrice({ id: item.id, value: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') savePrice(item.id); if (e.key === 'Escape') setEditPrice(null) }}
                        autoFocus
                        style={{ width: 70, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'var(--admin-input)', color: 'var(--admin-text)', fontSize: 13 }}
                      />
                      <button onClick={() => savePrice(item.id)} style={{ padding: '4px 8px', borderRadius: 8, border: 'none', background: '#25D366', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>✓</button>
                      <button onClick={() => setEditPrice(null)} style={{ padding: '4px 8px', borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', fontSize: 11, cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditPrice({ id: item.id, value: String(item.price) })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#c8733a' }}>{item.price}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SAR</span>
                      <span style={{ fontSize: 10, color: '#cbd5e1', marginLeft: 2 }}>✎</span>
                    </button>
                  )}

                  <button onClick={() => toggleAvailable(item.id)} style={{
                    fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: item.available ? '#dcfce7' : '#fef2f2',
                    color: item.available ? '#16a34a' : '#ef4444',
                  }}>
                    {item.available ? 'Available' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>No items found</div>
      )}

      {modal && <ItemModal item={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
