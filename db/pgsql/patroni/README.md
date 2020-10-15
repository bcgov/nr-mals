-- Source & Credit

	Source code copied from https://github.com/BCDevOps/platform-services/tree/master/apps/pgsql/patroni

-- Openshift Command Line tool (oc) download

	https://github.com/openshift/origin/releases

-- Updates made

		deployment-prereq.yaml and deployment.yaml 
		
			Split APP_DB_USERNAME into APP_DB_OWNER_USERNAME and APP_PROXY_USERNAME in order to separate the owner DDL and application DML responsibilities. 

-- Sample MALS Deployment BAT File - bsoszr-dev

	--   Replace dev with test, uat or prod as required.
	--   For uat, the project name is bsoszr-test

		@echo off

		echo Start of Script

		cd C:\temp\GitHub\nr-mals\db\pgsql\patroni\openshift

		echo BSOSZR-DEV DEPLOY

		oc project bsoszr-dev

		echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
		timeout 600
			
		oc process --param-file=mals-db-deploy-dev.param -f ./templates/deployment_prereq.yaml -n bsoszr-dev | oc create -f -
		 
		oc policy add-role-to-user system:image-puller system:serviceaccount:bsoszr-dev:patroni-dev -n bsoszr-tools

		oc process --param-file=mals-db-deploy-dev.param -f ./templates/deployment.yaml -n bsoszr-dev | oc apply -f -

		echo WAIT ~3 MINUTES for the 3 pods to complete

		echo End of Script