export type DocNote = {
  id: string;
  section: string;
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
  if (!el) return "general";
  const header = el.closest("header");
  if (header) return "opener";
  const sec = el.closest("section[id], .group[id], .sec[id]");
  if (sec) {
    const heading = sec.querySelector(".chapter-word, .sec-head, .band-word, h2, h3");
    const title = heading?.textContent?.replace(/\s+/g, " ").trim();
    if (title) return title;
    if (sec.id) return sec.id.replaceAll("-", " ");
  }
  return "general";
}

function collectSections(doc: Document): string[] {
  const seen = new Set<string>(["opener"]);
  for (const el of doc.querySelectorAll("section[id], .group[id], .sec[id]")) {
    const heading = el.querySelector(".chapter-word, .sec-head, .band-word, h2, h3");
    const label = heading?.textContent?.replace(/\s+/g, " ").trim() || el.id.replaceAll("-", " ");
    if (label) seen.add(label);
  }
  seen.add("general");
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

  // Floating composer popover
  const pop = doc.createElement("div");
  pop.className = "doc-note-pop";
  pop.setAttribute("data-doc-notes-ui", "");
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "add note on selection");
  pop.innerHTML =
    '<div class="doc-note-pop-top"><span class="doc-note-meta" data-role="sec">opener</span><span class="doc-note-meta">cmd+enter save · esc close</span></div>' +
    '<blockquote class="doc-note-quote" data-role="quote"></blockquote>' +
    '<textarea class="doc-note-input" data-role="input" placeholder="drop your thought on this..."></textarea>' +
    '<div class="doc-note-actions">' +
    '<button class="doc-note-btn doc-note-quiet" type="button" data-role="delete" hidden>remove</button>' +
    '<div class="doc-note-actions-right">' +
    '<button class="doc-note-btn" type="button" data-role="cancel">cancel</button>' +
    '<button class="doc-note-btn doc-note-primary" type="button" data-role="save">save note</button>' +
    "</div></div>";

  // Slide-over review & export drawer
  const scrim = doc.createElement("div");
  scrim.className = "doc-note-scrim";
  scrim.setAttribute("data-doc-notes-ui", "");

  const drawer = doc.createElement("aside");
  drawer.className = "doc-note-drawer";
  drawer.setAttribute("data-doc-notes-ui", "");
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-label", "notes and export");
  drawer.innerHTML =
    '<div class="doc-note-drawer-head">' +
    '<h2 class="doc-note-drawer-title">notes</h2>' +
    '<div class="doc-note-actions-right">' +
    '<button class="doc-note-btn" type="button" data-role="quick-copy">copy export</button>' +
    '<button class="doc-note-btn" type="button" data-role="close">close</button>' +
    "</div></div>" +
    '<div class="doc-note-tabs" role="tablist">' +
    '<button class="doc-note-tab is-active" type="button" role="tab" data-tab="list" aria-selected="true">all notes</button>' +
    '<button class="doc-note-tab" type="button" role="tab" data-tab="export" aria-selected="false">markdown export</button>' +
    "</div>" +
    '<div class="doc-note-body" data-pane="list"><div data-role="list"></div></div>' +
    '<div class="doc-note-body" data-pane="export" hidden>' +
    '<div class="doc-note-export-bar">' +
    '<button class="doc-note-btn doc-note-primary" type="button" data-role="copy-md">copy markdown</button>' +
    '<button class="doc-note-btn" type="button" data-role="download-md">download .md</button>' +
    '<span class="doc-note-status" data-role="status" aria-live="polite"></span>' +
    "</div>" +
    '<textarea class="doc-note-export" data-role="export" readonly aria-label="exported markdown notes"></textarea>' +
    "</div>" +
    '<div class="doc-note-general" data-pane="general">' +
    '<div class="doc-note-general-row"><span class="doc-note-meta">add a visual or general note</span><select class="doc-note-select" data-role="general-sec" aria-label="section"></select></div>' +
    '<textarea class="doc-note-input doc-note-input-sm" data-role="general-input" placeholder="leave a note on layout, visuals or direction..."></textarea>' +
    '<div class="doc-note-actions-right"><button class="doc-note-btn" type="button" data-role="general-add">add note</button></div>' +
    "</div>";

  doc.body.append(pop, scrim, drawer);

  const popSec = pop.querySelector<HTMLElement>('[data-role="sec"]')!;
  const popQuote = pop.querySelector<HTMLElement>('[data-role="quote"]')!;
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
  const copyMdBtn = drawer.querySelector<HTMLButtonElement>('[data-role="copy-md"]')!;
  const downloadBtn = drawer.querySelector<HTMLButtonElement>('[data-role="download-md"]')!;
  const generalSec = drawer.querySelector<HTMLSelectElement>('[data-role="general-sec"]')!;
  const generalInput = drawer.querySelector<HTMLTextAreaElement>('[data-role="general-input"]')!;
  const generalAddBtn = drawer.querySelector<HTMLButtonElement>('[data-role="general-add"]')!;

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
      mark.title = "click to edit note";
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
    const title = doc.title?.trim() || "document notes";
    const mode = doc.documentElement.classList.contains("dark") ? "dark" : "light";
    const list = orderedNotes();
    const lines = [`## notes: ${title}`, "", `- **mode:** ${mode}`, ""];
    if (list.length === 0) {
      lines.push("_no notes added yet._");
      return `${lines.join("\n")}\n`;
    }
    list.forEach((item, i) => {
      lines.push(`### ${i + 1}. ${item.section}`);
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
  }

  function renderUI() {
    syncCounts();
    const list = orderedNotes();
    exportArea.value = exportMarkdown();
    if (list.length === 0) {
      listHost.innerHTML =
        '<p class="doc-note-empty">select any text on the page to highlight it and drop a thought, or add a note below.</p>';
      return;
    }
    listHost.innerHTML = "";
    for (const item of list) {
      const card = doc.createElement("div");
      card.className = "doc-note-card";

      const meta = doc.createElement("span");
      meta.className = "doc-note-meta";
      meta.textContent = item.section;
      card.append(meta);

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
      editBtn.textContent = "edit";
      editBtn.addEventListener("click", () => {
        const mark = doc.querySelector<HTMLElement>(`mark.doc-hl[data-note-id="${item.id}"]`);
        if (mark) {
          closeDrawer();
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
          win!.setTimeout(() => openEditPopover(item.id, mark), 180);
        } else {
          const next = win!.prompt("edit note", item.comment);
          if (next !== null && next.trim()) {
            item.comment = next.trim();
            renderUI();
          }
        }
      });
      const removeBtn = doc.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "remove";
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
    popSec.textContent = detectSection(range.startContainer);
    popQuote.textContent = `“${range.toString().replace(/\s+/g, " ").trim()}”`;
    popQuote.hidden = false;
    popInput.value = "";
    popDelete.hidden = true;
    popSave.textContent = "save note";
    positionPopover(range.getBoundingClientRect());
    popInput.focus();
  }

  function openEditPopover(noteId: string, anchor: HTMLElement) {
    const item = notes.find((n) => n.id === noteId);
    if (!item) return;
    editingNoteId = noteId;
    pendingRange = null;
    popSec.textContent = item.section;
    popQuote.textContent = item.quote ? `“${item.quote}”` : "";
    popQuote.hidden = !item.quote;
    popInput.value = item.comment;
    popDelete.hidden = false;
    popSave.textContent = "update";
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
      if (item) item.comment = comment;
    } else if (pendingRange) {
      const quote = pendingRange.toString().replace(/\s+/g, " ").trim();
      const section = detectSection(pendingRange.startContainer);
      const id = `n${nextId++}`;
      wrapRange(pendingRange, id);
      notes.push({ id, section, quote, comment });
      win!.getSelection()?.removeAllRanges();
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
      statusEl.textContent = "selected · press cmd+c";
      return;
    }
    if (source === "quick") {
      const prev = quickCopyBtn.textContent;
      quickCopyBtn.textContent = "copied";
      win!.setTimeout(() => {
        quickCopyBtn.textContent = prev;
      }, 1600);
    } else {
      statusEl.textContent = "copied";
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
  }

  function addGeneralNote() {
    const comment = generalInput.value.trim();
    if (!comment) {
      generalInput.focus();
      return;
    }
    notes.push({ id: `n${nextId++}`, section: generalSec.value || "general", quote: "", comment });
    generalInput.value = "";
    renderUI();
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

  renderUI();

  const controller: DocNotesController = {
    open: openDrawer,
    close: closeDrawer,
    exportMarkdown,
    destroy() {
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("mousedown", onMouseDown);
      doc.removeEventListener("click", onClick);
      doc.removeEventListener("keydown", onKeyDown);
      for (const item of [...notes]) unwrapMarks(item.id);
      pop.remove();
      scrim.remove();
      drawer.remove();
      activeControllers.delete(doc);
    },
  };
  activeControllers.set(doc, controller);
  return controller;
}
