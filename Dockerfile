# Domain app image. Derived from the Shell's Dockerfile, with the Prisma steps
# removed — no domain app uses Prisma, and it is being retired from the estate.

# TEMP-NEXUS-BYPASS: original line below, restore once Nexus DNS is fixed
# FROM docker.sebaoffice.ir/library/node:22-alpine AS base
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm i -g npm@11.6.0
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are inlined at build time, so they must be present here and not
# only at runtime.
ARG NEXT_PUBLIC_BASE_PATH="/general-meeting"
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

ARG NEXT_PUBLIC_APP_NAME="KSS_Client_Web_general-meeting"
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

RUN npm run build

FROM base AS runner
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# i18n is read at runtime as well as bundled.
COPY --from=builder --chown=nextjs:nodejs /app/i18n ./i18n

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "server.js"]
