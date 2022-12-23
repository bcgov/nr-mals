@echo off

echo Start of Script

echo 30245e-TEST DELETE

oc project 30245e-test

oc delete deploymentconfig backup-mals
oc delete persistentvolumeclaim backup
oc delete persistentvolumeclaim backup-verification
oc delete secret backup-mals-creds
oc delete configmap backup-conf-mals

echo End of Script
