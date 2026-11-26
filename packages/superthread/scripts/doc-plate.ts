import { mountPlate } from "../items/lib/plate-core.ts";

for (const host of document.querySelectorAll<HTMLElement>("[data-plate], [data-plate-src]")) mountPlate(host);
