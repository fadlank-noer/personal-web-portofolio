import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL("sitemap.xml", site ?? "https://fadlank.web.id");
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${sitemapUrl.href}
`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
};