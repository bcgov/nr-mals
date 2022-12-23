#!/usr/bin/env bash
set -Eeu

if [[ (! -z "$APP_DB_OWNER_USERNAME") &&  (! -z "$APP_DB_OWNER_PASSWORD") && (! -z "$APP_DB_NAME")]]; then
  echo "Creating user ${APP_DB_OWNER_USERNAME}"
  psql "$1" -w -c "create user ${APP_DB_OWNER_USERNAME} WITH LOGIN ENCRYPTED PASSWORD '${APP_DB_OWNER_PASSWORD}'"

  echo "Creating database ${APP_DB_NAME}"
  psql "$1" -w -c "CREATE DATABASE ${APP_DB_NAME} OWNER ${APP_DB_OWNER_USERNAME} ENCODING '${APP_DB_ENCODING:-UTF8}' LC_COLLATE = '${APP_DB_LC_COLLATE:-en_US.UTF-8}' LC_CTYPE = '${APP_DB_LC_CTYPE:-en_US.UTF-8}'"

  echo "Creating user ${APP_PROXY_USERNAME}"
  psql "$1" -w -c "create user ${APP_PROXY_USERNAME} WITH LOGIN ENCRYPTED PASSWORD '${APP_PROXY_PASSWORD}'"

else
  echo "Skipping user creation"
  echo "Skipping database creation"
fi