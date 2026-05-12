'use client'

import { useState, useEffect } from 'react'
import { supabase, getImageUrl } from '@/lib/supabase'
import { SEED_CATEGORIES, SEED_MENU_ITEMS } from '@/lib/seed-data'
import Image from 'next/image'

interface MenuItemDisplay {
  id: number
  name_en: string
  name_ar: string
  price: number
  calories: number | null
  category: string
  image_url: string | null
  is_available: boolean
}

interface CategoryDisplay {
  id: number
  name_en: string
  name_ar: string
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemDisplay[]>([])
  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: cats }, { data: menuItems }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*, categories(name_en, name_ar)').eq('is_available', true).order('sort_order'),
      ])

      if (cats && cats.length > 0) setCategories(cats)
      else setCategories(SEED_CATEGORIES)

      if (menuItems && menuItems.length > 0) {
        setItems(menuItems.map((item: any) => ({
          ...item,
          category: item.categories?.name_en || '',
        })))
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

  const usedCategories = categories.filter(cat =>
    items.some(item => item.category === cat.name_en)
  )

  const filtered = activeCategory === 'all'
    ? items
    : items.filter(item => item.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#eaf3e0' }}>
              🥗
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">Appetie</div>
              <div className="text-xs font-semibold" style={{ color: '#5b8a3c' }}>أبيتي</div>
            </div>
          </div>
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 px-4 py-2 min-w-max">
            <CategoryTab
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              label={lang === 'ar' ? 'الكل' : 'All'}
            />
            {usedCategories.map(cat => (
              <CategoryTab
                key={cat.id}
                active={activeCategory === cat.name_en}
                onClick={() => setActiveCategory(cat.name_en)}
                label={lang === 'ar' ? cat.name_ar : cat.name_en}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="w-full aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🥗</div>
                <p className="text-sm">{lang === 'ar' ? 'لا توجد عناصر' : 'No items found'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filtered.map(item => (
                  <MenuCard key={item.id} item={item} lang={lang} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 mt-4">
        <p>Appetie · أبيتي · {lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p>
      </footer>
    </div>
  )
}

function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
      style={active ? { background: '#5b8a3c', color: 'white' } : { background: '#f3f4f6', color: '#4b5563' }}
    >
      {label}
    </button>
  )
}

function MenuCard({ item, lang }: { item: MenuItemDisplay; lang: 'ar' | 'en' }) {
  const [imgError, setImgError] = useState(false)
  const imgSrc = item.image_url && !imgError ? getImageUrl(item.image_url) : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={item.name_en}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <span className="text-5xl">🥗</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight truncate">
          {lang === 'ar' ? item.name_ar : item.name_en}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {lang === 'ar' ? item.name_en : item.name_ar}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-sm" style={{ color: '#5b8a3c' }}>
            {item.price} {lang === 'ar' ? 'ر.س' : 'SAR'}
          </span>
          {item.calories != null && (
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {item.calories} {lang === 'ar' ? 'سعرة' : 'kcal'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
