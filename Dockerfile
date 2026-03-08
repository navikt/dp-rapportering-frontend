FROM node:24-alpine AS node
RUN corepack enable
RUN corepack prepare pnpm@10.30.1 --activate
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN pnpm config set @navikt:registry=https://npm.pkg.github.com


# build app
FROM node AS app-build
WORKDIR /app
ENV RUNTIME_ENVIRONMENT=${RUNTIME_ENVIRONMENT}

COPY ./app ./app
COPY ./mocks ./mocks
COPY ./public ./public
COPY ./vite.config.ts ./
COPY ./react-router.config.ts ./
COPY ./package.json ./
COPY ./pnpm-lock.yaml  ./

RUN pnpm install --ignore-scripts --frozen-lockfile
RUN pnpm run build


# install dependencies
FROM node AS app-dependencies
WORKDIR /app

COPY ./package.json ./
COPY ./pnpm-lock.yaml  ./

RUN pnpm install --ignore-scripts --frozen-lockfile --prod


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=app-build /app/build /


# runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24@sha256:9cbe69a821c14ba9e335307d7f6d3c0936153f27e65b2d74ea3346465f7dacb5 AS runtime
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ="Europe/Oslo"
EXPOSE 3000

COPY ./package.json ./package.json
COPY --from=app-build /app/build/ ./build/
COPY --from=app-dependencies /app/node_modules ./node_modules

CMD ["./node_modules/@react-router/serve/dist/cli.js", "./build/server/index.js"]
