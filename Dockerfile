# Multi-stage Dockerfile for Next.js production
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (use npm by default)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy rest and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built files and production deps
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE ${PORT}

CMD ["npm", "start", "--", "-p", "${PORT}"]
