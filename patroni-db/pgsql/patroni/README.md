
-- Source & Credit

	Source code copied from https://github.com/BCDevOps/platform-services/tree/master/apps/pgsql/patroni

-- Openshift Command Line tool (oc) download

	https://github.com/openshift/origin/releases

-- Updates were made to add an application proxy user.

	deployment-prereq.yaml and deployment.yaml 
	
		Split APP_DB_USERNAME into APP_DB_OWNER_USERNAME and APP_PROXY_USERNAME in order to separate the owner DDL and application DML responsibilities. 

-- The following role bindings permit the patroni service accounts to pull the patroni build from the tools namespace. 

	oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-dev:patroni      -n 30245e-tools
	oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-test:patroni     -n 30245e-tools
	oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-uat:patroni-uat  -n 30245e-tools
	oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-prod:patroni     -n 30245e-tools

-- For OCP4 the Kubernetes Network Policy (KNP) replaces Aporeto Network Security Policy (NSP) and must be configured to alllow the pods to talk to each other.

	https://github.com/bcgov/networkpolicy-migration-workshop

		nr-mals\db\pgsql\patroni\openshift\templates>oc process -f quickstart.yaml -p NAMESPACE_PREFIX=30245e -p ENVIRONMENT=dev | oc apply -f -
		networkpolicy "deny-by-default" created
		networkpolicy "allow-from-openshift-ingress" created
		networkpolicy "allow-all-internal" created
		networksecuritypolicy "any-to-any" created
		networksecuritypolicy "any-to-external" created

-- Sample Windows deployment batch scripts exist in the sample_deploy subdirectory.

	--   Below are the steps that exist in the deploy_dev.bat script.
	--   Replace dev with test, uat or prod as required.
	--   For uat, the project name is 30245e-test

		@echo off

		echo Start of Script

		echo 30245e-DEV DEPLOY

		oc project 30245e-dev

		echo WAIT ~10 MINUTES for the build to complete. Skip if the build was deployed earlier.
		timeout 600
			
		oc process --param-file=../param/mals-db-deploy-dev.param -f ../templates/deployment-prereq.yaml -n 30245e-dev | oc create -f -
			
		oc process --param-file=../param/mals-db-deploy-dev.param -f ../templates/deployment.yaml -n 30245e-dev -p IMAGE_STREAM_TAG=patroni:v13-latest | oc apply -f -
			
		echo WAIT ~3 MINUTES for the 3 pods to complete

		echo End of Script
		
-- Backup and recovery templates

	Was not able to get these templates to deploy successfully; https://github.com/BCDevOps/backup-container
	
	Used the following templates; https://github.com/bcgov/orgbook-configurations
	
	Related issue; https://github.com/BCDevOps/backup-container/issues/83
	
	Updated the templates to work with Roles, as the base templates support only a single database user.
	
		