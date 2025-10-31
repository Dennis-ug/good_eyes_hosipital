import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'white' | 'gray' | 'green' | 'red' | 'yellow' | 'purple'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  className?: string
  message?: string
  showMessage?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  variant = 'spinner',
  className = '',
  message = 'Loading...',
  showMessage = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const colorClasses = {
    blue: 'border-blue-600 text-blue-600',
    white: 'border-white text-white',
    gray: 'border-gray-600 text-gray-600',
    green: 'border-green-600 text-green-600',
    red: 'border-red-600 text-red-600',
    yellow: 'border-yellow-600 text-yellow-600',
    purple: 'border-purple-600 text-purple-600'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={cn("flex space-x-1", sizeClasses[size])}>
            <div className={cn("bg-current rounded-full animate-bounce", colorClasses[color])} style={{ animationDelay: '0ms' }} />
            <div className={cn("bg-current rounded-full animate-bounce", colorClasses[color])} style={{ animationDelay: '150ms' }} />
            <div className={cn("bg-current rounded-full animate-bounce", colorClasses[color])} style={{ animationDelay: '300ms' }} />
          </div>
        )
      
      case 'pulse':
        return (
          <div className={cn("bg-current rounded-full animate-pulse", sizeClasses[size], colorClasses[color])} />
        )
      
      case 'bars':
        return (
          <div className={cn("flex space-x-1", sizeClasses[size])}>
            <div className={cn("bg-current animate-pulse", colorClasses[color])} style={{ width: '3px', animationDelay: '0ms' }} />
            <div className={cn("bg-current animate-pulse", colorClasses[color])} style={{ width: '3px', animationDelay: '150ms' }} />
            <div className={cn("bg-current animate-pulse", colorClasses[color])} style={{ width: '3px', animationDelay: '300ms' }} />
          </div>
        )
      
      default:
        return (
          <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-current", sizeClasses[size], colorClasses[color])} />
        )
    }
  }

  if (showMessage) {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        {renderSpinner()}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {renderSpinner()}
    </div>
  )
} 