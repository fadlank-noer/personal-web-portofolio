import type { LibraryItem } from '../lib/types/library';

// Manifest of public/assets/images/ + public/assets/projects/
// Keep in sync when adding/removing files.
export const libraryItems: LibraryItem[] = [
  {
    id: 'img-photo-in-boat',
    type: 'image',
    label: 'photo-in-boat.png',
    src: '/assets/images/photo-in-boat.png',
    source: 'images',
  },
  {
    id: 'img-photo-in-studio',
    type: 'image',
    label: 'photo-in-studio.png',
    src: '/assets/images/photo-in-studio.png',
    source: 'images',
  },
  {
    id: 'img-laundry-preview',
    type: 'image',
    label: 'laundry-preview.png',
    src: '/assets/projects/laundry-preview.png',
    source: 'projects',
  },
  {
    id: 'img-prompt-builder-preview',
    type: 'image',
    label: 'prompt-builder-preview.png',
    src: '/assets/projects/prompt-builder-preview.png',
    source: 'projects',
  },
];