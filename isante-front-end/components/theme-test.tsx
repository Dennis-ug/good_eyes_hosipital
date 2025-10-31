'use client'

import { useTheme } from '@/lib/theme-context'

export function ThemeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="text-sm">
        <div>Theme: {theme}</div>
        <div>Resolved: {resolvedTheme}</div>
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => setTheme('light')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Dark
          </button>
          <button 
            onClick={() => setTheme('system')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            System
          </button>
        </div>
      </div>
    </div>
  )
} 