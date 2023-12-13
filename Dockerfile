FROM docker.io/node:16.15.0-alpine

ENV NO_UPDATE_NOTIFIER=true
WORKDIR /opt/app-root/src/app
COPY . /opt/app-root/src
RUN npm run all:ci \
  && npm run all:build \
  && npm run client:purge
EXPOSE 8000

# Switch to a non-root user with UID 1001 and GID 1001
USER 1001:1001

CMD ["npm", "run", "start"]
