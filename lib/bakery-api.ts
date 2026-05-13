'use client'

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api/bakery${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

async function upload(path: string, formData: FormData, method = 'POST') {
  const res = await fetch(`/api/bakery${path}`, { method, body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}

export const bakeryApi = {
  auth: {
    login: (username: string, password: string) => req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    me: () => req('/auth/me'),
    logout: () => req('/auth/logout', { method: 'POST' }),
  },
  products: {
    list: () => req('/products'),
    save: (body: object) => 'id' in body ? req('/products', { method: 'PUT', body: JSON.stringify(body) }) : req('/products', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req('/products', { method: 'DELETE', body: JSON.stringify({ id }) }),
  },
  customers: {
    list: () => req('/customers'),
    save: (body: object) => 'id' in body ? req('/customers', { method: 'PUT', body: JSON.stringify(body) }) : req('/customers', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req('/customers', { method: 'DELETE', body: JSON.stringify({ id }) }),
  },
  orders: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return req(`/orders${qs}`)
    },
    create: (fd: FormData) => upload('/orders', fd),
    updateStatus: (fd: FormData) => upload('/orders/status', fd, 'PUT'),
    delete: (id: number) => req('/orders/status', { method: 'DELETE', body: JSON.stringify({ id }) }),
  },
  staff: {
    list: () => req('/staff'),
    save: (body: object) => 'id' in body ? req('/staff', { method: 'PUT', body: JSON.stringify(body) }) : req('/staff', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req('/staff', { method: 'DELETE', body: JSON.stringify({ id }) }),
  },
  activity: { list: () => req('/activity') },
  reports: {
    summary: () => req('/reports/summary'),
    sales: (days = 7) => req(`/reports/sales?days=${days}`),
    topProducts: () => req('/reports/top-products'),
  },
}
