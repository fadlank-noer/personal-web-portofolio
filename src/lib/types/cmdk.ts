/**
 * CmdKItem — item shape for the Cmd+K command palette.
 * Normalized from sidebar.json recents[] (url field) and pinned[] (meta field).
 */
export interface CmdKItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  tag?: string;
  time?: string;
}

/** Raw item from sidebar.json — recents use url, pinned use meta */
export interface RawSidebarItem {
  id: string;
  title: string;
  url?: string;
  meta?: string;
  source?: string;
  tag?: string;
  time?: string;
  icon?: string;
  type?: string;
}

/** Data passed via window.__CMDK_DATA__ from Astro inline script */
export interface CmdKWindowData {
  items: CmdKItem[];
}