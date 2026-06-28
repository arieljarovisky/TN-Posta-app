FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY api/package.json ./api/
COPY frontend/package.json ./frontend/

RUN node .yarn/releases/yarn-3.2.2.cjs install

COPY api ./api
COPY frontend ./frontend

ARG CLIENT_ID
ENV VITE_CLIENT_ID=${CLIENT_ID}
ENV VITE_API_URL=

RUN node .yarn/releases/yarn-3.2.2.cjs workspace frontend build

ENV NODE_ENV=production

CMD ["node", "api/start-prod.js"]
