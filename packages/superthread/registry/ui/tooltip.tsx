import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { useRef, type ComponentProps } from 'react'
import { cn } from '../lib/utils'

export const TooltipProvider = BaseTooltip.Provider
export const Tooltip = BaseTooltip.Root
export function TooltipTrigger({ className, ...props }: ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger className={cn('outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright', className)} {...props} />
}
export function TooltipPortal({ container, ...props }: ComponentProps<typeof BaseTooltip.Portal>) {
  const local = useRef<HTMLSpanElement>(null)
  return <><span ref={local} style={{ display: 'contents' }} /><BaseTooltip.Portal container={container ?? local} {...props} /></>
}
export const TooltipPositioner = BaseTooltip.Positioner
export function TooltipPopup({ className, ...props }: ComponentProps<typeof BaseTooltip.Popup>) {
  return <BaseTooltip.Popup className={cn('z-60 max-w-64 rounded-xs border border-line-strong bg-surface px-md py-sm font-body text-sm text-ink shadow-[0_8px_24px_var(--ground-deep)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-150 ease-snap motion-reduce:transition-none', className)} {...props} />
}
