// @ts-nocheck
// ── Minimal nanostores implementation (no import — Astro drops
function atom(initial) {
  let value = initial;
  const subs = new Set();
  const get = () => value;
  const set = (v) => {
    value = v;
    subs.forEach(fn => fn(value));
  };
  const subscribe = (fn) => {
    subs.add(fn);
    fn(value);
    return () => subs.delete(fn);
  };
  return { get, set, subscribe };
}

const $filteredSuggestions = atom([]);
const $selectedIndex = atom(-1);
const $suggestionsVisible = atom(true);
const $isSubmitting = atom(false);
const $suggestionsMode = atom('filtered'); // 'filtered' | 'dice'
const $previousDiceSet = atom(null);        // prevent double-roll déjà vu

// ── Load questions from JSON data element ─────────────────────
const questionsEl = document.getElementById('chat-questions-data');
const questions = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];

const DEBOUNCE_MS = 500;
const MIN_CHARS = 3;
const STORAGE_KEY = 'fadlan-chat-history';

// ── DOM refs ─────────────────────────────────────────────────
const suggestionsPanel = document.getElementById('suggestions-panel');
const composerDivider = document.getElementById('composer-divider');
const input = document.getElementById('chat-input');
const filteredWrap = document.getElementById('filtered-suggestions');
const inputHelper = document.getElementById('input-helper');
const sendBtn = document.getElementById('send-btn');
const sendIconDefault = document.getElementById('send-icon-default');
const sendIconActive = document.getElementById('send-icon-active');
const disclaimer = document.getElementById('disclaimer');
const diceStatus = document.getElementById('dice-status');
let isRolling = false;
let diceAudio = null;
function getDiceAudio() {
  if (!diceAudio) {
    diceAudio = new Audio('/assets/sfx/dice.mp3');
    diceAudio.volume = 0.5;
  }
  return diceAudio;
}

function generateId() { return `msg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`; }
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Suggestions panel toggle ──────────────────────────────────
function setSuggestionsCollapsed(collapsed) {
  $suggestionsVisible.set(!collapsed);
  if (suggestionsPanel) {
    suggestionsPanel.dataset.collapsed = collapsed ? 'true' : 'false';
    suggestionsPanel.classList.toggle('h-0', collapsed);
    suggestionsPanel.classList.toggle('opacity-0', collapsed);
  }
}

// ── ILIKE-style filter ────────────────────────────────────────
function filterQuestions(query, limit = 5) {
  if (!query || query.trim().length < MIN_CHARS) return [];
  const q = query.toLowerCase().trim();

  const scored = questions
    .map(qt => {
      const questionText = qt.question.toLowerCase();
      let score = 0;
      if (questionText === q) score = 100;
      else if (questionText.startsWith(q)) score = 85;
      else if (questionText.includes(q)) score = 70;
      else {
        const regex = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        if (regex.test(questionText)) score = 60;
      }
      return { qt, score };
    })
    .filter(({score}) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({qt}) => qt);
  return scored;
}

// ── Render filtered suggestions ──────────────────────────────
function renderSuggestions() {
  if (!filteredWrap) return;
  const list = $filteredSuggestions.get();
  if (list.length === 0) { filteredWrap.innerHTML = ''; return; }

  const selectedIdx = $selectedIndex.get();
  filteredWrap.innerHTML = list.map((item, idx) => {
    const active = idx === selectedIdx ? 'bg-white/6' : '';
    return `<button type="button" data-suggest-idx="${idx}" class="suggest-row group ${active}">
      <span class="truncate">${escapeHtml(item.question)}</span>
      <span class="chevron flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </span>
    </button>`;
  }).join('');

  filteredWrap.querySelectorAll('[data-suggest-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-suggest-idx') || '0', 10);
      selectSuggestion(idx);
    });
  });
}

function selectSuggestion(idx) {
  const list = $filteredSuggestions.get();
  if (idx < 0 || idx >= list.length) return;
  const q = list[idx];
  input.value = q.question;
  resizeTextarea(input);
  closeFiltered();
  validateInput();
  // Immediately send — no need to copas to textarea or press Enter
  submit();
}

function closeFiltered() {
  $filteredSuggestions.set([]);
  $selectedIndex.set(-1);
  $suggestionsMode.set('filtered');
  if (filteredWrap) filteredWrap.innerHTML = '';
}

