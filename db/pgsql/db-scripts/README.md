-- Connecting to the pod Postgres and executing SQL statements to create the database and objects.
-- These examples below use two Windows command shells.

-- Openshift Command Line tool (oc) download

	https://github.com/openshift/origin/releases
	
-- The superuser-password and app-db-owner-password are stored in the OpenShift secret for each environment.

		bsoszr-dev  = patroni-dev 
		bsoszr-test = patroni-test and patroni-uat 
		bsoszr-prod = patroni-prod 
	
-- CMD Shell 1

1.  Invoke port-forward to map your local host to the pod's listening port.

        oc port-forward <<pod name>> <<local port>>:<<pod port>>
		
		-- Example using local port 5434 so as not to conflict with a local Postgres database that is listening on 5432.
		oc port-forward patroni-dev-0 5434:5432
		

-- CMD Shell 2

2.  Optional - drop the existing database. 

        drop_mals_database.bat <<superuser-password>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\drop-database
        drop_mals_database.bat ABCDEFGHIJ1234567890abcdefghij12

3.  Create the database

        create_mals_database.bat <<superuser-password>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\create-database
        create_mals_database.bat ABCDEFGHIJ1234567890abcdefghij12
		
	or the objects of an individual Feature Set. 
		
        create_mals_fs-2.bat <<app-db-owner-password>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\create-fs-2
        create_mals_fs-2.bat ABCDEFGHIJ1234567890abcdefghij12
