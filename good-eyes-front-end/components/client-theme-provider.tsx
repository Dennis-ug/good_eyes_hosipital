'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider as OriginalThemeProvider } from '@/lib/theme-context'

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a simple div with the same structure during SSR
    return <div suppressHydrationWarning={true}>{children}</div>
  }

  return <OriginalThemeProvider>{children}</OriginalThemeProvider>
} 