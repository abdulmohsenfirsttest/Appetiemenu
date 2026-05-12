'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { supabase, getImageUrl } from '@/lib/supabase'
import { SEED_CATEGORIES, SEED_MENU_ITEMS, ITEM_DETAILS } from '@/lib/seed-data'

// ── colours (match original HTML tailwind config) ──────────────────────────
const C = {
  brand:   '#25D366',
  brandLt: '#E7F8EE',
  brandDk: '#128C7E',
  sand:    '#FAF8F5',
  ink:     '#1E1E2C',
  muted:   '#8C8CA1',
}

// ── allergen display data ─────────────────────────────────────────────────
const ALLERGENS: Record<string, { icon: string; en: string; ar: string }> = {
  gluten:    { icon: '🌾', en: 'Gluten',    ar: 'جلوتين' },
  dairy:     { icon: '🥛', en: 'Dairy',     ar: 'ألبان' },
  nuts:      { icon: '🥜', en: 'Nuts',      ar: 'مكسرات' },
  eggs:      { icon: '🥚', en: 'Eggs',      ar: 'بيض' },
  soy:       { icon: '🫘', en: 'Soy',       ar: 'صويا' },
  shellfish: { icon: '🦐', en: 'Shellfish', ar: 'مأكولات بحرية' },
  fish:      { icon: '🐟', en: 'Fish',      ar: 'سمك' },
  sesame:    { icon: '🌿', en: 'Sesame',    ar: 'سمسم' },
}

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

