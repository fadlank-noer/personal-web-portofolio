// Astro middleware - safe 404 handling for SPA
// Note: Vercel adapter already has catch-all ^/.*$ -> _render status 404
// This middleware just ensures no infinite redirect loop (guards /404, /api, _astro, _image, assets)

export const onRequest = (context: any, next: any) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Always allow these - prevent loop
  if (
    pathname.startsWith("/404") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/_image") ||
    pathname.startsWith("/_server-islands") ||
    pathname === "/" ||
    pathname.includes(".") // static assets like favicon, etc
  ) {
    return next();
  }

  // For any other route - let Astro handle via 404.astro (Vercel catch-all will set 404 status)
  // Do NOT redirect - just continue, Astro will render 404.astro automatically
  return next();
};
