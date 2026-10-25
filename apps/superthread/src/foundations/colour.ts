// Colour arithmetic for the foundations pages: WCAG contrast from the tokens' hex values, so every ratio the site
// prints is computed from the values it documents, never typed in.

// one sRGB channel, 0 to 255, in linear light
function linear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

// relative luminance of a #rrggbb colour; an alpha pair after it is ignored
export function luminance(hex: string): number {
  const rgb = Number.parseInt(hex.slice(1, 7), 16);
  return 0.2126 * linear((rgb >> 16) & 255) + 0.7152 * linear((rgb >> 8) & 255) + 0.0722 * linear(rgb & 255);
}

export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// a ratio as the pages print it: two decimals, so it matches the master's own records
export const ratio = (a: string, b: string): string => contrast(a, b).toFixed(2);

// whichever of two inks reads better on a fill: the wedge prints each step's label in it
export function inkOn(fill: string, light: string, dark: string): string {
  return contrast(fill, light) >= contrast(fill, dark) ? light : dark;
}
