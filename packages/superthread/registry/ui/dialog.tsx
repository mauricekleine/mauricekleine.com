import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { useRef, type ComponentProps } from 'react'
import { cn } from '../lib/utils'

export const Dialog = BaseDialog.Root
export function DialogTrigger({ className, ...props }: ComponentProps<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger className={cn('outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright', className)} {...props} />
}
export function DialogPortal({ container, ...props }: ComponentProps<typeof BaseDialog.Portal>) {
  const local = useRef<HTMLSpanElement>(null)
  return <><span ref={local} style={{ display: 'contents' }} /><BaseDialog.Portal container={container ?? local} {...props} /></>
}
export function DialogClose({ className, ...props }: ComponentProps<typeof BaseDialog.Close>) {
  return <BaseDialog.Close className={cn('outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright', className)} {...props} />
}

export function DialogBackdrop({ className, ...props }: ComponentProps<typeof BaseDialog.Backdrop>) {
  return <BaseDialog.Backdrop className={cn('fixed inset-0 z-40 bg-ground-deep/80 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200 ease-snap motion-reduce:transition-none', className)} {...props} />
}
export function DialogPopup({ className, ...props }: ComponentProps<typeof BaseDialog.Popup>) {
  return <BaseDialog.Popup className={cn('fixed left-1/2 top-1/2 z-50 w-[min(34rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-md border border-line-strong bg-surface p-xl font-body text-ink shadow-[0_24px_80px_var(--ground-deep)] outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-[opacity,transform] duration-200 ease-snap focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright motion-reduce:transition-none', className)} {...props} />
}
export function DialogTitle({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn('m-0 font-display-lg text-[length:var(--text-display-lg)] font-semibold leading-tight text-ink', className)} {...props} />
}
export function DialogDescription({ className, ...props }: ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn('mt-md font-body text-[length:var(--text-body)] text-ink-muted', className)} {...props} />
}
