export interface PinnedItem {
  id: string;
  title: string;
  meta: string;
  icon: string;
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
  ratio: string; // tailwind aspect-*
  color: string; // gradient from-.. to-..
  wide?: boolean;
  src?: string;
}

export interface RecentItem {
  id: string;
  title: string;
  time: string;
  tag: string;
  icon: string;
  url: string;
  source: string;
}

export interface SidebarData {
  pinned: PinnedItem[];
  projects: ProjectItem[];
  library: LibraryItem[];
  recents: RecentItem[];
}

export type SidebarSectionKey = 'pinned' | 'projects' | 'library' | 'recents' | 'chats';

export interface SidebarSectionsState {
  pinned: boolean;
  projects: boolean;
  library: boolean;
  recents: boolean;
  chats: boolean;
}
