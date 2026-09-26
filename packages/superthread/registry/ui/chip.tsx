import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export function Chip({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center rounded-xs border border-line-strong px-sm py-[2px] font-label text-[length:var(--text-label)] leading-[1.3] tracking-label text-ink-muted', className)} {...props} />
}
