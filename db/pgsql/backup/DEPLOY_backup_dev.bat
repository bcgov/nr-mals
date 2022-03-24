@echo off

echo Start of Script

echo 30245e-DEV DEPLOY

oc project 30245e-dev
	
oc -n 30245e-dev create configmap backup-conf-mals --from-file=./config/backup.conf
oc -n 30245e-dev label configmap backup-conf-mals app=mals-bkup

oc process --param-file=backup-deploy_dev.param -f backup-deploy.yaml -n 30245e-dev | oc create -f -
 
echo End of Script

