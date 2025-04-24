#
# Build stage
#
FROM node:22 AS builder

# Set working directory
WORKDIR /app

# heap out of memory
ENV NODE_OPTIONS=--max_old_space_size=4096

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY .npmrc ./

# Clean install dependencies
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# 
# Production stage
#
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create directory and set permissions
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
RUN mkdir -p /app/temp && chown -R node:node /app/temp

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
ENTRYPOINT ["node", "dist/main.js"]
