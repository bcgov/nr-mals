
echo One-off UAT deployment that share the 30245e-test namespace, using a UAT name suffix
echo The backup templates support a single service name, ie patroni, in dev, test and prod, thus UAT will not have a backup unless specific templates are created. 

@echo off

echo Start of Script

echo 30245e-TEST UAT DEPLOY

oc project 30245e-test

echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
timeout 600
	
oc process --param-file=uat_mals-db-deploy.param -f uat_deployment-prereq.yaml -n 30245e-test | oc create -f -
 
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-test:patroni-uat -n 30245e-tools
	
oc process --param-file=uat_mals-db-deploy.param -f uat_deployment.yaml -n 30245e-test | oc apply -f -
	
echo WAIT ~3 MINUTES for the 3 pods to complete

echo End of Script
