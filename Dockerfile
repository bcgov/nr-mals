FROM docker.io/node:16.15.0-alpine

ENV NO_UPDATE_NOTIFIER=true
WORKDIR /home/node/app
COPY . /opt/app-root/src
RUN npm run all:ci \
  && npm run all:build \
  && npm run client:purge
EXPOSE 8000

CMD ["npm", "run", "start"]
