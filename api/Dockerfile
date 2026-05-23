FROM node:20-slim AS base

WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

FROM base AS prod
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