// ── Visibility control ────────────────────────────────────────
function updateSuggestionVisibility() {
  const trimmed = input.value.trim();
  const filtered = $filteredSuggestions.get();
  const mode = $suggestionsMode.get();
  const hasFiltered = mode === 'filtered' && filtered.length > 0 && trimmed.length >= MIN_CHARS;
  const hasDice = mode === 'dice' && filtered.length > 0;

  if (filteredWrap) filteredWrap.classList.toggle('hidden', !hasFiltered && !hasDice);
  if (composerDivider) composerDivider.classList.toggle('hidden', !hasFiltered && !hasDice);
}

// ── Validation ────────────────────────────────────────────────
function findExactQuestion(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;
  const exact = questions.find(i => i.question.toLowerCase().trim() === q);
  if (exact) return exact;
  const loose = questions.find(i => i.question.toLowerCase().startsWith(q));
  return loose ?? null;
}

function isValidQuestion(query) { return !!findExactQuestion(query); }

function canSubmit() {
  return input && input.value.trim() !== '' && isValidQuestion(input.value.trim());
}

function validateInput() {
  const value = input.value.trim();
  if (value === '') {
    // Idle / dice state — button is CLICKABLE (rolls dice), full opacity
    sendBtn.removeAttribute('disabled');
    sendBtn.setAttribute('aria-disabled', 'false');
    sendBtn.classList.remove('opacity-40', 'opacity-70', 'opacity-90', 'cursor-not-allowed');
    sendBtn.classList.add('opacity-100', 'cursor-pointer');
    sendIconDefault.classList.remove('hidden');
    sendIconActive.classList.add('hidden');
    sendBtn.setAttribute('aria-label', 'Roll random questions');
    inputHelper.classList.add('hidden');
    return false;
  }
  const valid = isValidQuestion(value);
  if (valid) {
    // Valid question — button submits, full opacity
    sendBtn.removeAttribute('disabled');
    sendBtn.setAttribute('aria-disabled', 'false');
    sendBtn.classList.remove('opacity-40', 'opacity-70', 'opacity-90', 'cursor-not-allowed');
    sendBtn.classList.add('opacity-100', 'cursor-pointer');
    sendIconDefault.classList.add('hidden');
    sendIconActive.classList.remove('hidden');
    sendBtn.setAttribute('aria-label', 'Send message');
    inputHelper.classList.add('hidden');
    return true;
  } else {
    // Any typed text → ArrowUp (not empty), per requested switcher behavior
    sendBtn.removeAttribute('disabled');
    sendBtn.setAttribute('aria-disabled', 'true');
    sendBtn.classList.remove('opacity-40', 'opacity-100', 'cursor-not-allowed');
    sendBtn.classList.add('opacity-70', 'cursor-pointer');
    sendIconDefault.classList.add('hidden');
    sendIconActive.classList.remove('hidden');
    sendBtn.setAttribute('aria-label', 'Send message');
    if (value.length >= 2) inputHelper.classList.remove('hidden');
    return false;
  }
}

function resizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// ── Dice helpers ──────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomQuestions(avoidSet = null) {
  let shuffled = shuffleArray(questions);
  if (avoidSet) {
    // Re-shuffle once if identical to previous set (no déjà vu)
    const currentIds = shuffled.slice(0, 3).map(q => q.question);
    const avoidIds = avoidSet.map(q => q.question);
    if (currentIds.every((id, i) => id === avoidIds[i])) {
      shuffled = shuffleArray(questions);
    }
  }
  return shuffled.slice(0, 3);
}

async function playDiceSFX() {
  const audio = getDiceAudio();
  audio.currentTime = 0;
  try { await audio.play(); } catch {}
}

function announceDice(msg) {
  if (diceStatus) { diceStatus.textContent = msg; }
}

