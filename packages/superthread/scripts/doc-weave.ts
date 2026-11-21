import { mountWeave } from "../items/lib/weave-core.ts";

for (const host of document.querySelectorAll<HTMLElement>("[data-weave]")) mountWeave(host);
