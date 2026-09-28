---
version: alpha
name: superthread
description: maurice kleine's shadcn theme. paper by default, void under .dark.
colors:
  paper-background: "#fbfaf7"
  paper-foreground: "#0a0a0a"
  paper-card: "#f4f2ed"
  paper-card-foreground: "#0a0a0a"
  paper-popover: "#f4f2ed"
  paper-popover-foreground: "#0a0a0a"
  paper-primary: "oklch(55% 0.13 55)"
  paper-primary-foreground: "#fbfaf7"
  paper-secondary: "#f4f2ed"
  paper-secondary-foreground: "#0a0a0a"
  paper-muted: "#e8e3da"
  paper-muted-foreground: "#55524c"
  paper-accent: "oklch(94% 0.035 60)"
  paper-accent-foreground: "#0a0a0a"
  paper-destructive: "#735853"
  paper-border: "#d9d5cc"
  paper-input: "#898276"
  paper-ring: "oklch(48% 0.14 52)"
  paper-sidebar: "#f4f2ed"
  paper-sidebar-foreground: "#0a0a0a"
  paper-sidebar-primary: "oklch(55% 0.13 55)"
  paper-sidebar-primary-foreground: "#fbfaf7"
  paper-sidebar-accent: "oklch(94% 0.035 60)"
  paper-sidebar-accent-foreground: "#0a0a0a"
  paper-sidebar-border: "#d9d5cc"
  paper-sidebar-ring: "oklch(48% 0.14 52)"
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
  void-muted: "oklch(26% 0.03 278)"
  void-muted-foreground: "oklch(76% 0.02 275)"
  void-accent: "oklch(75% 0.13 55 / 0.13)"
  void-accent-foreground: "oklch(94% 0.01 85)"
  void-destructive: "oklch(64% 0.19 25)"
  void-border: "oklch(30% 0.03 278)"
  void-input: "oklch(50% 0.03 278)"
  void-ring: "oklch(84% 0.12 65)"
  void-sidebar: "oklch(20% 0.035 278)"
  void-sidebar-foreground: "oklch(94% 0.01 85)"
  void-sidebar-primary: "oklch(75% 0.13 55)"
  void-sidebar-primary-foreground: "oklch(13% 0.03 280)"
  void-sidebar-accent: "oklch(75% 0.13 55 / 0.13)"
  void-sidebar-accent-foreground: "oklch(94% 0.01 85)"
  void-sidebar-border: "oklch(30% 0.03 278)"
  void-sidebar-ring: "oklch(84% 0.12 65)"
fonts:
  sans: Supreme
  serif: Erode
  mono: Fragment Mono
  display: Unbounded
radius: 8px
---

# superthread

One thread through Maurice's surfaces. This file defines the colors, fonts and radius for stock shadcn components. The generated CSS is the installable theme.

Paper is the light theme on `:root`. Void is `.dark`. Ember is `primary` in both modes. The paper shade is darker so it stays legible on light ground. `accent` is the quiet interactive surface used by ghost buttons and menus. The remaining colors map existing brand values onto shadcn's roles.

Supreme is sans, Erode is serif, Fragment Mono is mono and Unbounded is display. The fourth font key is the only addition to Tailwind's standard font keys. Keep headings lowercase. Brand surfaces can add grain and stars in their own layout; neither changes component source.

Use shadcn's components and variants as installed. Change this file and regenerate the CSS when the shared theme changes.

The sidebar roles reuse card for the rail surface, foreground for labels, primary for actions, accent for the active and hover surface, border for the edge, and ring for focus in each mode.

## Type and density

- Paper reading: Erode `text-lg` (18px) at 1.65 line-height, 66ch measure. Controls use Supreme `text-sm` (14px) at 1.45. Use Unbounded for the app wordmark and short section or display lines.
- Void instruments: Supreme `text-sm` (14px) at 1.4 for row titles; Fragment Mono 12px at 1.45 for IDs, times and counts. Use Unbounded for the destination title or brand at 17–24px. Keep operational metadata at least 12px.
- Size ladder at 16px root: 12px metadata, 14px instrument body, 16px normal UI, 18px reading, 24px section, 32px page, 48px short hero, 64px exceptional display. Use `text-sm` for 14px, `text-base` for 16px, `text-lg` for 18px and `text-2xl` for 24px. On phones, cap ordinary page titles at 40px; use 28–32px for long titles. Unbounded line-height is 1.05–1.15; body line-height is 1.4–1.65.
- Read density: 18px prose and 48–56px list rows. Operate density: 14px titles, 12px meta and 44–48px pressable rows. Labels start at 12px, or 14px when they carry a choice. A 24px badge can sit inside a 44×44px pressable wrapper.
- Keep chrome headings lowercase. Preserve the casing of authored essays and chapters.

## Layout and shape

- Use Tailwind's 4px spacing grid: 8px within a fact pair (`gap-2`), 12px between peer controls (`gap-3`), 16px within a row or card (`gap-4`), 24px between groups (`gap-6`), 32px between sections (`gap-8`) and 48px between major reading sections (`gap-12`). Gutters are 16px on phones (`px-4`) and 24px on tablet and desktop (`px-6`). On operating screens, show one primary action or the first data row by 320px vertical position unless a deliberate setup state intervenes.
- Keep `--radius: 8px`. Use `rounded-sm` (~5px) for compact controls, `rounded-md` (~6px) for inputs and buttons, `rounded-lg` (8px) for cards and menus, and `rounded-xl` (~11px) for large overlays. Use stock Badge or a genuine status chip for pills.
- Background is the base; card and popover are raised by their theme colors and border. Paper: `#fbfaf7` / `#f4f2ed` / `#d9d5cc`. Void: `oklch(17% 0.035 275)` / `oklch(20% 0.035 278)` / `oklch(30% 0.03 278)`. Use a border or rule for inline rows. Keep stock overlay shadows.

## Interaction

- Use `primary` ember for the current or next action and selection, `destructive` for errors, and `muted-foreground` for settled or neutral states. Use words with status color. App identity colors belong in atmosphere, charts, progress data and marks, never as another focus or action color.
- Keep stock shadcn focus untouched. Give app-authored links, rows and canvases a 2px solid `--ring` outline with 2px offset on keyboard focus. Add text or shape change to keyboard-selected data.
- Keep stock component motion. For app-authored effects use 120ms for hover or pressed color, 180ms for menus and disclosures, and at most 240ms for sheets and dialog travel, with `cubic-bezier(0.22, 1, 0.36, 1)`. Keep data lists in place during state changes. Under reduced motion, remove travel and repeating atmosphere while showing an immediate color, border or text change.
