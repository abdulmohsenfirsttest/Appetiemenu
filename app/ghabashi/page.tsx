'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { GHABASHI_MENU, GHABASHI_CATEGORIES } from '@/lib/ghabashi-menu'

const C = {
  brand:   '#c8733a',
  brandLt: '#FDF3EC',
  brandDk: '#a05a28',
  sand:    '#FBF8F5',
  ink:     '#2d1f14',
  muted:   '#9C8070',
}

const T = {
  ar: {
    all: 'الكل',
    search: 'ابحث في القائمة…',
    items: (n: number) => `${n} صنف`,
    noItems: 'لا توجد أصناف مطابقة',
    sar: 'ر.س',
    size: 'الحجم',
    addons: 'الإضافات',
  },
  en: {
    all: 'All',
    search: 'Search menu…',
    items: (n: number) => `${n} items`,
    noItems: 'No items found',
    sar: 'SAR',
    size: 'Size',
    addons: 'Add-ons',
  },
}

interface GItem {
  id: number
  name_en: string
  name_ar: string
  category_en: string
  category_ar: string
  size_en: string
  size_ar: string
  price: number
  desc_en: string
  desc_ar: string
  add_en: string
  add_ar: string
  img_url: string
  is_available: boolean
}

function toGItem(raw: any): GItem {
  return {
    id: raw.id,
    name_en: raw.name_en ?? raw.nameEn ?? '',
    name_ar: raw.name_ar ?? raw.nameAr ?? '',
    category_en: raw.category_en ?? raw.catEn ?? '',
    category_ar: raw.category_ar ?? raw.catAr ?? '',
    size_en: raw.size_en ?? raw.sizeEn ?? '',
    size_ar: raw.size_ar ?? raw.sizeAr ?? '',
    price: raw.price ?? 0,
    desc_en: raw.desc_en ?? raw.descEn ?? '',
    desc_ar: raw.desc_ar ?? raw.descAr ?? '',
    add_en: raw.add_en ?? raw.addEn ?? '',
    add_ar: raw.add_ar ?? raw.addAr ?? '',
    img_url: raw.img_url ?? raw.img ?? '',
    is_available: raw.is_available ?? raw.available ?? true,
  }
}

