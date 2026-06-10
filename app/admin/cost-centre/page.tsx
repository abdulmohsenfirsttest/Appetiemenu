'use client'
import { useState, useMemo } from 'react'
import { COST_ITEMS, COST_SUPPLIERS, WASTAGE, RECIPES, Recipe } from '@/lib/cost-data'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'MEAT':                { bg: '#fef2f2', text: '#dc2626' },
  'VEGETABLES & FRUITS': { bg: '#f0fdf4', text: '#16a34a' },
  'DAIRY PRODUCTS':      { bg: '#eff6ff', text: '#2563eb' },
  'DAIRY OTHERS':        { bg: '#eff6ff', text: '#2563eb' },
  'DRY ITEMS':           { bg: '#fef3c7', text: '#d97706' },
  'SOFT DRINKS':         { bg: '#f0f9ff', text: '#0369a1' },
  'HOT DRINKS':          { bg: '#fff7ed', text: '#c2410c' },
  'SPICES':              { bg: '#fdf4ff', text: '#9333ea' },
  'Spices':              { bg: '#fdf4ff', text: '#9333ea' },
  'MISCELLANEOUS':       { bg: '#f8fafc', text: '#475569' },
  'LIQUID':              { bg: '#f0f9ff', text: '#0284c7' },
  'Default Categories':  { bg: '#f8fafc', text: '#64748b' },
}
const CATS = [...new Set(COST_ITEMS.map(i => i.category))].filter(Boolean).sort()

function findSupplier(ingredientName: string) {
  if (!ingredientName) return null
  const q = ingredientName.toLowerCase().trim()
  const match = COST_ITEMS.find(item =>
    item.name.toLowerCase().includes(q) || q.includes(item.name.toLowerCase().split(' ').filter(w => w.length > 3)[0] || '')
  )
  return match || null
}

type Tab = 'recipes' | 'items' | 'suppliers' | 'wastage'

