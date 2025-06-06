FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY . .

# Create directories for logs and data
RUN mkdir -p logs data

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sms-user -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R sms-user:nodejs /app

# Switch to non-root user
USER sms-user

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
