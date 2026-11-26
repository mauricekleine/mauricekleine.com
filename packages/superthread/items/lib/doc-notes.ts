export const NOTE_TAGS = ["Note", "Change", "Agree", "Question", "Discuss"] as const;
export type DocNoteTag = (typeof NOTE_TAGS)[number];

export type DocNote = {
  id: string;
  section: string;
  tag: DocNoteTag;
  quote: string;
  comment: string;
};

type DocNotesController = {
  open: (tab?: "list" | "export") => void;
  close: () => void;
  exportMarkdown: () => string;
  destroy: () => void;
};

const activeControllers = new WeakMap<Document, DocNotesController>();

function detectSection(node: Node): string {
  const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
  if (!el) return "General";
  const header = el.closest("header");
  if (header) return "Opener";
  const sec = el.closest("section[id], .group[id], .sec[id]");
  if (sec) {
    const heading = sec.querySelector(".chapter-word, .sec-head, .band-word, h2, h3");
    const title = heading?.textContent?.replace(/\s+/g, " ").trim();
    if (title) return title;
    if (sec.id) return sec.id.replaceAll("-", " ");
  }
  return "General";
}

function collectSections(doc: Document): string[] {
  const seen = new Set<string>(["Opener"]);
  for (const el of doc.querySelectorAll("section[id], .group[id], .sec[id]")) {
    const heading = el.querySelector(".chapter-word, .sec-head, .band-word, h2, h3");
    const label = heading?.textContent?.replace(/\s+/g, " ").trim() || el.id.replaceAll("-", " ");
    if (label) seen.add(label);
  }
  seen.add("General");
  return [...seen];
}

function isInsideNoteUI(node: Node | null): boolean {
  const el = node && (node.nodeType === 1 ? (node as Element) : node.parentElement);
  return Boolean(el?.closest("[data-doc-notes-ui], .top, button, input, textarea, select"));
}

