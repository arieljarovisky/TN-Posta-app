FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY api/package.json ./api/

RUN node .yarn/releases/yarn-3.2.2.cjs install

COPY api ./api

ENV NODE_ENV=production

CMD ["node", ".yarn/releases/yarn-3.2.2.cjs", "workspace", "api", "start"]
