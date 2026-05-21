import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ghabashi | غبـاشـي',
  description: 'Ghabashi restaurant menu - Riyadh, Saudi Arabia',
}

export default function GhabashiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
