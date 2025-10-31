import { LoadingSpinner } from './loading-spinner'
import { cn } from '@/lib/utils'

interface LoadingPageProps {
  message?: string
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'white' | 'gray' | 'green' | 'red' | 'yellow' | 'purple'
  layout?: 'centered' | 'top' | 'inline'
  className?: string
  showBackground?: boolean
}

export function LoadingPage({
  message = 'Loading...',
  variant = 'spinner',
  size = 'lg',
  color = 'blue',
  layout = 'centered',
  className = '',
  showBackground = true
}: LoadingPageProps) {
  const layoutClasses = {
    centered: 'flex items-center justify-center min-h-screen',
    top: 'flex items-center justify-center min-h-64',
    inline: 'flex items-center justify-center'
  }

  const backgroundClasses = showBackground 
    ? 'bg-white dark:bg-gray-900' 
    : ''

  return (
    <div className={cn(layoutClasses[layout], backgroundClasses, className)}>
      <LoadingSpinner
        size={size}
        color={color}
        variant={variant}
        message={message}
        showMessage={true}
      />
    </div>
  )
} 