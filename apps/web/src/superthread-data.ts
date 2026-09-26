import tokens from '../../../packages/superthread/dist/tokens.json'

type Mode = 'void' | 'paper'
const names: Record<string, string> = {
  ground: 'night / paper', 'ground-deep': 'night-deep / paper', surface: 'panel', line: 'line', 'line-strong': 'strong line',
  ink: 'starlight / ink', 'ink-muted': 'muted', 'ink-dim': 'dim', 'ink-dim-ui': 'dim ui',
  thread: 'ember', 'thread-bright': 'ember-bright', 'thread-ink': 'thread ink', 'thread-soft': 'ember tint',
  'atmosphere-wash': 'nebula wash', atmosphere: 'nebula', danger: 'overdue', 'danger-soft': 'overdue tint',
}
const proposed = new Set(['surface', 'line-strong', 'ink-dim', 'ink-dim-ui', 'thread-bright'])

function hexRgb(value: string): [number, number, number] {
  const n = value.slice(1)
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255) as [number, number, number]
}
function rgb(value: string): { channels: [number, number, number]; alpha: number } {
  if (value.startsWith('#')) return { channels: hexRgb(value), alpha: 1 }
  const match = value.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/)
  if (!match) throw new Error(`unsupported token color ${value}`)
  const L = Number(match[1]) / 100, C = Number(match[2]), h = Number(match[3]) * Math.PI / 180
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return { channels: linear.map((v) => {
    const clipped = Math.min(1, Math.max(0, v))
    return clipped <= 0.0031308 ? clipped * 12.92 : 1.055 * clipped ** (1 / 2.4) - 0.055
  }) as [number, number, number], alpha: Number(match[4] ?? 1) }
}
function luminance(channels: [number, number, number]) {
  const [r, g, b] = channels.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(foreground: string, ground: string) {
  const fg = rgb(foreground), bg = rgb(ground)
  const mixed = fg.channels.map((v, i) => v * fg.alpha + bg.channels[i] * (1 - fg.alpha)) as [number, number, number]
  const a = luminance(mixed), b = luminance(bg.channels)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
export const colorModes = (['void', 'paper'] as const).map((mode: Mode) => {
  const ground = tokens.colors[`${mode}-ground`]
  return { mode, colors: Object.entries(tokens.colors).filter(([key]) => key.startsWith(`${mode}-`)).map(([key, value]) => {
    const role = key.slice(mode.length + 1)
    return { role, name: names[role] ?? role, value, contrast: contrast(value, ground).toFixed(1), proposed: mode === 'paper' && proposed.has(role) }
  }) }
})
export const scales = { typography: tokens.typography, spacing: tokens.spacing, rounded: tokens.rounded }
