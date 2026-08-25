export function escapeHtml(s: string): string {
  const d = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!d) return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  d.textContent = s;
  return d.innerHTML;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?!.]+$/g, '');
}

export function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

export function generateId(prefix = 'msg'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function genUUID(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
