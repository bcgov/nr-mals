
echo DO NOT USE
echo Reequires updating as the environment suffix was removed from the object names, per Wade Barnes' recommendation on best practices.
echo Can it be deployed in Prod???

# @echo off

# echo Start of Script

# echo 30245e-UAT DEPLOY

# oc project 30245e-test

# echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
# timeout 600
	
# oc process --param-file=../param/mals-db-deploy-uat.param -f ../templates/deployment-prereq.yaml -n 30245e-test | oc create -f -
 
# oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-test:patroni-uat -n 30245e-tools
	
# oc process --param-file=../param/mals-db-deploy-uat.param -f ../templates/deployment.yaml -n 30245e-test -p IMAGE_STREAM_TAG=patroni:v13-latest | oc apply -f -
	
# echo WAIT ~3 MINUTES for the 3 pods to complete

# echo End of Script
