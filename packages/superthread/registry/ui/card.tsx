import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-sm border border-line bg-surface p-md text-ink shadow-none transition-[transform,border-color,box-shadow] duration-200 ease-snap hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_30px_var(--ground-deep)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-thread-bright motion-reduce:transform-none motion-reduce:transition-none', className)} {...props} />
}
export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('font-display-ui text-[length:var(--text-display-ui)] font-semibold leading-[1.3] tracking-[-0.015em] text-ink', className)} {...props} />
}
export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('font-body text-[length:var(--text-body)] text-ink-muted', className)} {...props} />
}
