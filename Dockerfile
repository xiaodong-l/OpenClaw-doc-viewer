# OpenClaw Doc Viewer - Multi-stage Dockerfile
# https://github.com/xiaodong-l/OpenClaw-doc-viewer

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY workspace/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY workspace/frontend/ ./

# Build frontend
RUN npm run build

# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY workspace/backend/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy backend source
COPY workspace/backend/ ./

# ============================================
# Stage 3: Production Image
# ============================================
FROM node:18-alpine AS production

# Add labels
LABEL maintainer="xiaodong-l <3253612047@qq.com>"
LABEL org.opencontainers.image.title="OpenClaw Doc Viewer"
LABEL org.opencontainers.image.description="A modern document viewer for Markdown documentation"
LABEL org.opencontainers.image.source="https://github.com/xiaodong-l/OpenClaw-doc-viewer"
LABEL org.opencontainers.image.licenses="MIT"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built frontend from builder
COPY --from=frontend-builder /app/dist ./workspace/frontend/dist

# Copy backend from builder
COPY --from=backend-builder /app/node_modules ./workspace/backend/node_modules
COPY --from=backend-builder /app/src ./workspace/backend/src
COPY --from=backend-builder /app/package*.json ./workspace/backend/

# Copy shared configs
COPY workspace/backend/config/ ./workspace/backend/config/

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "workspace/backend/src/server.js"]

# ============================================
# Development Image (alternative)
# ============================================
# To build development image, use:
# docker build --target dev -t doc-viewer:dev .
# ============================================

FROM node:18-alpine AS dev

WORKDIR /app

# Install development dependencies
COPY workspace/backend/package*.json ./workspace/backend/
COPY workspace/frontend/package*.json ./workspace/frontend/

RUN cd workspace/backend && npm ci && \
    cd ../frontend && npm ci

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 5173

CMD ["npm", "run", "dev"]
