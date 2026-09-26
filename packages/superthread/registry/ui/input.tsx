import { Input as BaseInput } from '@base-ui/react/input'
import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export function Input({ className, ...props }: ComponentProps<typeof BaseInput>) {
  return <BaseInput className={cn('h-10 w-full rounded-sm border border-line bg-surface px-md font-body text-[length:var(--text-body)] text-ink placeholder:text-ink-muted outline-none transition-colors duration-200 ease-snap hover:border-line-strong focus-visible:border-thread-bright focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright disabled:opacity-50 motion-reduce:transition-none', className)} {...props} />
}
