// @ts-check
import { defineConfig, envField } from 'astro/config';

// Plugins
import tailwindcss from "@tailwindcss/vite";

// Integrations
import vercel from "@astrojs/vercel";

export default defineConfig({
  env: {
    schema: {
      SECRET_RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
    }
  },
  vite: {
    plugins: [tailwindcss()],
  },

  // Server Deployment
  output: "server",
  adapter: vercel(),
});
