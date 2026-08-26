import type { APIRoute } from "astro";

// All pages on the site — kept in sync with src/pages/
const PAGES = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/cv/", priority: "0.9", changefreq: "monthly" },
  { url: "/cv/fadlan/", priority: "0.8", changefreq: "monthly" },
  { url: "/cv/work/", priority: "0.8", changefreq: "monthly" },
  { url: "/library/", priority: "0.7", changefreq: "monthly" },
  { url: "/projects/", priority: "0.8", changefreq: "monthly" },
  { url: "/social/", priority: "0.7", changefreq: "monthly" },
];

const SITE = "https://fadlank.web.id";

export const GET: APIRoute = () => {
  const urls = PAGES.map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${SITE}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};