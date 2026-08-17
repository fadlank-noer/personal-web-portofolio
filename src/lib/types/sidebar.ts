export type PinnedItemType = 'project' | 'notion';

export interface PinnedItem {
  id: string;
  title: string;
  meta?: string;
  icon?: string;
  type?: PinnedItemType;
}

export interface ProjectItem {
  id: string;
  title: string;
  desc: string;
  count: number;
  color: string;
  thumb: string;
  url: string;
  featured?: boolean;
}

export type LibraryMediaType = 'image' | 'video' | 'wide' | string;

export interface LibraryItem {
  id: string;
  type: LibraryMediaType;
  label: string;
  ratio: string;
  color: string;
  wide?: boolean;
  src?: string;
}

export interface RecentItem {
  id: string;
  title: string;
  time: string;
  tag: string;
  url: string;
  source: string;
}

export interface SidebarData {
  pinned: PinnedItem[];
  recents: RecentItem[];
}

export type SidebarSectionKey = 'pinned' | 'recents' | 'chats';

export interface SidebarSectionsState {
  pinned: boolean;
  recents: boolean;
  chats: boolean;
}
