FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS node
RUN corepack enable
RUN corepack prepare pnpm@12.15.0 --activate
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
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26@sha256:74ae442a92cf9fadbe5da5aa4c9b94893332940b064ee215d122264e9021443b AS runtime
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV TZ="Europe/Oslo"
EXPOSE 3000

COPY ./package.json ./package.json
COPY --from=app-build /app/build/ ./build/
COPY --from=app-dependencies /app/node_modules ./node_modules

CMD ["./node_modules/@react-router/serve/dist/cli.js", "./build/server/index.js"]
