'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_CATEGORIES } from '@/lib/seed-data'

interface Cat {
  id: number
  name_en: string
  name_ar: string
  sort_order: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([])
  const [modal, setModal] = useState<{ open: boolean; cat: Partial<Cat> | null }>({ open: false, cat: null })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data && data.length > 0 ? data : SEED_CATEGORIES)
  }

  function openAdd() {
    setModal({ open: true, cat: { name_en: '', name_ar: '', sort_order: categories.length + 1 } })
  }

  function openEdit(cat: Cat) {
    setModal({ open: true, cat: { ...cat } })
  }

  async function saveCat() {
    if (!modal.cat) return
    setSaving(true)
    try {
      if (modal.cat.id) {
        const { error } = await supabase.from('categories').update({
          name_en: modal.cat.name_en,
          name_ar: modal.cat.name_ar,
          sort_order: modal.cat.sort_order,
        }).eq('id', modal.cat.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert({
          name_en: modal.cat.name_en,
          name_ar: modal.cat.name_ar,
          sort_order: modal.cat.sort_order,
        })
        if (error) throw error
      }
      setModal({ open: false, cat: null })
      loadData()
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
    setSaving(false)
  }

  async function deleteCat(id: number) {
    if (!confirm('Delete this category? Items in this category will be uncategorized.')) return
    await supabase.from('categories').delete().eq('id', id)
    loadData()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: '#5b8a3c' }}>
          + Add Category
        </button>
      </div>

      {status && <p className="text-sm text-red-500 mb-4">{status}</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">English Name</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Arabic Name</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Sort Order</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{cat.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name_en}</td>
                <td className="px-4 py-3 text-gray-700" dir="rtl">{cat.name_ar}</td>
                <td className="px-4 py-3 text-gray-500">{cat.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 mr-2">Edit</button>
                  <button onClick={() => deleteCat(cat.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && modal.cat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.cat.id ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModal({ open: false, cat: null })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">English Name</label>
                <input type="text" value={modal.cat.name_en || ''}
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, name_en: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Arabic Name</label>
                <input type="text" dir="rtl" value={modal.cat.name_ar || ''}
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, name_ar: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sort Order</label>
                <input type="number" value={modal.cat.sort_order || ''}
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat!, sort_order: Number(e.target.value) } }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModal({ open: false, cat: null })}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveCat} disabled={saving}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
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
