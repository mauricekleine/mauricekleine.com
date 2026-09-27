---
version: alpha
name: superthread
description: maurice kleine's shadcn theme. paper by default, void under .dark.
colors:
  paper-background: "#fbfaf7"
  paper-foreground: "#1a1a1a"
  paper-card: "#f4f2ed"
  paper-card-foreground: "#1a1a1a"
  paper-popover: "#f4f2ed"
  paper-popover-foreground: "#1a1a1a"
  paper-primary: "oklch(55% 0.13 55)"
  paper-primary-foreground: "#fbfaf7"
  paper-secondary: "#f4f2ed"
  paper-secondary-foreground: "#1a1a1a"
  paper-muted: "#f4f2ed"
  paper-muted-foreground: "#55524c"
  paper-accent: "oklch(94% 0.035 60)"
  paper-accent-foreground: "#1a1a1a"
  paper-destructive: "#735853"
  paper-border: "#d9d5cc"
  paper-input: "#d9d5cc"
  paper-ring: "oklch(48% 0.14 52)"
  void-background: "oklch(17% 0.035 275)"
  void-foreground: "oklch(94% 0.01 85)"
  void-card: "oklch(20% 0.035 278)"
  void-card-foreground: "oklch(94% 0.01 85)"
  void-popover: "oklch(20% 0.035 278)"
  void-popover-foreground: "oklch(94% 0.01 85)"
  void-primary: "oklch(75% 0.13 55)"
  void-primary-foreground: "oklch(13% 0.03 280)"
  void-secondary: "oklch(20% 0.035 278)"
  void-secondary-foreground: "oklch(94% 0.01 85)"
  void-muted: "oklch(20% 0.035 278)"
  void-muted-foreground: "oklch(76% 0.02 275)"
  void-accent: "oklch(75% 0.13 55 / 0.13)"
  void-accent-foreground: "oklch(94% 0.01 85)"
  void-destructive: "oklch(64% 0.19 25)"
  void-border: "oklch(30% 0.03 278)"
  void-input: "oklch(30% 0.03 278)"
  void-ring: "oklch(84% 0.12 65)"
fonts:
  sans: Supreme
  serif: Erode
  mono: Fragment Mono
  display: Panchang
radius: 8px
---

# superthread

One thread through Maurice's surfaces. This file defines the colors, fonts and radius for stock shadcn components. The generated CSS is the installable theme.

Paper is the light theme on `:root`. Void is `.dark`. Ember is `primary` in both modes. The paper shade is darker so it stays legible on light ground. `accent` is the quiet interactive surface used by ghost buttons and menus. The remaining colors map existing brand values onto shadcn's roles.

Supreme is sans, Erode is serif, Fragment Mono is mono and Panchang is display. The fourth font key is the only addition to Tailwind's standard font keys. Keep headings lowercase. Brand surfaces can add grain and stars in their own layout; neither changes component source.

Use shadcn's components and variants as installed. Change this file and regenerate the CSS when the shared theme changes.