/** Mount inline text highlighting, margin notes and Markdown export on a Superthread document. */
export function mountDocNotes(doc: Document = document): DocNotesController | undefined {
  const existing = activeControllers.get(doc);
  if (existing) return existing;
  const win = doc.defaultView;
  if (!win || !doc.body) return;

  const notes: DocNote[] = [];
  let nextId = 1;
  let pendingRange: Range | null = null;
  let editingNoteId: string | null = null;
  let selectedTag: DocNoteTag = "Note";
  let generalTag: DocNoteTag = "Note";
  let toastTimer: number | undefined;
  let clearArmed = false;
  let clearTimer: number | undefined;

  let showFab = true;
  try {
    if (win.frameElement && !doc.querySelector("main")) showFab = false;
  } catch {
    // opaque-origin iframe: treat as a standalone document and show the launcher
  }

  // Floating composer popover
  const pop = doc.createElement("div");
  pop.className = "doc-note-pop";
  pop.setAttribute("data-doc-notes-ui", "");
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Add note on selection");
  pop.innerHTML =
    '<div class="doc-note-pop-top"><span class="doc-note-meta" data-role="sec">Opener</span><span class="doc-note-meta">Cmd+Enter save · Esc close</span></div>' +
    '<blockquote class="doc-note-quote" data-role="quote"></blockquote>' +
    '<div class="doc-note-tags" data-role="tags" role="group" aria-label="Note tag"></div>' +
    '<textarea class="doc-note-input" data-role="input" placeholder="Drop your thought on this..."></textarea>' +
    '<div class="doc-note-actions">' +
    '<button class="doc-note-btn doc-note-quiet" type="button" data-role="delete" hidden>Remove</button>' +
    '<div class="doc-note-actions-right">' +
    '<button class="doc-note-btn" type="button" data-role="cancel">Cancel</button>' +
    '<button class="doc-note-btn doc-note-primary" type="button" data-role="save">Save note</button>' +
    "</div></div>";

  // Slide-over review & export drawer
  const scrim = doc.createElement("div");
  scrim.className = "doc-note-scrim";
  scrim.setAttribute("data-doc-notes-ui", "");

  const drawer = doc.createElement("aside");
  drawer.className = "doc-note-drawer";
  drawer.setAttribute("data-doc-notes-ui", "");
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-label", "Notes and export");
  drawer.innerHTML =
    '<div class="doc-note-drawer-head">' +
    '<h2 class="doc-note-drawer-title">Notes</h2>' +
    '<div class="doc-note-actions-right">' +
    '<button class="doc-note-btn" type="button" data-role="quick-copy">Copy export</button>' +
    '<button class="doc-note-btn" type="button" data-role="close">Close</button>' +
    "</div></div>" +
    '<div class="doc-note-tabs" role="tablist">' +
    '<button class="doc-note-tab is-active" type="button" role="tab" data-tab="list" aria-selected="true">All notes</button>' +
    '<button class="doc-note-tab" type="button" role="tab" data-tab="export" aria-selected="false">Markdown export</button>' +
    '<button class="doc-note-clear" type="button" data-role="clear-all" hidden>Clear all</button>' +
    "</div>" +
    '<div class="doc-note-body" data-pane="list"><div data-role="list"></div></div>' +
    '<div class="doc-note-body" data-pane="export" hidden>' +
    '<div class="doc-note-export-bar">' +
    '<button class="doc-note-btn doc-note-primary" type="button" data-role="copy-md">Copy Markdown</button>' +
    '<button class="doc-note-btn" type="button" data-role="download-md">Download .md</button>' +
    '<span class="doc-note-status" data-role="status" aria-live="polite"></span>' +
    "</div>" +
    '<textarea class="doc-note-export" data-role="export" readonly aria-label="Exported Markdown notes"></textarea>' +
    "</div>" +
    '<div class="doc-note-general" data-pane="general">' +
    '<div class="doc-note-general-row"><span class="doc-note-meta">Add a visual or general note</span><select class="doc-note-select" data-role="general-sec" aria-label="Section"></select></div>' +
    '<div class="doc-note-tags" data-role="general-tags" role="group" aria-label="General note tag"></div>' +
    '<textarea class="doc-note-input doc-note-input-sm" data-role="general-input" placeholder="Leave a note on layout, visuals or direction..."></textarea>' +
    '<div class="doc-note-actions-right"><button class="doc-note-btn" type="button" data-role="general-add">Add note</button></div>' +
    "</div>";

  // Floating bottom-right launcher
  const fab = doc.createElement("button");
  fab.type = "button";
  fab.className = "doc-note-fab";
  fab.setAttribute("data-doc-notes", "");
  fab.setAttribute("data-doc-notes-ui", "");
  fab.setAttribute("aria-label", "Open notes");
  fab.innerHTML = 'Notes<span class="doc-note-fab-count" data-doc-notes-count="">0</span>';

  // Status toast
  const toast = doc.createElement("div");
  toast.className = "doc-note-toast";
  toast.setAttribute("data-doc-notes-ui", "");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const headerTrigger = doc.body.querySelector<HTMLElement>("[data-doc-notes]:not([data-doc-notes-ui])");
  const hasDeck = Boolean(doc.querySelector(".deck"));
  let fabObserver: IntersectionObserver | undefined;

  const setFabHidden = (hidden: boolean) => {
    fab.classList.toggle("is-hidden", hidden);
    fab.setAttribute("aria-hidden", String(hidden));
    fab.tabIndex = hidden ? -1 : 0;
  };

  if (showFab) {
    if (headerTrigger) {
      setFabHidden(true);
      if (!hasDeck && typeof win.IntersectionObserver === "function") {
        fabObserver = new win.IntersectionObserver(
          (entries) => {
            const entry = entries[entries.length - 1];
            if (entry) setFabHidden(entry.isIntersecting);
          },
          { threshold: 0 },
        );
        fabObserver.observe(headerTrigger);
      }
    } else {
      setFabHidden(false);
    }
    doc.body.append(fab);
  }
  doc.body.append(pop, scrim, drawer, toast);

  const popSec = pop.querySelector<HTMLElement>('[data-role="sec"]')!;
  const popQuote = pop.querySelector<HTMLElement>('[data-role="quote"]')!;
  const popTags = pop.querySelector<HTMLElement>('[data-role="tags"]')!;
  const popInput = pop.querySelector<HTMLTextAreaElement>('[data-role="input"]')!;
  const popSave = pop.querySelector<HTMLButtonElement>('[data-role="save"]')!;
  const popCancel = pop.querySelector<HTMLButtonElement>('[data-role="cancel"]')!;
  const popDelete = pop.querySelector<HTMLButtonElement>('[data-role="delete"]')!;

  const listPane = drawer.querySelector<HTMLElement>('[data-pane="list"]')!;
  const exportPane = drawer.querySelector<HTMLElement>('[data-pane="export"]')!;
  const generalPane = drawer.querySelector<HTMLElement>('[data-pane="general"]')!;
  const listHost = drawer.querySelector<HTMLElement>('[data-role="list"]')!;
  const exportArea = drawer.querySelector<HTMLTextAreaElement>('[data-role="export"]')!;
  const statusEl = drawer.querySelector<HTMLElement>('[data-role="status"]')!;
  const quickCopyBtn = drawer.querySelector<HTMLButtonElement>('[data-role="quick-copy"]')!;
  const closeBtn = drawer.querySelector<HTMLButtonElement>('[data-role="close"]')!;
  const clearAllBtn = drawer.querySelector<HTMLButtonElement>('[data-role="clear-all"]')!;
  const copyMdBtn = drawer.querySelector<HTMLButtonElement>('[data-role="copy-md"]')!;
  const downloadBtn = drawer.querySelector<HTMLButtonElement>('[data-role="download-md"]')!;
  const generalSec = drawer.querySelector<HTMLSelectElement>('[data-role="general-sec"]')!;
  const generalTags = drawer.querySelector<HTMLElement>('[data-role="general-tags"]')!;
  const generalInput = drawer.querySelector<HTMLTextAreaElement>('[data-role="general-input"]')!;
  const generalAddBtn = drawer.querySelector<HTMLButtonElement>('[data-role="general-add"]')!;

  function renderTagPicker(host: HTMLElement, active: DocNoteTag, onPick: (tag: DocNoteTag) => void) {
    host.innerHTML = "";
    for (const tag of NOTE_TAGS) {
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.className = tag === active ? "doc-note-tag is-selected" : "doc-note-tag";
      btn.dataset.tag = tag;
      btn.setAttribute("aria-pressed", String(tag === active));
      btn.textContent = tag;
      btn.addEventListener("click", () => {
        onPick(tag);
        renderTagPicker(host, tag, onPick);
      });
      host.append(btn);
    }
  }

  function showToast(message: string) {
    toast.textContent = message;
    toast.classList.add("is-open");
    if (toastTimer !== undefined) win!.clearTimeout(toastTimer);
    toastTimer = win!.setTimeout(() => {
      toast.classList.remove("is-open");
      toastTimer = undefined;
    }, 2200);
  }

  function resetClearArm() {
    clearArmed = false;
    clearAllBtn.textContent = "Clear all";
    if (clearTimer !== undefined) {
      win!.clearTimeout(clearTimer);
      clearTimer = undefined;
    }
  }

  function syncSectionOptions() {
    const current = generalSec.value;
    generalSec.innerHTML = "";
    for (const name of collectSections(doc)) {
      const opt = doc.createElement("option");
      opt.value = name;
      opt.textContent = name;
      generalSec.append(opt);
    }
    if (current && [...generalSec.options].some((o) => o.value === current)) generalSec.value = current;
  }

  function wrapRange(range: Range, noteId: string) {
    const ancestor = range.commonAncestorContainer;
    const root = ancestor.nodeType === 1 ? (ancestor as Element) : ancestor.parentElement;
    if (!root) return;

    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("[data-doc-notes-ui], script, style, button")) return NodeFilter.FILTER_REJECT;
        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const tn of nodes) {
      let target = tn;
      let start = 0;
      let end = target.nodeValue?.length ?? 0;
      if (tn === range.startContainer) start = range.startOffset;
      if (tn === range.endContainer) end = range.endOffset;
      if (end <= start) continue;
      if (end < (target.nodeValue?.length ?? 0)) target.splitText(end);
      if (start > 0) target = target.splitText(start);
      if (!target.nodeValue?.trim()) continue;
      const mark = doc.createElement("mark");
      mark.className = "doc-hl";
      mark.dataset.noteId = noteId;
      mark.tabIndex = 0;
      mark.title = "Click to edit note";
      target.parentNode?.insertBefore(mark, target);
      mark.append(target);
    }
  }

  function unwrapMarks(noteId: string) {
    const parents = new Set<Node>();
    for (const mark of doc.querySelectorAll(`mark.doc-hl[data-note-id="${noteId}"]`)) {
      const parent = mark.parentNode;
      if (!parent) continue;
      parents.add(parent);
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      mark.remove();
    }
    for (const parent of parents) parent.normalize();
  }

  function orderedNotes(): DocNote[] {
    const order = new Map<string, number>();
    let index = 0;
    for (const mark of doc.querySelectorAll<HTMLElement>("mark.doc-hl[data-note-id]")) {
      const id = mark.dataset.noteId!;
      if (!order.has(id)) order.set(id, index++);
    }
    return [...notes].sort((a, b) => (order.get(a.id) ?? 1e6) - (order.get(b.id) ?? 1e6));
  }

  function exportMarkdown(): string {
    const title = doc.title?.trim() || "Document notes";
    const mode = doc.documentElement.classList.contains("dark") ? "dark" : "light";
    const list = orderedNotes();
    const lines = [`## Notes: ${title}`, "", `- **Mode:** ${mode}`, ""];
    if (list.length === 0) {
      lines.push("_No notes added yet._");
      return `${lines.join("\n")}\n`;
    }
    list.forEach((item, i) => {
      lines.push(`### ${i + 1}. [${item.tag}] ${item.section}`);
      if (item.quote) {
        lines.push(`> "${item.quote}"`);
        lines.push("");
      }
      lines.push(item.comment);
      lines.push("");
    });
    return `${lines.join("\n").trim()}\n`;
  }

  function syncCounts() {
    const count = String(notes.length);
    for (const badge of doc.querySelectorAll<HTMLElement>("[data-doc-notes-count]")) {
      badge.textContent = count;
      badge.classList.toggle("has-notes", notes.length > 0);
    }
    clearAllBtn.hidden = notes.length === 0;
    if (notes.length === 0) resetClearArm();
  }

  function renderUI() {
    syncCounts();
    const list = orderedNotes();
    exportArea.value = exportMarkdown();
    if (list.length === 0) {
      listHost.innerHTML =
        '<p class="doc-note-empty">Select any text on the page to highlight it and drop a thought, or add a note below.</p>';
      return;
    }
    listHost.innerHTML = "";
    for (const item of list) {
      const card = doc.createElement("div");
      card.className = "doc-note-card";

      const head = doc.createElement("div");
      head.className = "doc-note-card-head";
      const meta = doc.createElement("span");
      meta.className = "doc-note-meta";
      meta.textContent = item.section;
      const badge = doc.createElement("span");
      badge.className = "doc-note-tag-badge";
      badge.textContent = item.tag;
      head.append(meta, badge);
      card.append(head);

      if (item.quote) {
        const quoteBtn = doc.createElement("button");
        quoteBtn.type = "button";
        quoteBtn.className = "doc-note-card-quote";
        quoteBtn.textContent = `“${item.quote}”`;
        quoteBtn.addEventListener("click", () => {
          closeDrawer();
          const mark = doc.querySelector<HTMLElement>(`mark.doc-hl[data-note-id="${item.id}"]`);
          if (mark) {
            mark.scrollIntoView({ behavior: "smooth", block: "center" });
            mark.classList.add("is-flash");
            win!.setTimeout(() => mark.classList.remove("is-flash"), 1400);
          }
        });
        card.append(quoteBtn);
      }

      const body = doc.createElement("p");
      body.className = "doc-note-card-text";
      body.textContent = item.comment;
      card.append(body);

      const actions = doc.createElement("div");
      actions.className = "doc-note-card-actions";
      const editBtn = doc.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        const mark = doc.querySelector<HTMLElement>(`mark.doc-hl[data-note-id="${item.id}"]`);
        if (mark) {
          closeDrawer();
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
          win!.setTimeout(() => openEditPopover(item.id, mark), 180);
        } else {
          const next = win!.prompt("Edit note", item.comment);
          if (next !== null && next.trim()) {
            item.comment = next.trim();
            renderUI();
          }
        }
      });
      const removeBtn = doc.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => deleteNote(item.id));
      actions.append(editBtn, removeBtn);
      card.append(actions);

      listHost.append(card);
    }
  }

  function positionPopover(rect: DOMRect) {
    pop.classList.add("is-open");
    const popW = pop.offsetWidth || 380;
    const popH = pop.offsetHeight || 210;
    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(12, Math.min(win!.innerWidth - popW - 12, left));
    let top = rect.bottom + 10;
    if (top + popH > win!.innerHeight - 12) top = Math.max(12, rect.top - popH - 10);
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
  }

  function openNewPopover(range: Range) {
    editingNoteId = null;
    pendingRange = range.cloneRange();
    selectedTag = "Note";
    renderTagPicker(popTags, selectedTag, (tag) => {
      selectedTag = tag;
    });
    popSec.textContent = detectSection(range.startContainer);
    popQuote.textContent = `“${range.toString().replace(/\s+/g, " ").trim()}”`;
    popQuote.hidden = false;
    popInput.value = "";
    popDelete.hidden = true;
    popSave.textContent = "Save note";
    positionPopover(range.getBoundingClientRect());
    popInput.focus();
  }

  function openEditPopover(noteId: string, anchor: HTMLElement) {
    const item = notes.find((n) => n.id === noteId);
    if (!item) return;
    editingNoteId = noteId;
    pendingRange = null;
    selectedTag = item.tag;
    renderTagPicker(popTags, selectedTag, (tag) => {
      selectedTag = tag;
    });
    popSec.textContent = item.section;
    popQuote.textContent = item.quote ? `“${item.quote}”` : "";
    popQuote.hidden = !item.quote;
    popInput.value = item.comment;
    popDelete.hidden = false;
    popSave.textContent = "Update";
    positionPopover(anchor.getBoundingClientRect());
    popInput.focus();
  }

  function closePopover() {
    pop.classList.remove("is-open");
    pendingRange = null;
    editingNoteId = null;
    for (const m of doc.querySelectorAll("mark.doc-hl.is-active")) m.classList.remove("is-active");
  }

  function savePopover() {
    const comment = popInput.value.trim();
    if (!comment) {
      popInput.focus();
      return;
    }
    if (editingNoteId) {
      const item = notes.find((n) => n.id === editingNoteId);
      if (item) {
        item.comment = comment;
        item.tag = selectedTag;
      }
      showToast("Note updated");
    } else if (pendingRange) {
      const quote = pendingRange.toString().replace(/\s+/g, " ").trim();
      const section = detectSection(pendingRange.startContainer);
      const id = `n${nextId++}`;
      wrapRange(pendingRange, id);
      notes.push({ id, section, tag: selectedTag, quote, comment });
      win!.getSelection()?.removeAllRanges();
      showToast("Highlight and note saved");
    }
    closePopover();
    renderUI();
  }

  function deleteNote(noteId: string) {
    const idx = notes.findIndex((n) => n.id === noteId);
    if (idx !== -1) notes.splice(idx, 1);
    unwrapMarks(noteId);
    if (editingNoteId === noteId) closePopover();
    renderUI();
    showToast("Note removed");
  }

  function clearAllNotes() {
    if (notes.length === 0) return;
    if (!clearArmed) {
      clearArmed = true;
      clearAllBtn.textContent = "Confirm clear?";
      if (clearTimer !== undefined) win!.clearTimeout(clearTimer);
      clearTimer = win!.setTimeout(resetClearArm, 3000);
      return;
    }
    for (const item of [...notes]) unwrapMarks(item.id);
    notes.length = 0;
    resetClearArm();
    closePopover();
    renderUI();
    showToast("Cleared all notes");
  }

  function switchTab(tab: "list" | "export") {
    for (const btn of drawer.querySelectorAll<HTMLButtonElement>("[data-tab]")) {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    }
    listPane.hidden = tab !== "list";
    generalPane.hidden = tab !== "list";
    exportPane.hidden = tab !== "export";
    if (tab === "export") exportArea.value = exportMarkdown();
  }

  function openDrawer(tab: "list" | "export" = "list") {
    closePopover();
    syncSectionOptions();
    renderUI();
    switchTab(tab);
    scrim.classList.add("is-open");
    drawer.classList.add("is-open");
  }

  function closeDrawer() {
    scrim.classList.remove("is-open");
    drawer.classList.remove("is-open");
  }

  async function copyExport(source: "quick" | "export") {
    const md = exportMarkdown();
    exportArea.value = md;
    let copied = false;
    try {
      const clipboard = win!.navigator.clipboard;
      if (clipboard && typeof clipboard.writeText === "function") {
        await clipboard.writeText(md);
        copied = true;
      }
    } catch {
      // opaque-origin sandboxes may reject navigator.clipboard; fall back to execCommand below
    }
    if (!copied) {
      try {
        const tmp = doc.createElement("textarea");
        tmp.value = md;
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        doc.body.append(tmp);
        tmp.select();
        copied = doc.execCommand("copy");
        tmp.remove();
      } catch {
        // if execCommand also fails, select the export textarea so the reader can copy manually
      }
    }
    if (!copied) {
      switchTab("export");
      exportArea.focus();
      exportArea.select();
      statusEl.textContent = "Selected · press Cmd+C";
      return;
    }
    const label = notes.length === 1 ? "Copied 1 note as Markdown" : `Copied ${notes.length} notes as Markdown`;
    showToast(label);
    if (source === "quick") {
      const prev = quickCopyBtn.textContent;
      quickCopyBtn.textContent = "Copied";
      win!.setTimeout(() => {
        quickCopyBtn.textContent = prev;
      }, 1600);
    } else {
      statusEl.textContent = "Copied";
      win!.setTimeout(() => {
        statusEl.textContent = "";
      }, 2000);
    }
  }

  function downloadExport() {
    const md = exportMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = doc.createElement("a");
    a.href = url;
    a.download = "notes.md";
    doc.body.append(a);
    a.click();
    a.remove();
    win!.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Downloaded notes.md");
  }

  function addGeneralNote() {
    const comment = generalInput.value.trim();
    if (!comment) {
      generalInput.focus();
      return;
    }
    notes.push({ id: `n${nextId++}`, section: generalSec.value || "General", tag: generalTag, quote: "", comment });
    generalInput.value = "";
    generalTag = "Note";
    renderTagPicker(generalTags, generalTag, (tag) => {
      generalTag = tag;
    });
    renderUI();
    showToast("Note saved");
  }

  const onMouseUp = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (isInsideNoteUI(target)) return;
    const mark = target?.closest<HTMLElement>("mark.doc-hl") ?? null;
    win.setTimeout(() => {
      const sel = win.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const text = range.toString().replace(/\s+/g, " ").trim();
        if (text.length >= 2 && !isInsideNoteUI(range.startContainer) && !isInsideNoteUI(range.endContainer)) {
          openNewPopover(range);
          return;
        }
      }
      if (mark?.dataset.noteId) {
        for (const m of doc.querySelectorAll("mark.doc-hl.is-active")) m.classList.remove("is-active");
        mark.classList.add("is-active");
        openEditPopover(mark.dataset.noteId, mark);
      }
    }, 10);
  };

  const onMouseDown = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (pop.classList.contains("is-open") && !target?.closest(".doc-note-pop, mark.doc-hl")) closePopover();
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (target?.closest("[data-doc-notes]")) openDrawer("list");
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (pop.classList.contains("is-open")) closePopover();
      else if (drawer.classList.contains("is-open")) closeDrawer();
    }
  };

  doc.addEventListener("mouseup", onMouseUp);
  doc.addEventListener("mousedown", onMouseDown);
  doc.addEventListener("click", onClick);
  doc.addEventListener("keydown", onKeyDown);

  popInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      savePopover();
    }
  });
  popSave.addEventListener("click", savePopover);
  popCancel.addEventListener("click", closePopover);
  popDelete.addEventListener("click", () => {
    if (editingNoteId) deleteNote(editingNoteId);
  });

  closeBtn.addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  clearAllBtn.addEventListener("click", clearAllNotes);
  quickCopyBtn.addEventListener("click", () => void copyExport("quick"));
  copyMdBtn.addEventListener("click", () => void copyExport("export"));
  downloadBtn.addEventListener("click", downloadExport);
  for (const btn of drawer.querySelectorAll<HTMLButtonElement>("[data-tab]")) {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab === "export" ? "export" : "list"));
  }
  generalAddBtn.addEventListener("click", addGeneralNote);
  generalInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      addGeneralNote();
    }
  });

  renderTagPicker(generalTags, generalTag, (tag) => {
    generalTag = tag;
  });
  renderUI();

  const controller: DocNotesController = {
    open: openDrawer,
    close: closeDrawer,
    exportMarkdown,
    destroy() {
      fabObserver?.disconnect();
      if (toastTimer !== undefined) win!.clearTimeout(toastTimer);
      if (clearTimer !== undefined) win!.clearTimeout(clearTimer);
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("mousedown", onMouseDown);
      doc.removeEventListener("click", onClick);
      doc.removeEventListener("keydown", onKeyDown);
      for (const item of [...notes]) unwrapMarks(item.id);
      fab.remove();
      pop.remove();
      scrim.remove();
      drawer.remove();
      toast.remove();
      activeControllers.delete(doc);
    },
  };
  activeControllers.set(doc, controller);
  return controller;
}
