FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước
COPY package*.json ./
RUN npm ci

# Copy .env để Vite đọc lúc build
COPY .env ./

# Copy source và build
COPY . .
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g serve@14

# Copy dist từ builder
COPY --from=builder /app/dist ./dist
EXPOSE 3022

CMD ["serve", "-s", "dist", "-l", "3022"]
