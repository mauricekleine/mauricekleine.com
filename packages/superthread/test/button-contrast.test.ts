import { expect, test } from 'bun:test'
import tokens from '../dist/tokens.json'
import { buttonVariants } from '../registry/ui/button'

type Color = { channels: [number, number, number]; alpha: number }

function color(value: string): Color {
  if (value.startsWith('#')) {
    const channels = [0, 2, 4].map((index) => Number.parseInt(value.slice(index + 1, index + 3), 16) / 255)
    return { channels: channels as Color['channels'], alpha: 1 }
  }
  const match = value.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/)
  if (!match) throw new Error(`unsupported token color: ${value}`)
  const lightness = Number(match[1]) / 100
  const chroma = Number(match[2])
  const hue = Number(match[3]) * Math.PI / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return {
    channels: linear.map((channel) => {
      const clipped = Math.min(1, Math.max(0, channel))
      return clipped <= 0.0031308 ? clipped * 12.92 : 1.055 * clipped ** (1 / 2.4) - 0.055
    }) as Color['channels'],
    alpha: Number(match[4] ?? 1),
  }
}

function over(foreground: Color, background: Color): Color {
  return {
    channels: foreground.channels.map((channel, index) => channel * foreground.alpha + background.channels[index] * (1 - foreground.alpha)) as Color['channels'],
    alpha: 1,
  }
}

function luminance({ channels }: Color): number {
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(foreground: Color, background: Color): number {
  const a = luminance(over(foreground, background))
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

test('button variants keep token colors independent of size and neutralize disabled state', () => {
  for (const size of ['default', 'compact', 'icon'] as const) {
    expect(buttonVariants({ variant: 'primary', size })).toContain('bg-thread text-thread-ink')
  }
  for (const variant of ['primary', 'secondary', 'ghost', 'danger'] as const) {
    const classes = buttonVariants({ variant })
    expect(classes).toContain('disabled:cursor-not-allowed')
    expect(classes).toContain('disabled:border-line')
    expect(classes).toContain('disabled:bg-surface')
    expect(classes).toContain('disabled:text-ink-dim')
  }
  expect(buttonVariants({ variant: 'danger' })).toContain('bg-danger text-ground')
})

test('primary and destructive button text reaches WCAG AA in both modes', () => {
  const colors: Record<string, string> = tokens.colors
  for (const mode of ['void', 'paper'] as const) {
    const token = (role: string) => color(colors[`${mode}-${role}`])
    expect(contrast(token('thread-ink'), token('thread'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token('thread-ink'), token('thread-bright'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token('ground'), token('danger'))).toBeGreaterThanOrEqual(4.5)
  }
})
