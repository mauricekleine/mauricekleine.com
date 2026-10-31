import type { MarkId } from "./marks.ts";
import type { Mode } from "./master.ts";

export const pngSizes = [16, 32, 48, 64, 128, 256, 512, 1024] as const;
export const markPngUrl = (id: MarkId, mode: Mode, size: number) => `/marks/${id}/png/${id}-${mode}-${size}.png`;
export const markZipUrl = (id: MarkId) => `/marks/${id}/${id}.zip`;
export const allMarksZipUrl = "/marks/superthread-icons.zip";
