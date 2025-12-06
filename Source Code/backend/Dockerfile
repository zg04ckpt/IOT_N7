FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache curl tar bash python3 py3-pip git ca-certificates

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY index.js ./
COPY src/ ./src/

RUN mkdir -p temp firmware_versions uploads tools/firmware_compiler/arduino-cli && \
    chown -R node:node /app

USER node

ENV NODE_ENV=production
CMD ["sh", "-c", "npm run migrate && npm run seed && node index.js"]
