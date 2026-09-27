import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type Tokens = {
  colors: Record<string, string>
  fonts: Record<string, string>
  radius: string
}

const root = join(import.meta.dir, '..')
const roles = ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring']

export async function readTokens(): Promise<Tokens> {
  const source = await readFile(join(root, 'DESIGN.md'), 'utf8')
  return Bun.YAML.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]) as Tokens
}

export function themeCss(tokens: Tokens) {
  const colors = (mode: 'paper' | 'void') => roles.map((role) => `  --${role}: ${tokens.colors[`${mode}-${role}`]};`).join('\n')
  const voidExtras = Object.entries(tokens.colors).filter(([name]) => name.startsWith('void-') && !roles.includes(name.slice(5))).map(([name, value]) => `  --${name.slice(5)}: ${value};`).join('\n')
  const face = (family: string, file: string, weight: number) => `@font-face {\n  font-family: "${family}";\n  src: url("https://www.mauricekleine.com/fonts/${file}.woff2") format("woff2");\n  font-weight: ${weight};\n  font-display: swap;\n}`
  return `${[['Supreme', 'supreme-400', 400], ['Supreme', 'supreme-500', 500], ['Erode', 'erode-400', 400], ['Erode', 'erode-500', 500], ['Fragment Mono', 'fragment-mono-400', 400], ['Panchang', 'panchang-400', 400], ['Panchang', 'panchang-600', 600], ['Panchang', 'panchang-800', 800]].map(([family, file, weight]) => face(String(family), String(file), Number(weight))).join('\n\n')}

@custom-variant dark (&:is(.dark *));

@theme inline {
${roles.map((role) => `  --color-${role}: var(--${role});`).join('\n')}
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
${Object.entries(tokens.fonts).map(([key, family]) => `  --font-${key}: "${family}", ${key === 'mono' ? 'monospace' : key === 'serif' ? 'serif' : 'sans-serif'};`).join('\n')}
}

:root {
  color-scheme: light;
  --radius: ${tokens.radius};
${colors('paper')}
}

.dark {
  color-scheme: dark;
${colors('void')}
${voidExtras}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`
}

if (import.meta.main) {
  await mkdir(join(root, 'dist'), { recursive: true })
  await writeFile(join(root, 'dist/superthread.css'), themeCss(await readTokens()))
}
