# FadlanGPT — ChatGPT-like Portfolio (Astro-Only)

> Fast, static-first portfolio built with **Astro only** — optimized for speed. Multi-framework experimentation will come back in the future as a separate branch / integration lab.

## 🚀 Overview
ChatGPT-inspired personal portfolio for Fadlan Kautsar Noer. Layout: Sidebar kiri (Pinned / Projects / Library masonry / Recents) + Main thread ChatHistory di atas + ChatBox di bawah. State handled via `nanostores` + vanilla JS, zero framework islands.

**URL:** https://fadlank.web.id (soon: static deploy)
**Current Mode:** `output: "static"` — pure SPA, no server API. Contact/email will be handled via external API endpoint (e.g., Cloudflare Worker / serverless) to keep app static.
**Styling:** TailwindCSS v4 + custom CSS variables
**Icons:** @lucide/astro

## 🛠️ Tech Stack (Current — Astro-Only Speed Build)
- **Framework:** Astro v7 (static)
- **State:** nanostores v1.4 (chat messages, typing, suggestions)
- **Styling:** TailwindCSS v4 via @tailwindcss/vite
- **Icons:** @lucide/astro
- **Utils:** clsx + tailwind-merge
- **TypeScript:** 5.3

No React/Vue/Svelte/Solid/Preact/Alpine at runtime — pure Astro + vanilla JS for fastest build.

## 🗂️ Project Structure
```
src/
  assets/                 # cv, favicon, images, svgs
  components/
    Head.astro            # SEO meta
    Header.astro
    Sidebar.astro         # ChatGPT sidebar - collapsible + masonry library + notion recents
    ChatHistory.astro     # Thread: Q bubble right + A left, typing indicator, localStorage
    ChatBox.astro         # Input bar with autocomplete suggestions
    ChatBubble / ChatResponse / ChatThread (legacy helpers)
    ui/                   # small ui primitives
  integrations/           # Astro-only integrations (future: adapter to external APIs)
    ChatHistory.astro     # Pure Astro wrapper for ChatHistory — no Alpine
  data/
    sidebar.json          # pinned / projects / library / recents mock
    question-templates.json
  layouts/
    Layout.astro          # Main layout: Sidebar + ChatHistory + ChatBox, no Alpine
  stores/
    chat.ts               # nanostores: messages, hasChats, typing, suggestions, matching
  styles/
    global.css
  pages/
    index.astro
    404.astro
```

## 🎯 Features
- **ChatGPT-like UX:** Question bubbles (right, #303030 rounded-[24px] rounded-br-[6px]), answers left with avatar F gradient
- **Fast Build:** static output, no server adapter, minimal JS
- **Local Persistence:** chat history in localStorage `fadlan-chat-history`, sidebar state persisted
- **Smart Matching:** fuzzy Jaccard + includes scoring for template answers
- **Masonry Library:** variable w/h media grid via CSS columns + break-inside-avoid
- **Responsive:** mobile hamburger, overlay, collapsible sidebar

## 🗺️ Roadmap — Future Multi-Framework Lab
> Astro-only is temporary for speed. Plan to experiment again:

- **Phase 2:** Re-introduce islands selectively:
  - Alpine → lightweight toggles (optional)
  - Solid → Hero high-perf
  - Vue → Experience timeline
  - Preact/React → Project gallery / Testimonials
  - Svelte → Contact form via external API
- **Phase 3:** External API endpoints (SPA):
  - `/api/contact` alternative via Cloudflare Worker / Vercel Function standalone (not Astro API routes) to keep `output: static`
  - Notion API sync for `Recents`
  - Library API
- **Phase 4:** Evaluate island scope via `client:load` / `client:only` again for perf tradeoff.

## 📚 Docs
- Astro: https://docs.astro.build/en/getting-started
- Project Structure: https://docs.astro.build/en/basics/project-structure/

### How to Run
```bash
npm run dev      # start dev server
npm run build    # static build to dist/
npm run preview  # preview build
```

## Notes
- `src/pages/api` removed — app is now static SPA. Contact will hit external API.
- `env.d.ts` now only `/// <reference types="astro/client" />` — no SECRET_RESEND_API_KEY.
- `astro.config.mjs` is `output: "static"` — add adapter again later if you need server islands.

