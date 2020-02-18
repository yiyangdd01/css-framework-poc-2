# Install Stage
FROM hk01/docker-node:10-v0.1 AS installer
WORKDIR /srv

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

COPY package.json yarn.lock ./

RUN /base/scripts/token-init.sh \
    && yarn --production

COPY . .

# Builder Stage
FROM hk01/docker-node:10-v0.1 AS builder
WORKDIR /srv

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

COPY --from=installer /srv/. .

RUN /base/scripts/token-init.sh \
    && yarn \
    && yarn build

# Run Stage
# use node server to host both ssr and statics
FROM hk01/docker-node:10-v0.1

WORKDIR /srv

# Copy server side code without dev dependencies from installer stage
COPY --from=installer /srv/. .
# Copy static files from builder stage to be service by node server
COPY --from=builder /srv/.next ./.next

# nextjs requires `NODE_ENV=production` for backend
ENV PORT=3000 \
    PM2_SCRIPT=/srv/server/index.js \
    NODE_ENV=production

ENTRYPOINT ["/base/scripts/start.sh"]
