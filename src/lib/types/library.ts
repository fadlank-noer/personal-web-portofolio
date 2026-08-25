export type LibraryMediaType = 'image' | 'video';
export type LibrarySource = 'images' | 'projects';

export interface LibraryItem {
  id: string;
  type: LibraryMediaType;
  label: string;
  src: string; // plain URL string e.g. "/assets/images/photo-in-boat.png"
  source?: LibrarySource;
  /** Natural image dimensions — required for JS masonry layout */
  width?: number;
  height?: number;
}