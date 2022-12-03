FROM docker.io/node:16.15.0-alpine

ENV NO_UPDATE_NOTIFIER=true
ENV REACT_APP_ENVIRONMENT_LABEL=dev
WORKDIR /opt/app-root/src/app
COPY . /opt/app-root/src
RUN npm run all:ci \
  && npm run all:build \
  && npm run client:purge
EXPOSE 8000
CMD ["npm", "run", "start"]
