# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Copy source and build
COPY client/ ./

# Vite env vars must be present at build time
ARG VITE_APP_NAME=KeyDuel
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_RACE_ENGINE_BASE_URL

RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config and built assets
COPY infra/fly/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
