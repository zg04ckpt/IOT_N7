FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
## Copy only application sources and required files to avoid embedding large artifacts
COPY package*.json ./
COPY index.js ./
COPY src/ ./src/

ENV NODE_ENV=production
CMD ["sh", "-c", "npm run migrate && npm run seed && node index.js"]
