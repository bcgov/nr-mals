
Errors were encountered while deploying the templates found on;

	https://github.com/BCDevOps/backup-container
	
The following backup templates were cloned then updated;

	https://github.com/bcgov/orgbook-configurations/tree/master/openshift/templates/backup	
	
Sample Backup Deployment

		oc login --token=... --server=...
		
		cd C:\temp\git\nr-mals\db\pgsql\backup
		
		DEPLOY_backup_build.bat
		
		DEPLOY_backup_dev.bat
		
The backups execute successfuly thought the validation scripts produce and error because the source Dockerfile uses pg_dump, which does not consider roles. As a result, there are a number of GRANT statements that fail. The paltform-services templates include a single database user who owns the database objects and is also used for all application connections. The nr-mals postgres templates have been updated to include a proxy user for the application as per best practices of least privileges required.

The issue is documented in Git;

	https://github.com/BCDevOps/backup-container/issues/83

As the automatic validation is not available, below are the steps to manually validate the backup.

* Note: The production backup will contain client PI data. This process requires an empty PostgreSQL database that is sedure.

	-- OpenShift

		Connect to the backup pod and find the desired path of hte directory in which the desired backup exists.

	-- CMD Shell

		Login to OpenShift

			oc login --token=... --server=...
		
		Copy the backups directory down to the local host. Example;

			oc rsync backup-mals-1-bc82d:/backups/daily/2021-09-14 C:\temp\pg_backup

		Create a temporary validation database in a secure location, using the create database scripts. Example;

			C:\temp\git\nr-mals\db\pgsql\db-scripts\create-database
			create_mals_database.bat postgrespwd 5432

		Extract the backup archive then run the SQL to create the database objects and data;
		
		patroni-master-mals_2021-09-14_01-00-00.sql.gz
		patroni-master-mals_2021-09-14_01-00-00.sql

UAT Restriction

	The original database pod names included the name of the environment, which provided the ability to house both the test and uat pods in the same namespace, ie patroni-test-0, patroni-uat-0. The environment suffixes were removed in order to get the backup template sto work correctly. As a ressult, the test pods have been renamed without the test suffix and the UAt pods must retain the uat suffix. As a result, the test pods have backup capabilities and the UAT pods do not.
