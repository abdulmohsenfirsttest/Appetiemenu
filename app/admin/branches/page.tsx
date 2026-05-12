'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_BRANCHES } from '@/lib/seed-data'

interface Branch { id: number; name: string; location: string; is_active: boolean }

const BRANCH_COLORS: Record<string, { text: string; bg: string }> = {
  'Ar Rayyan': { text: '#5b8a3c', bg: '#eaf3e0' },
  'Hittin': { text: '#7c3aed', bg: '#ede9fe' },
  'Malqa': { text: '#2563eb', bg: '#dbeafe' },
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [modal, setModal] = useState<{ open: boolean; branch: Partial<Branch> | null }>({ open: false, branch: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('branches').select('*').order('id')
    setBranches(data && data.length > 0 ? data : SEED_BRANCHES)
  }

  async function saveBranch() {
    if (!modal.branch) return
    setSaving(true)
    try {
      if (modal.branch.id) {
        await supabase.from('branches').update({
          name: modal.branch.name,
          location: modal.branch.location,
          is_active: modal.branch.is_active,
        }).eq('id', modal.branch.id)
      } else {
        await supabase.from('branches').insert({
          name: modal.branch.name,
          location: modal.branch.location,
          is_active: modal.branch.is_active ?? true,
        })
      }
      setModal({ open: false, branch: null })
      loadData()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function toggleActive(b: Branch) {
    await supabase.from('branches').update({ is_active: !b.is_active }).eq('id', b.id)
    loadData()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500 mt-1">{branches.length} branches · {branches.filter(b => b.is_active).length} active</p>
        </div>
        <button onClick={() => setModal({ open: true, branch: { name: '', location: '', is_active: true } })}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: '#5b8a3c' }}>
          + Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map(branch => {
          const colors = BRANCH_COLORS[branch.name] || { text: '#374151', bg: '#f3f4f6' }
          return (
            <div key={branch.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: colors.bg, color: colors.text }}>
                  {branch.name.charAt(0)}
                </div>
                <button onClick={() => toggleActive(branch)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    branch.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
                  }`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <h3 className="font-bold text-gray-900">{branch.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{branch.location}</p>
              <button onClick={() => setModal({ open: true, branch: { ...branch } })}
                className="mt-4 w-full text-xs border border-gray-200 py-2 rounded-xl hover:bg-gray-50 font-medium text-gray-600">
                Edit Branch
              </button>
            </div>
          )
        })}
      </div>

      {modal.open && modal.branch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.branch.id ? 'Edit Branch' : 'Add Branch'}</h2>
              <button onClick={() => setModal({ open: false, branch: null })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Branch Name</label>
                <input type="text" value={modal.branch.name || ''}
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, name: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Location</label>
                <input type="text" value={modal.branch.location || ''}
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, location: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={modal.branch.is_active ?? true}
                  onChange={e => setModal(m => ({ ...m, branch: { ...m.branch!, is_active: e.target.checked } }))} />
                <label htmlFor="active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModal({ open: false, branch: null })}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveBranch} disabled={saving}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
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
