import { mountDocNotes } from "../items/lib/doc-notes.ts";

if (document.querySelector("[data-doc-notes]") || document.documentElement.hasAttribute("data-doc-notes")) {
  mountDocNotes(document);
}
