const EDITABLE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="searchbox"], [role="combobox"]';

// Input types that take no typed text, so a letter pressed on one is free.
const KEYLESS_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

// A modal holds the page back, and a menu or a list jumps to the item a letter starts, so keys pressed inside one stay
// there. A native dialog is a modal with no role attribute to read.
const KEEPS_ITS_KEYS = 'dialog, [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

// A key pressed in an iframe or a window the page opened targets an instance of that window's classes, so these read
// the node itself and never ask instanceof.
const isElement = (target: EventTarget | null): target is Element =>
  (target as Node | null)?.nodeType === Node.ELEMENT_NODE;

function typesText(target: Element) {
  const field = target.closest(EDITABLE);
  return field !== null && !(field.localName === "input" && KEYLESS_INPUTS.has((field as HTMLInputElement).type));
}

/**
 * Whether a keydown is the bare key a page answers: that key and no modifier, not held down, not part of a composition,
 * not taken by anything else, and pressed away from editable text and from any layer that keeps its own keys. Letters
 * match in either case, so caps lock changes nothing.
 */
export function isPageKey(event: KeyboardEvent, key: string) {
  if (event.defaultPrevented || event.repeat || event.isComposing) return false;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return false;
  // A browser's autofill sends a keydown with no key.
  if (event.key?.toLowerCase() !== key.toLowerCase()) return false;
  const target = event.target;
  return !(isElement(target) && (typesText(target) || target.closest(KEEPS_ITS_KEYS)));
}