export default function GhabashiMenuPage() {
  const [items, setItems] = useState<GItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [scrollCategory, setScrollCategory] = useState('All')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<GItem | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadItems() }, [])

  useEffect(() => {
    if (activeCategory !== 'All' || loading) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const cat = e.target.getAttribute('data-cat')
            if (cat) setScrollCategory(cat)
          }
        })
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 }
    )
    const sections = document.querySelectorAll('[data-cat]')
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [activeCategory, loading, items])

  useEffect(() => {
    if (!navRef.current) return
    const btn = navRef.current.querySelector(`[data-tab="${scrollCategory}"]`) as HTMLElement
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [scrollCategory])

  async function loadItems() {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await supabase
        .from('ghabashi_menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order')
      if (error || !data?.length) throw new Error('fallback')
      setItems(data.map(toGItem))
    } catch {
      setItems(GHABASHI_MENU.filter(i => i.available).map(toGItem))
    }
    setLoading(false)
  }

  const t = T[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const categories = GHABASHI_CATEGORIES
  const usedCatNames = [...new Set(items.map(i => i.category_en))]
  const orderedCatNames = categories.map(c => c.nameEn).filter(n => usedCatNames.includes(n))

  const catLabel = (nameEn: string) => {
    if (nameEn === 'All') return t.all
    const cat = categories.find(c => c.nameEn === nameEn)
    return lang === 'ar' ? (cat?.nameAr || nameEn) : nameEn
  }

  const q = search.toLowerCase()
  const filtered = items.filter(item => {
    const catMatch = activeCategory === 'All' || item.category_en === activeCategory
    if (!catMatch) return false
    if (!q) return true
    return item.name_en.toLowerCase().includes(q) || item.name_ar.includes(q) ||
      item.desc_en.toLowerCase().includes(q) || item.desc_ar.includes(q)
  })

  const grouped: Record<string, GItem[]> = {}
  if (activeCategory === 'All') {
    for (const item of filtered) {
      if (!grouped[item.category_en]) grouped[item.category_en] = []
      grouped[item.category_en].push(item)
    }
  }

  return (
    <div dir={dir} style={{ background: C.sand, minHeight: '100vh', color: C.ink }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.brandLt}`,
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Brand */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🏪
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>Ghabashi</div>
              <div style={{ fontSize: 10, color: C.muted }}>غبाشي</div>
            </div>
          </a>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', [dir === 'rtl' ? 'right' : 'left']: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              style={{
                width: '100%',
                padding: dir === 'rtl' ? '8px 36px 8px 14px' : '8px 14px 8px 36px',
                borderRadius: 50,
                border: '1.5px solid transparent',
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

          {/* Lang toggle */}
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: C.brand, color: 'white', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* Category nav */}
      <nav style={{
        position: 'sticky', top: 61, zIndex: 30,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.brandLt}`,
      }}>
        <div ref={navRef} className="scrollbar-hide" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', minWidth: 'max-content', maxWidth: 1024, margin: '0 auto' }}>
            {['All', ...orderedCatNames].map(name => {
              const isActive = activeCategory === 'All'
                ? scrollCategory === name
                : activeCategory === name
              return (
                <button
                  key={name}
                  data-tab={name}
                  onClick={() => {
                    setActiveCategory(name)
                    setScrollCategory(name)
                    if (name !== 'All') {
                      setTimeout(() => {
                        document.querySelector(`[data-cat="${name}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 50)
                    }
                  }}
                  style={{
                    padding: '7px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                    whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: isActive ? C.brand : C.brandLt,
                    color: isActive ? 'white' : C.brand,
                    boxShadow: isActive ? `0 4px 12px ${C.brand}40` : 'none',
                  }}
                >
                  {catLabel(name)}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '20px 16px 56px' }}>
        {!loading && (
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{t.items(filtered.length)}</p>
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
          Object.entries(grouped).map(([catEn, catItems]) => (
            <div key={catEn} data-cat={catEn} style={{ marginBottom: 32 }}>
              <h2 dir={dir} style={{ fontWeight: 700, fontSize: 15, color: C.ink, borderBottom: '1px solid #f0ebe6', paddingBottom: 8, marginBottom: 16 }}>
                {catLabel(catEn)}
              </h2>
              <div className="menu-grid">
                {catItems.map((item, idx) => (
                  <GhabashiCard key={item.id} item={item} lang={lang} idx={idx} t={t} onClick={() => setModal(item)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="menu-grid">
            {filtered.map((item, idx) => (
              <GhabashiCard key={item.id} item={item} lang={lang} idx={idx} t={t} onClick={() => setModal(item)} />
            ))}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', borderTop: `1px solid ${C.brandLt}`, color: C.muted, fontSize: 12 }}>
        Ghabashi · غبـاشـي · {lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
      </footer>

      {modal && <GhabashiModal item={modal} lang={lang} t={t} onClose={() => setModal(null)} />}
    </div>
  )
}

function GhabashiCard({ item, lang, idx, t, onClick }: {
  item: GItem; lang: 'ar' | 'en'; idx: number; t: typeof T['ar']; onClick: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const imgSrc = item.img_url && !imgError ? item.img_url : null

  return (
    <article
      onClick={onClick}
      className="card-lift fade-up"
      style={{
        borderRadius: 16, overflow: 'hidden', background: 'white', cursor: 'pointer',
        border: '1px solid #f0ebe6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        animationDelay: `${Math.min(idx * 40, 400)}ms`,
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#FDF3EC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgSrc ? (
          <>
            {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
            <Image
              src={imgSrc} alt={item.name_en} fill
              className="object-cover"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s' }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          </>
        ) : (
          <>
            <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
            <span style={{ position: 'relative', fontSize: 32, opacity: 0.4 }}>🏪</span>
          </>
        )}
      </div>

      <div dir={dir} style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#2d1f14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lang === 'ar' ? item.name_ar : item.name_en}
        </p>
        <p style={{ fontSize: 11, color: '#9C8070', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={lang === 'en' ? 'rtl' : 'ltr'}>
          {lang === 'en' ? item.name_ar : item.name_en}
        </p>
        {(lang === 'ar' ? item.desc_ar : item.desc_en) && (
          <p style={{ fontSize: 11, color: '#9C8070', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {lang === 'ar' ? item.desc_ar : item.desc_en}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {(lang === 'ar' ? item.size_ar : item.size_en) && (
            <span style={{ fontSize: 10, color: '#9C8070' }}>{lang === 'ar' ? item.size_ar : item.size_en}</span>
          )}
          {item.price > 0 && (
            <span style={{ fontWeight: 700, fontSize: 13, color: '#c8733a', marginInlineStart: 'auto' }}>
              {item.price} {t.sar}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function GhabashiModal({ item, lang, t, onClose }: {
  item: GItem; lang: 'ar' | 'en'; t: typeof T['ar']; onClose: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const imgSrc = item.img_url && !imgError ? item.img_url : null
  const desc = lang === 'ar' ? item.desc_ar : item.desc_en
  const size = lang === 'ar' ? item.size_ar : item.size_en
  const addons = lang === 'ar' ? item.add_ar : item.add_en

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
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
        <div style={{ position: 'relative', width: '100%', height: 220, background: '#FDF3EC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imgSrc ? (
            <>
              {!imgLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
              <Image
                src={imgSrc} alt={item.name_en} fill
                className="object-cover"
                style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                sizes="560px"
                unoptimized
              />
            </>
          ) : (
            <>
              <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
              <span style={{ position: 'relative', fontSize: 56, opacity: 0.3 }}>🏪</span>
            </>
          )}
          <button onClick={onClose} aria-label="Close" style={{
            position: 'absolute', top: 12, [lang === 'ar' ? 'left' : 'right']: 12,
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(4px)',
            border: 'none', borderRadius: '50%', width: 32, height: 32,
            fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9C8070', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 36px' }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#2d1f14', margin: '0 0 4px' }}>
            {lang === 'ar' ? item.name_ar : item.name_en}
          </h2>
          <p style={{ fontSize: 13, color: '#9C8070', margin: '0 0 16px' }} dir={lang === 'en' ? 'rtl' : 'ltr'}>
            {lang === 'en' ? item.name_ar : item.name_en}
          </p>

          {item.price > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FDF3EC', borderRadius: 50, padding: '6px 16px', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#c8733a' }}>{item.price}</span>
              <span style={{ fontSize: 12, color: '#c8733a', fontWeight: 600 }}>{t.sar}</span>
            </div>
          )}

          {desc && (
            <p style={{ fontSize: 14, color: '#4a3828', lineHeight: 1.7, marginBottom: 16 }}>{desc}</p>
          )}

          {size && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9C8070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.size}</span>
              <p style={{ fontSize: 13, color: '#4a3828', marginTop: 4 }}>{size}</p>
            </div>
          )}

          {addons && (
            <div style={{ background: '#FBF8F5', borderRadius: 12, padding: '12px 16px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9C8070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.addons}</span>
              <p style={{ fontSize: 13, color: '#4a3828', marginTop: 6, lineHeight: 1.6 }}>{addons}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
