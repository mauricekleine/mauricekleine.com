import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export const Tabs = BaseTabs.Root
export function TabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return <BaseTabs.List className={cn('flex gap-xs border-b border-line', className)} {...props} />
}
export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return <BaseTabs.Tab className={cn('border-b-2 border-transparent px-md py-sm font-body text-[length:var(--text-body)] text-ink-muted outline-none transition-colors duration-150 ease-snap hover:text-ink data-[active]:border-thread data-[active]:text-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright motion-reduce:transition-none', className)} {...props} />
}
export function TabsContent({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn('py-lg font-body text-[length:var(--text-body)] text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright', className)} {...props} />
}
