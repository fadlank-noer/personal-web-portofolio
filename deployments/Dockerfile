# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Astro static site
RUN npm run build

# ─── Nginx stage ────────────────────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx SPA config
COPY deployments/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]