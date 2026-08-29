# Stage 1: Build Environment
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency definitions and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the source code and build
COPY . .
RUN npm run build

# Stage 2: Production Environment
FROM node:24-alpine

WORKDIR /app

# Set environment to production and define data directory
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# Copy only dependency definitions
COPY package.json package-lock.json* ./

# Install only production dependencies for smaller image size
RUN npm ci --omit=dev && npm cache clean --force

# Copy only the compiled artifacts from the builder
COPY --from=builder /app/dist ./dist

# Create the data directory and set permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Switch to non-root user for security
USER node

# Expose the designated server port
EXPOSE 3000

# Start the application using the compiled backend
CMD ["node", "dist/server.cjs"]
