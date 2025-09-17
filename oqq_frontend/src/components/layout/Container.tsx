// src/components/layout/Container.tsx
import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

// On retire undefined des clés pour Record
type SizeKey = NonNullable<ContainerProps['size']>
type PaddingKey = NonNullable<ContainerProps['padding']>

/**
 * Composant Container responsive pour oùquandquoi.fr
 */
const Container: React.FC<ContainerProps> = ({
  children,
  size = 'md',
  padding = 'md',
  className = ''
}) => {
  // Mapping des tailles
  const sizeClasses: Record<SizeKey, string> = {
    sm:   'max-w-2xl',
    md:   'max-w-4xl',
    lg:   'max-w-6xl',
    xl:   'max-w-7xl',
    full: 'max-w-none'
  }

  // Mapping des paddings
  const paddingClasses: Record<PaddingKey, string> = {
    none: '',
    sm:   'px-4 py-2',
    md:   'px-4 py-6 sm:px-6 lg:px-8',
    lg:   'px-4 py-8 sm:px-6 lg:px-12'
  }

  const combinedClasses = [
    'mx-auto w-full',
    sizeClasses[size],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ')

  return <div className={combinedClasses}>{children}</div>
}

export default Container
