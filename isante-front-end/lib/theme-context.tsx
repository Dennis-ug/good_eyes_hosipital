'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Declare global property for theme hydration
declare global {
  interface Window {
    __THEME_APPLIED__?: boolean
  }
}

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Get initial theme from data attribute to prevent hydration mismatch
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof document !== 'undefined') {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme
      }
    }
    return 'light'
  }

  // Always render the same content on server and client initially
  const safeResolvedTheme = mounted ? resolvedTheme : getInitialTheme()

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      console.log('Loading saved theme:', savedTheme)
      setTheme(savedTheme)
    } else {
      // Set default theme and save to localStorage
      const defaultTheme: Theme = 'system'
      console.log('Setting default theme:', defaultTheme)
      setTheme(defaultTheme)
      localStorage.setItem('theme', defaultTheme)
    }
  }, [])

  useEffect(() => {
    // Don't apply theme changes during initial render
    if (!mounted) {
      return
    }

    // Save theme to localStorage
    console.log('Saving theme to localStorage:', theme)
    localStorage.setItem('theme', theme)

    // Determine resolved theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      console.log('System theme detected:', systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      console.log('Setting resolved theme to:', theme)
      setResolvedTheme(theme)
    }
  }, [theme, mounted])

  // Apply theme when resolvedTheme changes
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      console.log('Applying theme to document:', resolvedTheme)
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.setAttribute('data-theme', resolvedTheme)
    }
  }, [resolvedTheme, mounted])

  useEffect(() => {
    if (!mounted) return

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        console.log('System theme changed to:', newTheme)
        setResolvedTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: safeResolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 