// a stub until the plates are committed: `build.py plates --ts src/site/texture.gen.ts` replaces this file, and from
// then on it is generated, never edited by hand. Plate.tsx prints a flat field for any plate named here that is not.
export const plates = {} as const;

export type PlateName = keyof typeof plates;
