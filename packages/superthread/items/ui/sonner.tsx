import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Icon } from "@/components/superthread/ui/glyphs"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <Icon name="tick" className="size-4" />
        ),
        info: (
          <Icon name="i" className="size-4" />
        ),
        warning: (
          <Icon name="pause" className="size-4" />
        ),
        error: (
          <Icon name="cross" className="size-4" />
        ),
        loading: (
          <Icon name="i" className="size-4" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
