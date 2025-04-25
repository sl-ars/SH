# ---- Builder Stage ----
FROM node:lts-alpine AS builder
WORKDIR /app

# Set ARGs and ENVs for build-time variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install all dependencies (including dev for build)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application (this will create .next/standalone)
RUN pnpm run build

# ---- Runner Stage ----
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy the standalone Next.js server output
COPY --from=builder /app/.next/standalone ./ 
# Copy public assets
COPY --from=builder /app/public ./public
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Expose port 3000 (Next.js standalone server listens on this port by default)
EXPOSE 3000

# Set the command to start the Next.js standalone server
CMD ["node", "server.js"]