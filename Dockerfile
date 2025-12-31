# Use official Bun image
FROM oven/bun:1.3.5-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY types.ts .
COPY utils.ts .
COPY index.ts .
COPY services/ ./services/

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Run the application
CMD ["bun", "run", "index.ts"]
