'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, getImageUrl } from '@/lib/supabase'
import { SEED_MENU_ITEMS, SEED_CATEGORIES } from '@/lib/seed-data'
import Image from 'next/image'

interface Item {
  id: number
  name_en: string
  name_ar: string
  price: number
  calories: number | null
  category_id: number | null
  category?: string
  image_url: string | null
  is_available: boolean
  sort_order: number
}

interface Cat { id: number; name_en: string; name_ar: string }

const EMPTY: Omit<Item, 'id'> = {
  name_en: '', name_ar: '', price: 0, calories: null, category_id: null,
  image_url: null, is_available: true, sort_order: 0,
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
    setImageFile(null)
    setImagePreview(null)
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
    setSaving(true)
    setStatus('Saving...')
    try {
      let imageUrl = modal.item.image_url || null

      if (modal.item.id) {
        // Edit existing
        if (imageFile) imageUrl = await uploadImage(imageFile, modal.item.id)
        const { error } = await supabase.from('menu_items').update({
          name_en: modal.item.name_en, name_ar: modal.item.name_ar,
          price: modal.item.price, calories: modal.item.calories,
          category_id: modal.item.category_id, is_available: modal.item.is_available,
          image_url: imageUrl, updated_at: new Date().toISOString(),
        }).eq('id', modal.item.id)
        if (error) throw error
      } else {
        // Add new
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
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
    setSaving(false)
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this item?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    loadData()
  }

  async function toggleAvailable(item: Item) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    loadData()
  }

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name_en.toLowerCase().includes(search.toLowerCase()) || i.name_ar.includes(search)
    const matchCat = filterCat === 'all' || String(i.category_id) === filterCat
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? i.is_available : !i.is_available)
    return matchSearch && matchCat && matchAvail
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} items total · {items.filter(i => i.is_available).length} available</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
          style={{ background: '#5b8a3c' }}>
          + Add Item
        </button>
      </div>

      {status && <div className="mb-4 text-sm text-gray-500">{status}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text" placeholder="Search items..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#5b8a3c' } as any}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Image</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Calories</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 transition ${!item.is_available ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative">
                      {item.image_url ? (
                        <Image src={getImageUrl(item.image_url)} alt={item.name_en} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🥗</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.name_en}</p>
                    <p className="text-xs text-gray-400">{item.name_ar}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.category || categories.find(c => c.id === item.category_id)?.name_en || '–'}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#5b8a3c' }}>{item.price} SAR</td>
                  <td className="px-4 py-3 text-gray-500">{item.calories ?? '–'} kcal</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(item)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                        item.is_available ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {item.is_available ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(item)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 mr-2">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && modal.item && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.item.id ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative flex items-center justify-center">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="preview" fill className="object-cover" sizes="80px" />
                    ) : <span className="text-3xl">🥗</span>}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <button onClick={() => fileRef.current?.click()}
                      className="text-sm px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                      Change Image
                    </button>
                    <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">English Name</label>
                  <input type="text" value={modal.item.name_en || ''}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, name_en: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Arabic Name</label>
                  <input type="text" dir="rtl" value={modal.item.name_ar || ''}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, name_ar: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (SAR)</label>
                  <input type="number" value={modal.item.price || ''}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, price: Number(e.target.value) } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Calories</label>
                  <input type="number" value={modal.item.calories ?? ''}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, calories: e.target.value ? Number(e.target.value) : null } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <select value={modal.item.category_id ?? ''}
                    onChange={e => setModal(m => ({ ...m, item: { ...m.item!, category_id: Number(e.target.value) || null } }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="avail" checked={modal.item.is_available ?? true}
                  onChange={e => setModal(m => ({ ...m, item: { ...m.item!, is_available: e.target.checked } }))} />
                <label htmlFor="avail" className="text-sm text-gray-700">Available on menu</label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModal({ open: false, item: null })}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveItem} disabled={saving}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                style={{ background: '#5b8a3c' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
