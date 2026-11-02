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
// there.
const KEEPS_ITS_KEYS = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

function typesText(target: Element) {
  const field = target.closest(EDITABLE);
  return field !== null && !(field instanceof HTMLInputElement && KEYLESS_INPUTS.has(field.type));
}

/**
 * Whether a keydown is the bare key a page answers: that key and no modifier, not held down, not part of a composition,
 * not taken by anything else, and pressed away from editable text and from any layer that keeps its own keys. Letters
 * match in either case, so caps lock changes nothing.
 */
export function isPageKey(event: KeyboardEvent, key: string) {
  if (event.defaultPrevented || event.repeat || event.isComposing) return false;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return false;
  if (event.key.toLowerCase() !== key.toLowerCase()) return false;
  const target = event.target;
  return !(target instanceof Element && (typesText(target) || target.closest(KEEPS_ITS_KEYS)));
}
