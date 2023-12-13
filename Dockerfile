FROM docker.io/node:16.15.0-alpine

ENV NO_UPDATE_NOTIFIER=true
ENV NPM_CONFIG_CACHE=/opt/app-root/src/app/.npm-cache

WORKDIR /opt/app-root/src/app
COPY . /opt/app-root/src

USER 1001:1001

RUN npm run all:ci \
    && npm run all:build \
    && npm run client:purge

EXPOSE 8000
CMD ["npm", "run", "start"]
