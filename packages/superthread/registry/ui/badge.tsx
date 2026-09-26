import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

const badgeVariants = cva('inline-flex items-center gap-sm rounded-pill px-sm py-xs font-label text-[length:var(--text-label)] leading-none tracking-label', {
  variants: { state: {
    neutral: 'bg-surface text-ink-muted',
    attention: 'bg-thread-soft text-thread-bright',
    danger: 'bg-danger-soft text-danger',
  } }, defaultVariants: { state: 'neutral' },
})
const dotVariants = cva('size-[5px] shrink-0 rounded-full', {
  variants: { state: {
    neutral: 'bg-ink-muted', attention: 'bg-thread', danger: 'bg-danger',
  } }, defaultVariants: { state: 'neutral' },
})

export function Badge({ className, state, children, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ state }), className)} {...props}><span aria-hidden="true" className={dotVariants({ state })} />{children}</span>
}
