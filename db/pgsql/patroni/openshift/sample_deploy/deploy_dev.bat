@echo off

echo Start of Script

echo 30245e-DEV DEPLOY

oc project 30245e-dev

echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
timeout 600
	
oc process --param-file=../param/mals-db-deploy-dev.param -f ../templates/deployment-prereq.yaml -n 30245e-dev | oc create -f -
 
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-dev:patroni-dev -n 30245e-tools
	
oc process --param-file=../param/mals-db-deploy-dev.param -f ../templates/deployment.yaml -n 30245e-dev -p IMAGE_STREAM_TAG=patroni:v13-latest | oc apply -f -
	
echo WAIT ~3 MINUTES for the 3 pods to complete

echo End of Script
