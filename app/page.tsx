'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase, getImageUrl } from '@/lib/supabase'
import { SEED_CATEGORIES, SEED_MENU_ITEMS } from '@/lib/seed-data'

interface MenuItem {
  id: number
  name_en: string
  name_ar: string
  price: number
  calories: number | null
  category: string
  image_url: string | null
  is_available: boolean
}

interface Category {
  id: number
  name_en: string
  name_ar: string
}

const BRAND = '#25D366'
const BRAND_LT = '#E7F8EE'
const INK = '#1E1E2C'
const MUTED = '#8C8CA1'
const SAND = '#FAF8F5'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<MenuItem | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: cats }, { data: menuItems }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*, categories(name_en, name_ar)').eq('is_available', true).order('sort_order'),
      ])
      setCategories(cats?.length ? cats : SEED_CATEGORIES)
      if (menuItems?.length) {
        setItems(menuItems.map((item: any) => ({ ...item, category: item.categories?.name_en || '' })))
      } else {
        setItems(SEED_MENU_ITEMS.filter(i => i.is_available).map(i => ({
          id: i.id, name_en: i.name_en, name_ar: i.name_ar, price: i.price,
          calories: i.calories, category: i.category, image_url: null, is_available: true,
        })))
      }
    } catch {
      setCategories(SEED_CATEGORIES)
      setItems(SEED_MENU_ITEMS.filter(i => i.is_available).map(i => ({
        id: i.id, name_en: i.name_en, name_ar: i.name_ar, price: i.price,
        calories: i.calories, category: i.category, image_url: null, is_available: true,
      })))
    }
    setLoading(false)
  }

  const usedCategories = categories.filter(cat => items.some(i => i.category === cat.name_en))
  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div dir={dir} style={{ background: SAND, minHeight: '100vh', color: INK }}>
      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BRAND_LT}`,
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: BRAND_LT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill={BRAND} opacity=".15"/>
                <path d="M16 6C11.03 6 7 10.03 7 15c0 3.9 2.34 7.24 5.71 8.78L12 26h8l-.71-2.22C22.66 22.24 25 18.9 25 15c0-4.97-4.03-9-9-9z" fill={BRAND}/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: INK, lineHeight: 1.1 }}>Appetie</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: BRAND }}>أبيتي</div>
            </div>
          </div>
          {/* Lang toggle */}
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{ fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 50, border: `1.5px solid ${BRAND_LT}`, color: INK, background: 'white', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = BRAND_LT)}
            onMouseOut={e => (e.currentTarget.style.background = 'white')}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

        {/* Category scrollable bar */}
        <div className="scrollbar-hide" style={{ overflowX: 'auto', borderTop: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', minWidth: 'max-content' }}>
            <CategoryTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label={lang === 'ar' ? 'الكل' : 'All'} />
            {usedCategories.map(cat => (
              <CategoryTab key={cat.id} active={activeCategory === cat.name_en} onClick={() => setActiveCategory(cat.name_en)} label={lang === 'ar' ? cat.name_ar : cat.name_en} />
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '20px 16px 48px' }}>
        {/* Item count */}
        {!loading && (
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 16, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            {lang === 'ar' ? `${filtered.length} صنف` : `${filtered.length} items`}
          </p>
        )}

        {loading ? (
          <div className="menu-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="shimmer" style={{ width: '100%', aspectRatio: '1' }} />
                <div style={{ padding: 12 }}>
                  <div className="shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 8, width: '70%' }} />
                  <div className="shimmer" style={{ height: 10, borderRadius: 6, width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: MUTED }}>
            <p style={{ fontSize: 15 }}>{lang === 'ar' ? 'لا توجد أصناف في هذه الفئة' : 'No items in this category'}</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item, idx) => (
              <MenuCard key={item.id} item={item} lang={lang} idx={idx} onClick={() => setModal(item)} />
            ))}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '28px 16px', borderTop: `1px solid ${BRAND_LT}`, color: MUTED, fontSize: 12 }}>
        Appetie · أبيتي · {lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
      </footer>

      {/* Item detail modal */}
      {modal && <ItemModal item={modal} lang={lang} onClose={() => setModal(null)} />}
    </div>
  )
}

function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 20px',
        borderRadius: 50,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.15s',
        background: active ? BRAND : '#EFEFEF',
        color: active ? 'white' : '#555',
      }}
    >
      {label}
    </button>
  )
}

function MenuCard({ item, lang, idx, onClick }: { item: MenuItem; lang: 'ar' | 'en'; idx: number; onClick: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgSrc = item.image_url && !imgError ? getImageUrl(item.image_url) : null

  return (
    <div
      onClick={onClick}
      className="card-lift fade-up"
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        animationDelay: `${Math.min(idx * 25, 350)}ms`,
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: BRAND_LT, overflow: 'hidden' }}>
        {imgSrc ? (
          <>
            {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
            <Image
              src={imgSrc}
              alt={item.name_en}
              fill
              className="object-cover"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s' }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </>
        ) : (
          <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lang === 'ar' ? item.name_ar : item.name_en}
        </p>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lang === 'ar' ? item.name_en : item.name_ar}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: BRAND }}>
            {item.price} {lang === 'ar' ? 'ر.س' : 'SAR'}
          </span>
          {item.calories != null && (
            <span style={{ fontSize: 11, background: '#F2F2F2', color: MUTED, padding: '3px 9px', borderRadius: 50 }}>
              {item.calories} {lang === 'ar' ? 'سعرة' : 'kcal'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ItemModal({ item, lang, onClose }: { item: MenuItem; lang: 'ar' | 'en'; onClose: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgSrc = item.image_url && !imgError ? getImageUrl(item.image_url) : null
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />

      {/* Sheet */}
      <div
        className="modal-slide-up"
        dir={dir}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, overflow: 'hidden', maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: BRAND_LT }}>
          {imgSrc ? (
            <>
              {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
              <Image src={imgSrc} alt={item.name_en} fill className="object-cover"
                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} sizes="520px" />
            </>
          ) : (
            <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
          )}
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, [lang === 'ar' ? 'left' : 'right']: 12,
              background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
              width: 34, height: 34, fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Details */}
        <div style={{ padding: '20px 20px 36px' }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: INK, marginBottom: 4 }}>
            {lang === 'ar' ? item.name_ar : item.name_en}
          </h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>
            {lang === 'ar' ? item.name_en : item.name_ar}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontWeight: 800, fontSize: 24, color: BRAND }}>
              {item.price} {lang === 'ar' ? 'ر.س' : 'SAR'}
            </span>
            {item.calories != null && (
              <span style={{ fontSize: 13, background: '#F2F2F2', color: MUTED, padding: '5px 14px', borderRadius: 50 }}>
                {item.calories} {lang === 'ar' ? 'سعرة حرارية' : 'kcal'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