// ── Render dice suggestions (distinct visual style) ───────────
function renderDiceSuggestions(list) {
  if (!filteredWrap) return;
  const mode = $suggestionsMode.get();
  if (mode !== 'dice') return;

  filteredWrap.classList.remove('hidden');
  const selectedIdx = $selectedIndex.get();
  filteredWrap.innerHTML = `<div class="dice-header">
    <span>Feeling lucky?</span>
    <button type="button" class="reroll-hint" id="reroll-btn">↻ roll again</button>
  </div>` +
    list.map((item, idx) => {
      const active = idx === selectedIdx ? 'bg-white/6' : '';
      return `<button type="button" data-dice-idx="${idx}" class="suggest-row dice-row group ${active}">
        <span class="dice-glyph flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold mr-2 flex-shrink-0">
          ⚄
        </span>
        <span class="truncate">${escapeHtml(item.question)}</span>
      </button>`;
    }).join('');

  // Re-roll button
  const rerollBtn = document.getElementById('reroll-btn');
  if (rerollBtn) rerollBtn.addEventListener('click', (e) => { e.stopPropagation(); rollDiceQuestions(); });

  // Dice row click → submit
  filteredWrap.querySelectorAll('[data-dice-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-dice-idx') || '0', 10);
      const list = $filteredSuggestions.get();
      if (idx < 0 || idx >= list.length) return;
      const q = list[idx];
      input.value = q.question;
      resizeTextarea(input);
      closeFiltered();
      validateInput();
      submit();
    });
  });

  // Staggered entrance animation
  const rows = filteredWrap.querySelectorAll('.dice-row');
  rows.forEach((row, i) => {
    row.classList.add('dice-row-enter');
    setTimeout(() => {
      row.classList.remove('dice-row-enter');
      row.classList.add('dice-row-entered');
    }, i * 70);
    setTimeout(() => { row.classList.add('pop'); }, i * 70 + 200);
  });
}

// ── Roll dice: slot-machine effect + SFX + haptics ────────────
function rollDiceQuestions() {
  if (isRolling) return;
  if (questions.length === 0) return;

  isRolling = true;

  const audio = getDiceAudio();
  audio.currentTime = 0;
  try { audio.play(); } catch {}
  navigator.vibrate?.(10);

  // Icon tumble
  if (sendIconDefault) {
    sendIconDefault.classList.remove('dice-tumbling');
    void sendIconDefault.offsetWidth; // reflow to restart animation
    sendIconDefault.classList.add('dice-tumbling');
    sendIconDefault.addEventListener('animationend', () => {
      sendIconDefault.classList.remove('dice-tumbling');
    }, { once: true });
  }

  // Slot machine: show intermediate random picks
  const finalSet = pickRandomQuestions($previousDiceSet.get());
  $previousDiceSet.set(finalSet);

  const intermediates = [pickRandomQuestions(), pickRandomQuestions()];

  $suggestionsMode.set('dice');
  $filteredSuggestions.set(intermediates[0]);
  renderDiceSuggestions(intermediates[0]);
  showSuggestionsPanel();

  setTimeout(() => {
    $filteredSuggestions.set(intermediates[1]);
    renderDiceSuggestions(intermediates[1]);

    setTimeout(() => {
      $filteredSuggestions.set(finalSet);
      renderDiceSuggestions(finalSet);
      announceDice(`Rolled 3 random questions: ${finalSet.map(q => q.question).join(', ')}`);
      isRolling = false;
    }, 120);
  }, 120);
}

function showSuggestionsPanel() {
  if (suggestionsPanel) {
    suggestionsPanel.dataset.collapsed = 'false';
    suggestionsPanel.classList.remove('h-0', 'opacity-0');
  }
  if (composerDivider) composerDivider.classList.remove('hidden');
}

// ── Debounced input handler ───────────────────────────────────
let debounceTimer = null;

function handleInputWithDebounce() {
  const query = input.value.trim();

  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }

  if (query.length < MIN_CHARS) {
    $filteredSuggestions.set([]);
    $selectedIndex.set(-1);
    if (filteredWrap) filteredWrap.innerHTML = '';
    updateSuggestionVisibility();
    return;
  }

  debounceTimer = setTimeout(() => {
    $suggestionsMode.set('filtered'); // exit dice mode on typing
    const results = filterQuestions(query);
    $filteredSuggestions.set(results);
    $selectedIndex.set(-1);
    renderSuggestions();
    updateSuggestionVisibility();
  }, DEBOUNCE_MS);
}

