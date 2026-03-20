FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production --no-optional && npm cache clean --force

# Copy .env trước để runtime đọc
COPY .env ./

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]
