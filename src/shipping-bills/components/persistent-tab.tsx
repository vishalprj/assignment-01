import { ReactNode } from 'react'

export interface PersistentTabProps {
  value: string
  activeTab: string
  children: ReactNode
  className?: string
}

/**
 * Tab panel that keeps form fields mounted in the DOM (hidden via CSS)
 * so that React Hook Form preserves state and validates all fields across tabs.
 */
export function PersistentTab({ value, activeTab, children, className = '' }: PersistentTabProps) {
  const isSelected = activeTab === value

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      hidden={!isSelected}
      className={`mt-4 outline-none ${isSelected ? 'animate-in fade-in-50 block duration-150' : 'hidden'} ${className}`}>
      {children}
    </div>
  )
}
