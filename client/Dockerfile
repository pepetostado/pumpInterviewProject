FROM node:20-slim AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS dev

WORKDIR /app
COPY --from=base /app .
COPY next.config.mjs postcss.config.mjs jsconfig.json eslint.config.mjs ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-slim AS build

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY . .
RUN npm run build

FROM node:20-slim AS prod

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

CMD ["node", "server.js"]
