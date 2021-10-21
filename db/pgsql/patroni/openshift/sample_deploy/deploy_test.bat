@echo off

echo Start of Script

echo 30245e-TEST DEPLOY

oc project 30245e-test

echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
timeout 600
	
oc process -f ../templates/quickstart.yaml -n 30245e-test -p NAMESPACE_PREFIX=30245e -p ENVIRONMENT=test | oc create -f -

oc process --param-file=../param/mals-db-deploy-test.param -f ../templates/deployment-prereq.yaml -n 30245e-test | oc create -f -
 
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-test:patroni -n 30245e-tools
	
oc process --param-file=../param/mals-db-deploy-test.param -f ../templates/deployment.yaml -n 30245e-test | oc apply -f -
	
echo WAIT ~3 MINUTES for the 3 pods to complete

echo End of Script
