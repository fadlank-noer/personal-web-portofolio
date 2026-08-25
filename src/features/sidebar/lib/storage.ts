import { STORAGE_KEY_SIDEBAR_COLLAPSED, STORAGE_KEY_SIDEBAR_SECTIONS } from '../../../lib/constants/storage-keys';
import type { SidebarSectionsState } from '../../../lib/types/sidebar';
import { DEFAULT_SIDEBAR_SECTIONS } from './constants';

export function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED) === 'true';
  } catch {
    return false;
  }
}
export function saveCollapsed(v: boolean): void {
  try { localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, String(v)); } catch {}
}
export function loadSections(): SidebarSectionsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SIDEBAR_SECTIONS);
    if (raw) return { ...DEFAULT_SIDEBAR_SECTIONS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SIDEBAR_SECTIONS };
}
export function saveSections(s: SidebarSectionsState): void {
  try { localStorage.setItem(STORAGE_KEY_SIDEBAR_SECTIONS, JSON.stringify(s)); } catch {}
}
export function isMobile(): boolean {
  return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
}