// ── Submit handler ────────────────────────────────────────────
function submit() {
  const value = input.value.trim();
  if (!value) return;
  if (!isValidQuestion(value)) {
    inputHelper.classList.remove('hidden');
    input.classList.add('ring-1', 'ring-amber-500/30');
    setTimeout(() => input.classList.remove('ring-1', 'ring-amber-500/30'), 600);
    return;
  }
  const matched = findExactQuestion(value);
  if (!matched) return;

  $isSubmitting.set(true);
  updateSuggestionVisibility();

  const newMessage = {
    id: generateId(),
    question: matched.question,
    answer: matched.answer,
    answer_type: matched.answer_type,
    images: matched.images || [],
    links: matched.links || [],
    timestamp: Date.now()
  };

  const api = window.chatHistoryApi;
  if (api) {
    api.showTyping(true, newMessage.images.length);
    setTimeout(() => {
      api.showTyping(false);
      api.add(newMessage);
      $isSubmitting.set(false);
      updateSuggestionVisibility();
    }, 600 + Math.random() * 300);
  } else {
    let history = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) history = JSON.parse(raw);
    } catch {}
    history = [...history, newMessage];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
    window.dispatchEvent(new CustomEvent('chat:updated'));
    $isSubmitting.set(false);
    updateSuggestionVisibility();
  }

  if (disclaimer) disclaimer.classList.remove('hidden');
  input.value = '';
  resizeTextarea(input);
  validateInput();
  closeFiltered();
  updateSuggestionVisibility();
}

// ── Event listeners ───────────────────────────────────────────
input.addEventListener('input', () => {
  resizeTextarea(input);
  validateInput();
  handleInputWithDebounce();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (canSubmit()) submit();
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const list = $filteredSuggestions.get();
    if (list.length === 0) return;
    e.preventDefault();
    const current = $selectedIndex.get();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = Math.max(-1, Math.min(list.length - 1, current + dir));
    $selectedIndex.set(next);
    renderSuggestions();
  }
});

// Single delegated handler — replaces both submit and future dice
  sendBtn.addEventListener('click', () => {
    const trimmed = input.value.trim();

    if (trimmed === '') {
      // Empty → roll dice
      rollDiceQuestions();
      return;
    }

    if (isValidQuestion(trimmed)) {
      // Valid → submit
      submit();
    } else {
      // Invalid typed text → attempt submit (shows helper, no silent clear+roll)
      submit();
    }
  });

window.addEventListener('chat:chip-click', (e) => {
  const q = e.detail && e.detail.question;
  if (!q) return;
  input.value = q;
  resizeTextarea(input);
  validateInput();
  submit();
});

window.addEventListener('chat:regenerate', (e) => {
  const messageId = e.detail && e.detail.messageId;
  if (!messageId) return;

  let history = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) history = JSON.parse(raw);
  } catch {}

  const existing = history.find(m => m.id === messageId);
  if (!existing) return;
  const matched = findExactQuestion(existing.question);
  if (!matched) return;

  const api = window.chatHistoryApi;
  if (!api) return;
  $isSubmitting.set(true);

  api.showTyping(true, existing.images.length);
  setTimeout(() => {
    const regenerated = { ...existing, timestamp: Date.now() };
    const updated = history.map(m => m.id === messageId ? regenerated : m);
    api.set(updated);
    api.showTyping(false);
    $isSubmitting.set(false);
  }, 600 + Math.random() * 300);
});

const updateDisclaimer = (show) => {
  if (!disclaimer) return;
  disclaimer.classList.toggle('hidden', !show);
};

window.addEventListener('chat:state', (e) => {
  const empty = !!(e.detail && e.detail.empty);
  updateDisclaimer(!empty);
  if (empty) setTimeout(() => updateSuggestionVisibility(), 50);
});

window.addEventListener('chat:updated', () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    updateDisclaimer(Array.isArray(arr) && arr.length > 0);
  } catch { updateDisclaimer(false); }
});

document.addEventListener('click', (e) => {
  const target = e.target;
  if (!filteredWrap?.contains(target) && target !== input && !input.closest('.composer')?.contains(target)) {
    closeFiltered();
  }
});

// ── Init ──────────────────────────────────────────────────────
updateDisclaimer(false);
resizeTextarea(input);
validateInput();
setSuggestionsCollapsed(false);
updateSuggestionVisibility();
