# Subdirectory for NR-MALS-APP

# Dev setup

Mals is configured to connect to the databases in OpenShift. To do so, please do the following:

1. Login to openshift from terminal (e.g. get your login command from OpenShift and switch to the project dev/test for Mals)
2. Get the pod name for the database
3. Issue the command `oc port-forward {database pod name} 5436:5432`

Next, generate the prisma client (has to be done the first time the app is setup, or anytime a database change is made):

`npx prisma generate`

Note: there's a bug with prisma, where the generated file isn't found by the backend. You can either restart vs code, or navigate directly to `node_modules/.prisma/index.d.ts` to view the file.
