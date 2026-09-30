/**
 * Substack → sidebar recents bridge (build time only).
 *
 * Posts are fetched from the publication by scripts/prebuild.mjs (before
 * `astro build` / `astro dev`) and persisted to __substack_rendered/posts.json.
 * This module only reads that file back from disk — no network at render time.
 * Recents have no other source: if the prebuild hasn't run (fresh clone,
 * failed fetch), the sidebar shows an empty Recents section.
 */
import { StaticSubstackInitiator } from 'astro-substack';
import type { RecentItem } from './types/sidebar';

export async function getSubstackRecents(): Promise<RecentItem[]> {
  try {
    // Handle comes from meta in posts.json (written by the prebuild), so no
    // env access is needed here — Vite resolves env differently from Node.
    const client = new StaticSubstackInitiator('unused-at-build-time', process.cwd());
    const { posts } = await client.loadStaticPosts();
    return posts.map((post) => ({
      id: `substack-${post.id}`,
      title: post.title,
      time: post.postDate.slice(0, 10),
      tag: 'Substack',
      url: post.canonicalUrl,
      source: 'substack',
    }));
  } catch {
    return [];
  }
}
