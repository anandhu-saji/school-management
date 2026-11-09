# Multi-stage Dockerfile for GHSS School Portal
# -------------------------------------------------------------
# Stage 1: Build Frontend SPA
# -------------------------------------------------------------
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Server Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server application source code
COPY server/ ./server/

# Copy compiled frontend assets from client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose HTTP port
EXPOSE 5000

# Start unified production server
WORKDIR /app/server
CMD ["node", "src/server.js"]
