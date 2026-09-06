/**
 * Schema for src/data/projects.json — the standalone data source for the
 * Projects page (src/pages/projects.astro).
 * cv/fadlan.json is intentionally NOT the source for the Projects page.
 */
export interface ProjectEntry {
  id: string;
  title: string;
  desc: string;
  url: string;
  image: string;
  color: string;
  thumb: string;
  count: number;
  category: string;
  /** Per-project ambient glow color used in the projects page hover effect (rgba/hex). */
  glowColor: string;
}
