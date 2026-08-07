// @ts-check
import { defineConfig } from 'astro/config';

// Plugins
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  // SPA-ready: static output for speed, no server secrets
  output: "static",
});
