# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Install curl and dbmate for migrations
RUN apk add --no-cache curl && \
    curl -fsSL https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 -o /usr/local/bin/dbmate && \
    chmod +x /usr/local/bin/dbmate

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db ./db

# Environment variables will be injected by docker-compose
EXPOSE 4000

# Run migrations and start the server
CMD ["sh", "-c", "dbmate up && node dist/index.js"]