export default function CostCentre() {
  const [tab, setTab] = useState<Tab>('recipes')
  const [recipeSearch, setRecipeSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('category')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [supplierSearch, setSupplierSearch] = useState('')

  const totalValue = COST_ITEMS.reduce((s, i) => s + i.price, 0)
  const avgPrice = totalValue / COST_ITEMS.length
  const MENU_GROUPS = ['all', ...new Set(RECIPES.map(r => r.menuGroup).filter(Boolean))]
  const filteredRecipes = useMemo(() => {
    let list = RECIPES.filter(r => r.totalCost > 0 || r.sellingPrice > 0)
    if (groupFilter !== 'all') list = list.filter(r => r.menuGroup === groupFilter)
    if (recipeSearch.trim()) list = list.filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase()))
    return list
  }, [recipeSearch, groupFilter])

  const filtered = useMemo(() => {
    let list = COST_ITEMS
    if (catFilter !== 'all') list = list.filter(i => i.category === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        String(i.code).toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q) ||
        i.subCategory.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      let va: string | number = a[sortBy]; let vb: string | number = b[sortBy]
      if (sortBy === 'price') { va = a.price; vb = b.price }
      const cmp = typeof va === 'number' ? va - (vb as number) : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [search, catFilter, sortBy, sortDir])

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return COST_SUPPLIERS
    const q = supplierSearch.toLowerCase()
    return COST_SUPPLIERS.filter(s => s.name.toLowerCase().includes(q))
  }, [supplierSearch])

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const SortArrow = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? <span style={{ marginLeft: 4, color: '#25D366' }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : null

  const cc = (cat: string) => CATEGORY_COLORS[cat] || { bg: '#f8fafc', text: '#64748b' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Cost Centre</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Ghabashi Group — ingredient costs, suppliers & wastage</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gap: 14 }} className="admin-grid-4">
        {[
          { label: 'Menu Items Costed', value: RECIPES.filter(r => r.totalCost > 0).length, sub: `${RECIPES.length} total recipes`, color: '#25D366' },
          { label: 'Suppliers', value: COST_SUPPLIERS.length, sub: `${COST_ITEMS.length} ingredients`, color: '#6366f1' },
          { label: 'Avg Food Cost', value: `${(RECIPES.filter(r => r.foodCostPct > 0 && r.foodCostPct < 100).reduce((s, r) => s + r.foodCostPct, 0) / RECIPES.filter(r => r.foodCostPct > 0 && r.foodCostPct < 100).length).toFixed(1)}%`, sub: 'Across all dishes', color: '#f59e0b' },
          { label: 'Wastage Tracked', value: WASTAGE.vegetables.length + WASTAGE.proteins.length, sub: 'Ingredients monitored', color: '#10b981' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--admin-card)', borderRadius: 16, padding: '20px 20px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid var(--admin-border2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.color, borderRadius: '16px 16px 0 0' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--admin-text)', lineHeight: 1.1 }}>{c.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--admin-border2)', paddingBottom: 0 }}>
        {([
          { id: 'recipes', label: `Recipe Costs (${RECIPES.length})` },
          { id: 'items',   label: `Ingredients (${COST_ITEMS.length})` },
          { id: 'suppliers', label: `Suppliers (${COST_SUPPLIERS.length})` },
          { id: 'wastage', label: 'Wastage' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? '#25D366' : '#64748b',
            borderBottom: `2px solid ${tab === t.id ? '#25D366' : 'transparent'}`,
            marginBottom: -2, whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RECIPES TAB ── */}
      {tab === 'recipes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={recipeSearch} onChange={e => setRecipeSearch(e.target.value)}
              placeholder="Search dishes..."
              style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1px solid var(--admin-border2)', borderRadius: 10, fontSize: 13, background: 'var(--admin-card)', color: 'var(--admin-text)' }} />
            <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
              style={{ padding: '9px 14px', border: '1px solid var(--admin-border2)', borderRadius: 10, fontSize: 13, background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer' }}>
              {MENU_GROUPS.map(g => <option key={g} value={g}>{g === 'all' ? 'All Groups' : g}</option>)}
            </select>
            <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{filteredRecipes.length} dishes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredRecipes.map((recipe, i) => {
              const isExpanded = expandedRecipe === recipe.name
              const fcPct = recipe.foodCostPct
              const fcColor = fcPct === 0 ? '#94a3b8' : fcPct < 20 ? '#16a34a' : fcPct < 30 ? '#d97706' : '#dc2626'
              const fcBg = fcPct === 0 ? '#f8fafc' : fcPct < 20 ? '#f0fdf4' : fcPct < 30 ? '#fef3c7' : '#fef2f2'
              const margin = recipe.sellingPrice > 0 && recipe.totalCost > 0 ? recipe.sellingPrice - recipe.totalCost : null

              return (
                <div key={i} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border2)', borderRadius: 14, overflow: 'hidden' }}>
                  <div onClick={() => setExpandedRecipe(isExpanded ? null : recipe.name)}
                    style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-subcard)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text)' }}>{recipe.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{recipe.menuGroup} · {recipe.ingredients.filter(i => i.name).length} ingredients</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      {recipe.sellingPrice > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Sell Price</div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-text)' }}>{recipe.sellingPrice.toFixed(2)} SAR</div>
                        </div>
                      )}
                      {recipe.totalCost > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Food Cost</div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-text)' }}>{recipe.totalCost.toFixed(3)} SAR</div>
                        </div>
                      )}
                      {margin !== null && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Margin</div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>{margin.toFixed(2)} SAR</div>
                        </div>
                      )}
                      {fcPct > 0 && fcPct < 200 && (
                        <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: fcBg, color: fcColor, whiteSpace: 'nowrap' }}>
                          {fcPct.toFixed(1)}% FC
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--admin-border2)', padding: '14px 18px', background: 'var(--admin-subcard)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ color: '#94a3b8', fontWeight: 600 }}>
                            <td style={{ padding: '4px 8px 8px 0' }}>Ingredient</td>
                            <td style={{ padding: '4px 8px 8px 0' }}>Supplier</td>
                            <td style={{ padding: '4px 8px 8px', textAlign: 'right' }}>Qty</td>
                            <td style={{ padding: '4px 8px 8px', textAlign: 'right' }}>Unit</td>
                            <td style={{ padding: '4px 8px 8px 0', textAlign: 'right' }}>Cost</td>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.ingredients.filter(ing => ing.name).map((ing, j) => {
                            const sup = findSupplier(ing.name)
                            return (
                            <tr key={j} style={{ borderTop: '1px solid var(--admin-border2)' }}>
                              <td style={{ padding: '7px 8px 7px 0', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>{ing.name}</td>
                              <td style={{ padding: '7px 8px 7px 0', maxWidth: 180 }}>
                                {sup ? (
                                  <div>
                                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sup.supplier}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{sup.price > 0 ? `${sup.price} SAR/${sup.unit}` : ''}</div>
                                  </div>
                                ) : <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>}
                              </td>
                              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#64748b' }}>{ing.qty}</td>
                              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#64748b' }}>{ing.unit}</td>
                              <td style={{ padding: '7px 0 7px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>
                                {ing.totalCost > 0 ? `${ing.totalCost.toFixed(4)} SAR` : '—'}
                              </td>
                            </tr>
                          )})}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: '2px solid var(--admin-border2)' }}>
                            <td colSpan={3} style={{ padding: '8px 8px 4px 0', fontWeight: 700, color: 'var(--admin-text)', fontSize: 13 }}>Total Food Cost</td>
                            <td style={{ padding: '8px 0 4px 8px', textAlign: 'right', fontWeight: 800, color: '#25D366', fontSize: 13 }}>{recipe.totalCost.toFixed(4)} SAR</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ITEMS TAB ── */}
      {tab === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items, code, supplier..."
              style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1px solid var(--admin-border2)', borderRadius: 10, fontSize: 13, background: 'var(--admin-card)', color: 'var(--admin-text)' }}
            />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ padding: '9px 14px', border: '1px solid var(--admin-border2)', borderRadius: 10, fontSize: 13, background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer' }}>
              <option value="all">All Categories</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{filtered.length} results</span>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--admin-subcard)', borderBottom: '1px solid var(--admin-border2)' }}>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Code</th>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('name')}>
                      Item Name <SortArrow col="name" />
                    </th>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('category')}>
                      Category <SortArrow col="category" />
                    </th>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Unit</th>
                    <th style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('price')}>
                      Price (SAR) <SortArrow col="price" />
                    </th>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Supplier</th>
                    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const c = cc(item.category)
                    return (
                      <tr key={String(item.code) + i} style={{ borderBottom: '1px solid var(--admin-border2)', transition: 'background 0.1s' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-subcard)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{String(item.code).slice(0, 8)}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--admin-text)', maxWidth: 260 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          {item.subCategory && item.subCategory !== item.category && (
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{item.subCategory}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{item.unit}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>
                          {item.price > 0 ? item.price.toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '10px 16px', color: '#64748b', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.supplier}</div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {item.location && (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569' }}>
                              {item.location}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPPLIERS TAB ── */}
      {tab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)}
            placeholder="Search suppliers..."
            style={{ padding: '9px 14px', border: '1px solid var(--admin-border2)', borderRadius: 10, fontSize: 13, background: 'var(--admin-card)', color: 'var(--admin-text)', maxWidth: 400 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredSuppliers.map((s, i) => (
              <div key={i} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border2)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#475569', flexShrink: 0 }}>
                  {(s.name[0] || '#').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 6 }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.categories.slice(0, 4).map(cat => {
                      const c = cc(cat)
                      return <span key={cat} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.text }}>{cat}</span>
                    })}
                    {s.categories.length > 4 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{s.categories.length - 4} more</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                  {s.locations.filter(Boolean).slice(0, 2).map(loc => (
                    <span key={loc} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>{loc}</span>
                  ))}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#25D366' }}>{s.itemCount}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>items</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WASTAGE TAB ── */}
      {tab === 'wastage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Vegetables */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>Vegetables</h2>
            <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-subcard)', borderBottom: '1px solid var(--admin-border2)' }}>
                      {['Ingredient', 'Unit', 'Qty (g)', 'Wastage (g)', 'Waste %', 'Price/Kg', 'Final Price'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Qty (g)' || h === 'Wastage (g)' || h === 'Waste %' || h === 'Price/Kg' || h === 'Final Price' ? 'right' : 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WASTAGE.vegetables.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--admin-border2)' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-subcard)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--admin-text)' }}>{v.name}</td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{v.unit}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748b' }}>{v.qty.toLocaleString()}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#ef4444' }}>{v.waste.toLocaleString()}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: v.wastePct > 0.5 ? '#fef2f2' : v.wastePct > 0.2 ? '#fef3c7' : '#f0fdf4',
                            color: v.wastePct > 0.5 ? '#dc2626' : v.wastePct > 0.2 ? '#d97706' : '#16a34a' }}>
                            {(v.wastePct * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748b' }}>{v.pricePerKg} SAR</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{typeof v.finalPrice === 'number' ? v.finalPrice.toFixed(3) : v.finalPrice} SAR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Proteins */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>Proteins</h2>
            <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-border2)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-subcard)', borderBottom: '1px solid var(--admin-border2)' }}>
                      {['Ingredient', 'Unit', 'Qty (g)', 'Wastage (g)', 'Waste %', 'Price/Kg', 'Final Price'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Qty (g)' || h === 'Wastage (g)' || h === 'Waste %' || h === 'Price/Kg' || h === 'Final Price' ? 'right' : 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WASTAGE.proteins.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--admin-border2)' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-subcard)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--admin-text)' }}>{p.name}</td>
                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{p.unit}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748b' }}>{p.qty.toLocaleString()}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#ef4444' }}>{p.waste.toLocaleString()}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: p.wastePct > 0.5 ? '#fef2f2' : p.wastePct > 0.2 ? '#fef3c7' : '#f0fdf4',
                            color: p.wastePct > 0.5 ? '#dc2626' : p.wastePct > 0.2 ? '#d97706' : '#16a34a' }}>
                            {(p.wastePct * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748b' }}>{p.pricePerKg} SAR</td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{typeof p.finalPrice === 'number' ? p.finalPrice.toFixed(3) : p.finalPrice} SAR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
