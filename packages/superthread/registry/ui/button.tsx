import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-sm px-lg font-body text-[length:var(--text-body)] font-semibold transition-[background-color,border-color,color,transform] duration-200 ease-snap outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none',
  { variants: {
    variant: {
      primary: 'bg-thread text-thread-ink hover:bg-thread-bright',
      secondary: 'border border-line-strong bg-surface text-ink hover:border-thread-bright',
      ghost: 'text-ink hover:bg-thread-soft hover:text-thread-bright',
      danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-ground',
    },
    size: {
      default: 'h-10 px-lg',
      compact: 'h-8 min-h-8 px-md text-sm',
      icon: 'size-10 p-0',
    },
  }, defaultVariants: { variant: 'primary', size: 'default' } },
)

export function Button({ className, variant, size, ...props }: ComponentProps<typeof BaseButton> & VariantProps<typeof buttonVariants>) {
  return <BaseButton className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
