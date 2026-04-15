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

# dbmate for migrations; postgresql-client for seed SQL
RUN apk add --no-cache curl postgresql16-client && \
    curl -fsSL https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 -o /usr/local/bin/dbmate && \
    chmod +x /usr/local/bin/dbmate

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db ./db

# Environment variables will be injected by docker-compose
EXPOSE 4000

# Migrations, seed data, then API (seed is idempotent on fixed UUIDs)
CMD ["sh", "-c", "dbmate up && psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f db/seed.sql && node dist/index.js"]
