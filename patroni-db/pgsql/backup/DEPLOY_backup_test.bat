@echo off

echo Start of Script

echo 30245e-TEST DEPLOY

oc project 30245e-test
	
oc -n 30245e-test create configmap backup-conf-mals --from-file=./config/backup.conf
oc -n 30245e-test label configmap backup-conf-mals app=mals-bkup

oc process --param-file=backup-deploy_test.param -f backup-deploy.yaml -n 30245e-test | oc create -f -
 
echo End of Script

