#!/bin/bash

# needs the following env vars set:

usage () {
  cat <<-EOF
#------------------------------------------------------------------------
# Holding for ${SLEEP} while a manual backup is run.
#
#------------------------------------------------------------------------

 Run the following command to backup your DB

  PGPASSWORD=\${POSTGRESQL_PASSWORD} pg_dump -Fp \\
    -h "\${DATABASE_SERVICE_NAME}" -p "\${PATRONI_MASTER_SERVICE_PORT}" \\
    -U \${POSTGRESQL_USER} \${POSTGRESQL_DATABASE} \\
    | gzip > "\${BACKUP_DIR}/\${DATABASE_SERVICE_NAME}.dmp-\`date +\%Y-\%m-\%d_%H-%M-%S\`.gz"

EOF
}

echoRed (){
  _msg=${1}
  _red='\e[31m'
  _nc='\e[0m' # No Color
  echo -e "${_red}${_msg}${_nc}"
}

# Show usage and then sleep

usage

if [ -z "${SLEEP}" ]; then
  SLEEP="1m"
fi

if [ ! -z "${AUTORUN_CMD}" ]; then
  echoRed "Running the following:"
  echo "${AUTORUN_CMD}"
  exec ${AUTORUN_CMD}
fi

echoRed "Sleeping for ${SLEEP} ..."
/usr/bin/sleep ${SLEEP}
