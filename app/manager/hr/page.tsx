'use client'
import { AdminThemeProvider } from '@/app/admin/theme'
import { LanguageProvider } from '@/lib/language-context'
import HRPage from '@/app/admin/hr/page'

export default function ManagerHRPage() {
  return (
    <AdminThemeProvider>
      <LanguageProvider>
        <HRPage />
      </LanguageProvider>
    </AdminThemeProvider>
  )
}
