@echo off

echo Start of Script

echo 30245e-PROD DEPLOY

oc project 30245e-prod
	
oc -n 30245e-prod create configmap backup-conf-mals --from-file=./config/backup.conf
oc -n 30245e-prod label configmap backup-conf-mals app=mals-bkup

oc process --param-file=backup-deploy_prod.param -f backup-deploy.yaml -n 30245e-prod | oc create -f -
 
echo End of Script

