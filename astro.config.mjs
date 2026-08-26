// @ts-check
import { defineConfig } from 'astro/config';

// Plugins
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://fadlank.web.id",
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [
          '/c/Users/User/Documents/Coding Projects/general-workspace/personal-web-portofolio',
          '/c/Users/User/Documents/Coding Projects/personal-web-portofolio',
        ],
      },
    },
  },

  // SPA-ready: static output for speed, no server secrets
  output: "static",

  integrations: [
    sitemap(),
  ],
});
