import type { CvData } from './types';

export const DEFAULT_SLUG = 'fadlan';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Builds the slug -> CvData registry from every JSON file in src/data/cv/.
 * Glob keys are derived from the file path, giving us the slug list for free
 * (repo-proven pattern from library.astro). Strict TS returns `unknown` from
 * glob modules, so each module is validated via assertValidCv at load time.
 */
const modules = import.meta.glob('/src/data/cv/*.json', { eager: true });

const registry = new Map<string, CvData>();

function assertValidCv(data: unknown, slug: string): CvData {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`CV data invalid: ${slug}.json — root`);
  }
  const d = data as Record<string, unknown>;

  const basics = d.basics;
  if (typeof basics !== 'object' || basics === null) {
    throw new Error(`CV data invalid: ${slug}.json — basics`);
  }
  const b = basics as Record<string, unknown>;
  if (typeof b.name !== 'string' || b.name.length === 0) {
    throw new Error(`CV data invalid: ${slug}.json — basics.name`);
  }

  for (const key of ['work', 'education', 'skills'] as const) {
    if (!Array.isArray(d[key])) {
      throw new Error(`CV data invalid: ${slug}.json — ${key}`);
    }
  }

  if ((d.work as unknown[]).length < 1) {
    throw new Error(`CV data invalid: ${slug}.json — work (needs ≥1 entry)`);
  }

  const checkDates = (arr: unknown | undefined, label: string) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item, i) => {
      if (typeof item !== 'object' || item === null) return;
      const o = item as Record<string, unknown>;
      for (const f of ['startDate', 'endDate']) {
        const v = o[f];
        if (v !== undefined && v !== null && (typeof v !== 'string' || !ISO_DATE.test(v))) {
          throw new Error(`CV data invalid: ${slug}.json — ${label}[${i}].${f}`);
        }
      }
    });
  };
  checkDates(d.work, 'work');
  checkDates(d.education, 'education');
  checkDates(d.projects, 'projects');

  return data as CvData;
}

for (const [path, mod] of Object.entries(modules)) {
  const slug = path.split('/').pop()?.replace('.json', '');
  if (!slug) continue;
  const modObj = mod as { default?: unknown };
  const data = modObj.default ?? modObj;
  registry.set(slug, assertValidCv(data, slug));
}

/**
 * trim -> lowercase -> /^[a-z0-9-]+$/ -> registry membership.
 * Returns null if any guard fails (caller falls back to default).
 */
export function normalizeSlug(raw?: string): string | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  if (!registry.has(slug)) return null;
  return slug;
}

export function getCvBySlug(slug?: string): CvData {
  const norm = normalizeSlug(slug);
  const key = norm ?? DEFAULT_SLUG;
  return registry.get(key) ?? (registry.get(DEFAULT_SLUG) as CvData);
}

export function getAvailableSlugs(): string[] {
  return [...registry.keys()];
}
