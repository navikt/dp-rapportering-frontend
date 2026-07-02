FROM node:24-alpine AS node
RUN corepack enable
RUN corepack prepare pnpm@11.1.2 --activate
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

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile && \
    pnpm config delete //npm.pkg.github.com/:_authToken
RUN pnpm run build


# install dependencies
FROM node AS app-dependencies
WORKDIR /app

COPY ./package.json ./
COPY ./pnpm-lock.yaml  ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile --prod && \
    pnpm config delete //npm.pkg.github.com/:_authToken


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=app-build /app/build /


# runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26@sha256:af2a360f0c74e10987a12fef94aa24499806aea95d3720cc1580aff29cf0ec88 AS runtime
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ="Europe/Oslo"
EXPOSE 3000

COPY ./package.json ./package.json
COPY --from=app-build /app/build/ ./build/
COPY --from=app-dependencies /app/node_modules ./node_modules

CMD ["./node_modules/@react-router/serve/dist/cli.js", "./build/server/index.js"]
