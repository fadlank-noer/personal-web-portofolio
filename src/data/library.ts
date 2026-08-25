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
    width: 1080,
    height: 1080,
  },
  {
    id: 'img-photo-in-studio',
    type: 'image',
    label: 'photo-in-studio.png',
    src: '/assets/images/photo-in-studio.png',
    source: 'images',
    width: 512,
    height: 512,
  },
  {
    id: 'img-laundry-preview',
    type: 'image',
    label: 'laundry-preview.png',
    src: '/assets/projects/laundry-preview.png',
    source: 'projects',
    width: 1254,
    height: 1254,
  },
  {
    id: 'img-prompt-builder-preview',
    type: 'image',
    label: 'prompt-builder-preview.png',
    src: '/assets/projects/prompt-builder-preview.png',
    source: 'projects',
    width: 2048,
    height: 2048,
  },
  {
    id: 'img-kamen-rider-26-8',
    type: 'image',
    label: 'Kamen Rider Premiere',
    src: '/assets/images/kamen-rider-26-8.jpg',
    source: 'images',
    width: 562,
    height: 1280,
  },
];