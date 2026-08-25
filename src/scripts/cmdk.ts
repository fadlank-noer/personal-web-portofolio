/**
 * Cmd+K Command Palette — client-side module
 *
 * Reads data from window.__CMDK_DATA__ (set by Astro inline script before this module loads).
 * All behavior: ILIKE search, highlight, keyboard nav, focus, global shortcut.
 * NO define:vars — Astro 7 silently drops <script define:vars> + import in production.
 */

import type { CmdKItem, CmdKWindowData } from '../lib/types/cmdk';

// ── ILIKE search ──────────────────────────────────────────────────────────────

/**
 * AND order-free ILIKE: every query token must be a case-insensitive substring of title.
 * "fest 2026" → title must contain both "fest" AND "2026" (case-insensitive, any order).
 */
function ilikeMatch(title: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const lower = title.toLowerCase();
  return tokens.every((token) => lower.includes(token));
}

/**
 * Wrap matched characters in title with <mark> (underline via CSS).
 * Preserves original case. Returns HTML string safe for innerHTML.
 */
function highlightTitle(title: string, query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return escapeHtml(title);
  const tokens = q.split(/\s+/).filter(Boolean);

  // Build a mask: for each char in title, is it matched by any token?
  const lower = title.toLowerCase();
  const matched = new Array(title.length).fill(false);

  for (const token of tokens) {
    let idx = lower.indexOf(token);
    while (idx !== -1) {
      for (let i = idx; i < idx + token.length; i++) matched[i] = true;
      idx = lower.indexOf(token, idx + 1);
    }
  }

  // Build HTML: wrap consecutive matched runs in <mark>
  let result = '';
  let inMark = false;
  for (let i = 0; i < title.length; i++) {
    if (matched[i]) {
      if (!inMark) { result += '<mark class="cmdk-highlight">'; inMark = true; }
      result += escapeHtml(title[i]);
    } else {
      if (inMark) { result += '</mark>'; inMark = false; }
      result += escapeHtml(title[i]);
    }
  }
  if (inMark) result += '</mark>';
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── State ─────────────────────────────────────────────────────────────────────

let items: CmdKItem[] = [];
let filtered: CmdKItem[] = [];
let activeIndex = 0;
let isOpen = false;
let openTrigger: HTMLElement | null = null;

const dialogId = 'cmdk-dialog';
const inputId = 'cmdk-input';
const listId = 'cmdk-list';
const statusId = 'cmdk-status';

// ── DOM helpers ───────────────────────────────────────────────────────────────

function getDialog(): HTMLDialogElement | null {
  return document.getElementById(dialogId) as HTMLDialogElement | null;
}
function getInput(): HTMLInputElement | null {
  return document.getElementById(inputId) as HTMLInputElement | null;
}
function getList(): HTMLElement | null {
  return document.getElementById(listId);
}
function getStatus(): HTMLElement | null {
  return document.getElementById(statusId);
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderResults() {
  const list = getList();
  const status = getStatus();
  const input = getInput();
  if (!list || !status || !input) return;

  const query = input.value;

  if (query.trim()) {
    filtered = items.filter((item) => ilikeMatch(item.title, query));
  } else {
    filtered = [...items];
  }

  if (filtered.length === 0) {
    list.innerHTML = `<p class="cmdk-empty">No results for "<span>${escapeHtml(query)}</span>"</p>`;
    status.textContent = '0 results';
    activeIndex = -1;
    return;
  }

  list.innerHTML = filtered
    .map(
      (item, i) => `
      <a
        href="${escapeHtml(item.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="cmdk-item${i === activeIndex ? ' cmdk-item--active' : ''}"
        data-cmdk-index="${i}"
        role="option"
        aria-selected="${i === activeIndex}"
      >
        ${item.source ? `<span class="cmdk-source">${escapeHtml(item.source)}</span>` : ''}
        <span class="cmdk-title">${highlightTitle(item.title, query)}</span>
        ${item.tag ? `<span class="cmdk-tag">${escapeHtml(item.tag)}</span>` : ''}
      </a>`
    )
    .join('');

  status.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

  // Attach click listeners
  list.querySelectorAll<HTMLAnchorElement>('.cmdk-item').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const idx = Number(el.dataset.cmdkIndex);
      setActive(idx);
    });
    el.addEventListener('click', () => {
      // dialog closes automatically on navigation
      close();
    });
  });
}

