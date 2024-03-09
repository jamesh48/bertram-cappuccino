# Install dependencies only when needed
FROM node:lts-alpine AS deps

WORKDIR /opt/bcp-app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
# This is where because may be the case that you would try
# to build the app based on some `X_TAG` in my case (Git commit hash)
# but the code hasn't changed.
FROM node:lts-alpine AS builder

ENV NODE_ENV=production
WORKDIR /opt/bcp-app
COPY . .
COPY --from=deps /opt/bcp-app/node_modules ./node_modules
RUN ls -ltr
RUN npm run build

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner

ARG X_TAG
WORKDIR /opt/bcp-app
ENV NODE_ENV=production
COPY --from=builder /opt/bcp-app/next.config.js ./
COPY --from=builder /opt/bcp-app/public ./public
COPY --from=builder /opt/bcp-app/.next ./.next
COPY --from=builder /opt/bcp-app/package*.json ./
COPY --from=builder /opt/bcp-app/node_modules ./node_modules


EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]