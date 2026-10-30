import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const variantClass = `btn-${variant}`
    const sizeClass = size !== 'default' ? `btn-size-${size}` : ''

    return (
      <button
        ref={ref}
        className={`ui-btn ${variantClass} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