function setActive(idx: number) {
  activeIndex = Math.max(0, Math.min(idx, filtered.length - 1));
  getList()
    ?.querySelectorAll('.cmdk-item')
    .forEach((el, i) => {
      el.classList.toggle('cmdk-item--active', i === activeIndex);
      el.setAttribute('aria-selected', String(i === activeIndex));
    });
  // Update aria-activedescendant on input
  const input = getInput();
  const activeEl = getList()?.querySelector<HTMLElement>(`.cmdk-item[data-cmdk-index="${activeIndex}"]`);
  if (input && activeEl) {
    input.setAttribute('aria-activedescendant', activeEl.id || `cmdk-item-${activeIndex}`);
  }
}

// ── Open / Close ─────────────────────────────────────────────────────────────

function open(fromTrigger?: HTMLElement) {
  const dialog = getDialog();
  if (!dialog || isOpen) return;

  isOpen = true;
  openTrigger = fromTrigger ?? null;

  // Clear any belt-and-suspenders CSS override from close()
  dialog.style.display = '';
  dialog.style.visibility = '';

  dialog.showModal();

  // Focus input after dialog opens
  requestAnimationFrame(() => {
    getInput()?.focus();
    renderResults();
  });
}

function close() {
  const dialog = getDialog();
  if (!dialog || !isOpen) return;

  isOpen = false;
  dialog.close();

  // Belt-and-suspenders: ensure the dialog is actually hidden.
  // Native dialog.close() removes the [open] attribute which hides via
  // CSS (#cmdk-dialog:not([open]) { display: none; }) — but if Astro SSR
  // re-renders the dialog mid-session or the attribute doesn't take effect
  // for any reason, this CSS override guarantees invisibility.
  dialog.style.display = 'none';
  dialog.style.visibility = 'hidden';

  // Reset state
  const input = getInput();
  if (input) input.value = '';
  filtered = [...items];
  activeIndex = 0;

  // Return focus: trigger if clicked, else body
  if (openTrigger) {
    openTrigger.focus();
    openTrigger = null;
  } else {
    document.body.focus();
  }
}

// ── Keyboard handling ─────────────────────────────────────────────────────────

function handleKeydown(e: KeyboardEvent) {
  const dialog = getDialog();
  if (!dialog || !dialog.open) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActive(activeIndex + 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActive(activeIndex - 1);
      break;
    case 'Enter': {
      e.preventDefault();
      const active = getList()?.querySelector<HTMLAnchorElement>('.cmdk-item--active');
      if (active) {
        active.click();
      }
      break;
    }
    case 'Escape':
      e.preventDefault();
      close();
      break;
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  if (e.key === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey) {
    e.preventDefault();
    if (isOpen) {
      close();
    } else {
      open();
    }
    return;
  }

  // Escape — document-level fallback so cmdk closes even when focus is
  // outside the dialog (e.g. body, or when dialog element doesn't receive
  // the event for any reason). Only fires when the dialog is open.
  if (e.key === 'Escape' && isOpen) {
    close();
  }
}

// ── Search input ──────────────────────────────────────────────────────────────

function handleInput() {
  activeIndex = 0;
  renderResults();
}

// ── Init ─────────────────────────────────────────────────────────────────────

let _inited = false;

function init() {
  if (_inited) return;
  _inited = true;

  // Read data from window.__CMDK_DATA__ (set by Astro inline script)
  const winData = (window as unknown as { __CMDK_DATA__?: CmdKWindowData }).__CMDK_DATA__;
  if (winData?.items?.length) {
    items = winData.items;
    filtered = [...items];
  }

  // Wire keyboard listeners
  document.addEventListener('keydown', handleGlobalKeydown);

  const dialog = getDialog();
  if (dialog) {
    dialog.addEventListener('keydown', handleKeydown);
  }

  const input = getInput();
  if (input) {
    input.addEventListener('input', handleInput);
  }

  // Wire sidebar search button triggers
  const sidebarSearchBtn = document.getElementById('sidebar-search');
  sidebarSearchBtn?.addEventListener('click', () => open(sidebarSearchBtn));

  const sidebarSearchChatsBtn = document.getElementById('sidebar-search-chats');
  sidebarSearchChatsBtn?.addEventListener('click', () => open(sidebarSearchChatsBtn));
}

// Init after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}