'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'en' | 'ar'

interface LangContextType {
  lang: Lang
  toggle: () => void
  t: (en: string, ar: string) => string
  isAr: boolean
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  toggle: () => {},
  t: (en) => en,
  isAr: false,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as Lang | null
    if (saved === 'ar' || saved === 'en') setLang(saved)
  }, [])

  function toggle() {
    setLang(l => {
      const next = l === 'en' ? 'ar' : 'en'
      localStorage.setItem('admin_lang', next)
      return next
    })
  }

  const t = (en: string, ar: string) => lang === 'ar' ? ar : en

  return (
    <LangContext.Provider value={{ lang, toggle, t, isAr: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LangContext)
}
