FROM docker.io/node:16.15.0-alpine

ENV NO_UPDATE_NOTIFIER=true
WORKDIR /opt/app-root/src/app
COPY . /opt/app-root/src
USER node
RUN npm install --unsafe-perm \
  && npm run all:ci \
  && npm run all:build \
  && npm run client:purge
EXPOSE 8000
# Switch to non-root user
CMD ["npm", "run", "start"]
