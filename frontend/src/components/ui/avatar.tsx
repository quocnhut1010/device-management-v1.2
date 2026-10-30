import * as React from 'react'

interface AvatarContextValue {
  imageLoaded: boolean
  setImageLoaded: (loaded: boolean) => void
}

const AvatarContext = React.createContext<AvatarContextValue | undefined>(undefined)

export function Avatar({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  return (
    <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
      <div className={`ui-avatar ${className}`.trim()}>{children}</div>
    </AvatarContext.Provider>
  )
}

export function AvatarImage({ src, alt = '' }: { src: string; alt?: string }) {
  const context = React.useContext(AvatarContext)

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => context?.setImageLoaded(true)}
      onError={() => context?.setImageLoaded(false)}
      className="ui-avatar-img"
      style={{ display: context?.imageLoaded ? 'block' : 'none' }}
    />
  )
}

export function AvatarFallback({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const context = React.useContext(AvatarContext)

  if (context?.imageLoaded) return null

  return <div className={`ui-avatar-fallback ${className}`.trim()}>{children}</div>
}
