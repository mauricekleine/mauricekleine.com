import { mountField } from "../items/lib/field-live";

for (const host of document.querySelectorAll<HTMLElement>("[data-field-art]")) mountField(host);
