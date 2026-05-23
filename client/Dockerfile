FROM node:20-alpine as b
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine as r
WORKDIR /app

ENV NENV=prod
ENV PORT=3000
ENV HOST="0.0.0.0"

COPY --from=b /app/public ./public
COPY --from=b /app/.next/standalone ./
COPY --from=b /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]