const T = {
  ar: {
    all: 'الكل',
    search: 'ابحث في القائمة…',
    items: (n: number) => `${n} صنف`,
    noItems: 'لا توجد أصناف مطابقة',
    calories: 'سعرات',
    nutritionTitle: 'القيم الغذائية',
    perServing: (s: string) => s ? `لكل ${s}` : 'لكل وجبة',
    fat: 'دهون',
    carbs: 'كربوهيدرات',
    protein: 'بروتين',
    sugars: 'سكر طبيعي',
    allergenTitle: 'معلومات الحساسية',
    noAllergens: '✓ لا يحتوي على مسببات حساسية',
    sar: 'ر.س',
  },
  en: {
    all: 'All',
    search: 'Search menu…',
    items: (n: number) => `${n} items`,
    noItems: 'No items found',
    calories: 'Calories',
    nutritionTitle: 'Nutrition Facts',
    perServing: (s: string) => s ? `per ${s}` : 'per serving',
    fat: 'Fat',
    carbs: 'Carbs',
    protein: 'Protein',
    sugars: 'Natural Sugar',
    allergenTitle: 'Allergen Information',
    noAllergens: '✓ No common allergens',
    sar: 'SAR',
  },
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCalories, setShowCalories] = useState(true)
  const [modal, setModal] = useState<MenuItem | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

  const t = T[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const usedCategoryNames = [...new Set(items.map(i => i.category))]
  const usedCategories = categories.filter(cat => usedCategoryNames.includes(cat.name_en))

  const catLabel = (nameEn: string) => {
    if (nameEn === 'All') return t.all
    const cat = categories.find(c => c.name_en === nameEn)
    return lang === 'ar' ? (cat?.name_ar || nameEn) : nameEn
  }

  const q = search.toLowerCase()
  const filtered = items.filter(item => {
    const catMatch = activeCategory === 'All' || item.category === activeCategory
    if (!catMatch) return false
    if (!q) return true
    return item.name_en.toLowerCase().includes(q) || item.name_ar.includes(q) ||
      (ITEM_DETAILS[item.id]?.descEn?.toLowerCase().includes(q) ?? false) ||
      (ITEM_DETAILS[item.id]?.descAr?.includes(q) ?? false)
  })

  // Group by category when showing All
  const grouped: Record<string, MenuItem[]> = {}
  if (activeCategory === 'All') {
    for (const item of filtered) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }
  }

  return (
    <div dir={dir} style={{ background: C.sand, minHeight: '100vh', color: C.ink }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.brandLt}`,
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.brandLt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C7.03 2 3 6.03 3 11c0 3.9 2.34 7.24 5.71 8.78L8 22h8l-.71-2.22C18.66 18.24 21 14.9 21 11c0-4.97-4.03-9-9-9z" fill={C.brand}/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: C.ink, lineHeight: 1.1 }}>Appetie</div>
              <div style={{ fontWeight: 700, fontSize: 11, color: C.brand }}>أبيتي</div>
            </div>
          </a>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', [dir === 'rtl' ? 'right' : 'left']: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              style={{
                width: '100%',
                padding: dir === 'rtl' ? '8px 36px 8px 14px' : '8px 14px 8px 36px',
                borderRadius: 50,
                border: `1.5px solid transparent`,
                background: C.sand,
                fontSize: 13,
                color: C.ink,
                outline: 'none',
                transition: 'border 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.brand}
              onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
            />
          </div>

          {/* Calories toggle */}
          <button
            onClick={() => setShowCalories(v => !v)}
            title="Show / hide calories"
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: showCalories ? C.brand : C.brandLt,
              color: showCalories ? 'white' : C.brand,
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: C.brand, color: 'white', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = C.brandDk}
            onMouseOut={e => e.currentTarget.style.background = C.brand}
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* ── Category nav (separate sticky strip) ───────────────────────── */}
      <nav style={{
        position: 'sticky', top: 61, zIndex: 30,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.brandLt}`,
      }}>
        <div className="scrollbar-hide" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', minWidth: 'max-content', maxWidth: 1024, margin: '0 auto' }}>
            {['All', ...usedCategoryNames].map(name => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                style={{
                  padding: '7px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: activeCategory === name ? C.brand : C.brandLt,
                  color: activeCategory === name ? 'white' : C.brand,
                  boxShadow: activeCategory === name ? `0 4px 12px ${C.brand}40` : 'none',
                }}
              >
                {catLabel(name)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '20px 16px 56px' }}>
        {/* Item count */}
        {!loading && (
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
            {t.items(filtered.length)}
          </p>
        )}

        {loading ? (
          <div className="menu-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f5f5f5' }}>
                <div className="shimmer" style={{ width: '100%', aspectRatio: '4/3' }} />
                <div style={{ padding: 12 }}>
                  <div className="shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 8, width: '70%' }} />
                  <div className="shimmer" style={{ height: 10, borderRadius: 6, width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <p style={{ fontSize: 15 }}>{t.noItems}</p>
          </div>
        ) : activeCategory === 'All' ? (
          // Grouped view
          Object.entries(grouped).map(([catName, catItems]) => (
            <div key={catName} style={{ marginBottom: 32 }}>
              <h2 dir={dir} style={{ fontWeight: 700, fontSize: 15, color: C.ink, borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                {catLabel(catName)}
              </h2>
              <div className="menu-grid">
                {catItems.map((item, idx) => (
                  <MenuCard key={item.id} item={item} lang={lang} idx={idx} showCalories={showCalories} t={t} onClick={() => setModal(item)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="menu-grid">
            {filtered.map((item, idx) => (
              <MenuCard key={item.id} item={item} lang={lang} idx={idx} showCalories={showCalories} t={t} onClick={() => setModal(item)} />
            ))}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', borderTop: `1px solid ${C.brandLt}`, color: C.muted, fontSize: 12 }}>
        Appetie · أبيتي · {lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
      </footer>

      {/* ── Item detail modal ──────────────────────────────────────────── */}
      {modal && <ItemModal item={modal} lang={lang} showCalories={showCalories} t={t} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Menu Card ──────────────────────────────────────────────────────────────
function MenuCard({ item, lang, idx, showCalories, t, onClick }: {
  item: MenuItem; lang: 'ar' | 'en'; idx: number
  showCalories: boolean; t: typeof T['ar']; onClick: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgSrc = item.image_url && !imgError ? getImageUrl(item.image_url) : null
  const details = ITEM_DETAILS[item.id]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <article
      onClick={onClick}
      className="card-lift fade-up"
      style={{
        borderRadius: 16, overflow: 'hidden', background: 'white', cursor: 'pointer',
        border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        animationDelay: `${Math.min(idx * 40, 400)}ms`,
      }}
    >
      {/* Image 4:3 */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: C.brandLt, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgSrc ? (
          <>
            {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
            <Image src={imgSrc} alt={item.name_en} fill className="object-cover"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s' }}
              onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
          </>
        ) : (
          <>
            <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', color: `${C.brand}55` }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 21C12 21 4 14 4 8C4 4 8 2 12 6C16 2 20 4 20 8C20 14 12 21 12 21Z"/>
              </svg>
              <span style={{ fontSize: 10, marginTop: 4, fontWeight: 500 }}>Appetie</span>
            </div>
          </>
        )}
        {/* Calories badge */}
        {showCalories && item.calories != null && (
          <span style={{
            position: 'absolute', top: 8, [lang === 'ar' ? 'left' : 'right']: 8,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
            fontSize: 11, fontWeight: 700, color: C.brand,
            padding: '2px 8px', borderRadius: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            {item.calories} {t.calories}
          </span>
        )}
      </div>

      {/* Info */}
      <div dir={dir} style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lang === 'ar' ? item.name_ar : item.name_en}
        </p>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={lang === 'en' ? 'rtl' : 'ltr'}>
          {lang === 'en' ? item.name_ar : item.name_en}
        </p>
        {details?.descEn && (
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {lang === 'ar' ? details.descAr : details.descEn}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {details?.size && <span style={{ fontSize: 10, color: C.muted }}>{details.size}</span>}
          {item.price > 0 && (
            <span style={{ fontWeight: 700, fontSize: 13, color: C.brand, marginInlineStart: 'auto' }}>
              {item.price} {t.sar}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Item Modal ────────────────────────────────────────────────────────────
function ItemModal({ item, lang, showCalories, t, onClose }: {
  item: MenuItem; lang: 'ar' | 'en'; showCalories: boolean; t: typeof T['ar']; onClose: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgSrc = item.image_url && !imgError ? getImageUrl(item.image_url) : null
  const details = ITEM_DETAILS[item.id]
  const n = details?.nutrition
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const allergenHTML = details?.allergens?.length
    ? details.allergens.map(a => {
        const m = ALLERGENS[a] || { icon: '⚠️', en: a, ar: a }
        return { key: a, label: `${m.icon} ${lang === 'ar' ? m.ar : m.en}` }
      })
    : null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 0 0' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div
        className="modal-slide-up"
        dir={dir}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', background: 'white', borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 560, maxHeight: '92dvh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: C.brandLt, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imgSrc ? (
            <>
              {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
              <Image src={imgSrc} alt={item.name_en} fill className="object-cover"
                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)} sizes="560px" />
            </>
          ) : (
            <>
              <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', color: `${C.brand}44` }}>
                <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 21C12 21 4 14 4 8C4 4 8 2 12 6C16 2 20 4 20 8C20 14 12 21 12 21Z"/>
                </svg>
                <span style={{ fontSize: 13, marginTop: 6, fontWeight: 500 }}>Appetie</span>
              </div>
            </>
          )}
          {/* Close button */}
          <button onClick={onClose} aria-label="Close" style={{
            position: 'absolute', top: 12, [lang === 'ar' ? 'left' : 'right']: 12,
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(4px)',
            border: 'none', borderRadius: '50%', width: 32, height: 32,
            fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.muted, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            ✕
          </button>
        </div>

        {/* Details body */}
        <div style={{ padding: '20px 20px 36px' }}>
          {/* Title + price */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.ink, marginBottom: 2 }}>
                {lang === 'ar' ? item.name_ar : item.name_en}
              </h2>
              <p style={{ fontSize: 13, color: C.muted }} dir={lang === 'en' ? 'rtl' : 'ltr'}>
                {lang === 'en' ? item.name_ar : item.name_en}
              </p>
            </div>
            {item.price > 0 && (
              <span style={{ flexShrink: 0, fontSize: 18, fontWeight: 800, color: C.brand, background: C.brandLt, padding: '5px 14px', borderRadius: 12 }}>
                {item.price} {t.sar}
              </span>
            )}
          </div>

          {/* Description */}
          {details?.descEn && (
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
              {lang === 'ar' ? details.descAr : details.descEn}
            </p>
          )}

          {/* Nutrition facts */}
          {n && (
            <div style={{ background: C.sand, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 12 }}>
                {t.nutritionTitle}{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  {details.size ? t.perServing(details.size) : ''}
                </span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n.sugars ? 5 : 4}, 1fr)`, gap: 8, textAlign: 'center' }}>
                {[
                  { val: item.calories, label: t.calories, highlight: true },
                  { val: `${n.fat}g`, label: t.fat },
                  { val: `${n.carbs}g`, label: t.carbs },
                  { val: `${n.protein}g`, label: t.protein },
                  ...(n.sugars ? [{ val: `${n.sugars}g`, label: t.sugars }] : []),
                ].map(({ val, label, highlight }) => (
                  <div key={label}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: highlight ? C.brand : C.ink }}>{val}</p>
                    <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 8 }}>
              {t.allergenTitle}
            </h3>
            {allergenHTML ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allergenHTML.map(({ key, label }) => (
                  <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF2F2', color: '#B91C1C', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 50 }}>
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>{t.noAllergens}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
