FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies (production)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Tạo non-root user để đảm bảo an toàn bảo mật
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs
USER nodejs

EXPOSE 8090

CMD ["node", "src/server.js"]

